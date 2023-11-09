import type { Drill } from "metabase/visualizations/types/click-actions";
import type { DrillThruType } from "metabase-lib";
import { ObjectDetailFkDrill } from "metabase/visualizations/click-actions/drills/mlv2/ObjectDetailFkDrill";
import { QuickFilterDrill } from "../drills/mlv2/QuickFilterDrill";
import { SummarizeColumnDrill } from "../drills/mlv2/SummarizeColumnDrill";
import { FKFilterDrill } from "../drills/mlv2/FKFilterDrill";
import { SummarizeColumnByTimeDrill } from "../drills/mlv2/SummarizeColumnByTimeDrill";
import { SortDrill } from "../drills/mlv2/SortDrill";
import { DistributionDrill } from "../drills/mlv2/DistributionDrill";
import { UnderlyingRecordsDrill } from "../drills/mlv2/UnderlyingRecordsDrill";
import { ObjectDetailZoomDrill } from "../drills/mlv2/ObjectDetailZoomDrill";

export const MODE_TYPE_DEFAULT = "default";
export const MODE_TYPE_NATIVE = "native";
export const MODE_TYPE_METRIC = "metric";
export const MODE_TYPE_TIMESERIES = "timeseries";
export const MODE_TYPE_GEO = "geo";
export const MODE_TYPE_PIVOT = "pivot";

export const MODES_TYPES = [
  MODE_TYPE_NATIVE,
  MODE_TYPE_METRIC,
  MODE_TYPE_TIMESERIES,
  MODE_TYPE_GEO,
  MODE_TYPE_PIVOT,
  MODE_TYPE_DEFAULT,
] as const;

export const DRILL_TYPE_TO_HANDLER_MAP: Record<
  DrillThruType,
  Drill<any> | null
> = {
  "drill-thru/column-filter": null, // ColumnFilterDrill,
  "drill-thru/quick-filter": QuickFilterDrill,
  "drill-thru/pk": ObjectDetailFkDrill,
  "drill-thru/zoom": ObjectDetailZoomDrill,
  "drill-thru/fk-details": ObjectDetailFkDrill,
  "drill-thru/pivot": null,
  "drill-thru/fk-filter": FKFilterDrill,
  "drill-thru/distribution": DistributionDrill,
  "drill-thru/sort": SortDrill,
  "drill-thru/summarize-column": SummarizeColumnDrill,
  "drill-thru/summarize-column-by-time": SummarizeColumnByTimeDrill,
  "drill-thru/underlying-records": UnderlyingRecordsDrill,
  "drill-thru/zoom-in.timeseries": null,
};
