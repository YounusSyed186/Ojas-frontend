import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, AlertCircle, Loader2, Plus, Clock } from "lucide-react";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { doctorDashboardApi } from "@/lib/api/doctorDashboardApi";
import { getApiErrorMessage } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const DoctorNotes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [newNote, setNewNote] = useState("");
  const [consultationId, setConsultationId] = useState("");

  const consultationsQuery = useQuery({
    queryKey: ["doctor-consultations", "assigned", "notes-selector"],
    queryFn: () => doctorDashboardApi.consultations({ scope: "assigned", per_page: 100 }),
  });

  const notesQuery = useQuery({
    queryKey: ["doctor-notes", page],
    queryFn: () => doctorDashboardApi.notes({ page, per_page: 10 }),
  });

  const addNoteMutation = useMutation({
    mutationFn: () => doctorDashboardApi.addNotes(Number(consultationId), newNote, false),
    onSuccess: () => {
      toast({ title: "Note added" });
      setNewNote("");
      queryClient.invalidateQueries({ queryKey: ["doctor-notes"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-consultations"] });
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Unable to add note"), variant: "destructive" }),
  });

  const notes = notesQuery.data?.notes?.data ?? [];
  const pagination = notesQuery.data?.notes;
  const consultations = (consultationsQuery.data?.consultations?.data ?? []).filter(
    (consultation: any) => consultation.doctor_id !== null,
  );

  return (
    <DoctorLayout title="Notes" subtitle="Manage your consultation notes.">
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#021B09]/10 p-2">
            <Plus className="h-4 w-4 text-[#021B09]" />
          </div>
          <p className="font-medium">Add a Note</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="note-consultation">Consultation</Label>
          <Select value={consultationId} onValueChange={setConsultationId}>
            <SelectTrigger id="note-consultation" className="rounded-xl">
              <SelectValue placeholder={consultationsQuery.isLoading ? "Loading consultations..." : "Choose a consultation"} />
            </SelectTrigger>
            <SelectContent>
              {consultations.map((consultation: any) => (
                <SelectItem key={consultation.id} value={String(consultation.id)}>
                  #{consultation.id} · {consultation.customer?.name || "Customer"} · {consultation.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!consultationsQuery.isLoading && consultations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No assigned consultations are available. Accept a consultation before adding notes.
            </p>
          )}
        </div>
        <Textarea
          rows={4}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          className="rounded-xl"
        />
        <Button
          className="rounded-full"
          disabled={!consultationId || !newNote.trim() || addNoteMutation.isPending}
          onClick={() => addNoteMutation.mutate()}
        >
          {addNoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Note
        </Button>
      </div>

      {notesQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      )}

      {notesQuery.isError && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="font-medium">Failed to load notes</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => notesQuery.refetch()}>Retry</Button>
        </div>
      )}

      {!notesQuery.isLoading && !notesQuery.isError && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">No notes yet</p>
          <p className="text-sm">Your notes will appear here.</p>
        </div>
      )}

      {!notesQuery.isLoading && !notesQuery.isError && notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((n: any) => (
            <Card key={n.id} className="border-0 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-[#021B09]/10 p-2 mt-0.5">
                    <FileText className="h-4 w-4 text-[#021B09]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap">{n.doctor_notes || n.note || n.content}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3" /> {formatDate(n.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" className="rounded-full" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pagination.current_page} of {pagination.last_page}</span>
          <Button variant="outline" size="sm" className="rounded-full" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </DoctorLayout>
  );
};

export default DoctorNotes;
