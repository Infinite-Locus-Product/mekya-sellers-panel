import { LoadingSpinner } from "@/components/shared"

export default function PagesLoading() {
  return (
    <output className="flex min-h-[40vh] items-center justify-center" aria-label="Loading page">
      <LoadingSpinner size="lg" />
    </output>
  )
}
