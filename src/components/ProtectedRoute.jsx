import { Navigate } from 'react-router-dom'
import Layout from './Layout'

export default function ProtectedRoute({ isAuthenticated, user, onLogout, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      {children}
    </Layout>
  )
}
