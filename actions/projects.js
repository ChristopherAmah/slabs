"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * CREATE PROJECT
 * (Requires orgId + admin privileges)
 */
export async function createProject(data) {
  const { userId } = auth();
  const { orgId, name, key, description } = data;

  if (!userId) throw new Error("Unauthorized");
  if (!orgId) throw new Error("No Organization Selected");

  // Verify user is admin of the organization
  const { data: membershipList } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userMembership = membershipList.find(
    (membership) => membership.publicUserData.userId === userId
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error("Only organization admins can create projects");
  }

  try {
    const project = await db.project.create({
      data: {
        name,
        key,
        description,
        organizationId: orgId,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Error creating project: " + error.message);
  }
}

/**
 * GET PROJECT
 * (auth required, no orgId or membership restriction)
 */
export async function getProject(projectId) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  if (!projectId) throw new Error("Project ID is required");

  // Optional: ensure the user exists locally, but don’t block if missing
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    // Don’t throw — just continue
    console.warn("User not found in local DB, but proceeding");
  }

  // Fetch the project
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sprints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) throw new Error("Project not found");

  // ❌ Removed membership check — all logged-in users can view
  return project;
}

/**
 * DELETE PROJECT
 * (Requires orgId + admin privileges)
 */
export async function deleteProject({ projectId, orgId }) {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");
  if (!orgId) throw new Error("No Organization Selected");

  // Verify user is admin of the organization
  const { data: membershipList } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userMembership = membershipList.find(
    (membership) => membership.publicUserData.userId === userId
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error("Only organization admins can delete projects");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found or unauthorized access");
  }

  await db.project.delete({
    where: { id: projectId },
  });

  return { success: true };
}
