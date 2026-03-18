
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "./stats-card"
import { Users, Stethoscope, DollarSign, Activity, UserPlus, MoreHorizontal, BadgeCheck, Settings, Bell, Globe, Shield, Terminal, Zap, CreditCard, TrendingUp } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  if (viewId === 'subscriptions') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue & Subscriptions</h2>
          <p className="text-muted-foreground">Manage clinic billing cycles and SaaS plans.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">$12,450</div>
              <p className="text-xs opacity-80 mt-2">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Active Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">24</div>
              <p className="text-xs text-muted-foreground mt-2">18 Pro, 6 Basic</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">1.2%</div>
              <p className="text-xs text-muted-foreground mt-2">Below industry average</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">City Wellness Center</TableCell>
                  <TableCell><Badge>Enterprise</Badge></TableCell>
                  <TableCell>$599.00</TableCell>
                  <TableCell><Badge variant="outline" className="text-emerald-500">Paid</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">HealthFirst Clinic</TableCell>
                  <TableCell><Badge>Pro</Badge></TableCell>
                  <TableCell>$199.00</TableCell>
                  <TableCell><Badge variant="outline" className="text-amber-500">Pending</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewId === 'doctors' || viewId === 'staff') {
    const list = MOCK_USERS.filter(u => viewId === 'doctors' ? u.role === 'Doctor' : u.role !== 'Patient')
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{viewId === 'doctors' ? 'Doctors' : 'Staff'} Registry</h2>
            <p className="text-muted-foreground">Manage your clinic's specialized workforce.</p>
          </div>
          <Button className="rounded-xl">
            <UserPlus className="w-4 h-4 mr-2" />
            Add {viewId === 'doctors' ? 'Doctor' : 'Staff'}
          </Button>
        </div>

        <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium pl-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.name}
                        {user.subscriptionPlan === 'Pro' && <BadgeCheck className="w-4 h-4 text-primary" />}
                      </div>
                      {user.specialty && <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{user.specialty}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="rounded-lg">
                        {user.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="rounded-xl">
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Admin Command Center</h2>
          <p className="text-muted-foreground">Real-time system health and clinical performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-900 animate-pulse">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">System Operational</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Registry" value="1,284" icon={Users} trend={{ value: 8, positive: true }} className="rounded-[2rem] border-none shadow-lg" />
        <StatsCard title="Clinical Staff" value="12" icon={Stethoscope} className="rounded-[2rem] border-none shadow-lg" />
        <StatsCard title="SaaS Revenue" value="$24,500" icon={DollarSign} trend={{ value: 15, positive: true }} className="rounded-[2rem] border-none shadow-lg" />
        <StatsCard title="System Load" value="12%" icon={Activity} className="rounded-[2rem] border-none shadow-lg" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Financial & Clinical Trends</CardTitle>
            <CardDescription>Consolidated growth metrics for 2024.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              Security Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 text-xs border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0">
                    <span className="text-muted-foreground font-mono shrink-0 font-bold">{log.time}</span>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{log.event}</p>
                      <Badge variant="outline" className={`text-[9px] uppercase font-black px-2 ${
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
