import { z } from "zod";

export const answerSchema = z.object({
  id: z.string(),
  answer: z.string().trim().min(10),
});

export const questionSchema = z.object({
  id: z.string(),
  question: z.string().trim().min(10),
  answers: z.array(answerSchema),
});

export type AnswerSchema = z.infer<typeof answerSchema>;
export type QuestionSchema = z.infer<typeof questionSchema>;
