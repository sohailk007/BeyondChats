import React, { createContext, useState, useContext, useEffect } from 'react'
import authService from '../services/auth'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const currentUser = authService.getCurrentUser()
      if (currentUser && authService.isAuthenticated()) {
        // Verify token is still valid
        const response = await authAPI.getCurrentUser()
        setUser(response.data)
        setIsAuthenticated(true)
      }
    } catch (error) {
      // Token is invalid, clear auth
      authService.clearAuth()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const userData = await authService.login(credentials)
      setUser(userData)
      setIsAuthenticated(true)
      return userData
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const newUser = await authService.register(userData)
      return newUser
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (userData) => {
    const updatedUser = authService.updateUser(userData)
    setUser(updatedUser)
    return updatedUser
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext