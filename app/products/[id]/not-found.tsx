import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-[#E53935]/10 flex items-center justify-center mx-auto mb-5">
          <PackageSearch className="w-10 h-10 text-[#E53935]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          Product Not Found
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          This product may have been removed or is no longer available.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="javascript:history.back()"
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-[#E53935] hover:text-[#E53935] transition-colors"
          >
            Go Back
          </Link>
          <Link
            href="/shop"
            className="px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-semibold hover:bg-[#C62828] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
