// eslint-disable-next-line no-restricted-imports
import moment from "moment-timezone";
import type { AxisBaseOptionCommon } from "echarts/types/src/coord/axisCommonTypes";
import type { CartesianAxisOption } from "echarts/types/src/coord/cartesian/AxisModel";
import type {
  ComputedVisualizationSettings,
  RenderingContext,
} from "metabase/visualizations/types";
import type {
  CartesianChartModel,
  Extent,
} from "metabase/visualizations/echarts/cartesian/model/types";

import type {
  AxesFormatters,
  AxisFormatter,
  AxisRange,
} from "metabase/visualizations/echarts/cartesian/option/types";
import { CHART_STYLE } from "metabase/visualizations/echarts/cartesian/option/style";
import {
  getXAxisNameGap,
  getYAxisNameGap,
} from "metabase/visualizations/echarts/cartesian/option/layout";
import { isNumeric } from "metabase-lib/types/utils/isa";

const NORMALIZED_RANGE = { min: 0, max: 1 };

const getCustomAxisRange = (
  axisExtent: Extent,
  min: number | undefined,
  max: number | undefined,
) => {
  const [extentMin, extentMax] = axisExtent;
  // if min/max are not specified or within series extents return `undefined`
  // so that ECharts compute a rounded range automatically
  const finalMin = min != null && min < extentMin ? min : undefined;
  const finalMax = max != null && max > extentMax ? max : undefined;

  return { min: finalMin, max: finalMax };
};

const getAxisRanges = (
  chartModel: CartesianChartModel,
  settings: ComputedVisualizationSettings,
): [AxisRange, AxisRange] => {
  const isNormalized = settings["stackable.stack_type"] === "normalized";
  const isAutoRangeEnabled = settings["graph.y_axis.auto_range"];

  if (isAutoRangeEnabled) {
    const defaultRange = isNormalized ? NORMALIZED_RANGE : {};
    return [defaultRange, defaultRange];
  }

  const customMin = settings["graph.y_axis.min"];
  const customMax = settings["graph.y_axis.max"];

  const [left, right] = chartModel.yAxisExtents;

  return [
    left != null ? getCustomAxisRange(left, customMin, customMax) : {},
    right != null ? getCustomAxisRange(right, customMin, customMax) : {},
  ];
};

const getAxisNameDefaultOption = (
  { getColor, fontFamily }: RenderingContext,
  nameGap: number,
  name?: string,
): Partial<AxisBaseOptionCommon> => ({
  name,
  nameGap,
  nameLocation: "middle",
  nameTextStyle: {
    color: getColor("text-dark"),
    fontSize: CHART_STYLE.axisName.size,
    fontWeight: CHART_STYLE.axisName.weight,
    fontFamily,
  },
});

const getTicksDefaultOption = ({ getColor, fontFamily }: RenderingContext) => {
  return {
    hideOverlap: true,
    color: getColor("text-dark"),
    fontSize: CHART_STYLE.axisTicks.size,
    fontWeight: CHART_STYLE.axisTicks.weight,
    fontFamily,
  };
};

export const getXAxisType = (settings: ComputedVisualizationSettings) => {
  switch (settings["graph.x_axis.scale"]) {
    case "timeseries":
      return "time";
    case "linear":
      return "value";
    default:
      // TODO: implement histogram
      return "category";
  }
};

export const getRotateAngle = (settings: ComputedVisualizationSettings) => {
  switch (settings["graph.x_axis.axis_enabled"]) {
    case "rotate-45":
      return 45;
    case "rotate-90":
      return 90;
    default:
      return undefined;
  }
};

export const buildDimensionAxis = (
  chartModel: CartesianChartModel,
  settings: ComputedVisualizationSettings,
  formatter: AxisFormatter,
  renderingContext: RenderingContext,
): CartesianAxisOption => {
  const { getColor } = renderingContext;
  const axisType = getXAxisType(settings);

  const boundaryGap =
    axisType === "value" ? undefined : ([0.02, 0.02] as [number, number]);

  const nameGap = getXAxisNameGap(
    chartModel,
    settings,
    formatter,
    renderingContext,
  );

  return {
    ...getAxisNameDefaultOption(
      renderingContext,
      nameGap,
      settings["graph.x_axis.title_text"],
    ),
    axisTick: {
      show: false,
    },
    boundaryGap,
    splitLine: {
      show: false,
    },
    type: axisType,
    axisLabel: {
      show: !!settings["graph.x_axis.axis_enabled"],
      rotate: getRotateAngle(settings),
      ...getTicksDefaultOption(renderingContext),
      // Value is always converted to a string by ECharts
      formatter: (value: string) => {
        let valueToFormat: string | number = value;

        if (axisType === "time") {
          valueToFormat = moment(value).format("YYYY-MM-DDTHH:mm:ss");
        } else if (isNumeric(chartModel.dimensionModel.column)) {
          valueToFormat = parseInt(value, 10);
        }

        const formatted = formatter(valueToFormat);

        // Spaces force having padding between ticks
        return ` ${formatted} `;
      },
    },
    axisLine: {
      lineStyle: {
        color: getColor("text-dark"),
      },
    },
  };
};

const buildMetricAxis = (
  settings: ComputedVisualizationSettings,
  position: "left" | "right",
  range: AxisRange,
  extent: Extent,
  formatter: AxisFormatter,
  renderingContext: RenderingContext,
): CartesianAxisOption => {
  const nameGap = getYAxisNameGap(
    extent,
    formatter,
    settings,
    renderingContext,
  );

  return {
    ...range,
    ...getAxisNameDefaultOption(
      renderingContext,
      nameGap,
      settings["graph.y_axis.title_text"],
    ),
    splitLine: {
      lineStyle: {
        type: 5,
        color: renderingContext.getColor("border"),
      },
    },
    position,
    axisLabel: {
      ...getTicksDefaultOption(renderingContext),
      // @ts-expect-error TODO: figure out EChart types
      formatter,
    },
  };
};

const buildMetricsAxes = (
  chartModel: CartesianChartModel,
  settings: ComputedVisualizationSettings,
  axesFormatters: AxesFormatters,
  renderingContext: RenderingContext,
): CartesianAxisOption[] => {
  const [leftRange, rightRange] = getAxisRanges(chartModel, settings);
  const [leftExtent, rightExtent] = chartModel.yAxisExtents;

  const hasLeftAxis = axesFormatters.left != null && leftExtent != null;
  const hasRightAxis = axesFormatters.right != null && rightExtent != null;

  return [
    ...(hasLeftAxis
      ? [
          buildMetricAxis(
            settings,
            "left",
            leftRange,
            leftExtent,
            axesFormatters.left,
            renderingContext,
            settings["graph.y_axis.title_text"],
          ),
        ]
      : []),
    ...(hasRightAxis
      ? [
          buildMetricAxis(
            settings,
            "right",
            rightRange,
            rightExtent,
            axesFormatters.right,
            renderingContext,
          ),
        ]
      : []),
  ];
};

export const buildAxes = (
  chartModel: CartesianChartModel,
  settings: ComputedVisualizationSettings,
  axesFormatters: AxesFormatters,
  renderingContext: RenderingContext,
) => {
  return {
    xAxis: buildDimensionAxis(
      chartModel,
      settings,
      axesFormatters.bottom,
      renderingContext,
    ),
    yAxis: buildMetricsAxes(
      chartModel,
      settings,
      axesFormatters,
      renderingContext,
    ),
  };
};
