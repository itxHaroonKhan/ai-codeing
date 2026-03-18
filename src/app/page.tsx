"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AdminView } from "@/components/dashboard/admin-view"
import { DoctorView } from "@/components/dashboard/doctor-view"
import { ReceptionistView } from "@/components/dashboard/receptionist-view"
import { PatientView } from "@/components/dashboard/patient-view"
import { Role } from "@/lib/mock-data"
import { AuthScreen } from "@/components/auth/auth-screen"
import { useUser, useFirestore, useDoc } from "@/firebase"
import { doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Stethoscope, Activity, Brain, Shield, ArrowRight, Loader2, Sparkles, HeartPulse } from "lucide-react"

export default function Page() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  
  const userProfileRef = React.useMemo(() => (user ? doc(db, "users", user.uid) : null), [db, user])
  const { data: profile, loading: profileLoading } = useDoc(userProfileRef)
  
  const [activeView, setActiveView] = React.useState<string>("dashboard")
  const [showAuth, setShowAuth] = React.useState(false)

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium animate-pulse">Syncing Clinical Data...</p>
        </div>
      </div>
    )
  }

  if (!user && !showAuth) {
    return (
      <div className="min-h-screen bg-background selection:bg-primary/20">
        <nav className="border-b px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <Stethoscope className="text-primary-foreground w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-primary">HealthFlow AI</span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" className="hidden md:flex">Features</Button>
            <Button variant="ghost" className="hidden md:flex">Providers</Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button onClick={() => setShowAuth(true)} className="rounded-xl shadow-lg shadow-primary/20">Sign In</Button>
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-xs font-bold mb-8 uppercase tracking-widest border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Generative AI for Healthcare
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900">
            Intelligent Care <br /> 
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Simplified.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Empower your clinic with automated diagnostics, smart risk flagging, and AI-explained prescriptions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={() => setShowAuth(true)} className="h-16 px-10 text-lg gap-2 rounded-2xl shadow-xl shadow-primary/30 group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-2xl border-2">
              Book a Demo
            </Button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-10 bg-white rounded-[2rem] border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                <Brain className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Diagnostics</h3>
              <p className="text-slate-500 leading-relaxed">AI-driven symptom analysis that assists doctors in identifying rare patterns.</p>
            </div>
            <div className="p-10 bg-white rounded-[2rem] border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-accent/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                <Shield className="text-accent w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Risk Flagging</h3>
              <p className="text-slate-500 leading-relaxed">Continuous clinical surveillance that alerts providers to high-risk trends.</p>
            </div>
            <div className="p-10 bg-white rounded-[2rem] border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                <HeartPulse className="text-emerald-500 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Patient Portal</h3>
              <p className="text-slate-500 leading-relaxed">Empower patients with AI health snapshots and easy-to-understand guides.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!user && showAuth) {
    return <AuthScreen onBack={() => setShowAuth(false)} />
  }

  const role = (profile?.role as Role) || 'Patient'

  const renderView = () => {
    switch (role) {
      case 'Admin': return <AdminView viewId={activeView} />
      case 'Doctor': return <DoctorView viewId={activeView} />
      case 'Receptionist': return <ReceptionistView viewId={activeView} />
      case 'Patient': return <PatientView viewId={activeView} />
      default: return <PatientView viewId={activeView} />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        role={role} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onLogout={() => {}} 
      />
      <SidebarInset className="bg-slate-50/50">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-6 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeView}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 leading-none">{profile?.name}</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">{role} Mode</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
              {profile?.name?.charAt(0)}
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderView()}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
