"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, FileText, Download, MessageSquare, Info, Loader2, User, Phone, Mail, MapPin, Droplets, ShieldAlert, Plus, Sparkles, Activity } from "lucide-react"
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase"
import { collection, query, where, orderBy, doc, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "../ui/badge"
import { aiPrescriptionExplanation, AIPrescriptionExplanationOutput } from "@/ai/flows/ai-prescription-explanation-flow"
import { generatePatientSummary, PatientSummaryOutput } from "@/ai/flows/patient-health-summary-flow"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "../ui/separator"
import { format } from "date-fns"

export function PatientView({ viewId }: { viewId: string }) {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [explaining, setExplaining] = React.useState<string | null>(null)
  const [explanation, setExplanation] = React.useState<AIPrescriptionExplanationOutput | null>(null)
  const [healthSummary, setHealthSummary] = React.useState<PatientSummaryOutput | null>(null)
  const [loadingSummary, setLoadingSummary] = React.useState(false)

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

  React.useEffect(() => {
    if (patientProfile && prescriptions) {
      const fetchSummary = async () => {
        setLoadingSummary(true)
        try {
          const result = await generatePatientSummary({
            patientName: patientProfile.name,
            history: prescriptions.map(r => r.instructions || "Routine visit"),
            medications: prescriptions.flatMap(r => r.medicines?.map((m: any) => m.name) || [])
          })
          setHealthSummary(result)
        } catch (e) {
          console.error("Summary failed")
        } finally {
          setLoadingSummary(false)
        }
      }
      fetchSummary()
    }
  }, [patientProfile, prescriptions])

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
      toast({ title: "AI Analysis failed", variant: "destructive" })
    } finally {
      setExplaining(null)
    }
  }

  if (viewId === 'profile') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Personal Health Profile</h2>
          <p className="text-muted-foreground">Digital medical identity and biometric records.</p>
        </div>

        {patientLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div> : (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-primary/20 bg-primary/5">
              <CardHeader className="text-center">
                <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 rotate-3">
                  <User className="w-12 h-12 text-white -rotate-3" />
                </div>
                <CardTitle className="text-2xl">{patientProfile?.name || user?.displayName}</CardTitle>
                <Badge variant="secondary" className="mt-2">Patient Profile #HF-{patientProfile?.id?.slice(0, 4)}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-xl border">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="truncate">{patientProfile?.email || user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-3 bg-white rounded-xl border">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{patientProfile?.contact || "+1 (555) 000-0000"}</span>
                  </div>
                </div>
                <Button className="w-full h-11 rounded-xl" variant="outline">Edit My Details</Button>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border rounded-2xl shadow-sm text-center">
                  <Droplets className="w-5 h-5 text-destructive mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Blood</p>
                  <p className="text-xl font-black">{patientProfile?.bloodGroup || "O+"}</p>
                </div>
                <div className="p-4 bg-white border rounded-2xl shadow-sm text-center">
                  <Activity className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Age</p>
                  <p className="text-xl font-black">{patientProfile?.age || "28"}y</p>
                </div>
                <div className="p-4 bg-white border rounded-2xl shadow-sm text-center">
                  <User className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Sex</p>
                  <p className="text-xl font-black">{patientProfile?.gender || "F"}</p>
                </div>
                <div className="p-4 bg-white border rounded-2xl shadow-sm text-center">
                  <ShieldAlert className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Risk</p>
                  <p className="text-xl font-black">Low</p>
                </div>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Medical Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 border-l-2 border-muted pl-4">
                    {appointments?.slice(0, 3).map((app: any) => (
                      <div key={app.id} className="relative">
                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[23px] top-1 border-2 border-white" />
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">{app.date}</p>
                        <p className="text-sm font-semibold">Consultation with General Physician</p>
                        <p className="text-xs text-muted-foreground">{app.status} • Room 302</p>
                      </div>
                    ))}
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
          <h2 className="text-3xl font-bold tracking-tight text-primary">Patient Portal</h2>
          <p className="text-muted-foreground">Manage your health journeys and prescriptions.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {healthSummary && (
            <Card className="border-accent/20 bg-accent/5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles className="w-24 h-24 text-accent" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI Health Snapshot
                  <Badge variant="outline" className="bg-white ml-auto">{healthSummary.stabilityScore}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed font-medium text-accent-foreground/80">
                  {healthSummary.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {healthSummary.topConcerns.map((c, i) => (
                    <Badge key={i} variant="secondary" className="bg-white text-[10px]">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming & Past Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments?.map((app: any) => (
                    <div key={app.id} className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-bold text-sm">Clinic Consultation</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{app.date} @ {app.time}</p>
                      </div>
                      <Badge variant={app.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                  {appointments?.length === 0 && <p className="text-sm text-muted-foreground text-center py-8 italic">No visit history found.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Digital Rx
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions?.map((rx: any) => (
                    <div key={rx.id} className="p-4 bg-white border rounded-xl shadow-sm space-y-4 group hover:border-accent/30 transition-all">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {rx.createdAt?.toDate().toLocaleDateString()}
                        </p>
                        <Download className="w-3 h-3 text-muted-foreground group-hover:text-primary cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        {rx.medicines?.map((m: any, i: number) => (
                          <div key={i} className="text-xs bg-muted/20 p-2 rounded-lg font-medium border-l-2 border-primary">
                            {m.name} <span className="text-muted-foreground opacity-60">({m.dosage})</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full text-[10px] h-8 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white" 
                        variant="ghost"
                        onClick={() => handleExplain(rx)}
                        disabled={!!explaining}
                      >
                        {explaining === rx.id ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <MessageSquare className="w-3 h-3 mr-2" />}
                        Explain with AI
                      </Button>
                    </div>
                  ))}
                  {prescriptions?.length === 0 && <p className="text-sm text-muted-foreground text-center py-8 italic">No prescriptions active.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {explanation && (
            <Card className="border-accent shadow-2xl bg-white rounded-3xl overflow-hidden sticky top-6">
              <div className="bg-accent p-4 text-white flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Smart Rx Assistant
                </CardTitle>
                <Badge variant="outline" className="border-white text-white text-[10px]">Verified Insight</Badge>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="text-sm leading-relaxed p-4 bg-muted/30 rounded-2xl italic border-l-4 border-accent">
                  "{explanation.simpleExplanation}"
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Lifestyle Support
                    </h4>
                    <div className="grid gap-2">
                      {explanation.lifestyleRecommendations.map((item, i) => (
                        <div key={i} className="text-[11px] p-2 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      Preventative Advice
                    </h4>
                    <div className="grid gap-2">
                      {explanation.preventativeAdvice.map((item, i) => (
                        <div key={i} className="text-[11px] p-2 bg-blue-50 text-blue-800 rounded-lg flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
