import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Issues from './pages/Issues'
import CurrentSprint from './pages/CurrentSprint'
import Sprints from './pages/Sprints'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Register from './pages/Register'
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
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <App />,
        children: [
          { index: true, element: <Issues /> },
          { path: 'current', element: <CurrentSprint /> },
          { path: 'sprints', element: <Sprints /> },
          { path: 'reports', element: <Reports /> },
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
