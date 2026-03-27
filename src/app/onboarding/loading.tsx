'use client'

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 h-2 mx-1 bg-secondary rounded" />
            ))}
          </div>
          <div className="text-center">
            <div className="h-4 w-32 bg-secondary rounded mx-auto" />
          </div>
        </div>

        {/* Form Steps Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-secondary rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-32 bg-secondary rounded mb-2" />
              <div className="h-11 w-full bg-secondary rounded-lg" />
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between mt-8">
          <div className="h-11 w-24 bg-secondary rounded-lg" />
          <div className="h-11 w-24 bg-secondary rounded-lg" />
        </div>
      </div>
    </div>
  )
}
