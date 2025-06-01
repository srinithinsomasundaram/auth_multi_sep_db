// Utility functions for authentication
export class AuthService {
  private static readonly BASE_URL = "http://localhost:5000/api/auth"

  static async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    // If token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshToken()
      if (refreshed) {
        // Retry the original request
        return fetch(`${this.BASE_URL}${endpoint}`, {
          ...options,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        })
      }
    }

    return response
  }

  static async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      })
      return response.ok
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch(`${this.BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("tenantId")
      window.location.href = "/login"
    }
  }

  static async checkAuthStatus(): Promise<{ isAuthenticated: boolean; tenantId?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/verify`, {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        return {
          isAuthenticated: true,
          tenantId: data.tenantId || localStorage.getItem("tenantId") || undefined,
        }
      }
    } catch (error) {
      console.error("Auth status check failed:", error)
    }

    return { isAuthenticated: false }
  }
}
