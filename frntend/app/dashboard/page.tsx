"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, User } from "lucide-react"

export default function DashboardPage() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if user is authenticated by calling a protected endpoint
      const res = await fetch("http://localhost:5000/api/auth/verify", {
        method: "GET",
        credentials: "include", // Include HttpOnly cookies
      })

      if (res.ok) {
        const data = await res.json()
        setIsAuthenticated(true)
        setTenantId(data.tenantId || localStorage.getItem("tenantId"))
      } else {
        // Try to refresh token
        await refreshToken()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        setIsAuthenticated(true)
        setTenantId(data.tenantId || localStorage.getItem("tenantId"))
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      router.push("/login")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("tenantId")
      setIsAuthenticated(false)
      router.push("/login")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your account dashboard</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details and authentication information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Tenant ID:</span>
                <Badge variant="secondary" className="font-mono">
                  {tenantId || "Not available"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Authentication Status:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Authenticated
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Session Security:</span>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  HttpOnly Cookies
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Manage your current session and account access</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
