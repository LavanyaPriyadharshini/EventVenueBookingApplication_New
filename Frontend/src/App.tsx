import { Navigate, Route, Routes } from 'react-router-dom'
import { Register } from './pages/auth/Register'
import { Login } from './pages/auth/Login'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { Venues } from './pages/Venues/Venues'
import { VenuesDisplay } from './pages/Venues/VenuesDisplay'
import { SectionsDisplay } from './pages/Sections/SectionDisplay'
import { Sections } from './pages/Sections/Sections'
import { Seats } from './pages/Seats/Seats'
import { Rows } from './pages/Rows/Rows'
import { RowsDisplay } from './pages/Rows/RowDisplay'
import { SeatsDisplay } from './pages/Seats/SeatDisplay'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'

// here ProtectedRoute is the common code i have given for protecting the page
//here when a user has not logged in then they cannot directly access the page
//the protected route is given in the layout-> protected route
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

<Route path="/rows/create" element={<ProtectedRoute><Rows /></ProtectedRoute>} />
<Route path="/rows" element={<ProtectedRoute><RowsDisplay /></ProtectedRoute>} />

<Route path="/seats/create" element={<ProtectedRoute><Seats /></ProtectedRoute>} />
<Route path="/seats/create" element={<ProtectedRoute><SeatsDisplay /></ProtectedRoute>} />
     
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

</Routes>

    
  )
}


export default App

