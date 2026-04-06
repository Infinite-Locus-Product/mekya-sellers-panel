import { LoadingSpinner } from "@/components/shared"

export default function PagesLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading page">
      <LoadingSpinner size="lg" />
    </div>
  )
}
