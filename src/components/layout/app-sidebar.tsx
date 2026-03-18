"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Stethoscope, 
  ShieldCheck,
  LogOut,
  Activity,
  CreditCard,
  UserCircle
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Role } from "@/lib/mock-data"

interface AppSidebarProps {
  role: Role
  activeView: string
  onViewChange: (view: string) => void
  onLogout: () => void
}

export function AppSidebar({ role, activeView, onViewChange, onLogout }: AppSidebarProps) {
  const menuItems = React.useMemo(() => {
    const common = [
      { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    ]

    switch (role) {
      case 'Admin':
        return [
          ...common,
          { title: "Manage Doctors", icon: Stethoscope, id: "doctors" },
          { title: "Staff Directory", icon: Users, id: "staff" },
          { title: "Subscriptions", icon: CreditCard, id: "subscriptions" },
          { title: "Analytics", icon: Activity, id: "analytics" },
          { title: "Settings", icon: Settings, id: "settings" },
        ]
      case 'Doctor':
        return [
          ...common,
          { title: "Appointments", icon: Calendar, id: "appointments" },
          { title: "Patient Records", icon: Users, id: "patients" },
          { title: "Prescriptions", icon: FileText, id: "prescriptions" },
        ]
      case 'Receptionist':
        return [
          ...common,
          { title: "Daily Schedule", icon: Calendar, id: "schedule" },
          { title: "Patients", icon: Users, id: "patients" },
        ]
      case 'Patient':
        return [
          ...common,
          { title: "My History", icon: Calendar, id: "history" },
          { title: "Prescriptions", icon: FileText, id: "prescriptions" },
          { title: "Health Profile", icon: UserCircle, id: "profile" },
        ]
      default:
        return common
    }
  }, [role])

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-4 flex items-center gap-2 border-b">
        <div className="bg-primary p-2 rounded-lg">
          <Stethoscope className="text-primary-foreground w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-primary">HealthFlow AI</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">{role} Portal</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                tooltip={item.title}
                isActive={activeView === item.id}
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}