"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    checkAuthStatus()
  }, [pathname])

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify", {
        method: "GET",
        credentials: "include",
      })
      setIsLoggedIn(res.ok)
    } catch (error) {
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
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
      setIsLoggedIn(false)
      window.location.href = "/login"
    }
  }

  if (isLoading) {
    return (
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Auth App
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Auth App
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
