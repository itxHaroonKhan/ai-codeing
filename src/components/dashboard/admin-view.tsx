"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Users, Stethoscope, DollarSign, Activity, UserPlus, MoreHorizontal, BadgeCheck } from "lucide-react"
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
import { MOCK_USERS } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const data = [
  { name: 'Jan', appointments: 400, revenue: 2400 },
  { name: 'Feb', appointments: 300, revenue: 1398 },
  { name: 'Mar', appointments: 200, revenue: 9800 },
  { name: 'Apr', appointments: 278, revenue: 3908 },
  { name: 'May', appointments: 189, revenue: 4800 },
  { name: 'Jun', appointments: 239, revenue: 3800 },
];

export function AdminView({ viewId }: { viewId: string }) {
  if (viewId === 'doctors' || viewId === 'staff') {
    const list = MOCK_USERS.filter(u => viewId === 'doctors' ? u.role === 'Doctor' : u.role !== 'Patient')
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{viewId === 'doctors' ? 'Doctors' : 'Staff'} Directory</h2>
            <p className="text-muted-foreground">Manage your clinic's medical professionals and staff.</p>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add {viewId === 'doctors' ? 'Doctor' : 'Staff'}
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.name}
                        {user.subscriptionPlan === 'Pro' && <BadgeCheck className="w-4 h-4 text-primary" />}
                      </div>
                      {user.specialty && <p className="text-xs text-muted-foreground">{user.specialty}</p>}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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