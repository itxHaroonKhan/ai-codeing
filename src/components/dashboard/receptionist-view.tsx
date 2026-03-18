"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, UserPlus, Search, Clock, Check, Loader2, Filter } from "lucide-react"
import { useFirestore, useCollection } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, where, orderBy, doc, updateDoc } from "firebase/firestore"
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
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export function ReceptionistView({ viewId }: { viewId: string }) {
  const db = useFirestore()
  const { toast } = useToast()
  
  // States
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false)
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  
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

  const filteredPatients = React.useMemo(() => {
    if (!patients) return []
    return patients.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [patients, searchTerm])

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
      setNewName(""); setNewEmail(""); setNewAge(""); setNewContact("");
    } catch (e) {
      toast({ title: "Error", description: "Registration failed.", variant: "destructive" })
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) return
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: selectedPatientId,
        date: formData.get('date'),
        time: formData.get('time'),
        status: 'confirmed',
        createdAt: serverTimestamp()
      })
      toast({ title: "Appointment Booked" })
      setIsScheduleOpen(false)
    } catch (e) {
      toast({ title: "Scheduling failed", variant: "destructive" })
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status })
      toast({ title: "Status Updated" })
    } catch (e) {
      toast({ title: "Failed to update", variant: "destructive" })
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
            <Button className="rounded-xl h-11">
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
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={newAge} onChange={(e) => setNewAge(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input value={newContact} onChange={(e) => setNewContact(e.target.value)} placeholder="+1..." />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleRegister} className="w-full">Save Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Scheduled Today" value={appointments?.length || 0} icon={Calendar} />
        <StatsCard title="Total Patients" value={patients?.length || 0} icon={Users} />
        <StatsCard title="Waiting" value={appointments?.filter(a => a.status === 'confirmed').length || 0} icon={Clock} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle>Patient Directory</CardTitle>
            <CardDescription>Search and schedule patient visits.</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 h-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {patientsLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div> : (
              <div className="space-y-2">
                {filteredPatients?.map((patient: any) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors group">
                    <div>
                      <p className="font-bold text-sm">{patient.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{patient.age}y • {patient.gender} • {patient.contact}</p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-lg h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                      setSelectedPatientId(patient.id)
                      setIsScheduleOpen(true)
                    }}>
                      Schedule
                    </Button>
                  </div>
                ))}
                {filteredPatients.length === 0 && <p className="text-center text-muted-foreground py-8 italic text-sm">No matching patients found.</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle>Daily Flow</CardTitle>
            <CardDescription>Queue for {todayStr}</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div> : (
              <div className="space-y-4">
                {appointments?.map((app: any) => {
                  const patient = patients?.find((p: any) => p.id === app.patientId)
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/30 rounded-xl px-4 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {app.time.split(':')[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{patient?.name || "Anonymous"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{app.time} • Room 4</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={app.status === 'completed' ? 'default' : app.status === 'confirmed' ? 'secondary' : 'outline'} className="text-[10px] capitalize">
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
                {appointments?.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">The queue is empty today.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <form onSubmit={handleSchedule}>
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
              <DialogDescription>Assign a time slot for the selected patient.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input name="date" type="date" required defaultValue={todayStr} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input name="time" type="time" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Confirm Slot</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
