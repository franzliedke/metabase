import type { GridOption } from "echarts/types/dist/shared";
import type {
  CartesianChartModel,
  Extent,
} from "metabase/visualizations/echarts/cartesian/model/types";
import type { AxisFormatter } from "metabase/visualizations/echarts/cartesian/option/types";
import type {
  ComputedVisualizationSettings,
  RenderingContext,
} from "metabase/visualizations/types";
import { CHART_STYLE } from "metabase/visualizations/echarts/cartesian/option/style";

const getYAxisTicksWidth = (
  extent: Extent,
  formatter: AxisFormatter,
  settings: ComputedVisualizationSettings,
  { measureText, fontFamily }: RenderingContext,
): number => {
  if (!settings["graph.x_axis.axis_enabled"]) {
    return 0;
  }

  const fontStyle = {
    ...CHART_STYLE.axisTicks,
    family: fontFamily,
  };

  const [min, max] = extent;
  const minTextWidth = measureText(formatter(min), fontStyle);
  const maxTextWidth = measureText(formatter(max), fontStyle);

  return Math.max(minTextWidth, maxTextWidth);
};

const getXAxisTicksHeight = (
  chartModel: CartesianChartModel,
  settings: ComputedVisualizationSettings,
  formatter: AxisFormatter,
  renderingContext: RenderingContext,
) => {
  const xAxisDisplay = settings["graph.x_axis.axis_enabled"];

  if (!xAxisDisplay) {
    return 0;
  }

  if (xAxisDisplay === true || xAxisDisplay === "compact") {
    return CHART_STYLE.axisTicks.size;
  }

  const tickWidths = chartModel.dataset.map(datum => {
    return renderingContext.measureText(
      formatter(datum[chartModel.dimensionModel.dataKey]),
      {
        ...CHART_STYLE.axisTicks,
        family: renderingContext.fontFamily,
      },
    );
  });

  const maxTickWidth = Math.max(...tickWidths);

  if (xAxisDisplay === "rotate-90") {
    return maxTickWidth;
  }

  if (xAxisDisplay === "rotate-45") {
    return maxTickWidth / Math.sqrt(2);
  }

  console.warn(`Unexpected "graph.x_axis.axis_enabled" value ${xAxisDisplay}`);

  return CHART_STYLE.axisTicks.size;
};

export const getYAxisNameGap = (
  extent: Extent,
  formatter: AxisFormatter,
  settings: ComputedVisualizationSettings,
  renderingContext: RenderingContext,
): number => {
  const hasYAxisName =
    settings["graph.y_axis.labels_enabled"] !== false &&
    settings["graph.y_axis.title_text"] != null;

  if (!hasYAxisName) {
    return 0;
  }

  return (
    getYAxisTicksWidth(extent, formatter, settings, renderingContext) +
    CHART_STYLE.axisNamePadding
  );
};

export const getXAxisNameGap = (
  chartModel: CartesianChartModel,
  settings: ComputedVisualizationSettings,
  formatter: AxisFormatter,
  renderingContext: RenderingContext,
): number => {
  return (
    getXAxisTicksHeight(chartModel, settings, formatter, renderingContext) +
    CHART_STYLE.axisNamePadding
  );
};

export const getChartGrid = (
  settings: ComputedVisualizationSettings,
): GridOption => {
  const gridOption: GridOption = { containLabel: true, top: 0 };

  const hasYAxisName =
    settings["graph.y_axis.labels_enabled"] &&
    settings["graph.y_axis.title_text"] != null;

  const axisNamePadding =
    CHART_STYLE.axisName.size + CHART_STYLE.axisNamePadding;

  if (hasYAxisName) {
    gridOption.left = axisNamePadding;
    gridOption.right = axisNamePadding;
  }

  const hasXAxis = settings["graph.x_axis.axis_enabled"];

  if (hasXAxis) {
    gridOption.bottom = axisNamePadding;
  }

  return gridOption;
};
