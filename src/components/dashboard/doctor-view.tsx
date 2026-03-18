
"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, FileText, Clock, Plus, ShieldAlert, FileSearch, ClipboardList } from "lucide-react"
import { SmartDiagnosis } from "../diagnosis/smart-diagnosis"
import { RiskAnalysis } from "../diagnosis/risk-analysis"
import { PdfAnalysis } from "../diagnosis/pdf-analysis"
import { MOCK_APPOINTMENTS, MOCK_PATIENTS } from "@/lib/mock-data"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function DoctorView({ viewId }: { viewId: string }) {
  const [isConsultOpen, setIsConsultOpen] = React.useState(false)
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null)
  const { toast } = useToast()

  const dailyAppointments = MOCK_APPOINTMENTS.filter(a => a.date === '2024-05-20')

  const handleConsult = (patient: any) => {
    setSelectedPatient(patient)
    setIsConsultOpen(true)
  }

  const handleSaveConsult = () => {
    toast({ title: "Consultation Saved", description: "Record has been updated in Firestore." })
    setIsConsultOpen(false)
  }

  if (viewId === 'patients') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Patient Records</h2>
            <p className="text-muted-foreground">Comprehensive list of all your patients.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PATIENTS.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.age}y / {p.gender}</TableCell>
                    <TableCell>{p.contact}</TableCell>
                    <TableCell>May 20, 2024</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleConsult(p)}>Consult</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Doctor Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, Dr. Sarah Smith.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" />
            Review Queue
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            New Patient Record
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Daily Appointments" 
          value={dailyAppointments.length} 
          icon={Calendar} 
          description="For today, May 20"
        />
        <StatsCard 
          title="Total Patients" 
          value={MOCK_PATIENTS.length} 
          icon={Users} 
          trend={{ value: 12, positive: true }}
          description="Total active records"
        />
        <StatsCard 
          title="Prescriptions" 
          value="48" 
          icon={FileText} 
          description="Issued this month"
        />
        <StatsCard 
          title="Avg. Consultation" 
          value="15m" 
          icon={Clock} 
          description="Per patient"
        />
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="bg-muted p-1 flex flex-wrap h-auto">
          <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
          <TabsTrigger value="diagnosis">AI Diagnosis Assistant</TabsTrigger>
          <TabsTrigger value="risk" className="gap-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2">
            <FileSearch className="w-3.5 h-3.5" />
            PDF Lab Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>View and manage your appointments for today.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyAppointments.map((app) => {
                  const patient = MOCK_PATIENTS.find(p => p.id === app.patientId)
                  return (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full text-primary font-bold">
                          {app.time.split(':')[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{patient?.name}</p>
                          <p className="text-sm text-muted-foreground">{app.time} • {patient?.gender}, {patient?.age}y</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={app.status === 'completed' ? 'default' : 'secondary'}>
                          {app.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleConsult(patient)}>Consult</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis">
          <SmartDiagnosis />
        </TabsContent>

        <TabsContent value="risk">
          <RiskAnalysis />
        </TabsContent>

        <TabsContent value="pdf">
          <PdfAnalysis />
        </TabsContent>
      </Tabs>

      <Dialog open={isConsultOpen} onOpenChange={setIsConsultOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consultation: {selectedPatient?.name}</DialogTitle>
            <DialogDescription>
              Record clinical notes and issue prescriptions for the current visit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Clinical Notes</Label>
              <Textarea placeholder="Enter observations and findings..." className="min-h-[120px]" />
            </div>
            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Prescription
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Medicine Name</Label>
                  <Input placeholder="e.g. Paracetamol" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dosage</Label>
                  <Input placeholder="e.g. 500mg, 3x daily" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pharmacy Instructions</Label>
                <Input placeholder="e.g. After meals" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsultOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveConsult}>Save & Finalize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
