import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Checking API...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => setMessage(`API: connected (database ${data.database})`))
      .catch(() => setMessage('API: not reachable. Is the backend running?'))
  }, [])

  return (
    <main>
      <h1>Inquiry Desk</h1>
      <p>{message}</p>
    </main>
  )
}

export default App