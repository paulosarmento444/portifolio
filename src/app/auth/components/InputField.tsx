"use client";
import type React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
