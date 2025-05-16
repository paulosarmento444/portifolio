export const FormField = ({
  register,
  name,
  placeholder,
  type = "text",
  required = false,
}: any) => (
  <input
    type={type}
    {...register(name)}
    required={required}
    placeholder={placeholder}
    className="h-12 px-4 bg-zinc-950 border border-zinc-800 rounded-lg text-lg placeholder-zinc-400 outline-none"
  />
);
