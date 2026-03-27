import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const SECRET = process.env.SESSION_SECRET || 'fallback-secret'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'

function verifyToken(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const expected = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
  if (sig !== expected) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

// Called by the WorkLog Vue app on mount — if the user already has a valid
// cronan_session (i.e. they came from the admin console), auto-login them
// as WorkLog admin without needing a second password.
export async function POST(req: NextRequest) {
  const token = req.cookies.get('cronan_session')?.value
  if (!token) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const { email, name } = payload as { email: string; name: string }

  // Only Brianna gets WorkLog admin access via SSO
  if (email !== 'brianna@cronantech.com') {
    return NextResponse.json({ error: 'Not authorized for WorkLog' }, { status: 403 })
  }

  // Forward to the Flask backend to create a WorkLog session
  const adminUsername = process.env.WORKLOG_ADMIN_USERNAME
  const adminPassword = process.env.WORKLOG_ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    return NextResponse.json({ error: 'WorkLog not configured' }, { status: 503 })
  }

  // Log in to the Flask WorkLog backend on behalf of the user
  const flaskRes = await fetch(`${API_URL}/api/worklog/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward cookies so Flask sets the session on the same cookie jar
      cookie: req.headers.get('cookie') || '',
    },
    body: JSON.stringify({ username: adminUsername, password: adminPassword }),
    credentials: 'include',
  })

  if (!flaskRes.ok) {
    return NextResponse.json({ error: 'WorkLog login failed' }, { status: 502 })
  }

  const data = await flaskRes.json()

  // Forward the Set-Cookie header from Flask back to the browser
  const response = NextResponse.json({ ok: true, name, role: data.role })
  const setCookie = flaskRes.headers.get('set-cookie')
  if (setCookie) response.headers.set('set-cookie', setCookie)

  return response
}
