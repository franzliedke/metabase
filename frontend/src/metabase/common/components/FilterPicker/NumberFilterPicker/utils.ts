import type * as Lib from "metabase-lib";
import { OPERATOR_OPTIONS } from "./constants";

function isNotEmpty(value: number | "") {
  return value != null;
}

export function getDefaultValues(
  operator: Lib.NumberFilterOperatorName,
  values: (number | "")[] = [],
): (number | "")[] {
  const { valueCount } = OPERATOR_OPTIONS[operator];
  if (valueCount == null) {
    return values.filter(isNotEmpty);
  }

  return Array(valueCount)
    .fill("")
    .map((value, index) => values[index] ?? value);
}

export function hasValidValues(
  operator: Lib.NumberFilterOperatorName,
  values: (number | "")[],
): values is number[] {
  if (!values.every(isNotEmpty)) {
    return false;
  }

  const { valueCount } = OPERATOR_OPTIONS[operator];
  return valueCount != null ? values.length === valueCount : values.length > 0;
}
