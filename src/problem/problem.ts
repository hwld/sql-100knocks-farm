import { z } from "zod";

export const ProblemSchema = z.object({
  no: z.number(),
  text: z.string(),
  solutions: z.array(
    z.object({
      no: z.number(),
      sql: z.string(),
      expectedCsv: z.string(),
    })
  ),
});

export type Problem = z.infer<typeof ProblemSchema>;
