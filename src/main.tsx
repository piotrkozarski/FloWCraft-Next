import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Issues from './pages/Issues'
import CurrentSprint from './pages/CurrentSprint'
import Sprints from './pages/Sprints'
import Dependencies from './pages/Dependencies'
import Reports from './pages/Reports'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Issues /> },
      { path: 'current', element: <CurrentSprint /> },
      { path: 'sprints', element: <Sprints /> },
      { path: 'dependencies', element: <Dependencies /> },
      { path: 'reports', element: <Reports /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
