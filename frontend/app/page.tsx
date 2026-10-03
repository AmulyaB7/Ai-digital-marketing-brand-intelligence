import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">

        <h1 className="text-4xl font-bold">
          AI Digital Marketing SaaS
        </h1>

        {/* LOGGED OUT */}
        <Show when="signed-out">
          <div className="flex justify-center gap-4 mt-8">

            <SignInButton>
              <button className="px-6 py-3 bg-white text-black rounded-lg">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton>
              <button className="px-6 py-3 border border-white rounded-lg">
                Sign Up
              </button>
            </SignUpButton>

          </div>
        </Show>


        {/* LOGGED IN */}
        <Show when="signed-in">
          <div className="flex flex-col items-center gap-5 mt-8">

            <p className="text-xl">
              Welcome back! 👋
            </p>

            <UserButton />

            <a
              href="/dashboard"
              className="px-6 py-3 bg-white text-black rounded-lg"
            >
              Go to Dashboard
            </a>

          </div>
        </Show>

      </div>
    </main>
  );
}