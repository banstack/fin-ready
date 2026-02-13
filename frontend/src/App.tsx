import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Markets } from '@/pages/Markets'
import { SecurityViewer } from '@/pages/SecurityViewer'

/**
 * Main App Component with Routing
 *
 * Routes:
 * - /          : Landing page with hero, features, AI section, and contact
 * - /markets   : Markets page — browse and search securities by sector
 * - /app/:ticker : Security detail view with price chart and financial metrics
 * - /app       : Redirects to /markets (legacy URL support)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/app/:ticker" element={<SecurityViewer />} />
        <Route path="/app" element={<Navigate to="/markets" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
