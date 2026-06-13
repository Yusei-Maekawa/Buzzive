import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from 'react'

import {

  GoogleAuthProvider,

  onAuthStateChanged,

  signInAnonymously,

  signInWithPopup,

  signOut as firebaseSignOut,

  type User,

} from 'firebase/auth'

import { auth, isFirebaseConfigured } from '../lib/firebase'

import {

  clearStoredDisplayName,

  DISPLAY_NAME_MAX,

  getDefaultNameFromUser,

  getStoredDisplayName,

  resolveDisplayName,

  setStoredDisplayName,

} from '../lib/session'



interface AuthContextValue {

  user: User | null

  loading: boolean

  displayName: string

  isGoogleUser: boolean

  isGuest: boolean

  isSignedIn: boolean

  firebaseReady: boolean

  authError: string | null

  signInWithGoogle: () => Promise<void>

  signInAsGuest: (name: string) => Promise<void>

  setDisplayName: (name: string) => void

  signOut: () => Promise<void>

  clearAuthError: () => void

}



const AuthCtx = createContext<AuthContextValue | null>(null)



const googleProvider = new GoogleAuthProvider()



export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null)

  const [loading, setLoading] = useState(true)

  const [authError, setAuthError] = useState<string | null>(null)

  const [nameVersion, setNameVersion] = useState(0)

  const [offlineDisplayName, setOfflineDisplayName] = useState(

    () => getStoredDisplayName() ?? ''

  )



  const firebaseReady = isFirebaseConfigured()



  useEffect(() => {

    if (!firebaseReady || !auth) {

      setLoading(false)

      return

    }



    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {

      setUser(nextUser)

      if (nextUser && !nextUser.isAnonymous && !getStoredDisplayName()) {

        setStoredDisplayName(getDefaultNameFromUser(nextUser).slice(0, DISPLAY_NAME_MAX))

      }

      setNameVersion((v) => v + 1)

      setLoading(false)

    })



    return unsubscribe

  }, [firebaseReady])



  const displayName = firebaseReady

    ? resolveDisplayName(user)

    : offlineDisplayName || getStoredDisplayName() || ''



  const isGoogleUser = user != null && !user.isAnonymous

  const isGuest = (user != null && user.isAnonymous) || (!firebaseReady && offlineDisplayName !== '')

  const isSignedIn = isGoogleUser || isGuest



  const signInWithGoogle = useCallback(async () => {

    setAuthError(null)

    if (!firebaseReady || !auth) {

      setAuthError('Firebase が未設定です。.env を確認してください。')

      return

    }

    try {

      await signInWithPopup(auth, googleProvider)

      const u = auth.currentUser

      if (u && !getStoredDisplayName()) {

        setStoredDisplayName(getDefaultNameFromUser(u).slice(0, DISPLAY_NAME_MAX))

        setNameVersion((v) => v + 1)

      }

    } catch (e) {

      setAuthError(e instanceof Error ? e.message : 'Google ログインに失敗しました')

    }

  }, [firebaseReady])



  const signInAsGuest = useCallback(

    async (name: string) => {

      const trimmed = name.trim()

      if (!trimmed) return



      setAuthError(null)

      setStoredDisplayName(trimmed)

      setNameVersion((v) => v + 1)



      if (!firebaseReady || !auth) {

        setOfflineDisplayName(trimmed)

        return

      }



      try {

        if (!auth.currentUser) {

          await signInAnonymously(auth)

        } else if (!auth.currentUser.isAnonymous) {

          setAuthError('Google ログイン中はゲスト参加できません')

          return

        }

      } catch (e) {

        setAuthError(e instanceof Error ? e.message : 'ゲストログインに失敗しました')

      }

    },

    [firebaseReady]

  )



  const setDisplayName = useCallback((name: string) => {

    const trimmed = name.trim().slice(0, DISPLAY_NAME_MAX)

    if (!trimmed) return

    setStoredDisplayName(trimmed)

    setOfflineDisplayName(trimmed)

    setNameVersion((v) => v + 1)

  }, [])



  const signOut = useCallback(async () => {

    setAuthError(null)

    clearStoredDisplayName()

    setOfflineDisplayName('')



    if (firebaseReady && auth) {

      try {

        await firebaseSignOut(auth)

      } catch (e) {

        setAuthError(e instanceof Error ? e.message : 'ログアウトに失敗しました')

      }

    }

  }, [firebaseReady])



  const clearAuthError = useCallback(() => setAuthError(null), [])



  const value = useMemo<AuthContextValue>(

    () => ({

      user,

      loading,

      displayName,

      isGoogleUser,

      isGuest,

      isSignedIn,

      firebaseReady,

      authError,

      signInWithGoogle,

      signInAsGuest,

      setDisplayName,

      signOut,

      clearAuthError,

    }),

    [

      user,

      loading,

      displayName,

      nameVersion,

      isGoogleUser,

      isGuest,

      isSignedIn,

      firebaseReady,

      authError,

      signInWithGoogle,

      signInAsGuest,

      setDisplayName,

      signOut,

      clearAuthError,

    ]

  )



  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>

}



export function useAuth() {

  const ctx = useContext(AuthCtx)

  if (!ctx) throw new Error('useAuth must be used within AuthProvider')

  return ctx

}


