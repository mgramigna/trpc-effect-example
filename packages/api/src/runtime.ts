import { TRPCError } from "@trpc/server";
import { Effect, Either, ManagedRuntime } from "effect";
import { ExampleService } from "./services/example";

export const serverRuntime = ManagedRuntime.make(ExampleService.Default);

export const runEffect = async <A, E, R>(
  runtime: ManagedRuntime.ManagedRuntime<R, never>,
  effect: Effect.Effect<A, E, R>,
) => {
  const result = await runtime.runPromise(effect.pipe(Effect.either));

  if (Either.isLeft(result)) {
    const error = result.left;

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unknown error occurred",
      cause: error,
    });
  }

  return result.right;
};
