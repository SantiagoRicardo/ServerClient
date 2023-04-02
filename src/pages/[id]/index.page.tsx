import { type NextPage } from "next";
import { useRouter } from "next/router";
import {
  answerSchema,
  type AnswerSchema,
  questionSchema,
} from "$/server/api/routers/schema";
import { api } from "$/utils/api";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const QuestionId: NextPage = () => {
  const router = useRouter();
  const id = router.query.id;
  const idSchema = questionSchema.pick({ id: true });
  const result = idSchema.safeParse({
    id,
  });

  const utils = api.useContext();
  const deleteQuestion = api.questions.delete.useMutation({
    onSuccess: (res) => {
      void utils.questions.getOne.invalidate({
        id: res.id,
      });
      void utils.questions.getAll.invalidate();
      void router.push("/");
    },
  });
  const addAnswer = api.questions.addAnswer.useMutation({
    onSuccess: (res) => {
      void utils.questions.getOne.invalidate({
        id: res.questionId,
      });
      void utils.questions.getAll.invalidate();
    },
  });
  const deleteAnswer = api.questions.deleteAnswer.useMutation({
    onSuccess: (res) => {
      void utils.questions.getOne.invalidate({
        id: res.questionId,
      });
      void utils.questions.getAll.invalidate();
    },
  });

  const questionQuery = api.questions.getOne.useQuery({
    id: result.success ? result.data.id : "",
  });

  const form = useForm<Pick<AnswerSchema, "answer">>({
    defaultValues: {
      answer: "",
    },
    resolver: zodResolver(answerSchema.pick({ answer: true })),
  });

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-neutral-800 p-12 text-white">
      {!result.success ? (
        <h1 className="text-4xl">Invalid ID</h1>
      ) : questionQuery.isError ? (
        <h1 className="text-4xl">{questionQuery.error.message}</h1>
      ) : questionQuery.isLoading ? (
        <h1 className="text-4xl">Loading...</h1>
      ) : questionQuery.data == null ? (
        <h1 className="text-4xl">No data</h1>
      ) : (
        <>
          <div className="flex items-center gap-6">
            <h1 className="text-4xl">{questionQuery.data?.question}</h1>

            <button
              type="button"
              className="rounded bg-red-500 p-2"
              onClick={() => {
                void deleteQuestion.mutate(result.data);
              }}
            >
              <TrashIcon className="h-6 w-6" />
            </button>
          </div>

          <form
            className="flex flex-col gap-2"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit((data) => {
              void addAnswer.mutate({
                postId: result.data.id,
                answer: data.answer,
              });
            })}
          >
            <label className="flex w-[30rem] flex-col gap-2 text-neutral-100">
              Add an answer
              <input
                type="text"
                className="rounded-md bg-neutral-700 p-2 text-neutral-100 placeholder-neutral-500"
                placeholder="Answer the question..."
                {...form.register("answer")}
              />
              {form.formState.errors.answer && (
                <span className="font-medium text-red-500">
                  {form.formState.errors.answer.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              className="rounded bg-green-500 p-2"
              disabled={addAnswer.isLoading}
            >
              {addAnswer.isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>

          <div className="flex flex-col gap-4">
            {questionQuery.data.answers.map((answer) => (
              <div
                key={answer.id}
                className="flex items-center justify-between gap-2 rounded-md bg-neutral-700 p-4"
              >
                <h1 className="max-w-prose text-xl">{answer.answer}</h1>

                <button
                  type="button"
                  className="flex rounded bg-red-500 p-2"
                  onClick={() => {
                    void deleteAnswer.mutate({
                      postId: result.data.id,
                      id: answer.id,
                    });
                  }}
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default QuestionId;
