import { Truck, Clock, RotateCcw, BadgePercent } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Free shipping",
    desc: "on Choice orders",
    color: "#E53935",
  },
  {
    icon: Clock,
    title: "Fast delivery",
    desc: "with easy refunds",
    color: "#E53935",
  },
  {
    icon: RotateCcw,
    title: "Free returns",
    desc: "within 90 days",
    color: "#E53935",
  },
  {
    icon: BadgePercent,
    title: "New lower prices",
    desc: "Savings are back",
    color: "#E53935",
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-white border-b border-gray-100 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="flex items-center gap-2 flex-shrink-0 px-2"
              >
                <Icon
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: badge.color }}
                />
                <p className="text-sm text-[#1A1A1A] whitespace-nowrap">
                  <span className="font-bold">{badge.title}</span>{" "}
                  <span className="text-gray-500">{badge.desc}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
