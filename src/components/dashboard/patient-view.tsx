
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, FileText, Download, MessageSquare, Info, Loader2, User, Phone, Mail, MapPin, Droplets, ShieldAlert, Plus } from "lucide-react"
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase"
import { collection, query, where, orderBy, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "../ui/badge"
import { aiPrescriptionExplanation, AIPrescriptionExplanationOutput } from "@/ai/flows/ai-prescription-explanation-flow"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "../ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PatientView({ viewId }: { viewId: string }) {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [explaining, setExplaining] = React.useState<string | null>(null)
  const [explanation, setExplanation] = React.useState<AIPrescriptionExplanationOutput | null>(null)
  const [isBookingOpen, setIsBookingOpen] = React.useState(false)

  // Real data hooks
  // Note: For demo we assume the user's patient profile is linked by email or uid
  const patientsQuery = React.useMemo(() => 
    user ? query(collection(db, "patients"), where("email", "==", user.email)) : null, 
    [db, user]
  )
  const { data: patientRecords, loading: patientLoading } = useCollection(patientsQuery)
  const patientProfile = patientRecords?.[0]

  const prescriptionsQuery = React.useMemo(() => 
    patientProfile ? query(collection(db, "prescriptions"), where("patientId", "==", patientProfile.id), orderBy("createdAt", "desc")) : null, 
    [db, patientProfile]
  )
  const { data: prescriptions, loading: rxLoading } = useCollection(prescriptionsQuery)

  const appointmentsQuery = React.useMemo(() => 
    patientProfile ? query(collection(db, "appointments"), where("patientId", "==", patientProfile.id), orderBy("date", "desc")) : null, 
    [db, patientProfile]
  )
  const { data: appointments, loading: apptLoading } = useCollection(appointmentsQuery)

  const handleExplain = async (rx: any) => {
    setExplaining(rx.id)
    try {
      const result = await aiPrescriptionExplanation({
        patientName: patientProfile?.name || "Patient",
        doctorName: "Clinic Doctor",
        medicines: rx.medicines,
        instructions: rx.instructions
      })
      setExplanation(result)
    } catch (error) {
      toast({ title: "AI Explanation failed", description: "Try again later.", variant: "destructive" })
    } finally {
      setExplaining(null)
    }
  }

  if (viewId === 'profile') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Personal Health Profile</h2>
          <p className="text-muted-foreground">Digital medical record and history.</p>
        </div>

        {patientLoading ? <Loader2 className="animate-spin" /> : (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <CardTitle>{patientProfile?.name || user?.displayName}</CardTitle>
                <CardDescription>Patient Record</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{patientProfile?.email || user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{patientProfile?.contact || "No phone added"}</span>
                </div>
                <Separator />
                <Button className="w-full" variant="outline">Update Contact Info</Button>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Vitals & Stats</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Age</p>
                    <p className="text-lg font-bold">{patientProfile?.age || "--"} Years</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Gender</p>
                    <p className="text-lg font-bold">{patientProfile?.gender || "--"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Health Records</h2>
          <p className="text-muted-foreground">View your digital prescriptions and visit history.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Visit History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apptLoading ? <Loader2 className="animate-spin" /> : (
              <div className="space-y-4">
                {appointments?.map((app: any) => (
                  <div key={app.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">Clinic Visit</p>
                      <p className="text-sm text-muted-foreground">{app.date} • {app.time}</p>
                    </div>
                    <Badge variant={app.status === 'completed' ? 'default' : 'outline'}>{app.status}</Badge>
                  </div>
                ))}
                {appointments?.length === 0 && <p className="text-sm text-muted-foreground italic">No history found.</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rxLoading ? <Loader2 className="animate-spin" /> : (
              <div className="space-y-4">
                {prescriptions?.map((rx: any) => (
                  <div key={rx.id} className="p-4 border rounded-lg space-y-4 shadow-sm bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">Issued on {rx.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                      <Button size="icon" variant="ghost"><Download className="w-4 h-4" /></Button>
                    </div>
                    
                    <div className="space-y-2">
                      {rx.medicines?.map((m: any, i: number) => (
                        <div key={i} className="text-sm bg-muted/30 p-2 rounded">
                          <span className="font-semibold text-primary">{m.name}</span> — {m.dosage}
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full text-xs h-8" 
                      variant="secondary"
                      onClick={() => handleExplain(rx)}
                      disabled={!!explaining}
                    >
                      {explaining === rx.id ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <MessageSquare className="w-3 h-3 mr-2" />}
                      Explain with AI
                    </Button>
                  </div>
                ))}
                {prescriptions?.length === 0 && <p className="text-sm text-muted-foreground italic">No prescriptions found.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {explanation && (
        <Card className="border-accent/30 bg-accent/5 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-accent" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm leading-relaxed text-muted-foreground bg-white p-4 rounded-md border">
              {explanation.simpleExplanation}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-md border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Lifestyle</h4>
                <ul className="list-disc pl-4 text-xs space-y-1 text-emerald-800">
                  {explanation.lifestyleRecommendations.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Preventative</h4>
                <ul className="list-disc pl-4 text-xs space-y-1 text-blue-800">
                  {explanation.preventativeAdvice.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
