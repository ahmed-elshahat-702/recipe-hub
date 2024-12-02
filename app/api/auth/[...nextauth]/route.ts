import NextAuth from "next-auth/next";
import { authOptions } from "../auth-options";

const handler = NextAuth(authOptions);

export const { GET, POST } = handler;
