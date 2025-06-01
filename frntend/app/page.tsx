"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/verify", {
          method: "GET",
          credentials: "include",
        })

        if (res.ok) {
          router.push("/dashboard")
        } else {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p className="text-muted-foreground">Redirecting you to the appropriate page...</p>
      </div>
    </div>
  )
}
