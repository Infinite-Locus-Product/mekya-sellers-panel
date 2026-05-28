import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/** Placeholder until user listing and `getUsers` are wired to the API. */
export default function UserManagementPage() {
  return (
    <div className="flex min-h-0 w-full flex-col px-4 py-6 sm:px-6 md:px-8">
      <Card className="max-w-2xl rounded-lg border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl">User management</CardTitle>
          <CardDescription>
            This section is not connected to live data yet. User listing and actions will appear here once the
            backend is integrated.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          User listing and admin actions will be available after the data layer is connected.
        </CardContent>
      </Card>
    </div>
  )
}
