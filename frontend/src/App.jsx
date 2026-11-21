import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import { api } from './api/client.js'

// Temporary home page: proves the login cookie works. The inquiry list replaces it next step.
function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleSignOut() {
    await api('/auth/logout', { method: 'POST' })
    navigate('/login')
  }

  if (loading) return <p>Loading...</p>

  if (!user) {
    return (
      <main>
        <p>You are not signed in.</p>
        <Link to="/login">Go to sign in</Link>
      </main>
    )
  }

  return (
    <main>
      <h1>Inquiry Desk</h1>
      <p>
        Signed in as {user.name} ({user.role})
      </p>
      <button onClick={handleSignOut}>Sign out</button>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App