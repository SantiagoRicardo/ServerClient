import { createTRPCRouter, publicProcedure } from "$/server/api/trpc";
import { answerSchema, type QuestionSchema, questionSchema } from "./schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const POSTS: QuestionSchema[] = [
  {
    id: "1",
    question: "What is the meaning of life?",
    answers: [
      {
        id: "1",
        answer:
          "The pursuit of happiness and fulfillment in whatever way one chooses.",
      },
      {
        id: "2",
        answer:
          "The meaning of life is to find inner peace and contentment through mindfulness and self-reflection.",
      },
    ],
  },
];

export const questionsRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return POSTS;
  }),
  getOne: publicProcedure
    .input(questionSchema.pick({ id: true }))
    .query(({ input }) => {
      return POSTS.find((post) => post.id === input.id) ?? null;
    }),
  create: publicProcedure
    .input(questionSchema.pick({ question: true }))
    .mutation(({ input }) => {
      const post: QuestionSchema = {
        ...input,
        id: Math.random().toString(),
        answers: [],
      };
      POSTS.push(post);
      return post;
    }),
  update: publicProcedure
    .input(
      questionSchema.pick({
        id: true,
        question: true,
      }),
    )
    .mutation(({ input }) => {
      const post = POSTS.find((post) => post.id === input.id);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      post.question = input.question;
      return post;
    }),
  delete: publicProcedure
    .input(questionSchema.pick({ id: true }))
    .mutation(({ input }) => {
      const index = POSTS.findIndex((post) => post.id === input.id);
      if (index === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }
      POSTS.splice(index, 1);
      return { id: input.id };
    }),
  addAnswer: publicProcedure
    .input(
      answerSchema
        .pick({
          answer: true,
        })
        .merge(
          z.object({
            postId: questionSchema.pick({ id: true }).shape.id,
          }),
        ),
    )
    .mutation(({ input }) => {
      const post = POSTS.find((post) => post.id === input.postId);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const newAnswer = {
        ...input,
        id: Math.random().toString(),
      };

      post.answers.push(newAnswer);
      return {
        newAnswer,
        questionId: input.postId,
      };
    }),
  deleteAnswer: publicProcedure
    .input(
      answerSchema
        .pick({
          id: true,
        })
        .merge(
          z.object({
            postId: questionSchema.pick({ id: true }).shape.id,
          }),
        ),
    )
    .mutation(({ input }) => {
      const post = POSTS.find((post) => post.id === input.postId);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const index = post.answers.findIndex((answer) => answer.id === input.id);
      if (index === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Answer not found",
        });
      }

      post.answers.splice(index, 1);
      return {
        id: input.id,
        questionId: input.postId,
      };
    }),
});
