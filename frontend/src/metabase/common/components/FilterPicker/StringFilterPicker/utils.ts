import type * as Lib from "metabase-lib";
import { OPERATOR_OPTIONS } from "./constants";

function isNotEmpty(value: string) {
  return value.length > 0;
}

export function getDefaultValues(
  operator: Lib.StringFilterOperatorName,
  values: string[] = [],
): string[] {
  const { valueCount } = OPERATOR_OPTIONS[operator];
  if (valueCount == null) {
    return values.filter(isNotEmpty);
  }

  return Array(valueCount)
    .fill("")
    .map((value, index) => values[index] ?? value);
}

export function hasValidValues(
  operator: Lib.StringFilterOperatorName,
  values: string[],
) {
  if (!values.every(isNotEmpty)) {
    return false;
  }

  const { valueCount } = OPERATOR_OPTIONS[operator];
  return valueCount != null ? values.length === valueCount : values.length > 0;
}
