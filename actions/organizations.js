"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Get organization by slug
 * (auth required, no membership check)
 */
export async function getOrganization(slug) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  if (!slug) throw new Error("Organization slug is required");

  const organization = await clerkClient().organizations.getOrganization({ slug });
  if (!organization) return null;

  return organization;
}

/**
 * Get projects for an organization
 * (auth required, no org membership check)
 */
export async function getProjects(orgId) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  if (!orgId) return [];

  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

/**
 * Get issues assigned to or reported by the current logged-in user
 * (no orgId required)
 */
export async function getUserIssues() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  // Find the user in your local DB
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    // Optional: just return an empty array instead of throwing an error
    return [];
  }

  // Fetch issues assigned to or reported by this user
  const issues = await db.issue.findMany({
    where: {
      OR: [
        { assigneeId: user.id },
        { reporterId: user.id },
      ],
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

/**
 * Get all users in an organization
 * (auth required, no org membership check)
 */
export async function getOrganizationUsers(orgId) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  if (!orgId) return [];

  const organizationMemberships =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userIds = organizationMemberships.data.map(
    (membership) => membership.publicUserData.userId
  );

  const users = await db.user.findMany({
    where: { clerkUserId: { in: userIds } },
  });

  return users;
}
