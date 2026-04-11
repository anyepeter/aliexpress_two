"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function LoginAsRedirectPage() {
  const searchParams = useSearchParams();
  const { isSignedIn, signOut } = useAuth();
  const { signIn, setActive } = useSignIn();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Preparing...");

  useEffect(() => {
    const token = searchParams.get("token");
    const redirect = searchParams.get("redirect") || "/";

    if (!token) {
      setError("No sign-in token provided.");
      return;
    }

    // Step 1: If we're still signed in as admin, sign out first and reload
    if (isSignedIn) {
      setStatus("Clearing current session...");
      signOut().then(() => {
        // Reload page — next time isSignedIn will be false and we proceed to step 2
        window.location.href = `/admin/login-as-redirect?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(redirect)}`;
      });
      return;
    }

    // Step 2: Not signed in — now sign in with the token
    if (!signIn || !setActive) return;

    let cancelled = false;

    async function doSignIn() {
      try {
        setStatus("Signing in as user...");
        const result = await signIn!.create({
          strategy: "ticket",
          ticket: token!,
        });

        if (cancelled) return;

        if (result.status === "complete") {
          setStatus("Redirecting to dashboard...");
          await setActive!({ session: result.createdSessionId });
          window.location.href = redirect;
        } else {
          setError("Sign-in did not complete. Please try again.");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Login-as redirect error:", err);
          setError("Failed to sign in. The token may have expired. Close this window and try again.");
        }
      }
    }

    doSignIn();

    return () => {
      cancelled = true;
    };
  }, [searchParams, signIn, setActive, isSignedIn, signOut]);

  return (
    <div className="min-h-screen bg-[#E53935] flex flex-col items-center justify-center text-white">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-xl font-bold mb-2">Sign-in Failed</p>
            <p className="text-white/80 text-sm max-w-sm mx-auto">{error}</p>
            <button
              onClick={() => window.close()}
              className="mt-6 px-6 py-2 bg-white text-[#E53935] rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Close Window
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
            <p className="text-xl font-bold mb-1">Logging in as user...</p>
            <p className="text-white/70 text-sm">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
