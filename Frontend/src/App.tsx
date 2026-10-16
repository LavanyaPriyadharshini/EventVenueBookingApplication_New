import { Navigate, Route, Routes } from 'react-router-dom'
import { Register } from './pages/auth/Register'
import { Login } from './pages/auth/Login'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { Venues } from './pages/Venues/Venues'
import { VenuesDisplay } from './pages/Venues/VenuesDisplay'
import { SectionsDisplay } from './pages/Sections/SectionDisplay'
import { Sections } from './pages/Sections/Sections'

// here ProtectedRoute is the common code i have given for protecting the page
//here when a user has not logged in then 
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

     <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

        <Route
        path="/venues"
        element={
          <ProtectedRoute>
            <Venues />
          </ProtectedRoute>
        }
      />

        <Route
        path="/venuesdisplay"
        element={
          <ProtectedRoute>
            <VenuesDisplay />
          </ProtectedRoute>
        }
      />

      <Route
  path="/sections"
  element={
    <ProtectedRoute>
      <SectionsDisplay />
    </ProtectedRoute>
  }
/>

<Route
  path="/sections/create"
  element={
    <ProtectedRoute>
      <Sections />
    </ProtectedRoute>
  }
/>

      
    </Routes>

    
  )
}


export default App

