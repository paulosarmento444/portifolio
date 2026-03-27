"use client";

import { SelectField, type SelectFieldProps } from "@site/shared";
import {
  BRAZILIAN_STATES,
  normalizeBrazilianStateValue,
} from "../../data/brazilian-states";

type StateSelectProps = Omit<SelectFieldProps, "children"> & {
  placeholder?: string;
};

export function StateSelect({
  placeholder = "Selecione o estado",
  value,
  required = true,
  label,
  "aria-label": ariaLabel,
  ...props
}: Readonly<StateSelectProps>) {
  const normalizedValue =
    typeof value === "string" ? normalizeBrazilianStateValue(value) : "";
  const resolvedAriaLabel =
    typeof ariaLabel === "string"
      ? ariaLabel
      : typeof label === "string"
        ? label
        : undefined;

  return (
    <SelectField
      {...props}
      label={label}
      aria-label={resolvedAriaLabel}
      required={required}
      value={normalizedValue}
    >
      <option value="">{placeholder}</option>
      {BRAZILIAN_STATES.map((state) => (
        <option key={state.value} value={state.value}>
          {state.label}
        </option>
      ))}
    </SelectField>
  );
}
