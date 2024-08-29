import { NextResponse } from 'next/server'
import { NextRequest, userAgent } from 'next/server'
import { verifyToken } from './utils/auth'
import jwt from 'jsonwebtoken'
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const roleToken = request.cookies.get('role_token')?.value

  

  const {device,os} = userAgent(request)

  if(request.nextUrl.pathname != '/' && device.type == 'mobile'){
    return NextResponse.redirect(new URL('/', request.url))
  }
  

  const loggedInUserNotAccessPaths = request.nextUrl.pathname === '/login' || request.nextUrl.pathname == '/'

  if(roleToken){
    const decodedToken : any= jwt.decode(roleToken as string)
    if(decodedToken?.role.name == 'driver' && !request.nextUrl.pathname.includes(`/user/drivers/${decodedToken.role.driver_id}`)){
      return NextResponse.redirect(new URL(`/user/drivers/${decodedToken.role.driver_id}`, request.url))
    }
  }
  
  if(loggedInUserNotAccessPaths){
    if(token){
      return NextResponse.redirect(new URL('/user/parties', request.url))
    }
  }else{
    if(!token){
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }


  
  return NextResponse.next()
}

export const config = {
  matcher : [
    '/',
    '/login',
    '/user/parties',
    '/user/:path',
    '/user/:path*',
    '/user/parties/:path/party-details',
    '/user/parties/:path/passbook',
    '/user/parties/:path/trips',
    '/user/:path',
    '/user/:path/:path',
    '/user/:path/:path/:path'
  ]
}
// See "Matching Paths" below to learn more
