import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    // Check if DB connection works before any query
    await db.$queryRaw`SELECT 1`;

    // Step 1: Try finding by Clerk ID
    let loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!loggedInUser) {
      // Step 2: Try finding by email if not found by Clerk ID
      loggedInUser = await db.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
      });

      if (loggedInUser) {
        // Step 3: Update record with Clerk info if found by email
        loggedInUser = await db.user.update({
          where: { email: user.emailAddresses[0].emailAddress },
          data: {
            clerkUserId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
          },
        });
      } else {
        // Step 4: Create new record
        loggedInUser = await db.user.create({
          data: {
            clerkUserId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
          },
        });
      }
    }

    return loggedInUser;
  } catch (error) {
    // Handle Neon sleeping / connection issues
    if (
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ETIMEDOUT")
    ) {
      console.warn(
        "⚠️ Database is currently unreachable. Neon may be paused or network is unstable."
      );
      return null;
    }

    // Handle Prisma constraint or general DB errors
    console.error("❌ Error in checkUser:", error);
    return null;
  }
};
