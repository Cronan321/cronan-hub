import { NextResponse } from 'next/server'

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('cronan_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
