"use client"

import * as React from "react"
import { ShieldAlert, Loader2, AlertTriangle, CheckCircle, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { aiPatientRiskFlagging, AIPatientRiskFlaggingOutput } from "@/ai/flows/ai-patient-risk-flagging"
import { useToast } from "@/hooks/use-toast"
import { MOCK_PATIENTS } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RiskAnalysis() {
  const [loading, setLoading] = React.useState(false)
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>("")
  const [result, setResult] = React.useState<AIPatientRiskFlaggingOutput | null>(null)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!selectedPatientId) {
      toast({ title: "Please select a patient", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      // Mock history based on patient selection for demo purposes
      const output = await aiPatientRiskFlagging({
        patientId: selectedPatientId,
        diagnosisHistory: ["Tonsillitis (Feb 2024)", "Common Cold (Dec 2023)", "Mild Asthma"],
        symptomsHistory: ["Recurring sore throat", "Shortness of breath during exercise"],
        medicationHistory: ["Salbutamol inhaler", "Amoxicillin (completed)"]
      })
      setResult(output)
    } catch (error) {
      toast({ 
        title: "Risk Analysis Failed", 
        description: "Could not connect to AI services.", 
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
            AI Patient Risk Flagging
          </CardTitle>
          <CardDescription>
            Analyze medical history patterns to identify chronic risks or repeated infection cycles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Select Patient for Analysis</label>
              <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PATIENTS.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.age}y)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAnalyze} disabled={loading || !selectedPatientId} className="bg-accent hover:bg-accent/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
              Run Risk Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className={result.hasRepeatedInfectionPatterns ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Infection Patterns
                {result.hasRepeatedInfectionPatterns ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={result.hasRepeatedInfectionPatterns ? "destructive" : "secondary"}>
                {result.hasRepeatedInfectionPatterns ? "Risk Identified" : "Normal"}
              </Badge>
            </CardContent>
          </Card>

          <Card className={result.hasChronicSymptoms ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Chronic Symptoms
                {result.hasChronicSymptoms ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={result.hasChronicSymptoms ? "destructive" : "secondary"}>
                {result.hasChronicSymptoms ? "Chronic Pattern" : "No Chronic Signs"}
              </Badge>
            </CardContent>
          </Card>

          <Card className={result.hasHighRiskCombinations ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Drug/Condition Risks
                {result.hasHighRiskCombinations ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={result.hasHighRiskCombinations ? "destructive" : "secondary"}>
                {result.hasHighRiskCombinations ? "High Risk Detected" : "Safe Combination"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Risk Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.riskSummary}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-primary">
                {result.recommendedAction}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
