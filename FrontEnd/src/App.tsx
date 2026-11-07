import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastProvider'
import { FinanceProvider } from './context/FinanceProvider'
import { AppLayout } from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LedgerPage from './pages/LedgerPage'
import AnalyticsPage from './pages/AnalyticsPage'
import MasterPage from './pages/MasterPage'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <FinanceProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="ledger" element={<LedgerPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="master" element={<MasterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </FinanceProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
