"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function SignOut() {
  return (
    <SignOutButton>
      <button className="mt-6 px-5 py-2 bg-red-600 text-white rounded-lg">
        Sign Out
      </button>
    </SignOutButton>
  );
}