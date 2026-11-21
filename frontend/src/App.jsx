import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'

// Temporary home page. The inquiry list replaces it next step.
function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main>
      <h1>Inquiry Desk</h1>
      <p>
        Signed in as {user.name} ({user.role})
      </p>
      <button onClick={logout}>Sign out</button>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App