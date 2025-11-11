import { Effect } from "effect";
import { runEffect } from "../runtime";
import { createTRPCRouter, publicProcedure } from "./trpc";
import { ExampleService } from "../services/example";
import { TRPCError } from "@trpc/server";

export const appRouter = createTRPCRouter({
  ping: publicProcedure.query(async ({ ctx }) => {
    const res = await runEffect(
      ctx.runtime,
      Effect.gen(function* () {
        const service = yield* ExampleService;
        return yield* service.ping();
      }),
    );

    return res;
  }),
  mutate: publicProcedure.mutation(async ({ ctx }) => {
    const res = await runEffect(
      ctx.runtime,
      Effect.gen(function* () {
        const service = yield* ExampleService;
        yield* service.mutate();
      }).pipe(
        Effect.catchTag("ExampleError", (e) =>
          Effect.fail(
            new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "ExampleError encountered during mutation",
              cause: e,
            }),
          ),
        ),
      ),
    );

    return res;
  }),
});

export type AppRouter = typeof appRouter;
