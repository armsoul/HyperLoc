import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Manutencao({ user }) {
  const [ordens, setOrdens] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')

  const [formData, setFormData] = useState({
    numero: '',
    equipamento_id: '',
    tipo: 'preventiva',
    data_previsao: '',
    custo_estimado: 0,
    observacoes: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [ordResponse, eqResponse] = await Promise.all([
        api.get('/manutencao'),
        api.get('/equipamentos'),
      ])
      setOrdens(ordResponse.data)
      setEquipamentos(eqResponse.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/manutencao', formData)
      setFormData({
        numero: '',
        equipamento_id: '',
        tipo: 'preventiva',
        data_previsao: '',
        custo_estimado: 0,
        observacoes: '',
      })
      setShowForm(false)
      await carregarDados()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar ordem')
    }
  }

  const ordensFiltradas = ordens.filter(ord => {
    if (filtroStatus && ord.status !== filtroStatus) return false
    return true
  })

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manutenção</h1>
          <p className="text-gray-600 mt-2">Gerenciar ordens de manutenção preventiva e corretiva</p>
        </div>
        {['admin_empresa', 'manutencao'].includes(user?.papel) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancelar' : '+ Nova Ordem'}
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
      {showForm && ['admin_empresa', 'manutencao'].includes(user?.papel) && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipamento</label>
                <select
                  value={formData.equipamento_id}
                  onChange={(e) => setFormData({ ...formData, equipamento_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Selecione um equipamento</option>
                  {equipamentos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.descricao}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="preventiva">Preventiva</option>
                  <option value="corretiva">Corretiva</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Previsão</label>
                <input
                  type="datetime-local"
                  value={formData.data_previsao}
                  onChange={(e) => setFormData({ ...formData, data_previsao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo Estimado</label>
                <input
                  type="number"
                  value={formData.custo_estimado}
                  onChange={(e) => setFormData({ ...formData, custo_estimado: parseFloat(e.target.value) })}
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
              Criar Ordem
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
          <option value="aberta">Aberta</option>
          <option value="em_execucao">Em Execução</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {ordensFiltradas.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhuma ordem encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Número</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Equipamento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data Abertura</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Custo Estimado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ordensFiltradas.map(ord => {
                  const eq = equipamentos.find(e => e.id === ord.equipamento_id)
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{ord.numero}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{eq?.descricao}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{ord.tipo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(ord.data_abertura).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        R$ {parseFloat(ord.custo_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ord.status === 'aberta'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'em_execucao'
                            ? 'bg-yellow-100 text-yellow-800'
                            : ord.status === 'concluida'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ord.status}
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
