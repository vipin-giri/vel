'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { AuthState, User } from '@/types'
import { apiClient } from '@/lib/api'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  signup: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: User }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken()
      if (token) {
        try {
          const response = await apiClient.getCurrentUser()
          if (response.success && response.data) {
            dispatch({
              type: 'SET_USER',
              payload: { user: response.data, token },
            })
          } else {
            dispatch({ type: 'CLEAR_USER' })
            apiClient.clearToken()
          }
        } catch (error) {
          dispatch({ type: 'CLEAR_USER' })
          apiClient.clearToken()
        }
      } else {
        dispatch({ type: 'CLEAR_USER' })
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await apiClient.login({ email, password })
      
      if (response.success && response.data) {
        apiClient.setToken(response.data.token)
        dispatch({
          type: 'SET_USER',
          payload: { user: response.data.user, token: response.data.token },
        })
        return { success: true, user: response.data.user }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: false, error: response.error || 'Login failed' }
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: 'Network error' }
    }
  }

  const signup = async (email: string, password: string, confirmPassword: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await apiClient.signup({ email, password, confirmPassword })
      
      if (response.success && response.data) {
        apiClient.setToken(response.data.token)
        dispatch({
          type: 'SET_USER',
          payload: { user: response.data.user, token: response.data.token },
        })
        return { success: true }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: false, error: response.error || 'Signup failed' }
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    apiClient.clearToken()
    dispatch({ type: 'CLEAR_USER' })
  }

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user })
  }

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
