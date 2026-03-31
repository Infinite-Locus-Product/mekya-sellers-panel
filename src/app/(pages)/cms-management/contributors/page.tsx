"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  UserPlus,
  Users,
  Link2,
  Eye,
  Settings,
  ChevronDown,
  User,
  Pencil,
  Check,
  XCircle,
} from "lucide-react"

const SUBMISSION_LINK = "http://cms.example.com/contribute/abc"

const PENDING_SUBMISSIONS = [
  {
    id: "1",
    title: "5 Key Advantages of Buying Fashion in Bulk...",
    subtitle:
      "Buying in bulk doesn't mean compromising on quality or variety — not when you're using Mekya. Our platfo...",
    author: "Alice Cooper",
    category: "Buying",
    publishDate: "01-Jan-2025",
    status: "Pending",
  },
  {
    id: "2",
    title: "5 Key Advantages of Buying Fashion in Bulk...",
    subtitle:
      "Buying in bulk doesn't mean compromising on quality or variety — not when you're using Mekya. Our platfo...",
    author: "Hardik Tiwari",
    category: "Buying",
    publishDate: "01-Jan-2025",
    status: "Pending",
  },
  {
    id: "3",
    title: "5 Key Advantages of Buying Fashion in Bulk...",
    subtitle:
      "Buying in bulk doesn't mean compromising on quality or variety — not when you're using Mekya. Our platfo...",
    author: "Shivam Singh",
    category: "Buying",
    publishDate: "01-Jan-2025",
    status: "Pending",
  },
]

const ACTIVE_CONTRIBUTORS = [
  {
    id: "1",
    name: "Alice Cooper",
    email: "alice@blogger.com",
    joinDate: "01-Jan-2025",
    submitted: 120,
    approved: 118,
    status: "Active",
    avatar: null,
  },
  {
    id: "2",
    name: "Hardik Tiwari",
    email: "hardiktiwari1@blogger.com",
    joinDate: "01-Jan-2025",
    submitted: 321,
    approved: 312,
    status: "Active",
    avatar: null,
  },
  {
    id: "3",
    name: "Shivam Singh",
    email: "shivam@blogger.com",
    joinDate: "01-Jan-2025",
    submitted: 720,
    approved: 620,
    status: "Inactive",
    avatar: null,
  },
]

export default function ContributorsPage() {
  const [copied, setCopied] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [rejectingSubmissionId, setRejectingSubmissionId] = useState<string | null>(null)

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SUBMISSION_LINK)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  const handleSendInvite = useCallback(() => {
    // TODO: call API to send invite
    setInviteEmail("")
    setInviteOpen(false)
  }, [])

  const handleInviteOpenChange = useCallback((open: boolean) => {
    setInviteOpen(open)
    if (!open) setInviteEmail("")
  }, [])

  const openRejectFeedback = useCallback((submissionId: string) => {
    setRejectingSubmissionId(submissionId)
    setFeedbackText("")
    setFeedbackOpen(true)
  }, [])

  const handleFeedbackOpenChange = useCallback((open: boolean) => {
    setFeedbackOpen(open)
    if (!open) {
      setFeedbackText("")
      setRejectingSubmissionId(null)
    }
  }, [])

  const handleFeedbackDone = useCallback(() => {
    // TODO: call API to reject submission with feedbackText and rejectingSubmissionId
    setFeedbackText("")
    setRejectingSubmissionId(null)
    setFeedbackOpen(false)
  }, [])

  return (
    <div className="flex flex-col w-full max-w-6xl space-y-8">
      <div className="flex flex-col gap-4">
        <nav className="text-sm text-muted-foreground">
          Admin Dashboard &gt; CMS Management &gt; Contributors
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Contributors</h1>
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Contributor
          </Button>
        </div>

        <Dialog open={inviteOpen} onOpenChange={handleInviteOpenChange}>
          <DialogContent className="max-w-md p-6 sm:p-6">
            <DialogHeader className="space-y-1 pr-8">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="h-5 w-5 shrink-0" aria-hidden />
                Invite Contributor
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="invite-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="Contributor@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="rounded-md bg-sky-50 px-3 py-2.5 text-sm text-sky-800">
                An invitation email will be sent with the submission link and
                instructions.
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendInvite}>Send Invite</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={feedbackOpen} onOpenChange={handleFeedbackOpenChange}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className="border-b px-6 py-4">
              <DialogHeader className="space-y-0 pr-8">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Pencil className="h-5 w-5 shrink-0" aria-hidden />
                  Add Feedback
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex flex-col gap-4 px-6 py-4">
              <textarea
                placeholder="Write feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-md border border-input bg-[#E8E9E8] px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Feedback"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFeedbackOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleFeedbackDone}>Done</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">
              Blog Submission Link
            </h2>
            <p className="text-sm text-muted-foreground">
              Share this link with contributors to allow them to submit blog
              posts
            </p>
          </div>
          <div className="flex items-stretch gap-3">
            <div className="flex flex-1 min-w-0 items-center gap-2 rounded-md border bg-muted/30 px-3 py-2.5">
              <Link2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate text-sm text-primary">
                {SUBMISSION_LINK}
              </span>
            </div>
            <Button
              onClick={handleCopyLink}
              variant="secondary"
              className="shrink-0"
            >
              <Link2 className="h-4 w-4 mr-2" aria-hidden />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Pending Submissions
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-[#E8E9E8]">
                    <th className="px-4 py-3 font-medium text-foreground">
                      Title
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Author
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Publish Date
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Preview
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PENDING_SUBMISSIONS.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">
                            {sub.title}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {sub.subtitle}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {sub.author}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {sub.category}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {sub.publishDate}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" aria-label="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1.5" />
                              Action
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openRejectFeedback(sub.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Active Contributors
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-[#E8E9E8]">
                    <th className="px-4 py-3 font-medium text-foreground">
                      Profile image
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Join Date
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Submitted
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Approved
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ACTIVE_CONTRIBUTORS.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                          {c.avatar ? (
                            <img
                              src={c.avatar}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users
                              className="h-5 w-5 text-muted-foreground"
                              aria-hidden
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">
                            {c.name}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            {c.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.joinDate}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.submitted}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.approved}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            c.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
