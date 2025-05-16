import React from "react";

export type InputFieldProps = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  className?: string;
};

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  placeholder,
  className,
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={id} className="text-sm font-semibold text-gray-500">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        name={id}
        className={`rounded-lg border-gray-600 bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${className}`}
      />
    </div>
  );
};
