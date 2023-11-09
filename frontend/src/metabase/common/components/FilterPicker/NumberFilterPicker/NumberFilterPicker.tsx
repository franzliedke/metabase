import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { t } from "ttag";
import { Box, Flex, NumberInput, Text } from "metabase/ui";
import * as Lib from "metabase-lib";

import type { FilterPickerWidgetProps } from "../types";
import { MAX_WIDTH } from "../constants";
import { getAvailableOperatorOptions } from "../utils";
import { ColumnValuesWidget } from "../ColumnValuesWidget";
import { FilterHeader } from "../FilterHeader";
import { FilterFooter } from "../FilterFooter";
import { FilterOperatorPicker } from "../FilterOperatorPicker";
import { FlexWithScroll } from "../FilterPicker.styled";

import { OPERATOR_OPTIONS } from "./constants";
import { getDefaultValues, hasValidValues } from "./utils";

export function NumberFilterPicker({
  query,
  stageIndex,
  column,
  filter,
  isNew,
  onChange,
  onBack,
}: FilterPickerWidgetProps) {
  const columnInfo = useMemo(
    () => Lib.displayInfo(query, stageIndex, column),
    [query, stageIndex, column],
  );

  const filterParts = useMemo(
    () => (filter ? Lib.numberFilterParts(query, stageIndex, filter) : null),
    [query, stageIndex, filter],
  );

  const availableOperators = useMemo(
    () =>
      getAvailableOperatorOptions(query, stageIndex, column, OPERATOR_OPTIONS),
    [query, stageIndex, column],
  );

  const [operator, setOperator] = useState(
    filterParts ? filterParts.operator : "=",
  );

  const [values, setValues] = useState(
    getDefaultValues(operator, filterParts?.values),
  );

  const { valueCount } = OPERATOR_OPTIONS[operator] ?? {};
  const isValid = hasValidValues(operator, values);

  const handleOperatorChange = (operator: Lib.NumberFilterOperatorName) => {
    setOperator(operator);
    setValues(getDefaultValues(operator, values));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isValid) {
      onChange(
        Lib.numberFilterClause({
          operator: operator,
          column,
          values,
        }),
      );
    }
  };

  return (
    <Box
      component="form"
      maw={MAX_WIDTH}
      data-testid="number-filter-picker"
      onSubmit={handleSubmit}
    >
      <FilterHeader columnName={columnInfo.longDisplayName} onBack={onBack}>
        <FilterOperatorPicker
          value={operator}
          options={availableOperators}
          onChange={handleOperatorChange}
        />
      </FilterHeader>
      <Box>
        <NumberValueInput
          values={values}
          valueCount={valueCount}
          column={column}
          onChange={setValues}
        />
        <FilterFooter isNew={isNew} canSubmit={isValid} />
      </Box>
    </Box>
  );
}

interface NumberValueInputProps {
  values: (number | "")[];
  valueCount: number | undefined;
  column: Lib.ColumnMetadata;
  onChange: (values: (number | "")[]) => void;
}

function NumberValueInput({
  values,
  valueCount,
  column,
  onChange,
}: NumberValueInputProps) {
  const placeholder = t`Enter a number`;

  if (valueCount == null) {
    return (
      <FlexWithScroll p="md" mah={300}>
        <ColumnValuesWidget
          value={values}
          column={column}
          canHaveManyValues
          onChange={onChange}
        />
      </FlexWithScroll>
    );
  }

  if (valueCount === 1) {
    return (
      <Flex p="md">
        <NumberInput
          value={values[0]}
          onChange={(newValue: number) => onChange([newValue])}
          placeholder={placeholder}
          autoFocus
          w="100%"
        />
      </Flex>
    );
  }

  if (valueCount === 2) {
    return (
      <Flex align="center" justify="center" p="md">
        <NumberInput
          value={values[0]}
          onChange={(newValue: number) => onChange([newValue, values[1]])}
          placeholder={placeholder}
          autoFocus
        />
        <Text mx="sm">{t`and`}</Text>
        <NumberInput
          value={values[1]}
          onChange={(newValue: number) => onChange([values[0], newValue])}
          placeholder={placeholder}
        />
      </Flex>
    );
  }

  return null;
}
