
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, UserPlus, Search, Clock, Check, Loader2 } from "lucide-react"
import { useFirestore, useCollection } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "../ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export function ReceptionistView({ viewId }: { viewId: string }) {
  const db = useFirestore()
  const { toast } = useToast()
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false)
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null)
  
  // Registration State
  const [newName, setNewName] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newAge, setNewAge] = React.useState("")
  const [newGender, setNewGender] = React.useState("Female")
  const [newContact, setNewContact] = React.useState("")

  // Collections
  const patientsQuery = React.useMemo(() => collection(db, "patients"), [db])
  const { data: patients, loading: patientsLoading } = useCollection(patientsQuery)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const appointmentsQuery = React.useMemo(() => 
    query(collection(db, "appointments"), where("date", "==", todayStr), orderBy("time", "asc")), 
    [db, todayStr]
  )
  const { data: appointments, loading: appointmentsLoading } = useCollection(appointmentsQuery)

  const handleRegister = async () => {
    try {
      await addDoc(collection(db, "patients"), {
        name: newName,
        email: newEmail,
        age: parseInt(newAge),
        gender: newGender,
        contact: newContact,
        createdAt: serverTimestamp()
      })
      toast({ title: "Patient Registered", description: "Successfully added to the system." })
      setIsRegisterOpen(false)
      // Reset
      setNewName(""); setNewEmail(""); setNewAge(""); setNewContact("");
    } catch (e) {
      toast({ title: "Error", description: "Registration failed.", variant: "destructive" })
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) return

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const date = formData.get('date') as string
    const time = formData.get('time') as string

    try {
      await addDoc(collection(db, "appointments"), {
        patientId: selectedPatientId,
        date,
        time,
        status: 'confirmed',
        createdAt: serverTimestamp()
      })
      toast({ title: "Appointment Booked", description: `Scheduled for ${date} at ${time}.` })
      setIsScheduleOpen(false)
    } catch (e) {
      toast({ title: "Error", description: "Scheduling failed.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinic Operations</h2>
          <p className="text-muted-foreground">Manage front-desk activities and patient flow.</p>
        </div>
        
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Patient</DialogTitle>
              <DialogDescription>Create a new medical file in the database.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Age</Label>
                <Input type="number" value={newAge} onChange={(e) => setNewAge(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Contact</Label>
                <Input value={newContact} onChange={(e) => setNewContact(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleRegister}>Save Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Scheduled Today" value={appointments?.length || 0} icon={Calendar} />
        <StatsCard title="Total Patients" value={patients?.length || 0} icon={Users} />
        <StatsCard title="New Leads" value="3" icon={UserPlus} description="Joined recently" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Directory</CardTitle>
            <CardDescription>Search and schedule patient visits.</CardDescription>
          </CardHeader>
          <CardContent>
            {patientsLoading ? <Loader2 className="animate-spin mx-auto" /> : (
              <div className="space-y-4">
                {patients?.map((patient: any) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.contact} • {patient.age}y</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedPatientId(patient.id)}>Schedule</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <form onSubmit={handleSchedule}>
                            <DialogHeader>
                              <DialogTitle>Book Appointment: {patient.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Date</Label>
                                <Input name="date" type="date" className="col-span-3" required />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Time</Label>
                                <Input name="time" type="time" className="col-span-3" required />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit">Confirm Slot</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Flow</CardTitle>
            <CardDescription>Appointments for {todayStr}</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? <Loader2 className="animate-spin mx-auto" /> : (
              <div className="space-y-4">
                {appointments?.map((app: any) => {
                  const patient = patients?.find((p: any) => p.id === app.patientId)
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {app.time.split(':')[0]}
                        </div>
                        <div>
                          <p className="font-medium">{patient?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{app.time} • Room 4</p>
                        </div>
                      </div>
                      <Badge variant={app.status === 'completed' ? 'default' : 'outline'}>{app.status}</Badge>
                    </div>
                  )
                })}
                {appointments?.length === 0 && <p className="text-center text-muted-foreground py-8">Queue empty.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
