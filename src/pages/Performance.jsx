import { useEffect, useState } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const levelConfig = {
  'Xuất sắc': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', bar: 'bg-emerald-500', glow: 'shadow-emerald-200', stroke: '#10b981' },
  'Tốt':      { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-300',    bar: 'bg-blue-500',    glow: 'shadow-blue-200',    stroke: '#3b82f6' },
  'Trung bình':{ bg: 'bg-amber-100',  text: 'text-amber-700',   border: 'border-amber-300',   bar: 'bg-amber-500',   glow: 'shadow-amber-200',   stroke: '#f59e0b' },
  'Yếu':      { bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-300',     bar: 'bg-red-500',     glow: 'shadow-red-200',     stroke: '#ef4444' },
}

function ScoreRing({ score, level }) {
  const cfg = levelConfig[level] || levelConfig['Tốt']
  const pct = Math.min(score, 100)
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={cfg.stroke}
          strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold text-slate-800">{score}</span>
        <span className="block text-xs text-slate-400 font-medium">/ 100+</span>
      </div>
    </div>
  )
}

function StatBox({ label, value, sub, color = 'slate' }) {
  const colors = {
    slate:   'bg-slate-50 border-slate-200 text-slate-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber:   'bg-amber-50 border-amber-200 text-amber-600',
    red:     'bg-red-50 border-red-200 text-red-600',
    blue:    'bg-blue-50 border-blue-200 text-blue-600',
  }
  return (
    <div className={`rounded-xl border p-4 text-center ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold mt-0.5">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  )
}

function KpiCard({ data, isMe = false }) {
  const cfg = levelConfig[data.level] || levelConfig['Tốt']
  const pct = Math.min(data.score, 100)

  return (
    <div className={`bg-white rounded-2xl border ${cfg.border} shadow-lg ${cfg.glow} p-5 flex flex-col gap-4 animate-fade-in ${isMe ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-800 text-base">{data.fullName}</p>
          <p className="text-xs text-slate-400 font-mono">{data.employeeCode || '—'}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          <span>{data.levelIcon}</span>
          <span>{data.level}</span>
        </div>
      </div>

      {/* Score bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Điểm KPI</span>
          <span className="font-bold text-slate-700">{data.score} điểm</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full ${cfg.bar} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="font-bold text-slate-700 text-base">{data.totalTasks}</div>
          <div className="text-slate-400">Tổng task</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-2">
          <div className="font-bold text-emerald-600 text-base">+{data.bonusPoints}</div>
          <div className="text-emerald-500">Thưởng</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2">
          <div className="font-bold text-red-500 text-base">-{data.penaltyPoints}</div>
          <div className="text-red-400">Phạt</div>
        </div>
      </div>

      {/* Risk warning */}
      {data.isAtRisk && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 flex items-start gap-2">
          <span>⚠️</span>
          <span>{data.warningMessage}</span>
        </div>
      )}
    </div>
  )
}

export default function Performance() {
  const { role, userId } = useAuth()
  const [myKpi, setMyKpi] = useState(null)
  const [unitKpi, setUnitKpi] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mine')  // 'mine' | 'unit'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (userId) {
        const res = await api.get(`/users/performance/${userId}`)
        setMyKpi(res.data)
      }
      if (role === 'Manager' || role === 'Admin') {
        const res2 = await api.get('/users/performance/unit')
        setUnitKpi(res2.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canViewUnit = role === 'Manager' || role === 'Admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 font-display mb-1">
            📊 Hiệu suất KPI
          </h1>
          <p className="text-slate-500 text-sm">
            Theo dõi điểm hiệu suất cá nhân dựa trên tiến độ và chất lượng công việc
          </p>
        </div>

        {/* Tab switcher */}
        {canViewUnit && (
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-8">
            <button
              onClick={() => setTab('mine')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'mine' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              👤 Của tôi
            </button>
            <button
              onClick={() => setTab('unit')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'unit' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🏆 Xếp hạng phòng
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-4xl mb-3 animate-spin">⏳</div>
            <p>Đang tải dữ liệu KPI...</p>
          </div>
        ) : (
          <>
            {/* ───── MY KPI ───── */}
            {(tab === 'mine' || !canViewUnit) && myKpi && (
              <div className="animate-fade-in">
                {/* Hero card */}
                <div className={`bg-white rounded-3xl border shadow-xl p-8 mb-6 ${levelConfig[myKpi.level]?.border || 'border-slate-200'}`}>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Ring */}
                    <ScoreRing score={myKpi.score} level={myKpi.level} />

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-3 ${levelConfig[myKpi.level]?.bg} ${levelConfig[myKpi.level]?.text} border ${levelConfig[myKpi.level]?.border}`}>
                        <span className="text-lg">{myKpi.levelIcon}</span>
                        <span>{myKpi.level}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-1">{myKpi.fullName}</h2>
                      <p className="text-slate-400 font-mono text-sm mb-4">{myKpi.employeeCode || '—'}</p>
                      {myKpi.isManagerKpi ? (
                        <p className="text-sm text-slate-500">
                          Công thức: (<strong className="text-blue-600">{Math.round(myKpi.unitAverageScore)}</strong> × 70%) 
                          + (<strong className="text-indigo-600">{myKpi.personalScore}</strong> × 30%)
                          {myKpi.reviewPenaltyPoints > 0 && <span> − phạt ngâm bài <strong className="text-red-600">{myKpi.reviewPenaltyPoints}</strong></span>}
                          {' '} = <strong className="text-blue-600 text-lg">{myKpi.score}</strong> điểm
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Điểm nền <strong>100</strong> + thưởng <strong className="text-emerald-600">+{myKpi.bonusPoints}</strong> 
                          {myKpi.penaltyPoints > 0 && <span> − phạt cá nhân <strong className="text-red-500">{myKpi.penaltyPoints}</strong></span>}
                          {' '} = <strong className="text-blue-600 text-lg">{myKpi.score}</strong> điểm
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 min-w-[220px]">
                      <StatBox label="Tổng task" value={myKpi.totalTasks} color="slate" />
                      <StatBox label="Hoàn thành đúng hạn" value={myKpi.completedOnTime} sub="+5 điểm/task" color="emerald" />
                      <StatBox label="Hoàn thành trễ" value={myKpi.completedLate} color="amber" />
                      <StatBox label="Quá hạn" value={myKpi.overdueTasks} sub="Phạt lũy tiến" color="red" />
                    </div>
                  </div>

                  {/* Warning */}
                  {myKpi.isAtRisk && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <p className="font-semibold text-red-600 text-sm">Cảnh báo hiệu suất</p>
                        <p className="text-red-500 text-sm mt-0.5">{myKpi.warningMessage}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow p-5">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <span>📋</span> Tổng quan task
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Tổng task được giao', value: myKpi.totalTasks, color: 'text-slate-700' },
                        { label: 'Hoàn thành đúng hạn', value: myKpi.completedOnTime, color: 'text-emerald-600' },
                        { label: 'Hoàn thành trễ hạn', value: myKpi.completedLate, color: 'text-amber-500' },
                        { label: 'Quá hạn (chưa nộp)', value: myKpi.overdueTasks, color: 'text-red-500' },
                        { label: 'Báo cáo bị từ chối', value: myKpi.rejectedReports, color: 'text-red-400' },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                          <span className="text-sm text-slate-500">{r.label}</span>
                          <span className={`font-bold text-sm ${r.color}`}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow p-5">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <span>🎯</span> Cơ cấu điểm
                    </h3>
                    <div className="space-y-3">
                      {myKpi.isManagerKpi ? (
                        <>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                            <span className="text-sm text-slate-500">Trung bình phòng (70%)</span>
                            <span className="font-bold text-slate-700">{Math.round(myKpi.unitAverageScore * 0.7)}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                            <span className="text-sm text-slate-500">Hiệu suất cá nhân (30%)</span>
                            <span className="font-bold text-slate-700">{Math.round(myKpi.personalScore * 0.3)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                            <span className="text-sm text-slate-500">Điểm nền</span>
                            <span className="font-bold text-slate-700">100</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                            <span className="text-sm text-emerald-500">+ Hoàn thành đúng hạn</span>
                            <span className="font-bold text-emerald-600">+{myKpi.bonusPoints}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                            <span className="text-sm text-red-400">− Phạt trễ hạn cá nhân</span>
                            <span className="font-bold text-red-500">−{myKpi.penaltyPoints}</span>
                          </div>
                        </>
                      )}
                      
                      {myKpi.reviewPenaltyPoints > 0 && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                          <span className="text-sm text-red-600">− Phạt ngâm duyệt (SLA)</span>
                          <span className="font-bold text-red-600">−{myKpi.reviewPenaltyPoints}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold text-slate-700">Tổng điểm</span>
                        <span className="font-bold text-blue-600 text-lg">{myKpi.score}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow p-5">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <span>📖</span> Thang điểm
                    </h3>
                    <div className="space-y-3">
                      {[
                        { range: '≥ 90', level: 'Xuất sắc', icon: '⭐', cfg: levelConfig['Xuất sắc'] },
                        { range: '75 – 89', level: 'Tốt', icon: '✅', cfg: levelConfig['Tốt'] },
                        { range: '60 – 74', level: 'Trung bình', icon: '⚠️', cfg: levelConfig['Trung bình'] },
                        { range: '< 60', level: 'Yếu', icon: '🔴', cfg: levelConfig['Yếu'] },
                      ].map(r => (
                        <div key={r.level} className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${r.cfg.bg} ${r.cfg.border}`}>
                          <span className="text-lg">{r.icon}</span>
                          <div className="flex-1">
                            <p className={`text-xs font-bold ${r.cfg.text}`}>{r.level}</p>
                            <p className="text-xs text-slate-400">{r.range} điểm</p>
                          </div>
                          {myKpi.level === r.level && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">Bạn</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───── UNIT RANKING ───── */}
            {tab === 'unit' && canViewUnit && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-700">🏆 Bảng xếp hạng phòng</h2>
                  <span className="text-sm text-slate-400">{unitKpi.length} nhân viên</span>
                </div>

                {unitKpi.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <div className="text-5xl mb-4">😶</div>
                    <p>Chưa có dữ liệu KPI nhân viên</p>
                  </div>
                ) : (
                  <>
                    {/* Top 3 podium */}
                    {unitKpi.length >= 3 && (
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                          { idx: 1, medal: '🥈', height: 'pt-6' },
                          { idx: 0, medal: '🥇', height: 'pt-0' },
                          { idx: 2, medal: '🥉', height: 'pt-10' },
                        ].map(({ idx, medal, height }) => {
                          const d = unitKpi[idx]
                          if (!d) return null
                          const cfg = levelConfig[d.level] || levelConfig['Tốt']
                          return (
                            <div key={idx} className={`${height} flex flex-col items-center`}>
                              <div className="text-3xl mb-2">{medal}</div>
                              <div className={`w-full bg-white rounded-2xl border ${cfg.border} shadow-lg p-4 text-center`}>
                                <div className="text-2xl font-bold text-slate-800 mb-0.5">{d.score}</div>
                                <div className={`text-xs font-bold ${cfg.text} mb-2`}>{d.levelIcon} {d.level}</div>
                                <div className="font-semibold text-slate-700 text-sm">{d.fullName}</div>
                                <div className="text-xs text-slate-400 font-mono">{d.employeeCode || '—'}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Full list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unitKpi.map((d, i) => (
                        <div key={d.userId} className="relative">
                          <span className="absolute -top-2 -left-2 w-6 h-6 bg-slate-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                            {i + 1}
                          </span>
                          <KpiCard data={d} isMe={d.userId === userId} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
