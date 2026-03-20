import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ isOpen, user }) {
  const location = useLocation()

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Clientes', href: '/clientes', icon: '👥' },
    { label: 'Equipamentos', href: '/equipamentos', icon: '🔧' },
    { label: 'Orçamentos', href: '/orcamentos', icon: '📋' },
    { label: 'Pedidos', href: '/pedidos', icon: '📦' },
    { label: 'Manutenção', href: '/manutencao', icon: '🔨' },
    { label: 'Financeiro', href: '/financeiro', icon: '💰' },
    { label: 'Super Admin', href: '/super-admin', icon: '⚙️' },
  ]

  // Filtrar menu baseado no papel do usuário
  const filteredMenu = menuItems.filter(item => {
    if (user?.papel === 'super_admin') return true
    if (user?.papel === 'admin_empresa' && item.label !== 'Super Admin') return true
    if (user?.papel === 'operador_comercial' && ['Dashboard', 'Clientes', 'Equipamentos', 'Orçamentos', 'Pedidos'].includes(item.label)) return true
    if (user?.papel === 'manutencao' && ['Dashboard', 'Manutenção'].includes(item.label)) return true
    if (user?.papel === 'financeiro' && ['Dashboard', 'Financeiro'].includes(item.label)) return true
    return false
  })

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-primary-900 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-primary-800">
        <div className="flex items-center justify-center">
          <span className="text-2xl">🚀</span>
          {isOpen && <span className="ml-2 font-bold text-lg">HyperLoc</span>}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {filteredMenu.map(item => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              location.pathname === item.href
                ? 'bg-primary-700 text-white'
                : 'text-primary-100 hover:bg-primary-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-primary-800">
        {isOpen && (
          <div className="text-xs text-primary-200">
            <p className="font-semibold truncate">{user?.nome}</p>
            <p className="text-primary-300 capitalize">{user?.papel?.replace('_', ' ')}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
