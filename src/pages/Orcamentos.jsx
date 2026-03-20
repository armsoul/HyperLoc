import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Orcamentos({ user }) {
  const [orcamentos, setOrcamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')

  const [formData, setFormData] = useState({
    numero: '',
    cliente_id: '',
    validade: '',
    observacoes: '',
    desconto: 0,
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [orcResponse, clientResponse] = await Promise.all([
        api.get('/comercial/orcamentos'),
        api.get('/clientes'),
      ])
      setOrcamentos(orcResponse.data)
      setClientes(clientResponse.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/comercial/orcamentos', formData)
      setFormData({
        numero: '',
        cliente_id: '',
        validade: '',
        observacoes: '',
        desconto: 0,
      })
      setShowForm(false)
      await carregarDados()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar orçamento')
    }
  }

  const orcamentosFiltrados = orcamentos.filter(orc => {
    if (filtroStatus && orc.status !== filtroStatus) return false
    return true
  })

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600 mt-2">Gerenciar orçamentos de locação</p>
        </div>
        {['admin_empresa', 'operador_comercial'].includes(user?.papel) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancelar' : '+ Novo Orçamento'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && ['admin_empresa', 'operador_comercial'].includes(user?.papel) && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cli => (
                    <option key={cli.id} value={cli.id}>{cli.nome_razao}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                <input
                  type="datetime-local"
                  value={formData.validade}
                  onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                <input
                  type="number"
                  value={formData.desconto}
                  onChange={(e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
            >
              Criar Orçamento
            </button>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos os status</option>
          <option value="aberto">Aberto</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Quotes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {orcamentosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum orçamento encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Número</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orcamentosFiltrados.map(orc => {
                  const cliente = clientes.find(c => c.id === orc.cliente_id)
                  return (
                    <tr key={orc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{orc.numero}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cliente?.nome_razao}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(orc.data_emissao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        R$ {parseFloat(orc.total_liquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          orc.status === 'aberto'
                            ? 'bg-blue-100 text-blue-800'
                            : orc.status === 'aprovado'
                            ? 'bg-green-100 text-green-800'
                            : orc.status === 'rejeitado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {orc.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
