import LoginForm from '@/components/admin/LoginForm'

// This page handles login when accessing the admin panel via admin.yourdomain.com.
// The middleware redirects unauthenticated users on the admin subdomain to /login.
export default function LoginPage() {
  return <LoginForm />
}
