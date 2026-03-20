import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Pedidos({ user }) {
  const [pedidos, setPedidos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')

  const [formData, setFormData] = useState({
    numero: '',
    cliente_id: '',
    data_inicio_locacao: '',
    data_fim_prevista: '',
    observacoes: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [pedResponse, clientResponse] = await Promise.all([
        api.get('/comercial/pedidos'),
        api.get('/clientes'),
      ])
      setPedidos(pedResponse.data)
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
      await api.post('/comercial/pedidos', formData)
      setFormData({
        numero: '',
        cliente_id: '',
        data_inicio_locacao: '',
        data_fim_prevista: '',
        observacoes: '',
      })
      setShowForm(false)
      await carregarDados()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar pedido')
    }
  }

  const pedidosFiltrados = pedidos.filter(ped => {
    if (filtroStatus && ped.status !== filtroStatus) return false
    return true
  })

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos de Locação</h1>
          <p className="text-gray-600 mt-2">Gerenciar contratos de locação</p>
        </div>
        {['admin_empresa', 'operador_comercial'].includes(user?.papel) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancelar' : '+ Novo Pedido'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input
                  type="datetime-local"
                  value={formData.data_inicio_locacao}
                  onChange={(e) => setFormData({ ...formData, data_inicio_locacao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim Prevista</label>
                <input
                  type="datetime-local"
                  value={formData.data_fim_prevista}
                  onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
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
              Criar Pedido
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
          <option value="em_andamento">Em Andamento</option>
          <option value="encerrado">Encerrado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {pedidosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum pedido encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Número</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data Início</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data Fim</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pedidosFiltrados.map(ped => {
                  const cliente = clientes.find(c => c.id === ped.cliente_id)
                  return (
                    <tr key={ped.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{ped.numero}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cliente?.nome_razao}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ped.data_inicio_locacao ? new Date(ped.data_inicio_locacao).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ped.data_fim_prevista ? new Date(ped.data_fim_prevista).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        R$ {parseFloat(ped.valor_total_previsto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ped.status === 'aberto'
                            ? 'bg-blue-100 text-blue-800'
                            : ped.status === 'em_andamento'
                            ? 'bg-yellow-100 text-yellow-800'
                            : ped.status === 'encerrado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ped.status}
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
