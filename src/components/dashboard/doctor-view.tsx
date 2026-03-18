
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, FileText, Clock, Plus, ShieldAlert, FileSearch, ClipboardList, Loader2 } from "lucide-react"
import { SmartDiagnosis } from "../diagnosis/smart-diagnosis"
import { RiskAnalysis } from "../diagnosis/risk-analysis"
import { PdfAnalysis } from "../diagnosis/pdf-analysis"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export function DoctorView({ viewId }: { viewId: string }) {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isConsultOpen, setIsConsultOpen] = React.useState(false)
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null)
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

  const handleSaveConsult = async () => {
    if (!selectedPatient) return

    try {
      // 1. Create Prescription Record
      await addDoc(collection(db, "prescriptions"), {
        patientId: selectedPatient.id,
        doctorId: user?.uid,
        appointmentId: selectedAppointmentId,
        medicines: [{ name: medName, dosage: dosage, notes: instr }],
        instructions: instr,
        createdAt: serverTimestamp()
      })

      // 2. Update Appointment Status if applicable
      if (selectedAppointmentId) {
        await updateDoc(doc(db, "appointments", selectedAppointmentId), {
          status: 'completed',
          notes: notes
        })
      }

      toast({ title: "Consultation Finalized", description: "Records updated in real-time." })
      setIsConsultOpen(false)
      // Reset form
      setNotes(""); setMedName(""); setDosage(""); setInstr("");
    } catch (e) {
      toast({ title: "Error", description: "Could not save consultation.", variant: "destructive" })
    }
  }

  if (viewId === 'patients') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Patient Database</h2>
            <p className="text-muted-foreground">Manage centralized medical records.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            {patientsLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients?.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.age}y / {p.gender}</TableCell>
                      <TableCell>{p.contact}</TableCell>
                      <TableCell className="text-right">
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
          <p className="text-muted-foreground">Review schedule and clinical insights.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Today's Load" value={appointments?.length || 0} icon={Calendar} description="Appointments" />
        <StatsCard title="Total Registry" value={patients?.length || 0} icon={Users} />
        <StatsCard title="Risk Flags" value="2" icon={ShieldAlert} className="border-destructive/20 bg-destructive/5" />
        <StatsCard title="Pending Review" value="5" icon={FileSearch} />
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Today's Queue</TabsTrigger>
          <TabsTrigger value="diagnosis">AI Diagnosis</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="pdf">Lab Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Queue</CardTitle>
              <CardDescription>Appointments for {todayStr}</CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
              ) : (
                <div className="space-y-4">
                  {appointments?.map((app: any) => {
                    const patient = patients?.find((p: any) => p.id === app.patientId)
                    return (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full text-primary font-bold">{app.time.split(':')[0]}</div>
                          <div>
                            <p className="font-semibold">{patient?.name || "Unknown Patient"}</p>
                            <p className="text-sm text-muted-foreground">{app.time} • {patient?.gender}, {patient?.age}y</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={app.status === 'completed' ? 'default' : 'secondary'}>{app.status}</Badge>
                          <Button size="sm" variant="outline" onClick={() => handleConsult(patient, app.id)}>Consult</Button>
                        </div>
                      </div>
                    )
                  })}
                  {appointments?.length === 0 && <p className="text-center text-muted-foreground py-8">No appointments scheduled for today.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis"><SmartDiagnosis /></TabsContent>
        <TabsContent value="risk"><RiskAnalysis /></TabsContent>
        <TabsContent value="pdf"><PdfAnalysis /></TabsContent>
      </Tabs>

      <Dialog open={isConsultOpen} onOpenChange={setIsConsultOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consultation: {selectedPatient?.name}</DialogTitle>
            <DialogDescription>Record clinical findings and issue prescriptions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Clinical Observations</Label>
              <Textarea 
                placeholder="Enter notes..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="min-h-[100px]" 
              />
            </div>
            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <h4 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Prescription</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Medicine</Label>
                  <Input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="e.g. Paracetamol" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dosage</Label>
                  <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="500mg, 3x daily" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Instructions</Label>
                <Input value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="After meals" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsultOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveConsult}>Save & Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
