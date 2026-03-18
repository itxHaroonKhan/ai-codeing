"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AdminView } from "@/components/dashboard/admin-view"
import { DoctorView } from "@/components/dashboard/doctor-view"
import { ReceptionistView } from "@/components/dashboard/receptionist-view"
import { PatientView } from "@/components/dashboard/patient-view"
import { Role } from "@/lib/mock-data"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, ChevronDown, Stethoscope, Shield, Brain, Activity, ArrowRight } from "lucide-react"

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [role, setRole] = React.useState<Role>('Doctor')
  const [activeView, setActiveView] = React.useState<string>("dashboard")

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole)
    setActiveView("dashboard")
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Stethoscope className="text-primary-foreground w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">HealthFlow AI</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button onClick={() => setIsLoggedIn(true)}>Go to Dashboard</Button>
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
            <Activity className="w-4 h-4" />
            Next-Gen Clinic Management
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Modernize Your Clinic <br /> with Smart AI.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Automate diagnostics, analyze lab reports in seconds, and identify patient risks proactively using our advanced generative AI engine.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => setIsLoggedIn(true)} className="h-14 px-8 text-lg gap-2">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
              Watch Demo
            </Button>
          </div>
        </section>

        <section className="bg-muted/30 py-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Brain className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Diagnostics</h3>
              <p className="text-muted-foreground leading-relaxed">Input symptoms and let our AI suggest possible conditions and necessary tests with clinical precision.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-accent w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Risk Flagging</h3>
              <p className="text-muted-foreground leading-relaxed">Proactively identify chronic patterns and high-risk combinations in patient medical histories.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Activity className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lab Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">Upload PDF reports and get instant, structured insights, flagging abnormal values for immediate action.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const renderView = () => {
    switch (role) {
      case 'Admin': return <AdminView viewId={activeView} />
      case 'Doctor': return <DoctorView viewId={activeView} />
      case 'Receptionist': return <ReceptionistView viewId={activeView} />
      case 'Patient': return <PatientView viewId={activeView} />
      default: return <DoctorView viewId={activeView} />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        role={role} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onLogout={() => setIsLoggedIn(false)} 
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border mx-2" />
            <h1 className="font-semibold text-sm hidden md:block">HealthFlow Management System</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  <span>Switch Role: {role}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Demo Role Selector</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRoleChange('Admin')}>Admin View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('Doctor')}>Doctor View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('Receptionist')}>Receptionist View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('Patient')}>Patient View</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
