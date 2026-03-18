"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, FileText, Clock, Plus, ShieldAlert, FileSearch, ClipboardList, Loader2, History, Info, ExternalLink } from "lucide-react"
import { SmartDiagnosis } from "../diagnosis/smart-diagnosis"
import { RiskAnalysis } from "../diagnosis/risk-analysis"
import { PdfAnalysis } from "../diagnosis/pdf-analysis"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDocs, limit } from "firebase/firestore"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { generatePatientSummary, PatientSummaryOutput } from "@/ai/flows/patient-health-summary-flow"

export function DoctorView({ viewId }: { viewId: string }) {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  // States
  const [isConsultOpen, setIsConsultOpen] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null)
  const [patientHistory, setPatientHistory] = React.useState<any[]>([])
  const [aiSummary, setAiSummary] = React.useState<PatientSummaryOutput | null>(null)
  const [loadingHistory, setLoadingHistory] = React.useState(false)
  
  // Form State
  const [notes, setNotes] = React.useState("")
  const [medName, setMedName] = React.useState("")
  const [dosage, setDosage] = React.useState("")
  const [instr, setInstr] = React.useState("")

  // Real-time Collections
  const patientsQuery = React.useMemo(() => collection(db, "patients"), [db])
  const { data: patients, loading: patientsLoading } = useCollection(patientsQuery)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const appointmentsQuery = React.useMemo(() => 
    query(collection(db, "appointments"), where("date", "==", todayStr), orderBy("time", "asc")), 
    [db, todayStr]
  )
  const { data: appointments, loading: appointmentsLoading } = useCollection(appointmentsQuery)

  const handleConsult = (patient: any, appointmentId?: string) => {
    setSelectedPatient(patient)
    setSelectedAppointmentId(appointmentId || null)
    setIsConsultOpen(true)
  }

  const fetchPatientHistory = async (patient: any) => {
    setLoadingHistory(true)
    setSelectedPatient(patient)
    setIsHistoryOpen(true)
    try {
      const q = query(collection(db, "prescriptions"), where("patientId", "==", patient.id), orderBy("createdAt", "desc"))
      const snap = await getDocs(q)
      const hist = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setPatientHistory(hist)

      // Run AI Summary
      const summary = await generatePatientSummary({
        patientName: patient.name,
        history: hist.map((h: any) => h.instructions || "Routine consult"),
        medications: hist.flatMap((h: any) => h.medicines?.map((m: any) => m.name) || [])
      })
      setAiSummary(summary)
    } catch (e) {
      toast({ title: "Failed to load history", variant: "destructive" })
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSaveConsult = async () => {
    if (!selectedPatient) return

    try {
      await addDoc(collection(db, "prescriptions"), {
        patientId: selectedPatient.id,
        doctorId: user?.uid,
        appointmentId: selectedAppointmentId,
        medicines: [{ name: medName, dosage: dosage, notes: instr }],
        instructions: instr,
        createdAt: serverTimestamp()
      })

      if (selectedAppointmentId) {
        await updateDoc(doc(db, "appointments", selectedAppointmentId), {
          status: 'completed',
          notes: notes
        })
      }

      toast({ title: "Consultation Finalized" })
      setIsConsultOpen(false)
      setNotes(""); setMedName(""); setDosage(""); setInstr("");
    } catch (e) {
      toast({ title: "Error", description: "Could not save.", variant: "destructive" })
    }
  }

  if (viewId === 'patients') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Patient Registry</h2>
            <p className="text-muted-foreground">Comprehensive medical records database.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            {patientsLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Clinical Info</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients?.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline">{p.age}y / {p.gender}</Badge>
                          {p.bloodGroup && <Badge variant="secondary">{p.bloodGroup}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{p.contact}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => fetchPatientHistory(p)}>
                          <History className="w-3 h-3 mr-1" />
                          History
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleConsult(p)}>Start Consult</Button>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Doctor Workspace</h2>
          <p className="text-muted-foreground">Live clinical flow and smart diagnostics.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Clinical Queue" value={appointments?.length || 0} icon={Calendar} description="Today's load" />
        <StatsCard title="Total Registry" value={patients?.length || 0} icon={Users} />
        <StatsCard title="High Risk" value="2" icon={ShieldAlert} className="border-destructive/20 bg-destructive/5" />
        <StatsCard title="Labs Pending" value="3" icon={FileSearch} />
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Queue</TabsTrigger>
          <TabsTrigger value="diagnosis">AI Assist</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="pdf">Document Lab</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>Appointments for {todayStr}</CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-4">
                  {appointments?.map((app: any) => {
                    const patient = patients?.find((p: any) => p.id === app.patientId)
                    return (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold">
                            <span className="text-xs uppercase opacity-60">Slot</span>
                            {app.time.split(':')[0]}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{patient?.name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">{app.time} • {patient?.gender}, {patient?.age}y</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={app.status === 'completed' ? 'default' : 'outline'} className="capitalize">
                            {app.status}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => fetchPatientHistory(patient)}>History</Button>
                          <Button size="sm" onClick={() => handleConsult(patient, app.id)}>Consult</Button>
                        </div>
                      </div>
                    )
                  })}
                  {appointments?.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-muted-foreground">No appointments booked for today.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis"><SmartDiagnosis /></TabsContent>
        <TabsContent value="risk"><RiskAnalysis /></TabsContent>
        <TabsContent value="pdf"><PdfAnalysis /></TabsContent>
      </Tabs>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Clinical History: {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {loadingHistory ? <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div> : (
              <>
                {aiSummary && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        AI Clinical Snapshot
                        <Badge variant="secondary" className="ml-auto">{aiSummary.stabilityScore}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm italic">{aiSummary.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {aiSummary.topConcerns.map((c, i) => <Badge key={i} variant="outline" className="bg-white">{c}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Timeline</h4>
                  {patientHistory.map((h: any) => (
                    <div key={h.id} className="border-l-2 border-primary/20 pl-4 py-2 relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-3" />
                      <div className="bg-card border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold">{format(h.createdAt?.toDate() || new Date(), 'PPP')}</p>
                          <Badge variant="secondary">Prescription</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{h.instructions}</p>
                        <div className="space-y-1">
                          {h.medicines?.map((m: any, idx: number) => (
                            <div key={idx} className="text-xs bg-muted/50 p-1 px-2 rounded flex justify-between">
                              <span className="font-semibold">{m.name}</span>
                              <span>{m.dosage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {patientHistory.length === 0 && <p className="text-center text-muted-foreground italic">No historical records found.</p>}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Consult Dialog */}
      <Dialog open={isConsultOpen} onOpenChange={setIsConsultOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Live Consultation: {selectedPatient?.name}</DialogTitle>
            <DialogDescription>Input findings to update patient EHR and issue prescriptions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Chief Complaint & Observations</Label>
              <Textarea 
                placeholder="Describe current symptoms and clinical signs..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="min-h-[120px] rounded-xl" 
              />
            </div>
            <div className="space-y-4 border p-4 rounded-xl bg-muted/20">
              <h4 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Digital Prescription</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Medication Name</Label>
                  <Input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="e.g. Amoxicillin" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Regimen / Dosage</Label>
                  <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="500mg, BID x 7 days" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Patient Instructions</Label>
                <Input value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="Take with food, avoid sunlight" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsultOpen(false)}>Discard</Button>
            <Button onClick={handleSaveConsult} className="shadow-lg shadow-primary/20">Finalize Records</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
