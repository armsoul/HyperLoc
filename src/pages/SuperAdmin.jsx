import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function SuperAdmin({ user }) {
  const [tenants, setTenants] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFormTenant, setShowFormTenant] = useState(false)
  const [showFormUsuario, setShowFormUsuario] = useState(false)

  const [formTenant, setFormTenant] = useState({
    nome_empresa: '',
    cnpj: '',
    email_admin: '',
    plano: 'basico',
  })

  const [formUsuario, setFormUsuario] = useState({
    tenant_id: '',
    nome: '',
    email: '',
    papel: 'operador_comercial',
    senha: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/tenants')
      setTenants(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar tenants')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTenant = async (e) => {
    e.preventDefault()
    try {
      await api.post('/tenants', formTenant)
      setFormTenant({
        nome_empresa: '',
        cnpj: '',
        email_admin: '',
        plano: 'basico',
      })
      setShowFormTenant(false)
      await carregarDados()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar tenant')
    }
  }

  const handleSubmitUsuario = async (e) => {
    e.preventDefault()
    try {
      await api.post('/tenants/usuarios', formUsuario)
      setFormUsuario({
        tenant_id: '',
        nome: '',
        email: '',
        papel: 'operador_comercial',
        senha: '',
      })
      setShowFormUsuario(false)
      await carregarDados()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar usuário')
    }
  }

  if (user?.papel !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Acesso negado. Apenas super admins podem acessar esta página.
        </div>
      </div>
    )
  }

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Painel Super Admin</h1>
        <p className="text-gray-600 mt-2">Gerenciar tenants e usuários do sistema</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setShowFormTenant(false)}
              className="px-4 py-3 border-b-2 border-primary-600 text-primary-600 font-medium"
            >
              Tenants
            </button>
            <button
              onClick={() => setShowFormUsuario(false)}
              className="px-4 py-3 border-b-2 border-transparent text-gray-600 font-medium hover:text-gray-900"
            >
              Usuários
            </button>
          </div>
        </div>

        {/* Tenants Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Tenants</h2>
            <button
              onClick={() => setShowFormTenant(!showFormTenant)}
              className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
            >
              {showFormTenant ? 'Cancelar' : '+ Novo Tenant'}
            </button>
          </div>

          {/* Form Tenant */}
          {showFormTenant && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <form onSubmit={handleSubmitTenant} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                    <input
                      type="text"
                      value={formTenant.nome_empresa}
                      onChange={(e) => setFormTenant({ ...formTenant, nome_empresa: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={formTenant.cnpj}
                      onChange={(e) => setFormTenant({ ...formTenant, cnpj: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Admin</label>
                    <input
                      type="email"
                      value={formTenant.email_admin}
                      onChange={(e) => setFormTenant({ ...formTenant, email_admin: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                    <select
                      value={formTenant.plano}
                      onChange={(e) => setFormTenant({ ...formTenant, plano: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="basico">Básico</option>
                      <option value="profissional">Profissional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
                >
                  Criar Tenant
                </button>
              </form>
            </div>
          )}

          {/* Tenants List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Empresa</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">CNPJ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plano</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data Criação</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{tenant.nome_empresa}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant.cnpj}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant.email_admin}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {tenant.plano}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tenant.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tenant.status === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total de Tenants</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{tenants.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Tenants Ativos</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {tenants.filter(t => t.status === 'ativo').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Plano Básico</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {tenants.filter(t => t.plano === 'basico').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Plano Enterprise</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {tenants.filter(t => t.plano === 'enterprise').length}
          </p>
        </div>
      </div>
    </div>
  )
}
