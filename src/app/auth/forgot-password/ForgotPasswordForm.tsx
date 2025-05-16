"use client";
import { InputField } from "@/app/components/InputField";

export function ForgotPasswordForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    alert("forgot password...");
    e.preventDefault();
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md rounded flex-col space-y-4 bg-[#141414] bg-opacity-90 px-4 py-8 shadow-lg"
    >
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
        <p className="text-sm text-gray-500">
          Enter your email to reset your password
        </p>
      </div>
      <InputField id="email" type="email" label="Email" placeholder="Email" />
      <div className="flex flex-col-reverse space-y-2 pt-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <button
          type="submit"
          className="flex w-full rounded-lg justify-center bg-red-500 px-4 py-2 text-sm font-semibold text-white sm:w-auto sm-px-8"
        >
          Reset Password
        </button>
      </div>
    </form>
  );
}
