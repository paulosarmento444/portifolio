import { z } from "zod";

type TextSchemaOptions = {
  min?: number;
  max?: number;
};

type NumberSchemaOptions = {
  min?: number;
  integer?: boolean;
};

const trimStringValue = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

const trimOrUndefined = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const createRequiredTextSchema = (
  label: string,
  options: TextSchemaOptions = {},
) =>
  z
    .string({
      required_error: `${label} e obrigatorio`,
      invalid_type_error: `${label} precisa ser texto`,
    })
    .trim()
    .min(options.min ?? 1, `${label} e obrigatorio`)
    .max(options.max ?? 5000, `${label} excede o tamanho permitido`);

export const createOptionalTextSchema = (options: TextSchemaOptions = {}) =>
  z.preprocess(
    trimOrUndefined,
    z
      .string({
        invalid_type_error: "Valor invalido",
      })
      .min(options.min ?? 1, "Valor invalido")
      .max(options.max ?? 5000, "Valor excede o tamanho permitido")
      .optional(),
  );

export const createIdentifierSchema = (label = "Identificador") =>
  z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .pipe(z.string().min(1, `${label} e obrigatorio`));

export const createOptionalIdentifierSchema = (label = "Identificador") =>
  z.preprocess(
    trimOrUndefined,
    z
      .union([z.string(), z.number()])
      .transform((value) => String(value).trim())
      .pipe(z.string().min(1, `${label} invalido`))
      .optional(),
  );

export const createSlugSchema = (label = "Slug") =>
  z
    .string({
      required_error: `${label} e obrigatorio`,
      invalid_type_error: `${label} precisa ser texto`,
    })
    .trim()
    .min(1, `${label} e obrigatorio`)
    .max(255, `${label} excede o tamanho permitido`)
    .regex(/^[a-z0-9/_-]+$/i, `${label} invalido`);

export const createUrlSchema = (label = "URL") =>
  z
    .string({
      required_error: `${label} e obrigatoria`,
      invalid_type_error: `${label} precisa ser texto`,
    })
    .trim()
    .url(`${label} invalida`);

export const createOptionalUrlSchema = (label = "URL") =>
  z.preprocess(
    trimOrUndefined,
    z
      .string({
        invalid_type_error: `${label} invalida`,
      })
      .url(`${label} invalida`)
      .optional(),
  );

export const createEmailSchema = (label = "E-mail") =>
  z
    .string({
      required_error: `${label} e obrigatorio`,
      invalid_type_error: `${label} precisa ser texto`,
    })
    .trim()
    .email(`${label} invalido`);

export const createOptionalEmailSchema = (label = "E-mail") =>
  z.preprocess(
    trimOrUndefined,
    z
      .string({
        invalid_type_error: `${label} invalido`,
      })
      .email(`${label} invalido`)
      .optional(),
  );

export const createDateTimeStringSchema = (label = "Data") =>
  z
    .string({
      required_error: `${label} e obrigatoria`,
      invalid_type_error: `${label} precisa ser texto`,
    })
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), `${label} invalida`);

export const createOptionalDateTimeStringSchema = (label = "Data") =>
  z.preprocess(
    trimOrUndefined,
    z
      .string({
        invalid_type_error: `${label} invalida`,
      })
      .refine((value) => !Number.isNaN(Date.parse(value)), `${label} invalida`)
      .optional(),
  );

export const createNumberSchema = (
  label: string,
  options: NumberSchemaOptions = {},
) => {
  let schema = z
    .number({
      required_error: `${label} e obrigatorio`,
      invalid_type_error: `${label} precisa ser numerico`,
    })
    .finite(`${label} invalido`)
    .min(options.min ?? 0, `${label} invalido`);

  if (options.integer) {
    schema = schema.int(`${label} invalido`);
  }

  return schema;
};

export { z };
