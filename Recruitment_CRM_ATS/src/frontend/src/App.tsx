import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { ToastProvider } from './components/Toast'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Candidates from './pages/Candidates'
import CandidateDetail from './pages/CandidateDetail'
import Jobs from './pages/Jobs'
import Applications from './pages/Applications'
import AIServices from './pages/AIServices'
import Analytics from './pages/Analytics'
import Calendar from './pages/Calendar'
import JobBoardIntegration from './pages/JobBoardIntegration'
import Settings from './pages/Settings'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <PrivateRoute>
                  <Layout>
                    <Candidates />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/candidates/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <CandidateDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <PrivateRoute>
                  <Layout>
                    <Jobs />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <PrivateRoute>
                  <Layout>
                    <Applications />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-services"
              element={
                <PrivateRoute>
                  <Layout>
                    <AIServices />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/job-boards"
              element={
                <PrivateRoute>
                  <Layout>
                    <JobBoardIntegration />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
    </FluentProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

