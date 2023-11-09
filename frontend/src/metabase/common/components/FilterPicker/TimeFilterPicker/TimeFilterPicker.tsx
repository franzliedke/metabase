import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { t } from "ttag";

import { Box, Flex, Text, TimeInput } from "metabase/ui";
import * as Lib from "metabase-lib";

import { MAX_WIDTH } from "../constants";
import type { FilterPickerWidgetProps } from "../types";
import { getAvailableOperatorOptions } from "../utils";
import { FilterOperatorPicker } from "../FilterOperatorPicker";
import { FilterHeader } from "../FilterHeader";
import { FilterFooter } from "../FilterFooter";
import { OPERATOR_OPTIONS } from "./constants";
import { getDefaultValues } from "./utils";

export function TimeFilterPicker({
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
    () => (filter ? Lib.timeFilterParts(query, stageIndex, filter) : null),
    [query, stageIndex, filter],
  );

  const availableOperators = useMemo(
    () =>
      getAvailableOperatorOptions(query, stageIndex, column, OPERATOR_OPTIONS),
    [query, stageIndex, column],
  );

  const [operator, setOperator] = useState(
    filterParts ? filterParts.operator : "<",
  );

  const [values, setValues] = useState(
    getDefaultValues(operator, filterParts?.values),
  );

  const operatorOption = OPERATOR_OPTIONS[operator];

  const handleOperatorChange = (operator: Lib.TimeFilterOperatorName) => {
    setOperator(operator);
    setValues(getDefaultValues(operator, values));
  };

  const handleFilterChange = () => {
    onChange(
      Lib.timeFilterClause({
        operator,
        column,
        values,
      }),
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleFilterChange();
  };

  return (
    <Box
      component="form"
      maw={MAX_WIDTH}
      data-testid="time-filter-picker"
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
        {operatorOption.valueCount > 0 && (
          <Flex p="md">
            <ValuesInput
              values={values}
              valueCount={operatorOption.valueCount}
              onChange={setValues}
            />
          </Flex>
        )}
        <FilterFooter isNew={isNew} canSubmit />
      </Box>
    </Box>
  );
}

interface ValuesInputProps {
  values: Date[];
  valueCount: number;
  onChange: (values: Date[]) => void;
}

function ValuesInput({ values, valueCount, onChange }: ValuesInputProps) {
  if (valueCount === 1) {
    const [value] = values;
    return (
      <TimeInput
        value={value}
        onChange={newValue => onChange([newValue])}
        w="100%"
      />
    );
  }

  if (valueCount === 2) {
    const [value1, value2] = values;
    return (
      <Flex direction="row" align="center" gap="sm" w="100%">
        <TimeInput
          value={value1}
          onChange={newValue1 => onChange([newValue1, value2])}
          w="100%"
        />
        <Text>{t`and`}</Text>
        <TimeInput
          value={value2}
          onChange={newValue2 => onChange([value1, newValue2])}
          w="100%"
        />
      </Flex>
    );
  }

  return null;
}
