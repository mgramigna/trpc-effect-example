import { initTRPC } from "@trpc/server";
import { runEffect } from "../runtime";

export const createContext = () => ({ runEffect });

type Context = ReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;

export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
