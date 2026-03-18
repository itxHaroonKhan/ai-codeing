"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, FileText, Download, MessageSquare, Info, Loader2 } from "lucide-react"
import { MOCK_APPOINTMENTS, MOCK_PRESCRIPTIONS } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "../ui/badge"
import { aiPrescriptionExplanation, AIPrescriptionExplanationOutput } from "@/ai/flows/ai-prescription-explanation-flow"
import { useToast } from "@/hooks/use-toast"

export function PatientView() {
  const [explaining, setExplaining] = React.useState<string | null>(null)
  const [explanation, setExplanation] = React.useState<AIPrescriptionExplanationOutput | null>(null)
  const { toast } = useToast()

  const handleExplain = async (prescriptionId: string) => {
    const rx = MOCK_PRESCRIPTIONS.find(r => r.id === prescriptionId)
    if (!rx) return

    setExplaining(prescriptionId)
    try {
      const result = await aiPrescriptionExplanation({
        patientName: "Alice Patient",
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