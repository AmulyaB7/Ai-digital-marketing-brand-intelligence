import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          AI Digital Marketing SaaS
        </h1>

        <Show when="signed-out">
          <div className="flex gap-4 justify-center mt-6">
            <SignInButton>
              <button className="px-5 py-2 bg-black text-white rounded-lg">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton>
              <button className="px-5 py-2 border rounded-lg">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="mt-6">
            <p className="mb-4">
              You are logged in 🎉
            </p>

            <UserButton />
          </div>
        </Show>
      </div>
    </main>
  );
}