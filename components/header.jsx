"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import UserMenu from "./user-menu";
import { PenBox, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import UserLoading from "./user-loading";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // only render theme toggle after client mount
  }, []);

  return (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-3xl font-bold gradient-title">SLABS</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/project/create">
            <Button variant="destructive" className="flex items-center gap-2">
              <PenBox size={18} />
              <span className="hidden md:inline">Create Project</span>
            </Button>
          </Link>

          {/* Only render toggle on client */}
          {mounted && (
            <Button
              variant="outline"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center rounded-full p-2"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span className="hidden sm:inline">
                {theme === "dark"}
              </span>
            </Button>
          )}

          <SignedOut>
            <SignInButton>
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserMenu />
          </SignedIn>
        </div>
      </nav>

      <UserLoading />
    </header>
  );
}
