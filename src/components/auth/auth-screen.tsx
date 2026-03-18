"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, useFirestore } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Stethoscope, Loader2, Mail } from "lucide-react"

interface AuthScreenProps {
  onBack: () => void
}

export function AuthScreen({ onBack }: AuthScreenProps) {
  const [loading, setLoading] = React.useState(false)
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>, mode: 'login' | 'register') => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string || 'Patient'

    try {
      if (mode === 'register') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name,
          email,
          role,
          createdAt: serverTimestamp(),
          status: 'active'
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      toast({ title: mode === 'register' ? "Account Created" : "Welcome Back" })
    } catch (error: any) {
      toast({ 
        title: "Authentication Error", 
        description: error.message, 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const { user } = await signInWithPopup(auth, provider)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'Patient',
        createdAt: serverTimestamp(),
        status: 'active'
      }, { merge: true })
      toast({ title: "Signed in with Google" })
    } catch (error: any) {
      toast({ 
        title: "Google Sign-In Error", 
        description: error.message, 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-primary p-3 rounded-2xl mb-4">
            <Stethoscope className="text-primary-foreground w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-primary">HealthFlow AI</h2>
          <p className="text-muted-foreground mt-2">Your clinical intelligence partner.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
              </CardHeader>
              <form onSubmit={(e) => handleEmailAuth(e, 'login')}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="dr.smith@healthflow.ai" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                    Sign In with Email
                  </Button>
                  <Button variant="outline" className="w-full" type="button" onClick={handleGoogleAuth} disabled={loading}>
                    Sign In with Google
                  </Button>
                  <Button variant="link" type="button" onClick={onBack} className="text-xs">
                    Back to Landing Page
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join our platform as a patient or medical professional.</CardDescription>
              </CardHeader>
              <form onSubmit={(e) => handleEmailAuth(e, 'register')}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Join as</Label>
                    <select 
                      name="role" 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      defaultValue="Patient"
                    >
                      <option value="Patient">Patient</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Receptionist">Receptionist</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Account"}
                  </Button>
                  <Button variant="link" type="button" onClick={onBack} className="text-xs">
                    Back to Landing Page
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
