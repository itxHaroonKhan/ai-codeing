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
import { User, ChevronDown } from "lucide-react"

export default function DashboardPage() {
  const [role, setRole] = React.useState<Role>('Doctor')

  const renderView = () => {
    switch (role) {
      case 'Admin': return <AdminView />
      case 'Doctor': return <DoctorView />
      case 'Receptionist': return <ReceptionistView />
      case 'Patient': return <PatientView />
      default: return <DoctorView />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar role={role} onLogout={() => alert("Logging out...")} />
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
                <DropdownMenuItem onClick={() => setRole('Admin')}>Admin View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('Doctor')}>Doctor View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('Receptionist')}>Receptionist View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('Patient')}>Patient View</DropdownMenuItem>
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
