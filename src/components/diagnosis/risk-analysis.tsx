
"use client"

import * as React from "react"
import { ShieldAlert, Loader2, AlertTriangle, CheckCircle, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { aiPatientRiskFlagging, AIPatientRiskFlaggingOutput } from "@/ai/flows/ai-patient-risk-flagging"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection } from "@/firebase"
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RiskAnalysis() {
  const db = useFirestore()
  const [loading, setLoading] = React.useState(false)
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>("")
  const [result, setResult] = React.useState<AIPatientRiskFlaggingOutput | null>(null)
  const { toast } = useToast()

  // Fetch real patients
  const patientsQuery = React.useMemo(() => collection(db, "patients"), [db])
  const { data: patients } = useCollection(patientsQuery)

  const handleAnalyze = async () => {
    if (!selectedPatientId) {
      toast({ title: "Please select a patient", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      // 1. Fetch real historical data from Firestore for the selected patient
      const rxQuery = query(
        collection(db, "prescriptions"), 
        where("patientId", "==", selectedPatientId),
        orderBy("createdAt", "desc"),
        limit(5)
      )
      const rxSnap = await getDocs(rxQuery)
      const meds = rxSnap.docs.flatMap(d => (d.data().medicines || []).map((m: any) => m.name))
      const history = rxSnap.docs.map(d => d.data().instructions || "Consultation record")

      // 2. Run AI with real context
      const output = await aiPatientRiskFlagging({
        patientId: selectedPatientId,
        diagnosisHistory: history,
        symptomsHistory: ["Referenced from records"],
        medicationHistory: meds
      })
      setResult(output)
    } catch (error) {
      toast({ 
        title: "Risk Analysis Failed", 
        description: "Could not pull patient history for AI processing.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-accent" />
            AI Clinical Surveillance
          </CardTitle>
          <CardDescription>
            Scans real patient records to identify chronic risks or repeated infection cycles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Target Patient</label>
              <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.age}y)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAnalyze} disabled={loading || !selectedPatientId} className="bg-accent hover:bg-accent/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
              Run Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className={result.hasRepeatedInfectionPatterns ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Infection Cycle
                {result.hasRepeatedInfectionPatterns ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={result.hasRepeatedInfectionPatterns ? "destructive" : "secondary"}>
                {result.hasRepeatedInfectionPatterns ? "High Pattern" : "Normal"}
              </Badge>
            </CardContent>
          </Card>

          <Card className={result.hasChronicSymptoms ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Chronic Trends
                {result.hasChronicSymptoms ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={result.hasChronicSymptoms ? "destructive" : "secondary"}>
                {result.hasChronicSymptoms ? "Chronic Detected" : "Healthy Status"}
              </Badge>
            </CardContent>
          </Card>

          <Card className={result.hasHighRiskCombinations ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                High-Risk Scenarios
                {result.hasHighRiskCombinations ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={result.hasHighRiskCombinations ? "destructive" : "secondary"}>
                {result.hasHighRiskCombinations ? "Dangerous" : "Safe"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-lg">Clinical Summary</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{result.riskSummary}</p></CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ListTodo className="w-5 h-5 text-primary" />Action Plan</CardTitle></CardHeader>
            <CardContent><p className="text-sm font-medium text-primary">{result.recommendedAction}</p></CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
