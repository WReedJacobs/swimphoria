import { Lock } from 'lucide-react'
import type { SwimmerStatsRow } from '@/hooks/useSwimmerStats'

// ─── Tier configuration ────────────────────────────────────────────────────

type Tier = 'rookie' | 'bronze' | 'silver' | 'gold' | 'elite' | 'legend' | 'mythic'

interface TierConfig {
  label: string
  borderStyle: React.CSSProperties
  bgStyle: React.CSSProperties
  textColor: string
  ovrColor: string
  wrapperClass?: string
}

const TIER_CONFIG: Record<Tier, TierConfig> = {
  rookie: {
    label: 'Rookie',
    borderStyle: { background: 'linear-gradient(135deg, #6b7280, #9ca3af)' },
    bgStyle: { background: 'linear-gradient(160deg, #1a1f27 0%, #0f1319 100%)' },
    textColor: '#9ca3af',
    ovrColor: '#d1d5db',
  },
  bronze: {
    label: 'Bronze',
    borderStyle: { background: 'linear-gradient(135deg, #92400e, #d97706, #b45309)' },
    bgStyle: { background: 'linear-gradient(160deg, #1c1508 0%, #0f0c04 100%)' },
    textColor: '#d97706',
    ovrColor: '#f59e0b',
  },
  silver: {
    label: 'Silver',
    borderStyle: { background: 'linear-gradient(135deg, #6b7280, #e5e7eb, #9ca3af)' },
    bgStyle: { background: 'linear-gradient(160deg, #18191f 0%, #0c0d12 100%)' },
    textColor: '#d1d5db',
    ovrColor: '#f9fafb',
  },
  gold: {
    label: 'Gold',
    borderStyle: { background: 'linear-gradient(135deg, #ca8a04, #fde047, #b45309)' },
    bgStyle: { background: 'linear-gradient(160deg, #1a1500 0%, #0d0b00 100%)' },
    textColor: '#fbbf24',
    ovrColor: '#fde047',
  },
  elite: {
    label: 'Elite',
    borderStyle: { background: 'linear-gradient(135deg, #0891b2, #22d3ee, #0e7490)' },
    bgStyle: { background: 'linear-gradient(160deg, #00161a 0%, #000e12 100%)' },
    textColor: '#22d3ee',
    ovrColor: '#67e8f9',
  },
  legend: {
    label: 'Legend',
    borderStyle: { background: 'linear-gradient(135deg, #7c3aed, #a78bfa, #6d28d9)' },
    bgStyle: { background: 'linear-gradient(160deg, #0f0018 0%, #07000f 100%)' },
    textColor: '#a78bfa',
    ovrColor: '#c4b5fd',
  },
  mythic: {
    label: 'Mythic',
    borderStyle: {},
    bgStyle: { background: 'linear-gradient(160deg, #1a0010 0%, #0a000a 100%)' },
    textColor: '#f0abfc',
    ovrColor: '#f0abfc',
    wrapperClass: 'mythic-card-wrapper',
  },
}

// ─── Stat bar color ────────────────────────────────────────────────────────

function statColor(val: number): string {
  if (val >= 90) return 'rgb(var(--c-primary))'
  if (val >= 75) return 'rgb(var(--c-secondary))'
  if (val >= 60) return 'rgb(var(--c-text-secondary))'
  if (val >= 40) return 'rgb(var(--c-accent))'
  return 'rgb(var(--c-danger))'
}

function statTextClass(val: number): string {
  if (val >= 90) return 'text-primary'
  if (val >= 75) return 'text-secondary'
  if (val >= 60) return 'text-text-secondary'
  if (val >= 40) return 'text-accent'
  return 'text-danger'
}

// ─── Stat row sub-component ────────────────────────────────────────────────

