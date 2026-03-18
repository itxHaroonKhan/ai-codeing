"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Users, Stethoscope, DollarSign, Activity, UserPlus, MoreHorizontal, BadgeCheck, Settings, Bell, Globe, Shield, Terminal, Zap } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { MOCK_USERS } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

const chartData = [
  { name: 'Jan', appointments: 400, revenue: 2400 },
  { name: 'Feb', appointments: 300, revenue: 1398 },
  { name: 'Mar', appointments: 600, revenue: 9800 },
  { name: 'Apr', appointments: 278, revenue: 3908 },
  { name: 'May', appointments: 489, revenue: 4800 },
  { name: 'Jun', appointments: 539, revenue: 3800 },
];

const logs = [
  { time: '10:45 AM', event: 'Dr. Sarah updated Patient ID #829', status: 'success' },
  { time: '10:30 AM', event: 'New AI Diagnosis generated for Bob Wilson', status: 'info' },
  { time: '09:50 AM', event: 'System Backup completed successfully', status: 'success' },
  { time: '09:15 AM', event: 'Failed login attempt from IP 192.168.1.1', status: 'error' },
  { time: '08:45 AM', event: 'New doctor registered: Dr. James Wilson', status: 'success' },
];

export function AdminView({ viewId }: { viewId: string }) {
  if (viewId === 'doctors' || viewId === 'staff') {
    const list = MOCK_USERS.filter(u => viewId === 'doctors' ? u.role === 'Doctor' : u.role !== 'Patient')
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{viewId === 'doctors' ? 'Doctors' : 'Staff'} Registry</h2>
            <p className="text-muted-foreground">Manage your clinic's specialized workforce.</p>
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
                  <TableHead>Designation</TableHead>
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
                      {user.specialty && <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{user.specialty}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
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

  if (viewId === 'analytics') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">System Analytics</h2>
          <p className="text-muted-foreground">Deep dive into clinic performance and patient growth.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Appointment Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="appointments" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorApp)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Admin Overview</h2>
          <p className="text-muted-foreground">Monitor platform health and financial performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 animate-pulse">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">System Live</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Registry" value="1,284" icon={Users} trend={{ value: 8, positive: true }} />
        <StatsCard title="Clinical Staff" value="12" icon={Stethoscope} />
        <StatsCard title="SaaS Revenue" value="$24,500" icon={DollarSign} trend={{ value: 15, positive: true }} />
        <StatsCard title="System Load" value="12%" icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Trends</CardTitle>
            <CardDescription>Monthly revenue growth metrics.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: 'hsl(var(--accent))', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              Live Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 text-xs border-b pb-3 last:border-0">
                    <span className="text-muted-foreground font-mono shrink-0">{log.time}</span>
                    <div className="space-y-1">
                      <p className="font-medium">{log.event}</p>
                      <Badge variant="outline" className={`text-[10px] ${
                        log.status === 'error' ? 'text-destructive border-destructive/20 bg-destructive/5' : 
                        log.status === 'info' ? 'text-blue-600 border-blue-100 bg-blue-50' : 
                        'text-emerald-600 border-emerald-100 bg-emerald-50'
                      }`}>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
