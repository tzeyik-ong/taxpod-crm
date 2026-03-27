import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar        from './components/layout/Sidebar'
import TopBar         from './components/layout/TopBar'
import DashboardPage  from './pages/DashboardPage'
import LeadsPage      from './pages/LeadsPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import ActivitiesPage from './pages/ActivitiesPage'
import CopilotPanel   from './components/copilot/CopilotPanel'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/"              element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/leads"         element={<LeadsPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/activities"    element={<ActivitiesPage />} />
            </Routes>
          </main>
        </div>
        <CopilotPanel />
      </div>
    </BrowserRouter>
  )
}
