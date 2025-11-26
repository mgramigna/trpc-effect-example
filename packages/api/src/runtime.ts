import { TRPCError } from "@trpc/server";
import { Cause, Effect, Exit, ManagedRuntime } from "effect";
import { ExampleService } from "./services/example";

const serverRuntime = ManagedRuntime.make(ExampleService.Default);

export const runEffect = async <
  A,
  E,
  R extends ManagedRuntime.ManagedRuntime.Context<typeof serverRuntime>,
>(
  effect: Effect.Effect<A, E, R>,
) => {
  const exit = await serverRuntime.runPromiseExit(effect);

  if (Exit.isFailure(exit)) {
    const cause = exit.cause;

    if (Cause.isFailType(cause)) {
      const originalError = cause.error;

      if (originalError instanceof TRPCError) {
        console.error("Handled trpc error", originalError);
        throw originalError;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unknown error occurred",
        cause: originalError,
      });
    }

    const squashedCause = Cause.squash(exit.cause);

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An un-recoverable error occurred",
      cause: squashedCause,
    });
  }

  return exit.value;
};
