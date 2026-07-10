import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface StatusToggleProps {
  status: "active" | "inactive"
  onToggle: (newStatus: "active" | "inactive") => void
  isLoading?: boolean
}

export const StatusToggle = ({ status, onToggle, isLoading = false }: StatusToggleProps) => {
  const isActive = status === "active"

  const handleChange = (checked: boolean) => {
    onToggle(checked ? "active" : "inactive")
  }

  if (isLoading) {
    return <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
  }

  return <Switch checked={isActive} onCheckedChange={handleChange} />
}
