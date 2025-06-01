"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies in requests
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        // JWT is now stored in HttpOnly cookie by backend
        // Only store tenant ID in localStorage (non-sensitive data)
        localStorage.setItem("tenantId", data.tenantId)
        setMessage("Login successful!")
        router.push("/dashboard")
      } else {
        setMessage(data.message || "Login failed")
      }
    } catch (err) {
      setMessage("Error connecting to server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {message && (
            <Alert
              className={`mt-4 ${message.includes("successful") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              <AlertDescription className={message.includes("successful") ? "text-green-800" : "text-red-800"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
