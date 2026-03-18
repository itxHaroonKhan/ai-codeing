"use client"

import * as React from "react"
import { FileText, Loader2, Upload, AlertCircle, CheckCircle2, FileSearch, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { analyzeMedicalPdf, AnalyzeMedicalPdfOutput } from "@/ai/flows/pdf-medical-analysis-flow"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function PdfAnalysis() {
  const [loading, setLoading] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [context, setContext] = React.useState("")
  const [result, setResult] = React.useState<AnalyzeMedicalPdfOutput | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "Please upload a PDF file", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const dataUri = await convertToBase64(file)
      const output = await analyzeMedicalPdf({
        pdfDataUri: dataUri,
        additionalContext: context
      })
      setResult(output)
      toast({ title: "Analysis Complete", description: "The PDF has been successfully processed." })
    } catch (error) {
      toast({ 
        title: "Analysis Failed", 
        description: "There was an error processing the PDF. Ensure it's a valid medical document.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Document
            </CardTitle>
            <CardDescription>Upload lab results or medical records (PDF only).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-upload">Medical Report (PDF)</Label>
              <Input 
                id="pdf-upload" 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label>Clinical Context (Optional)</Label>
              <Textarea 
                placeholder="What should the AI look for? (e.g., 'Check for anemia signs')" 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="text-xs"
              />
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={loading || !file} 
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSearch className="w-4 h-4 mr-2" />}
              Start AI Analysis
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {result ? (
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{result.documentType}</CardTitle>
                      <CardDescription>AI-generated clinical summary</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white">AI Analysis</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.summary}
                  </p>

                  {result.criticalFlags.length > 0 && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <h4 className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-3 h-3" />
                        Critical Flags
                      </h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {result.criticalFlags.map((flag, i) => (
                          <li key={i} className="text-xs font-medium text-destructive">{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Key Findings
                      </h4>
                      <ul className="space-y-1">
                        {result.keyFindings.map((finding, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {finding}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
              <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-10" />
              <h3 className="text-lg font-medium text-muted-foreground">No Document Analyzed</h3>
              <p className="text-sm text-muted-foreground max-w-[300px] mt-2">
                Upload a medical PDF report to see intelligent extractions and insights here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
