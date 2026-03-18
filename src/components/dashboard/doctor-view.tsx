
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, FileText, Clock, ShieldAlert, FileSearch, History, Info, Loader2, MessageCircle } from "lucide-react"
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
  const [isMessagesOpen, setIsMessagesOpen] = React.useState(false)
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
          <h2 className="text-4xl font-black tracking-tighter text-primary uppercase">Clinical Hub</h2>
          <p className="text-muted-foreground">Managing your daily queue with AI intelligence.</p>
        </div>
        <Button variant="outline" className="rounded-2xl gap-2" onClick={() => setIsMessagesOpen(true)}>
          <MessageCircle className="w-4 h-4" />
          Patient Communications
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Daily Queue" value={appointments?.length || 0} icon={Calendar} className="rounded-3xl border-none shadow-lg" />
        <StatsCard title="Total Patients" value={patients?.length || 0} icon={Users} className="rounded-3xl border-none shadow-lg" />
        <StatsCard title="System Alerts" value="2" icon={ShieldAlert} className="rounded-3xl border-none shadow-lg bg-destructive/5" />
        <StatsCard title="Docs Pending" value="3" icon={FileSearch} className="rounded-3xl border-none shadow-lg" />
      </div>

      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border h-12">
          <TabsTrigger value="appointments" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Patient Queue</TabsTrigger>
          <TabsTrigger value="diagnosis" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Smart Diagnosis</TabsTrigger>
          <TabsTrigger value="risk" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Risk Flagging</TabsTrigger>
          <TabsTrigger value="pdf" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Lab Analyst</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-800 p-2">
            <CardHeader className="px-8 pt-8">
              <CardTitle>Schedule for {todayStr}</CardTitle>
              <CardDescription>Click consult to start a clinical session.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-4">
                {appointments?.map((app: any) => {
                  const patient = patients?.find((p: any) => p.id === app.patientId)
                  return (
                    <div key={app.id} className="flex items-center justify-between p-6 border border-slate-100 dark:border-slate-700 rounded-[2rem] hover:bg-muted/30 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                          {app.time.split(':')[0]}
                        </div>
                        <div>
                          <p className="font-black text-lg text-slate-900 dark:text-white">{patient?.name || "Patient"}</p>
                          <div className="flex gap-3 mt-1">
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest">{app.time}</Badge>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{patient?.gender}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" className="rounded-xl h-12 px-6 font-bold" onClick={() => fetchPatientHistory(patient)}>History</Button>
                        <Button className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20" onClick={() => handleConsult(patient, app.id)}>Consult</Button>
                      </div>
                    </div>
                  )
                })}
                {appointments?.length === 0 && (
                  <div className="py-20 text-center">
                    <Calendar className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No appointments scheduled for today.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis" className="animate-in fade-in slide-in-from-bottom-4"><SmartDiagnosis /></TabsContent>
        <TabsContent value="risk" className="animate-in fade-in slide-in-from-bottom-4"><RiskAnalysis /></TabsContent>
        <TabsContent value="pdf" className="animate-in fade-in slide-in-from-bottom-4"><PdfAnalysis /></TabsContent>
      </Tabs>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-[3rem]">
          <DialogHeader className="px-4">
            <DialogTitle className="text-2xl font-black">Clinical History: {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            {loadingHistory ? <Loader2 className="animate-spin mx-auto w-12 h-12 text-primary" /> : (
              <>
                {aiSummary && (
                  <Card className="bg-primary/5 border-primary/20 p-6 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-widest"><Info className="w-4 h-4" /> AI Summary</p>
                      <Badge className="bg-primary text-white font-bold">{aiSummary.stabilityScore}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed font-medium italic text-slate-700 dark:text-slate-300">"{aiSummary.summary}"</p>
                  </Card>
                )}
                <div className="space-y-4">
                  {patientHistory.map((h: any) => (
                    <div key={h.id} className="border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-black text-slate-900 dark:text-white">{format(h.createdAt?.toDate() || new Date(), 'PPP')}</p>
                        <Badge variant="outline" className="text-[10px] font-bold">DR. {h.doctorId?.slice(0, 4)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{h.instructions}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConsultOpen} onOpenChange={setIsConsultOpen}>
        <DialogContent className="max-w-2xl rounded-[3rem]">
          <DialogHeader><DialogTitle className="text-2xl font-black">Clinical Consultation</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-3">
              <Label className="font-bold text-slate-700 dark:text-slate-300">Chief Complaints & Observations</Label>
              <Textarea 
                placeholder="Type clinical findings here..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="min-h-[150px] rounded-[1.5rem] p-4 bg-slate-50 dark:bg-slate-900 border-none shadow-inner"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-primary">Medicine</Label>
                <Input placeholder="e.g. Amoxicillin" value={medName} onChange={(e) => setMedName(e.target.value)} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-primary">Dosage</Label>
                <Input placeholder="e.g. 500mg BID" value={dosage} onChange={(e) => setDosage(e.target.value)} className="rounded-xl h-12" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsConsultOpen(false)} className="rounded-xl">Discard</Button>
            <Button onClick={handleSaveConsult} className="rounded-xl h-12 px-10 font-bold shadow-xl shadow-primary/20">Finalize Patient Consult</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMessagesOpen} onOpenChange={setIsMessagesOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Messages</DialogTitle>
          </DialogHeader>
          <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 opacity-50">
            <MessageCircle className="w-16 h-16 mb-4 text-primary" />
            <p className="font-bold">Patient Chat System</p>
            <p className="text-sm">Secure direct messaging is being initialized.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
