import { createContext, useContext, useState } from 'react'
import { authAPI } from '../api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('hrms_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.login({ email, password })
      // Backend: { success, message, data: { accessToken, refreshToken, user } }
      const payload = res.data?.data || res.data
      const token = payload?.accessToken || payload?.token
      const rawUser = payload?.user || payload

      if (!token) throw new Error('No token received from server')

      const userData = {
        id: rawUser.id || rawUser._id,
        email: rawUser.email || email,
        role: rawUser.role,
        employeeId: rawUser.employeeId,
        name: rawUser.name || email.split('@')[0],
        companyName: rawUser.companyName || ''
      }

      localStorage.setItem('hrms_token', token)
      localStorage.setItem('hrms_user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('hrms_token')
    localStorage.removeItem('hrms_user')
    setUser(null)
  }

  const updateUser = (data) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('hrms_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
