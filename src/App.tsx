import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { AppShell } from './components/common/AppShell'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { Login } from './routes/Login'
import { Wasodex } from './routes/Wasodex'
import { Badges } from './routes/Badges'
import { Classement } from './routes/Classement'
import { Profil } from './routes/Profil'
import { useSyncTrigger } from './sync/useSyncTrigger'

function SyncBootstrap() {
  useSyncTrigger()
  return null
}

export default function App() {
  return (
    <BrowserRouter basename="/Waso">
      <AuthProvider>
        <SyncBootstrap />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/wasodex" replace />} />
              <Route path="/wasodex" element={<Wasodex />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/classement" element={<Classement />} />
              <Route path="/profil" element={<Profil />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/wasodex" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
