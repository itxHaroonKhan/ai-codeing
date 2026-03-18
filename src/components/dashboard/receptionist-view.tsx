"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Calendar, Users, UserPlus, Search, Clock } from "lucide-react"
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from "@/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "../ui/badge"

export function ReceptionistView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reception Desk</h2>
        <p className="text-muted-foreground">Patient registration and appointment scheduling.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Checked In" value="12" icon={Clock} description="Waiting for doctor" />
        <StatsCard title="Total Appointments" value={MOCK_APPOINTMENTS.length} icon={Calendar} description="Today's total" />
        <StatsCard title="New Registrations" value="3" icon={UserPlus} description="Joined today" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Patient Directory</CardTitle>
                <CardDescription>Search or register new patients.</CardDescription>
              </div>
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name, phone or email..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_PATIENTS.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.contact}</p>
                  </div>
                  <Button variant="ghost" size="sm">View Profile</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Manage the daily flow.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {MOCK_APPOINTMENTS.map((app) => {
                  const patient = MOCK_PATIENTS.find(p => p.id === app.patientId)
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{patient?.name}</p>
                        <p className="text-xs text-muted-foreground">{app.time} • {app.status}</p>
                      </div>
                      <Badge variant="outline">{app.status}</Badge>
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