import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Equipamentos({ user }) {
  const [equipamentos, setEquipamentos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const [formData, setFormData] = useState({
    codigo_interno: '',
    descricao: '',
    categoria_id: '',
    numero_serie: '',
    fabricante: '',
    modelo: '',
    ano_fabricacao: new Date().getFullYear(),
    valor_aquisicao: 0,
    localizacao_atual: '',
    observacoes: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [equipResponse, categResponse] = await Promise.all([
        api.get('/equipamentos'),
        api.get('/equipamentos/categorias'),
      ])
      setEquipamentos(equipResponse.data)
      setCategorias(categResponse.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/equipamentos', formData)
      setFormData({
        codigo_interno: '',
        descricao: '',
        categoria_id: '',
        numero_serie: '',
        fabricante: '',
        modelo: '',
        ano_fabricacao: new Date().getFullYear(),
        valor_aquisicao: 0,
        localizacao_atual: '',
        observacoes: '',
      })
      setShowForm(false)
      await carregarDados()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar equipamento')
    }
  }

  const equipamentosFiltrados = equipamentos.filter(eq => {
    if (filtroStatus && eq.status_estoque !== filtroStatus) return false
    if (filtroCategoria && eq.categoria_id !== filtroCategoria) return false
    return true
  })

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
          <p className="text-gray-600 mt-2">Gerenciar equipamentos disponíveis para locação</p>
        </div>
        {user?.papel === 'admin_empresa' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancelar' : '+ Novo Equipamento'}
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
      {showForm && user?.papel === 'admin_empresa' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Interno</label>
                <input
                  type="text"
                  value={formData.codigo_interno}
                  onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Série</label>
                <input
                  type="text"
                  value={formData.numero_serie}
                  onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
                <input
                  type="text"
                  value={formData.fabricante}
                  onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor de Aquisição</label>
                <input
                  type="number"
                  value={formData.valor_aquisicao}
                  onChange={(e) => setFormData({ ...formData, valor_aquisicao: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input
                  type="text"
                  value={formData.localizacao_atual}
                  onChange={(e) => setFormData({ ...formData, localizacao_atual: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
            >
              Criar Equipamento
            </button>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Todos os status</option>
            <option value="disponivel">Disponível</option>
            <option value="locado">Locado</option>
            <option value="manutencao">Manutenção</option>
            <option value="reservado">Reservado</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {equipamentosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum equipamento encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descrição</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fabricante</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {equipamentosFiltrados.map(eq => {
                  const categoria = categorias.find(c => c.id === eq.categoria_id)
                  return (
                    <tr key={eq.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{eq.codigo_interno}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{eq.descricao}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{categoria?.nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{eq.fabricante}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          eq.status_estoque === 'disponivel'
                            ? 'bg-green-100 text-green-800'
                            : eq.status_estoque === 'locado'
                            ? 'bg-blue-100 text-blue-800'
                            : eq.status_estoque === 'manutencao'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {eq.status_estoque}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        R$ {parseFloat(eq.valor_aquisicao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
