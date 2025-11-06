"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * CREATE PROJECT
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
 * GET PROJECT (no orgId required)
 */
export async function getProject(projectId) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sprints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // 🧠 Optional: still restrict access if project is tied to an organization
  if (project.organizationId) {
    try {
      const { data: membershipList } =
        await clerkClient().organizations.getOrganizationMembershipList({
          organizationId: project.organizationId,
        });

      const isMember = membershipList.some(
        (m) => m.publicUserData.userId === userId
      );

      if (!isMember) {
        throw new Error(
          "Access denied: you are not a member of this organization"
        );
      }
    } catch (error) {
      // Fail softly if Clerk org lookup fails (to prevent total page crash)
      console.warn("Membership check failed:", error.message);
    }
  }

  return project;
}

/**
 * DELETE PROJECT
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
