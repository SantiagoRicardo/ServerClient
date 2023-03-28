import { createTRPCRouter, publicProcedure } from "$/server/api/trpc";
import { questionSchema, type QuestionSchema, answerSchema } from "./schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const POSTS: QuestionSchema[] = [];

export const questionsRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return POSTS;
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
      return true;
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
      post.answers.push({
        ...input,
        id: Math.random().toString(),
      });
      return post;
    }),
});
