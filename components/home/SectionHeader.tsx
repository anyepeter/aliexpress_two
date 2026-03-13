import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  subtitle?: string;
}

export default function SectionHeader({
  title,
  viewAllHref,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A] md:text-2xl">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-[#E53935] hover:text-[#E53935] transition-colors flex items-center gap-1"
        >
          View All <span className="text-base">→</span>
        </Link>
      )}
    </div>
  );
}
