import { z } from "zod";

export const createMapperContractHarness = <Schema extends z.ZodTypeAny>(
  schema: Schema,
) => ({
  parse: (input: unknown): z.infer<Schema> => schema.parse(input),
  parseCollection: (input: unknown[]): Array<z.infer<Schema>> =>
    z.array(schema).parse(input),
  safeParse: (input: unknown) => schema.safeParse(input),
  issuePaths: (input: unknown): string[] => {
    const result = schema.safeParse(input);

    if (result.success) {
      return [];
    }

    return result.error.issues.map((issue) =>
      issue.path.length > 0 ? issue.path.join(".") : "<root>",
    );
  },
});
