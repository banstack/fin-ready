import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { SecurityViewer } from '@/pages/SecurityViewer'

/**
 * Main App Component with Routing
 *
 * Routes:
 * - / : Landing page with hero, features, AI section, and contact
 * - /app : Security viewer for analyzing stocks
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<SecurityViewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
