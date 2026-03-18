"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, UserPlus, Search, Clock, Check } from "lucide-react"
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from "@/lib/mock-data"
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

export function ReceptionistView({ viewId }: { viewId: string }) {
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false)

  const renderRegistrationDialog = () => (
    <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Register New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Register New Patient</DialogTitle>
          <DialogDescription>
            Enter details to create a new patient file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Full Name</Label>
            <Input id="name" className="col-span-3" placeholder="Jane Doe" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" className="col-span-3" placeholder="jane@example.com" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">Gender</Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">Age</Label>
            <Input id="age" type="number" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsRegisterOpen(false)}>Save Registration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reception Desk</h2>
          <p className="text-muted-foreground">Manage patients and clinic schedule.</p>
        </div>
        {renderRegistrationDialog()}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Checked In" value="12" icon={Clock} description="Waiting for doctor" />
        <StatsCard title="Total Appointments" value={MOCK_APPOINTMENTS.length} icon={Calendar} description="Today's total" />
        <StatsCard title="New Registrations" value="3" icon={UserPlus} description="Joined today" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Patient Directory</CardTitle>
              <CardDescription>Search or register new patients.</CardDescription>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name, phone or email..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_PATIENTS.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.contact}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Profile</Button>
                    <Button size="sm" variant="outline" className="text-xs">Schedule</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Flow</CardTitle>
            <CardDescription>Manage waitlists and check-ins.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {MOCK_APPOINTMENTS.map((app) => {
                  const patient = MOCK_PATIENTS.find(p => p.id === app.patientId)
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {app.time.split(' ')[0]}
                        </div>
                        <div>
                          <p className="font-medium">{patient?.name}</p>
                          <p className="text-xs text-muted-foreground">{app.time} • Room 4</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Badge variant={app.status === 'completed' ? 'default' : 'outline'}>{app.status}</Badge>
                         {app.status === 'confirmed' && (
                           <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600">
                             <Check className="w-4 h-4" />
                           </Button>
                         )}
                      </div>
                    </div>
                  )
                })}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}