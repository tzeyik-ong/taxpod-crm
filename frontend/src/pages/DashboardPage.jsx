import { useEffect, useState } from 'react'
import { Users, Briefcase, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react'
import { dashboardApi } from '../api/client'
import StatCard       from '../components/dashboard/StatCard'
import RecentActivity from '../components/dashboard/RecentActivity'

const STAGE_ORDER = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']

export default function DashboardPage() {
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [stageOpen,  setStageOpen]  = useState(false)

  useEffect(() => {
    dashboardApi.get()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
  )
  if (!data) return null

  const statusItems = [
    { label: 'Leads',     value: data.leads_count,     color: 'bg-blue-500' },
    { label: 'Prospects', value: data.prospects_count, color: 'bg-indigo-500' },
    { label: 'Customers', value: data.customers_count, color: 'bg-emerald-500' },
  ]

  // Sort by_stage into a consistent order
  const stageMap = Object.fromEntries((data.by_stage ?? []).map(s => [s.stage, s]))
  const stageRows = STAGE_ORDER.map(s => stageMap[s]).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Contacts"
          value={data.total_leads}
          color="blue"
          info="Total number of leads, prospects, and customers in the system."
        />
        <StatCard
          icon={Briefcase}
          label="Open Opportunities"
          value={data.open_opportunities}
          color="indigo"
          info="Active deals not yet marked as Won or Lost."
        />
        <StatCard
          icon={TrendingUp}
          label="Pipeline Value"
          value={`RM ${Number(data.pipeline_value).toLocaleString()}`}
          color="emerald"
          info="Total RM value of all open (non-Won, non-Lost) opportunities."
        />
        <StatCard
          icon={Award}
          label="Won Value"
          value={`RM ${Number(data.won_value).toLocaleString()}`}
          color="amber"
          info="Total RM value of all opportunities marked as Won."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-4">Contacts by Status</h3>
          <div className="space-y-3">
            {statusItems.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`} />
                <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Total opportunities value — collapsible stage breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total opportunities value</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">
                  RM {Number(data.total_value).toLocaleString()}
                </span>
                <button
                  onClick={() => setStageOpen(o => !o)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title={stageOpen ? 'Hide breakdown' : 'Show breakdown by stage'}
                >
                  {stageOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {stageOpen && (
              <div className="mt-3 space-y-1.5">
                {stageRows.length === 0 ? (
                  <p className="text-xs text-gray-400">No opportunities yet.</p>
                ) : (
                  stageRows.map(s => (
                    <div key={s.stage} className="flex items-center justify-between text-xs text-gray-600 pl-1">
                      <span className="text-gray-500">{s.stage} <span className="text-gray-400">({s.count})</span></span>
                      <span className="font-medium">RM {Number(s.value).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <RecentActivity activities={data.recent_activities} />
        </div>
      </div>
    </div>
  )
}
