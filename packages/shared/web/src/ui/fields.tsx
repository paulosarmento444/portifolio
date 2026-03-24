import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
} from "react";
import { ecommerceFieldStyles } from "../design-system";
import { cn } from "./utils/cn";

export interface FieldShellProps {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  hintId?: string;
  error?: ReactNode;
  errorId?: string;
  required?: boolean;
  className?: string;
  supportingAction?: ReactNode;
  children: ReactNode;
}

export function FieldShell({
  label,
  htmlFor,
  hint,
  hintId,
  error,
  errorId,
  required = false,
  className,
  supportingAction,
  children,
}: Readonly<FieldShellProps>) {
  return (
    <div className={cn("site-stack-panel", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={htmlFor} className={ecommerceFieldStyles.label}>
            <span>{label}</span>
            {required ? (
              <span className="ml-1 text-[color:var(--site-color-danger)]">*</span>
            ) : null}
          </label>
          {supportingAction ? <div className="shrink-0">{supportingAction}</div> : null}
        </div>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} className={ecommerceFieldStyles.helperDanger} role="alert" aria-live="polite">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={ecommerceFieldStyles.helper}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface FieldBaseProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
  fieldClassName?: string;
  supportingAction?: ReactNode;
}

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    FieldBaseProps {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hint,
    error,
    containerClassName,
    fieldClassName,
    supportingAction,
    id,
    required,
    className,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [props["aria-describedby"], errorId ?? hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      required={required}
      className={containerClassName}
      supportingAction={supportingAction}
    >
      <input
        id={fieldId}
        ref={ref}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
        className={cn(
          ecommerceFieldStyles.input,
          error && ecommerceFieldStyles.invalid,
          fieldClassName,
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
});

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldBaseProps {}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  {
    label,
    hint,
    error,
    containerClassName,
    fieldClassName,
    supportingAction,
    id,
    required,
    className,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [props["aria-describedby"], errorId ?? hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      required={required}
      className={containerClassName}
      supportingAction={supportingAction}
    >
      <select
        id={fieldId}
        ref={ref}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
        className={cn(
          ecommerceFieldStyles.select,
          error && ecommerceFieldStyles.invalid,
          fieldClassName,
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
});

export interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldBaseProps {}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  {
    label,
    hint,
    error,
    containerClassName,
    fieldClassName,
    supportingAction,
    id,
    required,
    className,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [props["aria-describedby"], errorId ?? hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      required={required}
      className={containerClassName}
      supportingAction={supportingAction}
    >
      <textarea
        id={fieldId}
        ref={ref}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
        className={cn(
          ecommerceFieldStyles.textarea,
          error && ecommerceFieldStyles.invalid,
          fieldClassName,
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
});
