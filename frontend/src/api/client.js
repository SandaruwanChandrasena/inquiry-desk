// One place for every API call: sends JSON, reads JSON, turns error replies into thrown errors
export async function api(path, { method = 'GET', body } = {}) {
  let res

  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.')
  }

  // Login expired or cookie gone: go to the login page.
  // Not for /auth/* (wrong password is also 401, and /auth/me on start would loop).
  if (res.status === 401 && !path.startsWith('/auth/')) {
    window.location.assign('/login')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong. Please try again.')
    error.status = res.status
    error.fields = data.fields || {}
    throw error
  }

  return data
}