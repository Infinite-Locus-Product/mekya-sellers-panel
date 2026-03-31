import { Switch } from "@/components/ui/switch"

interface StatusToggleProps {
  status: "active" | "inactive"
  onToggle: (newStatus: "active" | "inactive") => void
}

export const StatusToggle = ({ status, onToggle }: StatusToggleProps) => {
  const isActive = status === "active"

  const handleChange = (checked: boolean) => {
    onToggle(checked ? "active" : "inactive")
  }

  return <Switch checked={isActive} onCheckedChange={handleChange} />
}
