export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Left panel skeleton */}
      <div className="w-[320px] border-r border-gray-100 p-4 space-y-4">
        <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-9 bg-gray-50 rounded-lg animate-pulse" />
        <div className="space-y-3 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E53935]/30 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    </div>
  );
}