function StatRow({ label, value, compact }: { label: string; value: number; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? 'gap-1' : ''}`}>
      <span
        className="font-mono text-[10px] font-semibold tracking-wider uppercase"
        style={{ color: 'rgb(var(--c-text-muted))' }}
      >
        {label}
      </span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: compact ? 3 : 4, background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: statColor(value) }}
        />
      </div>
      <span
        className={`font-mono text-xs font-bold tabular-nums w-6 text-right ${statTextClass(value)}`}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────

export interface SwimmerCardProps {
  stats: SwimmerStatsRow
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  locked?: boolean
}

// ─── Small variant: compact leaderboard row ────────────────────────────────

function CardSm({ stats, name, locked }: SwimmerCardProps) {
  const cfg = TIER_CONFIG[(stats.tier as Tier) ?? 'rookie']
  return (
    <div className={`p-[2px] rounded-component ${cfg.wrapperClass ?? ''}`} style={!cfg.wrapperClass ? cfg.borderStyle : undefined}>
      <div className="flex items-center gap-3 rounded-[4px] px-3 py-2" style={cfg.bgStyle}>
        {locked ? (
          <span className="font-mono text-sm font-bold w-8 text-center text-text-muted">?</span>
        ) : (
          <span className="font-mono text-sm font-bold w-8 text-center" style={{ color: cfg.ovrColor }}>
            {stats.ovr}
          </span>
        )}
        <span className="text-sm font-medium text-text-primary flex-1 truncate">{name}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.textColor }}>
          {cfg.label}
        </span>
      </div>
    </div>
  )
}

// ─── Medium + Large variants ───────────────────────────────────────────────

export function SwimmerCard({ stats, name, avatarUrl, size = 'md', locked = false }: SwimmerCardProps) {
  if (size === 'sm') return <CardSm stats={stats} name={name} size={size} locked={locked} />

  const cfg = TIER_CONFIG[(stats.tier as Tier) ?? 'rookie']
  const isLg = size === 'lg'

  const statLabels: Array<{ key: keyof SwimmerStatsRow; label: string }> = [
    { key: 'spd', label: 'SPD' },
    { key: 'end_stat', label: 'END' },
    { key: 'tec', label: 'TEC' },
    { key: 'con', label: 'CON' },
    { key: 'prg', label: 'PRG' },
    { key: 'com', label: 'COM' },
  ]

  return (
    <div
      className={`p-[2px] rounded-card select-none ${cfg.wrapperClass ?? ''} ${isLg ? 'w-56' : 'w-40'}`}
      style={!cfg.wrapperClass ? cfg.borderStyle : undefined}
    >
      <div
        className="rounded-[8px] flex flex-col overflow-hidden"
        style={cfg.bgStyle}
      >
        {/* Header strip */}
        <div className={`flex flex-col items-center ${isLg ? 'pt-5 pb-3 gap-1' : 'pt-3 pb-2 gap-0.5'}`}>
          {/* OVR */}
          {locked ? (
            <div className="relative">
              <span
                className={`font-mono font-black blur-sm ${isLg ? 'text-5xl' : 'text-3xl'}`}
                style={{ color: cfg.ovrColor }}
              >
                88
              </span>
              <Lock
                className="absolute inset-0 m-auto text-text-muted"
                size={isLg ? 20 : 14}
              />
            </div>
          ) : (
            <span
              className={`font-mono font-black ${isLg ? 'text-5xl' : 'text-3xl'}`}
              style={{ color: cfg.ovrColor }}
            >
              {stats.ovr}
            </span>
          )}

          {/* Tier label */}
          <span
            className={`font-semibold uppercase tracking-widest ${isLg ? 'text-xs' : 'text-[9px]'}`}
            style={{ color: cfg.textColor }}
          >
            {cfg.label}
          </span>

          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className={`rounded-full object-cover mt-1 ring-1 ${isLg ? 'w-16 h-16' : 'w-10 h-10'}`}
              style={{ '--tw-ring-color': cfg.textColor } as React.CSSProperties}
            />
          ) : (
            <div
              className={`rounded-full flex items-center justify-center mt-1 font-bold font-mono ${isLg ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm'}`}
              style={{ background: 'rgba(255,255,255,0.06)', color: cfg.textColor }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name */}
          <span
            className={`font-semibold text-center truncate max-w-[90%] ${isLg ? 'text-sm mt-1' : 'text-[10px]'}`}
            style={{ color: 'rgb(var(--c-text-primary))' }}
          >
            {name}
          </span>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Stats */}
        <div className={`flex flex-col px-3 ${isLg ? 'py-3 gap-2' : 'py-2 gap-1.5'} ${locked ? 'blur-sm' : ''}`}>
          {statLabels.map(({ key, label }) => (
            <StatRow
              key={key}
              label={label}
              value={(stats[key] as number) ?? 0}
              compact={!isLg}
            />
          ))}
        </div>

        {/* Locked overlay */}
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 gap-1 pointer-events-none">
            <Lock size={16} className="text-text-muted" />
            <span className="text-[10px] text-text-muted font-medium">Join as swimmer</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SwimmerCard
