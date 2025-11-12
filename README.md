# tRPC Effect Example Monorepo

This is an example monorepo demonstrating a full-stack TypeScript application using [tRPC](https://trpc.io/), [Effect](https://effect.website/), [React](https://react.dev/), and [Vite](https://vitejs.dev/). The backend is powered by Bun and exposes a tRPC API, while the frontend is a modern React app consuming the API via tRPC client and TanStack Query.

## Project Structure

```
trpc-effect-example/
├── packages/
│   ├── api/      # tRPC backend (Bun, Effect)
│   └── www/      # React frontend (Vite, tRPC client)
```

- **api**: tRPC server with Effect integration, running on Bun.
- **www**: React app using Vite, TanStack Query, and tRPC client to communicate with the backend.

## Tech Stack

- **Backend**: tRPC, Effect, Bun, CORS
- **Frontend**: React, Vite, TanStack Query, tRPC client
- **TypeScript**: End-to-end type safety

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed globally
- [Node.js](https://nodejs.org/) (for frontend tooling)

### Installation

From the project root:

```bash
bun install # Installs all dependencies in the monorepo
```

### Running the Backend (API)

```bash
cd packages/api
bun run dev
```

The tRPC server will start on [http://localhost:3001](http://localhost:3001).

### Running the Frontend (WWW)

```bash
cd packages/www
bun run dev
```

The React app will start on [http://localhost:5173](http://localhost:5173) (default Vite port).

### Type Checking

Run type checking in either package:

```bash
bun run typecheck
```

## Usage

- The frontend communicates with the backend via tRPC, providing end-to-end type safety and automatic API inference.
- Effect is used in the backend for functional programming and effect management.
- TanStack Query manages data fetching and caching in the frontend.

## tRPC + Effect Integration (Backend)

This example demonstrates a modern approach to backend design by integrating [Effect](https://effect.website/) with [tRPC](https://trpc.io/):

### How It Works

- **Effect as Service Layer:**
  - Business logic is encapsulated in Effect services (see `ExampleService`).
  - Services expose effectful methods, e.g.:
    ```ts
    // packages/api/src/services/example.ts
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
          }),
        },
      },
    ) {}
    ```

- **tRPC Procedures Use Effect:**
  - tRPC procedures run Effect services using a helper (`runEffect`) and the injected runtime context:
    ```ts
    // packages/api/src/trpc/router.ts
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
    ```

- **Error Handling Across Boundaries:**
  - Effect errors (like `ExampleError`) are caught and mapped to tRPC errors, preserving error semantics for the frontend:
    ```ts
    mutate: publicProcedure.mutation(async ({ ctx }) => {
      const res = await runEffect(
        ctx.runtime,
        Effect.gen(function* () {
          const service = yield* ExampleService;
          yield* service.mutate();
        }).pipe(
          Effect.catchTag("ExampleError", (e) =>
            Effect.fail(new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "ExampleError encountered during mutation",
              cause: e,
            })),
          ),
        ),
      );
      return res;
    }),
    ```

- **Context Injection:**
  - The tRPC context includes the Effect runtime, enabling dependency injection and effect management:
    ```ts
    // packages/api/src/trpc/trpc.ts
    export const createContext = () => ({ runtime: serverRuntime });
    ```

### Why This Matters

- **Type Safety:** End-to-end types from backend logic to frontend API calls.
- **Functional Error Handling:** Effect errors are handled and surfaced to the client in a type-safe way.
- **Composability:** Effect services can be composed, tested, and reused independently of tRPC.
- **Separation of Concerns:** tRPC handles transport and API shape; Effect handles business logic and effects.

### Frontend Interaction

The frontend calls these tRPC procedures and receives results or errors as returned by the Effect-powered backend. This enables robust, type-safe, and effectful APIs for modern full-stack TypeScript applications.

## Scripts

### API

- `dev`: Start the Bun tRPC server with hot reload
- `typecheck`: Run TypeScript type checking

### WWW

- `dev`: Start the Vite development server
- `build`: Typecheck and build the frontend for production
- `typecheck`: Run TypeScript type checking

## License

This example is provided for educational purposes. Feel free to use and modify it for your own projects.
