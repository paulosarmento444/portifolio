export const BRAZILIAN_STATE_VALUES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type BrazilianStateValue = (typeof BRAZILIAN_STATE_VALUES)[number];

export const BRAZILIAN_STATES: ReadonlyArray<{
  label: string;
  value: BrazilianStateValue;
}> = [
  { label: "Acre", value: "AC" },
  { label: "Alagoas", value: "AL" },
  { label: "Amapá", value: "AP" },
  { label: "Amazonas", value: "AM" },
  { label: "Bahia", value: "BA" },
  { label: "Ceará", value: "CE" },
  { label: "Distrito Federal", value: "DF" },
  { label: "Espírito Santo", value: "ES" },
  { label: "Goiás", value: "GO" },
  { label: "Maranhão", value: "MA" },
  { label: "Mato Grosso", value: "MT" },
  { label: "Mato Grosso do Sul", value: "MS" },
  { label: "Minas Gerais", value: "MG" },
  { label: "Pará", value: "PA" },
  { label: "Paraíba", value: "PB" },
  { label: "Paraná", value: "PR" },
  { label: "Pernambuco", value: "PE" },
  { label: "Piauí", value: "PI" },
  { label: "Rio de Janeiro", value: "RJ" },
  { label: "Rio Grande do Norte", value: "RN" },
  { label: "Rio Grande do Sul", value: "RS" },
  { label: "Rondônia", value: "RO" },
  { label: "Roraima", value: "RR" },
  { label: "Santa Catarina", value: "SC" },
  { label: "São Paulo", value: "SP" },
  { label: "Sergipe", value: "SE" },
  { label: "Tocantins", value: "TO" },
] as const;

const BRAZILIAN_STATE_VALUE_SET = new Set<string>(BRAZILIAN_STATE_VALUES);

const normalizeStateText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const BRAZILIAN_STATE_LABEL_MAP = new Map<string, BrazilianStateValue>(
  BRAZILIAN_STATES.map((state) => [normalizeStateText(state.label), state.value]),
);

export const isBrazilianStateValue = (
  value?: string | null,
): value is BrazilianStateValue =>
  typeof value === "string" &&
  BRAZILIAN_STATE_VALUE_SET.has(value.trim().toUpperCase());

export const normalizeBrazilianStateValue = (value?: string | null) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "";
  }

  const upperValue = normalizedValue.toUpperCase();

  if (isBrazilianStateValue(upperValue)) {
    return upperValue;
  }

  return BRAZILIAN_STATE_LABEL_MAP.get(normalizeStateText(normalizedValue)) || "";
};
