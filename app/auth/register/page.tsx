import Link from "next/link";
import { Store } from "lucide-react";
import RegisterRouter from "@/components/auth/RegisterRouter";

export const metadata = {
  title: "Create Account — MarketHub",
};

export default function RegisterPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#F5F6FA]">
      {/* Minimal top bar — logo only */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 shrink-0 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Store className="w-7 h-7 text-[#E53935]" />
          <span className="text-xl font-extrabold text-[#E53935]">
            Market<span className="text-[#E53935]">Hub</span>
          </span>
        </Link>
        <Link
          href="/auth/login"
          className="text-sm text-gray-500 hover:text-[#E53935] font-medium transition-colors"
        >
          Already have an account? Sign in
        </Link>
      </header>

      {/* Centered content — vertically fills remaining space */}
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <RegisterRouter />
      </main>
    </div>
  );
}
