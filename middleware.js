// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isProtectedRoute = createRouteMatcher([
//   "/onboarding(.*)",
//   "/organisation(.*)",
//   "/project(.*)",
//   "/issue(.*)",
//   "/sprint(.*)",
// ]);

// export default clerkMiddleware((auth, req) => {
//   if (!auth().userId && isProtectedRoute(req)) {
//     return auth().redirectToSignIn();
//   }

//   if (
//     auth().userId &&
//     !auth().orgId &&
//     req.nextUrl.pathname !== "/onboarding" &&
//     req.nextUrl.pathname !== "/"
//   ) {
//     return NextResponse.redirect(new URL("/onboarding", req.url));
//   }
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };



// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isProtectedRoute = createRouteMatcher([
//   "/onboarding(.*)",
//   "/organization(.*)",
//   "/project(.*)",
//   "/issue(.*)",
//   "/sprint(.*)",
// ]);

// export default clerkMiddleware((auth, req) => {
//   const { userId, orgId } = auth();

//   // If not signed in → redirect to sign-in page
//   if (!userId && isProtectedRoute(req)) {
//     return auth().redirectToSignIn();
//   }

//   // If signed in but no organization → redirect to onboarding,
//   // except when already on onboarding or organization routes
//   if (
//     userId &&
//     !orgId &&
//     !req.nextUrl.pathname.startsWith("/onboarding") &&
//     !req.nextUrl.pathname.startsWith("/organization")
//   ) {
//     return NextResponse.redirect(new URL("/onboarding", req.url));
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };


// import { clerkMiddleware } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export default clerkMiddleware();

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };


// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // Define which routes should require authentication and organization context
// const isProtectedRoute = createRouteMatcher([
//   "/onboarding(.*)",
//   "/organization(.*)",
//   "/project(.*)",
//   "/issue(.*)",
//   "/sprint(.*)",
// ]);

// export default clerkMiddleware((auth, req) => {
//   const { userId, orgId } = auth();

//   // If the route is protected and the user is not signed in → redirect to sign-in page
//   if (!userId && isProtectedRoute(req)) {
//     return auth().redirectToSignIn({ returnBackUrl: req.url });
//   }

//   // If the user is signed in but doesn't have an organization yet
//   // redirect them to onboarding, unless already on onboarding or organization pages
//   if (
//     userId &&
//     !orgId &&
//     !req.nextUrl.pathname.startsWith("/onboarding") &&
//     !req.nextUrl.pathname.startsWith("/organization")
//   ) {
//     return NextResponse.redirect(new URL("/onboarding", req.url));
//   }

//   return NextResponse.next();
// });

// // Configuration for which paths the middleware should apply to
// export const config = {
//   matcher: [
//     // Apply to all routes except static assets and Next.js internals
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // Define which routes require authentication
// const isProtectedRoute = createRouteMatcher([
//   "/onboarding(.*)",
//   "/organisation(.*)",
//   "/project(.*)",
//   "/issue(.*)",
// ]);

// export default clerkMiddleware((auth, req) => {
//   const { userId, orgId } = auth();
//   const { pathname } = req.nextUrl;

//   // If user is not signed in and tries to access a protected route
//   if (!userId && isProtectedRoute(req)) {
//     return auth().redirectToSignIn();
//   }

//   // Define routes that can be accessed without being in an organization
//   const allowedWithoutOrg = ["/", "/onboarding", "/project/create",];

//   // Regex pattern to allow organization slug routes
//   const orgBySlugRoute = /^\/organization\/[^\/]+$/;

//   // Redirect user to onboarding if they are signed in but have no org selected
//   if (
//     userId &&
//     !orgId &&
//     !allowedWithoutOrg.includes(pathname) &&
//     !orgBySlugRoute.test(pathname)
//   ) {
//     return NextResponse.redirect(new URL("/onboarding", req.url));
//   }

//   // Otherwise, allow the request to continue
//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };


import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define routes that require the user to be signed in
const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/organization(.*)",
  "/project(.*)",
  "/issue(.*)",
  "/sprint(.*)",
]);

export default clerkMiddleware((auth, req) => {
  const { userId, orgId } = auth();
  const { pathname } = req.nextUrl;

  // 1️⃣ Redirect unauthenticated users from protected routes → Sign-in
  if (!userId && isProtectedRoute(req)) {
    return auth().redirectToSignIn({ returnBackUrl: req.url });
  }

  // 2️⃣ Routes allowed without an active organization
  // NOTE: use regex or startsWith, not array includes, since pathname is full
  const allowedWithoutOrg = ["/", "/onboarding", "/project/create"];
  const isAllowedWithoutOrg =
    allowedWithoutOrg.includes(pathname) ||
    pathname.startsWith("/project/"); // ✅ allows /project/[id]

  // 3️⃣ Match org slug routes (like /organization/xyz)
  const orgBySlugRoute = /^\/organization\/[^\/]+/;

  // 4️⃣ If signed in but no org selected → redirect to onboarding
  if (userId && !orgId && !isAllowedWithoutOrg && !orgBySlugRoute.test(pathname)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 5️⃣ Otherwise, continue the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Apply to all routes except static files & Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
