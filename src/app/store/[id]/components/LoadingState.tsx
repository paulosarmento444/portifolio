"use client"

export function LoadingState() {
  return (
    <div className="relative overflow-hidden bg-black min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        ></div>
      </div>

      <div className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Back Button Skeleton */}
          <div className="mb-8">
            <div className="h-12 bg-gray-700 rounded-2xl animate-pulse w-40"></div>
          </div>

          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-700 rounded-full animate-pulse w-48 mx-auto mb-6"></div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Gallery Skeleton */}
            <div className="space-y-6">
              <div className="aspect-square bg-gray-700 rounded-3xl animate-pulse"></div>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="aspect-square bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="h-16 bg-gray-700 rounded animate-pulse w-3/4"></div>
                <div className="h-12 bg-gray-700 rounded animate-pulse w-1/2"></div>
                <div className="flex gap-3">
                  <div className="h-8 bg-gray-700 rounded-full animate-pulse w-24"></div>
                  <div className="h-8 bg-gray-700 rounded-full animate-pulse w-32"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-gray-700 rounded animate-pulse w-1/4"></div>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-12 bg-gray-700 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-gray-700 rounded animate-pulse w-1/4"></div>
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-12 bg-gray-700 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="h-16 bg-gray-700 rounded-2xl animate-pulse w-full"></div>
              <div className="h-32 bg-gray-700 rounded-2xl animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  )
}
