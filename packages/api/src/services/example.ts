import { Data, Effect } from "effect";

export class ExampleError extends Data.TaggedError<"ExampleError">(
  "ExampleError",
)<{
  message?: string;
  cause?: unknown;
}> {}

export class ExampleService extends Effect.Service<ExampleService>()(
  "ExampleService",
  {
    succeed: {
      ping: Effect.fn(() => Effect.succeed("pong" as const)),
      mutate: Effect.fn(function* () {
        if (Math.random() < 0.5) {
          return yield* Effect.fail(
            new ExampleError({ message: "Random failure occurred" }),
          );
        }

        return yield* Effect.die(new Error("Unexpected error occurred"));
      }),
    },
  },
) {}
