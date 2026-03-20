import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Equipamentos from './pages/Equipamentos'
import Orcamentos from './pages/Orcamentos'
import Pedidos from './pages/Pedidos'
import Manutencao from './pages/Manutencao'
import Financeiro from './pages/Financeiro'
import SuperAdmin from './pages/SuperAdmin'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token no localStorage
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    
    setLoading(false)
  }, [])

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/clientes" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <Clientes user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/equipamentos" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <Equipamentos user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/orcamentos" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <Orcamentos user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pedidos" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <Pedidos user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manutencao" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <Manutencao user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/financeiro" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <Financeiro user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout}>
              <SuperAdmin user={user} />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
