import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import Issues from './pages/Issues'
import CurrentSprint from './pages/CurrentSprint'
import Sprints from './pages/Sprints'
import MyIssues from './pages/MyIssues'
import Reports from './pages/Reports'
import SprintPerformanceReport from './pages/reports/SprintPerformanceReport'
import UserActivityReport from './pages/reports/UserActivityReport'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './auth/AuthContext'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <App />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'issues', element: <Issues /> },
          { path: 'current', element: <CurrentSprint /> },
          { path: 'sprints', element: <Sprints /> },
          { path: 'my-issues', element: <MyIssues /> },
          { 
            path: 'reports', 
            element: <Reports />,
            children: [
              { index: true, element: <SprintPerformanceReport /> },
              { path: 'sprint-performance', element: <SprintPerformanceReport /> },
              { path: 'user-activity', element: <UserActivityReport /> },
            ]
          },
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
