"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, FileText, Clock, ShieldAlert, FileSearch, History, Info, Loader2 } from "lucide-react"
import { SmartDiagnosis } from "../diagnosis/smart-diagnosis"
import { RiskAnalysis } from "../diagnosis/risk-analysis"
import { PdfAnalysis } from "../diagnosis/pdf-analysis"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDocs } from "firebase/firestore"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
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
  
  const [isConsultOpen, setIsConsultOpen] = React.useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null)
  const [patientHistory, setPatientHistory] = React.useState<any[]>([])
  const [aiSummary, setAiSummary] = React.useState<PatientSummaryOutput | null>(null)
  const [loadingHistory, setLoadingHistory] = React.useState(false)
  
  const [notes, setNotes] = React.useState("")
  const [medName, setMedName] = React.useState("")
  const [dosage, setDosage] = React.useState("")
  const [instr, setInstr] = React.useState("")

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
        await updateDoc(doc(db, "appointments", selectedAppointmentId), { status: 'completed' })
      }
      toast({ title: "Consultation Finalized" })
      setIsConsultOpen(false)
      setNotes(""); setMedName(""); setDosage(""); setInstr("");
    } catch (e) {
      toast({ title: "Error Saving", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Doctor Workspace</h2>
          <p className="text-muted-foreground">Clinical queue and smart diagnostic assistance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Daily Queue" value={appointments?.length || 0} icon={Calendar} />
        <StatsCard title="Total Patients" value={patients?.length || 0} icon={Users} />
        <StatsCard title="System Alerts" value="2" icon={ShieldAlert} />
        <StatsCard title="Docs Pending" value="3" icon={FileSearch} />
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Patient Queue</TabsTrigger>
          <TabsTrigger value="diagnosis">AI Diagnosis</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="pdf">Lab Analyst</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Schedule for {todayStr}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments?.map((app: any) => {
                  const patient = patients?.find((p: any) => p.id === app.patientId)
                  return (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center font-bold">
                          {app.time.split(':')[0]}
                        </div>
                        <div>
                          <p className="font-bold">{patient?.name || "Patient"}</p>
                          <p className="text-xs text-muted-foreground">{app.time} • {patient?.gender}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => fetchPatientHistory(patient)}>History</Button>
                        <Button size="sm" onClick={() => handleConsult(patient, app.id)}>Consult</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis"><SmartDiagnosis /></TabsContent>
        <TabsContent value="risk"><RiskAnalysis /></TabsContent>
        <TabsContent value="pdf"><PdfAnalysis /></TabsContent>
      </Tabs>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clinical History: {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {loadingHistory ? <Loader2 className="animate-spin mx-auto" /> : (
              <>
                {aiSummary && (
                  <Card className="bg-primary/5 border-primary/20 p-4">
                    <p className="text-sm font-bold flex items-center gap-2 mb-2"><Info className="w-4 h-4" /> AI Summary</p>
                    <p className="text-sm italic">{aiSummary.summary}</p>
                  </Card>
                )}
                {patientHistory.map((h: any) => (
                  <div key={h.id} className="border p-4 rounded-xl">
                    <p className="font-bold">{format(h.createdAt?.toDate() || new Date(), 'PPP')}</p>
                    <p className="text-sm text-muted-foreground">{h.instructions}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConsultOpen} onOpenChange={setIsConsultOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Consultation: {selectedPatient?.name}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Observations</Label>
              <Textarea placeholder="Clinical notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Medicine" value={medName} onChange={(e) => setMedName(e.target.value)} />
              <Input placeholder="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveConsult}>Finalize Consult</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
