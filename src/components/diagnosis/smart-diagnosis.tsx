"use client"

import * as React from "react"
import { Brain, Loader2, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { smartDiagnosisAssistance, SmartDiagnosisAssistanceOutput } from "@/ai/flows/smart-diagnosis-assistance-flow"
import { useToast } from "@/hooks/use-toast"

export function SmartDiagnosis() {
  const [loading, setLoading] = React.useState(false)
  const [symptoms, setSymptoms] = React.useState("")
  const [age, setAge] = React.useState(30)
  const [gender, setGender] = React.useState("Male")
  const [history, setHistory] = React.useState("")
  const [result, setResult] = React.useState<SmartDiagnosisAssistanceOutput | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symptoms) {
      toast({ title: "Please enter symptoms", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const output = await smartDiagnosisAssistance({
        symptoms,
        age,
        gender,
        medicalHistory: history
      })
      setResult(output)
    } catch (error) {
      toast({ title: "AI Analysis Failed", description: "The service is temporarily unavailable. Please try again later.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Diagnostic Assistant
          </CardTitle>
          <CardDescription>Input patient details for AI-assisted diagnostic suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="e.g. Female" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Symptoms</Label>
              <Textarea 
                placeholder="Describe current symptoms in detail..." 
                className="min-h-[100px]"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Medical History (Optional)</Label>
              <Textarea 
                placeholder="Known allergies, past surgeries, chronic conditions..." 
                value={history}
                onChange={(e) => setHistory(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>Analyze Symptoms</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {result ? (
          <>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Analysis Result</CardTitle>
                  <Badge variant={
                    result.riskLevel === 'Low' ? 'default' : 
                    result.riskLevel === 'Medium' ? 'secondary' : 'destructive'
                  }>
                    {result.riskLevel} Risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Possible Conditions
                  </h4>
                  <ul className="grid grid-cols-1 gap-1">
                    {result.possibleConditions.map((cond, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-primary" />
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Suggested Tests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedTests.map((test, i) => (
                      <Badge key={i} variant="outline" className="bg-white">{test}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
            <Brain className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Fill in the symptoms to see AI-generated insights here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}