"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Users, Stethoscope, DollarSign, Activity } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

const data = [
  { name: 'Jan', appointments: 400, revenue: 2400 },
  { name: 'Feb', appointments: 300, revenue: 1398 },
  { name: 'Mar', appointments: 200, revenue: 9800 },
  { name: 'Apr', appointments: 278, revenue: 3908 },
  { name: 'May', appointments: 189, revenue: 4800 },
  { name: 'Jun', appointments: 239, revenue: 3800 },
];

export function AdminView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Console</h2>
        <p className="text-muted-foreground">System overview and analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Patients" value="1,284" icon={Users} trend={{ value: 8, positive: true }} />
        <StatsCard title="Active Doctors" value="12" icon={Stethoscope} />
        <StatsCard title="Monthly Revenue" value="$24,500" icon={DollarSign} trend={{ value: 15, positive: true }} />
        <StatsCard title="System Uptime" value="99.9%" icon={Activity} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Monthly volume for the current year.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Simulated financial performance tracking.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
