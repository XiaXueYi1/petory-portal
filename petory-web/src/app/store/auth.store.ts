import { create } from 'zustand'
import type { AuthProfile } from '@/features/auth/api'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous'

type AuthState = {
  status: AuthStatus
  profile: AuthProfile | null
  setLoading: () => void
  setProfile: (profile: AuthProfile) => void
  clearProfile: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  profile: null,
  setLoading: () => {
    set((state) => ({
      status: state.profile ? 'authenticated' : 'loading',
    }))
  },
  setProfile: (profile) => {
    set({
      status: 'authenticated',
      profile,
    })
  },
  clearProfile: () => {
    set({
      status: 'anonymous',
      profile: null,
    })
  },
}))
