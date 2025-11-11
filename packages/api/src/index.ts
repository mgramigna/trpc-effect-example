import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/trpc";

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext,
});

server.on("listening", () => {
  console.log("tRPC server is running on http://localhost:3001");
});

server.listen(3001);
