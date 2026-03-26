export const resolveAccountFirstName = (value?: string | null) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue.split(/\s+/)[0] ?? normalizedValue;
};
