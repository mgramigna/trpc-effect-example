import { Effect } from "effect";
import { createTRPCRouter, publicProcedure } from "./trpc";
import { ExampleService } from "../services/example";
import { TRPCError } from "@trpc/server";

export const appRouter = createTRPCRouter({
  ping: publicProcedure.query(async ({ ctx }) => {
    const res = await ctx.runEffect(
      Effect.gen(function* () {
        const service = yield* ExampleService;
        return yield* service.ping();
      }),
    );

    return res;
  }),
  mutate: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.runEffect(
      Effect.gen(function* () {
        const service = yield* ExampleService;
        return yield* service.mutate();
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
  }),
});

export type AppRouter = typeof appRouter;
