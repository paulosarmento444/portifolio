export const normalizeLocalhostUrl = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  return value.includes("localhost")
    ? value.replace(/^https:\/\//, "http://")
    : value;
};

export const normalizeWordpressUri = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  return value.replace(/^\/+/, "").replace(/^blog\//, "");
};

export const stripHtml = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  const cleaned = value.replace(/<[^>]*>/g, "").trim();
  return cleaned || undefined;
};

export const toMoneyAmount = (value?: string | number | null): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const humanizeStatus = (value?: string | null): string => {
  if (!value) {
    return "Indefinido";
  }

  const normalized = value.toLowerCase();
  const labels: Record<string, string> = {
    pending: "Pendente",
    processing: "Processando",
    completed: "Concluido",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    failed: "Falhou",
    "on-hold": "Em espera",
    instock: "Em estoque",
    outofstock: "Sem estoque",
  };

  if (labels[normalized]) {
    return labels[normalized];
  }

  return normalized
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};
