"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, FileText, Download, MessageSquare, Info, Loader2, User, Phone, Mail, MapPin, Droplets, ShieldAlert } from "lucide-react"
import { MOCK_APPOINTMENTS, MOCK_PRESCRIPTIONS, MOCK_PATIENTS } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "../ui/badge"
import { aiPrescriptionExplanation, AIPrescriptionExplanationOutput } from "@/ai/flows/ai-prescription-explanation-flow"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "../ui/separator"

export function PatientView({ viewId }: { viewId: string }) {
  const [explaining, setExplaining] = React.useState<string | null>(null)
  const [explanation, setExplanation] = React.useState<AIPrescriptionExplanationOutput | null>(null)
  const { toast } = useToast()

  const alice = MOCK_PATIENTS[0] // Demo purposes

  const handleExplain = async (prescriptionId: string) => {
    const rx = MOCK_PRESCRIPTIONS.find(r => r.id === prescriptionId)
    if (!rx) return

    setExplaining(prescriptionId)
    try {
      const result = await aiPrescriptionExplanation({
        patientName: alice.name,
        doctorName: "Dr. Sarah Smith",
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
          <h2 className="text-3xl font-bold tracking-tight">Health Profile</h2>
          <p className="text-muted-foreground">Manage your personal and medical information.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>{alice.name}</CardTitle>
              <CardDescription>Patient ID: {alice.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{alice.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{alice.contact}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{alice.address}</span>
              </div>
              <Separator />
              <Button className="w-full" variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Highlights</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Age</p>
                  <p className="text-lg font-bold">{alice.age} Years</p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Blood Group</p>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-destructive" />
                    <p className="text-lg font-bold">{alice.bloodGroup}</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Gender</p>
                  <p className="text-lg font-bold">{alice.gender}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <ShieldAlert className="w-5 h-5" />
                  Allergies & Sensitivities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {alice.allergies?.map((a, i) => (
                    <Badge key={i} variant="outline" className="bg-white border-amber-300 text-amber-800">
                      {a}
                    </Badge>
                  ))}
                  {(!alice.allergies || alice.allergies.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">No allergies recorded.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Health Portal</h2>
        <p className="text-muted-foreground">Manage your medical records and prescriptions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Appointment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_APPOINTMENTS.map((app) => (
                <div key={app.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">General Checkup</p>
                    <p className="text-sm text-muted-foreground">{app.date} • {app.time}</p>
                  </div>
                  <Badge variant={app.status === 'completed' ? 'default' : 'outline'}>{app.status}</Badge>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {MOCK_PRESCRIPTIONS.map((rx) => (
                <div key={rx.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">Prescription #{rx.id}</p>
                      <p className="text-xs text-muted-foreground">Issued on {rx.createdAt}</p>
                    </div>
                    <Button size="icon" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {rx.medicines.map((m, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-semibold">{m.name}</span> — {m.dosage}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="w-full text-xs h-8" 
                      variant="secondary"
                      onClick={() => handleExplain(rx.id)}
                      disabled={!!explaining}
                    >
                      {explaining === rx.id ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                      ) : (
                        <MessageSquare className="w-3 h-3 mr-2" />
                      )}
                      Explain with AI
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {explanation && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-accent" />
              AI Prescription Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm leading-relaxed text-muted-foreground">
              {explanation.simpleExplanation}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Lifestyle Recommendations</h4>
                <ul className="list-disc pl-4 text-xs space-y-1 text-muted-foreground">
                  {explanation.lifestyleRecommendations.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Preventative Advice</h4>
                <ul className="list-disc pl-4 text-xs space-y-1 text-muted-foreground">
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