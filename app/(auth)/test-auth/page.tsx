"use client";

import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";

export default function TestPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [subStatus, setSubStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkSub = async () => {
    const res = await fetch("/api/subscription/status");
    const data = await res.json();
    setSubStatus(data);
  };

  const checkout = async (plan: "monthly" | "yearly") => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }), // priceId ki jagah plan bhejo
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  if (!isLoaded) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-black">🧪 Auth + Stripe Test</h1>

      {/* AUTH STATUS */}
      <div className="border rounded-xl p-5 space-y-3">
        <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500">
          Clerk Auth
        </h2>
        {isSignedIn ? (
          <>
            <p className="text-green-600 font-bold">✅ Logged in</p>
            <p className="text-sm text-zinc-600">
              User ID:{" "}
              <code className="bg-zinc-100 px-1 rounded">{user.id}</code>
            </p>
            <p className="text-sm text-zinc-600">
              Email: {user.emailAddresses[0].emailAddress}
            </p>
            <SignOutButton>
              <button className="bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-lg">
                Sign Out
              </button>
            </SignOutButton>
          </>
        ) : (
          <>
            <p className="text-red-500 font-bold">❌ Not logged in</p>
            <SignInButton mode="modal">
              <button className="bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-lg">
                Sign In
              </button>
            </SignInButton>
          </>
        )}
      </div>

      {/* SUBSCRIPTION STATUS */}
      {isSignedIn && (
        <div className="border rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500">
            Subscription
          </h2>
          <button
            onClick={checkSub}
            className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            Check Subscription Status
          </button>
          {subStatus && (
            <pre className="bg-zinc-100 p-3 rounded-lg text-xs overflow-auto">
              {JSON.stringify(subStatus, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* STRIPE CHECKOUT */}
      {isSignedIn && (
        <div className="border rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500">
            Stripe Checkout
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => checkout("monthly")}
              disabled={loading}
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Test Monthly ($9)
            </button>
            <button
              onClick={() => checkout("yearly")}
              disabled={loading}
              className="bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Test Yearly ($79)
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Use card: 4242 4242 4242 4242, any future date, any CVC
          </p>
        </div>
      )}
    </div>
  );
}
