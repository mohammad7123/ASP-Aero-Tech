import { useGetAdminOverview } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Mail, Box, Briefcase, FileText, Layers, Loader2 } from "lucide-react"

export function AdminOverview() {
  const { data, isLoading, error } = useGetAdminOverview()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-destructive font-mono border border-destructive/30 bg-destructive/10 p-4 clip-edges">
        ERR_TELEMETRY_FAILURE: Unable to fetch system overview.
      </div>
    )
  }

  const stats = [
    { label: "Total Inquiries", value: data.inquiriesTotal, icon: Mail, highlight: data.unreadInquiries > 0, extra: `${data.unreadInquiries} UNREAD` },
    { label: "Active Products", value: data.activeProducts, icon: Box },
    { label: "Active Services", value: data.activeServices, icon: Briefcase },
    { label: "Published Pages", value: data.publishedPages, icon: Layers },
    { label: "Open Jobs", value: data.openJobs, icon: FileText },
    { label: "Published Posts", value: data.publishedPosts, icon: FileText },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-foreground">
                {stat.value.toString().padStart(3, '0')}
              </div>
              {stat.extra && (
                <div className={`mt-2 text-xs font-mono font-bold ${stat.highlight ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
                  {stat.extra}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transmissions (Inquiries)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentInquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-mono text-sm">
              NO RECENT TRANSMISSIONS DETECTED
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TIMESTAMP</TableHead>
                  <TableHead>SENDER</TableHead>
                  <TableHead>SUBJECT</TableHead>
                  <TableHead>STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentInquiries.map((inq: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'UNKNOWN'}</TableCell>
                    <TableCell className="font-medium">{inq.name} {inq.organization ? `(${inq.organization})` : ''}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[200px]">{inq.interest}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono uppercase">LOGGED</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
