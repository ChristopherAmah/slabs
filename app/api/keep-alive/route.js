// app/api/keep-alive/route.js
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", message: "Neon is awake 🌙➡️☀️" });
  } catch (error) {
    console.error("⚠️ Neon keep-alive failed:", error);
    return Response.json({ status: "error", message: error.message });
  }
}
