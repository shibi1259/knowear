import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Function to detect device type from user agent
function detectDeviceType(userAgent: string): 'mobile' | 'desktop' {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}

const protectedPaths = [
  "add-address",
  "favourites",
  "gift-cards",
  "orders",
  "profile",
  // "order-placed"
];

export function middleware(request: NextRequest) {
  // Check if the current path is protected
  const token = request.cookies.get("access_token");
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.includes(path)
  );

  // Redirect to home page if accessing protected path
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Get the current device type from cookie if it exists
  const currentDeviceType = request.cookies.get('deviceType')?.value;
  
  // Get user agent from the request headers
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect the device type
  const detectedDeviceType = detectDeviceType(userAgent);
 
  // If device type has changed or cookie doesn't exist, set new cookie
  if (currentDeviceType !== detectedDeviceType) {
    const response = NextResponse.next();
    
    // Set cookie with detected device type
    // maxAge is set to 7 days (in seconds)
    response.cookies.set('deviceType', detectedDeviceType, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return response;
  }
  
  return NextResponse.next();
}

// Configure paths that middleware will run on
export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public folder
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}