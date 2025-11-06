"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Get organization by slug
 * (still requires org membership)
 */
export async function getOrganization(slug) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const organization = await clerkClient().organizations.getOrganization({ slug });
  if (!organization) return null;

  // Check membership
  const { data: membership } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  const userMembership = membership.find(
    (member) => member.publicUserData.userId === userId
  );

  if (!userMembership) return null;

  return organization;
}

/**
 * Get projects for an organization
 */
export async function getProjects(orgId) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  if (!orgId) return []; // Return empty if orgId not provided

  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

/**
 * Get issues assigned to or reported by a user
 * No orgId required
 */
export async function getUserIssues(userId) {
  if (!userId) throw new Error("No user id provided");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

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
 * (still requires orgId)
 */
export async function getOrganizationUsers(orgId) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

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
