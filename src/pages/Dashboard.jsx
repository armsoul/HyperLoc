import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    equipamentosDisponiveis: 0,
    contratosAbertos: 0,
    proximosVencimentos: 0,
    saldoFluxoCaixa: 0,
  })

  useEffect(() => {
    // Aqui viriam chamadas reais à API
    // Por enquanto, dados mockados
    setStats({
      equipamentosDisponiveis: 12,
      contratosAbertos: 5,
      proximosVencimentos: 3,
      saldoFluxoCaixa: 45250.00,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo, {user?.nome}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Equipamentos Disponíveis */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Equipamentos Disponíveis</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.equipamentosDisponiveis}</p>
            </div>
            <div className="text-4xl">🔧</div>
          </div>
        </div>

        {/* Card: Contratos Abertos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Contratos Abertos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.contratosAbertos}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        {/* Card: Próximos Vencimentos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Próximos Vencimentos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.proximosVencimentos}</p>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
        </div>

        {/* Card: Saldo Fluxo de Caixa */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Saldo Fluxo de Caixa</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                R$ {stats.saldoFluxoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Locações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Últimas Locações</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">Nenhuma locação recente</p>
          </div>
        </div>

        {/* Próximas Devoluções */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Próximas Devoluções</h2>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">Nenhuma devolução próxima</p>
          </div>
        </div>
      </div>
    </div>
  )
}
