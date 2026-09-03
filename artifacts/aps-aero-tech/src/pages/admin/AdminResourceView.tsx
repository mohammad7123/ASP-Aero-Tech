import { useState, useEffect } from "react"
import { useListAdminResource, useCreateAdminResource, useUpdateAdminResource, useDeleteAdminResource, getListAdminResourceQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Search, X, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProductEditorFields } from "./ProductEditorFields"

export function AdminResourceView({ params }: { params: { resource: string } }) {
  const { resource } = params
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, error } = useListAdminResource(resource, { search: debouncedSearch || undefined })
  const createMut = useCreateAdminResource()
  const updateMut = useUpdateAdminResource()
  const deleteMut = useDeleteAdminResource()

  const [panelOpen, setPanelOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<any>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    // Reset state when resource changes
    setPanelOpen(false)
    setSearch("")
    setDebouncedSearch("")
  }, [resource])

  const handleOpenCreate = () => {
    setEditingRow(null)
    setFormData(resource === "products" ? { categories: [], specs: {}, features: ["Encrypted Comms", "Autonomous", "Mission-Ready"], sort_order: 0, is_active: true } : {})
    setPanelOpen(true)
  }

  const handleOpenEdit = (row: any) => {
    setEditingRow(row)
    setFormData({ ...row })
    setPanelOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("CONFIRM DELETION: This action cannot be reversed.")) {
      deleteMut.mutate({ resource, id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminResourceQueryKey(resource, { search: debouncedSearch || undefined }) })
          queryClient.invalidateQueries({ queryKey: getListAdminResourceQueryKey(resource) })
          toast({ title: "RECORD DELETED", description: "The resource has been removed from the database." })
        },
        onError: () => {
          toast({ title: "DELETION FAILED", description: "System encountered an error while removing the record.", variant: "destructive" })
        }
      })
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRow?.id) {
      updateMut.mutate({ resource, id: editingRow.id as number, data: { values: formData } }, {
        onSuccess: () => {
          setPanelOpen(false)
          queryClient.invalidateQueries({ queryKey: getListAdminResourceQueryKey(resource, { search: debouncedSearch || undefined }) })
          queryClient.invalidateQueries({ queryKey: getListAdminResourceQueryKey(resource) })
          toast({ title: "RECORD UPDATED", description: "Changes successfully committed." })
        },
        onError: () => {
          toast({ title: "UPDATE FAILED", description: "System encountered an error while saving.", variant: "destructive" })
        }
      })
    } else {
      createMut.mutate({ resource, data: { values: formData } }, {
        onSuccess: () => {
          setPanelOpen(false)
          queryClient.invalidateQueries({ queryKey: getListAdminResourceQueryKey(resource, { search: debouncedSearch || undefined }) })
          queryClient.invalidateQueries({ queryKey: getListAdminResourceQueryKey(resource) })
          toast({ title: "RECORD CREATED", description: "New resource successfully added." })
        },
        onError: () => {
          toast({ title: "CREATION FAILED", description: "System encountered an error while saving.", variant: "destructive" })
        }
      })
    }
  }

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
        ERR_DATA_RETRIEVAL_FAILURE: Unable to load resource payload.
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-foreground">{data.label}</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">{data.total} RECORDS DETECTED</p>
        </div>
        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="SEARCH DATABANKS..." 
              className="pl-9 h-10 bg-card border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenCreate} className="h-10 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            NEW RECORD
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {data.fields.map(f => (
                  <TableHead key={f.name}>{f.label}</TableHead>
                ))}
                <TableHead className="w-[100px] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={data.fields.length + 1} className="h-24 text-center text-muted-foreground font-mono">
                    NO RECORDS MATCH QUERY
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((row: any, i: number) => (
                  <TableRow key={i}>
                    {data.fields.map(f => (
                      <TableCell key={f.name} className="max-w-[200px] truncate">
                        {String(row[f.name] ?? '-')}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(row)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(row.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Slide-out Edit/Create Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-lg h-full bg-card border-l border-primary/20 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-primary/50 to-transparent pointer-events-none" />
            
            <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/50">
              <h2 className="font-display font-bold uppercase tracking-widest text-lg">
                {editingRow ? "EDIT RECORD" : "NEW RECORD"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setPanelOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <form id="resource-form" onSubmit={handleSave} className="space-y-6">
                {resource === "products" ? (
                  <ProductEditorFields formData={formData} setFormData={setFormData} />
                ) : data.fields.filter(f => f.editable).map(f => (
                  <div key={f.name} className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-bold">
                      {f.label} {f.required && <span className="text-primary">*</span>}
                    </label>
                    {f.type === 'boolean' ? (
                      <select
                        className="flex h-10 w-full rounded-sm border border-input bg-background/50 px-3 py-1 text-sm shadow-sm font-mono"
                        value={formData[f.name] ? 'true' : 'false'}
                        onChange={(e) => setFormData({...formData, [f.name]: e.target.value === 'true'})}
                      >
                        <option value="false">FALSE</option>
                        <option value="true">TRUE</option>
                      </select>
                    ) : f.type === 'textarea' || f.type === 'json' ? (
                      <textarea
                        className="flex min-h-[120px] w-full rounded-sm border border-input bg-background/50 px-3 py-2 text-sm shadow-sm font-mono"
                        value={formData[f.name] || ''}
                        onChange={(e) => setFormData({...formData, [f.name]: e.target.value})}
                        required={f.required}
                      />
                    ) : (
                      <Input
                        type={f.type === 'number' ? 'number' : f.type === 'date' ? 'datetime-local' : f.type === 'url' ? 'url' : 'text'}
                        value={formData[f.name] ?? ''}
                        onChange={(e) => setFormData({...formData, [f.name]: f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value})}
                        required={f.required}
                      />
                    )}
                  </div>
                ))}
              </form>
            </div>

            <div className="p-6 border-t border-border bg-background/50 shrink-0 flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setPanelOpen(false)}>
                CANCEL
              </Button>
              <Button type="submit" form="resource-form" className="flex-1" disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? "SAVING..." : "COMMIT CHANGES"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
