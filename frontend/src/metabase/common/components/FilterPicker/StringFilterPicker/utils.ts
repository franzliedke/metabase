import type * as Lib from "metabase-lib";
import { OPERATOR_OPTIONS } from "./constants";

export function getDefaultValues(
  operator: Lib.StringFilterOperatorName,
  values: string[] = [],
): string[] {
  const { valueCount = values.length } = OPERATOR_OPTIONS[operator];

  return Array(valueCount)
    .fill("")
    .map((value, index) => values[index] ?? value);
}

export function hasValidValues(
  operator: Lib.StringFilterOperatorName,
  values: string[],
) {
  const { valueCount = 1 } = OPERATOR_OPTIONS[operator];
  return values.length >= valueCount && values.every(value => value.length > 0);
}
