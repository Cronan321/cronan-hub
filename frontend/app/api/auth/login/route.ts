import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const SECRET = process.env.SESSION_SECRET || 'fallback-secret'

function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

const STAFF: Record<string, { name: string; accentColor: string; passwordEnvKey: string }> = {
  'brianna@cronantech.com': { name: 'Brianna Cronan', accentColor: 'amber', passwordEnvKey: 'BRIANNA_PASSWORD' },
  'bethany@cronantech.com': { name: 'Bethany Cronan', accentColor: 'cyan', passwordEnvKey: 'BETHANY_PASSWORD' },
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const normalizedEmail = (email as string).trim().toLowerCase()
  const account = STAFF[normalizedEmail]

  if (!account) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const expectedPassword = process.env[account.passwordEnvKey]
  if (!expectedPassword || password !== expectedPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60
  const token = signToken({ email: normalizedEmail, name: account.name, accentColor: account.accentColor, exp })

  const response = NextResponse.json({ ok: true, name: account.name, accentColor: account.accentColor })
  response.cookies.set('cronan_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 28800,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('cronan_session', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}
