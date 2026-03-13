import { Suspense } from "react";
import { ShoppingBag, Shield, TrendingUp, Users } from "lucide-react";
import AuthPage from "@/components/auth/AuthPage";

const TRUST_BULLETS = [
  { icon: Shield, text: "Verified sellers & secure payments" },
  { icon: TrendingUp, text: "Set your own margins & grow freely" },
  { icon: Users, text: "Join thousands of active buyers & sellers" },
] as const;

export default function AuthRoute() {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#E53935] via-[#0F2540] to-[#0a1a2e] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-[#E53935]/10" />

        <div className="relative z-10 text-center text-white max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <ShoppingBag size={48} className="text-[#E53935]" />
            <span className="text-4xl font-bold">MarketHub</span>
          </div>

          <p className="text-xl text-white/80 mb-10">
            The marketplace where sellers thrive and buyers discover
          </p>

          {/* Trust bullets */}
          <div className="space-y-4 text-left">
            {TRUST_BULLETS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/70 text-sm">
                <Icon size={18} className="text-[#E53935] shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <ShoppingBag className="text-[#E53935]" size={32} />
            <span className="text-2xl font-bold text-[#E53935]">
              Market<span className="text-[#E53935]">Hub</span>
            </span>
          </div>

          {/* Needs useSearchParams — wrap in Suspense */}
          <Suspense
            fallback={
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-xl mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            }
          >
            <AuthPage />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
