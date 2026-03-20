import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Financeiro({ user }) {
  const [lancamentos, setLancamentos] = useState([])
  const [contas, setContas] = useState([])
  const [fluxoCaixa, setFluxoCaixa] = useState(null)
  const [inadimplencia, setInadimplencia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const [formData, setFormData] = useState({
    tipo: 'receber',
    historico: '',
    data_vencimento: '',
    valor_original: 0,
    forma_pagamento: 'dinheiro',
  })

  const [dataFluxo, setDataFluxo] = useState({
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [lancResponse, contResponse, inadResponse] = await Promise.all([
        api.get('/financeiro/lancamentos'),
        api.get('/financeiro/contas'),
        api.get('/financeiro/inadimplencia'),
      ])
      setLancamentos(lancResponse.data)
      setContas(contResponse.data)
      setInadimplencia(inadResponse.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const carregarFluxoCaixa = async () => {
    try {
      const response = await api.get('/financeiro/fluxo-caixa', {
        params: {
          data_inicio: dataFluxo.data_inicio,
          data_fim: dataFluxo.data_fim,
        },
      })
      setFluxoCaixa(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar fluxo de caixa')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/financeiro/lancamentos', formData)
      setFormData({
        tipo: 'receber',
        historico: '',
        data_vencimento: '',
        valor_original: 0,
        forma_pagamento: 'dinheiro',
      })
      setShowForm(false)
      await carregarDados()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar lançamento')
    }
  }

  const lancamentosFiltrados = lancamentos.filter(lanc => {
    if (filtroStatus && lanc.status !== filtroStatus) return false
    if (filtroTipo && lanc.tipo !== filtroTipo) return false
    return true
  })

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-2">Gerenciar lançamentos, contas e fluxo de caixa</p>
        </div>
        {['admin_empresa', 'financeiro'].includes(user?.papel) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancelar' : '+ Novo Lançamento'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Saldo Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            R$ {contas.reduce((sum, c) => sum + parseFloat(c.saldo_atual || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Títulos Abertos</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{lancamentos.filter(l => l.status === 'aberto').length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Títulos Atrasados</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{inadimplencia?.total_titulos_atrasados || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Valor Atrasado</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            R$ {(inadimplencia?.valor_total_atrasado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && ['admin_empresa', 'financeiro'].includes(user?.papel) && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="receber">Receber</option>
                  <option value="pagar">Pagar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Histórico</label>
                <input
                  type="text"
                  value={formData.historico}
                  onChange={(e) => setFormData({ ...formData, historico: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Vencimento</label>
                <input
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <input
                  type="number"
                  value={formData.valor_original}
                  onChange={(e) => setFormData({ ...formData, valor_original: parseFloat(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cheque">Cheque</option>
                  <option value="transferencia">Transferência</option>
                  <option value="cartao">Cartão</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
            >
              Criar Lançamento
            </button>
          </form>
        </div>
      )}

      {/* Fluxo de Caixa */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fluxo de Caixa</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={dataFluxo.data_inicio}
            onChange={(e) => setDataFluxo({ ...dataFluxo, data_inicio: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <input
            type="date"
            value={dataFluxo.data_fim}
            onChange={(e) => setDataFluxo({ ...dataFluxo, data_fim: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button
            onClick={carregarFluxoCaixa}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
          >
            Gerar Relatório
          </button>
        </div>

        {fluxoCaixa && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-700 text-sm font-medium">Entradas Previstas</p>
              <p className="text-xl font-bold text-green-900 mt-1">
                R$ {fluxoCaixa.entradas_previstas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm font-medium">Saídas Previstas</p>
              <p className="text-xl font-bold text-red-900 mt-1">
                R$ {fluxoCaixa.saidas_previstas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm font-medium">Saldo Atual</p>
              <p className="text-xl font-bold text-blue-900 mt-1">
                R$ {fluxoCaixa.saldo_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-purple-700 text-sm font-medium">Saldo Projetado</p>
              <p className="text-xl font-bold text-purple-900 mt-1">
                R$ {fluxoCaixa.saldo_projetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos os tipos</option>
          <option value="receber">Receber</option>
          <option value="pagar">Pagar</option>
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos os status</option>
          <option value="aberto">Aberto</option>
          <option value="liquidado">Liquidado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Lancamentos List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {lancamentosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum lançamento encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Histórico</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data Vencimento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lancamentosFiltrados.map(lanc => (
                  <tr key={lanc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{lanc.historico}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lanc.tipo === 'receber'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {lanc.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(lanc.data_vencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      R$ {parseFloat(lanc.valor_liquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lanc.status === 'aberto'
                          ? 'bg-blue-100 text-blue-800'
                          : lanc.status === 'liquidado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {lanc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
