import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input, Select } from './ui/Input'
import { useSavePreset, useUpdatePreset } from '@/hooks/useSetPresets'
import {
  CATEGORY_LABELS,
  LEVEL_LABELS,
  type PresetCategory,
  type PresetLevel,
  type SetPreset,
} from '@/lib/presetUtils'
import type { CatalogPreset } from '@/lib/presetUtils'
import { STROKES } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavePresetModalProps {
  open: boolean
  onClose: () => void
  /** Pre-fill for "save as preset" from a session block or plan set. */
  prefill?: Partial<CatalogPreset>
  /** Pre-fill for editing an existing user preset. */
  editPreset?: SetPreset
}

type FormState = {
  title: string
  category: PresetCategory
  level: PresetLevel
  stroke: string
  reps: number
  distance: number
  rest_type: CatalogPreset['rest_type']
  rest_value: string
  equipment: string
  description: string
}

const EMPTY: FormState = {
  title: '',
  category: 'endurance',
  level: 'intermediate',
  stroke: '',
  reps: 4,
  distance: 100,
  rest_type: 'rest_seconds',
  rest_value: '30',
  equipment: '',
  description: '',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as PresetCategory[]
const LEVELS = Object.keys(LEVEL_LABELS) as PresetLevel[]

function presetToForm(p: SetPreset): FormState {
  return {
    title: p.title,
    category: p.category,
    level: p.level,
    stroke: p.stroke ?? '',
    reps: p.reps,
    distance: p.distance,
    rest_type: p.rest_type,
    rest_value: p.rest_value != null ? String(p.rest_value) : '',
    equipment: p.equipment.join(', '),
    description: p.description,
  }
}

function prefillToForm(pf: Partial<CatalogPreset>): FormState {
  return {
    ...EMPTY,
    title: pf.title ?? '',
    category: pf.category ?? 'endurance',
    level: pf.level ?? 'intermediate',
    stroke: pf.stroke ?? '',
    reps: pf.reps ?? 4,
    distance: pf.distance ?? 100,
    rest_type: pf.rest_type ?? 'rest_seconds',
    rest_value: pf.rest_value != null ? String(pf.rest_value) : '30',
    equipment: (pf.equipment ?? []).join(', '),
    description: pf.description ?? '',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SavePresetModal({ open, onClose, prefill, editPreset }: SavePresetModalProps) {
  const isEdit = Boolean(editPreset)
  const savePreset = useSavePreset()
  const updatePreset = useUpdatePreset()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (editPreset) {
      setForm(presetToForm(editPreset))
    } else if (prefill) {
      setForm(prefillToForm(prefill))
    } else {
      setForm(EMPTY)
    }
    setError(null)
  }, [open, editPreset, prefill])

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setError(null)
    const equipment = form.equipment
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const rest_value =
      form.rest_type === 'none' || form.rest_value === ''
        ? null
        : Number(form.rest_value)

    const payload: CatalogPreset = {
      title: form.title.trim(),
      category: form.category,
      level: form.level,
      stroke: form.stroke || null,
      reps: form.reps,
      distance: form.distance,
      rest_type: form.rest_type,
      rest_value,
      equipment,
      description: form.description.trim(),
      structure: null,
      family: null,
    }

    try {
      if (isEdit && editPreset) {
        await updatePreset.mutateAsync({ id: editPreset.id, ...payload })
      } else {
        await savePreset.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const isSaving = savePreset.isPending || updatePreset.isPending
  const showRestValue = form.rest_type !== 'none'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit preset' : 'Save as preset'}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Title"
          placeholder="My threshold set"
          value={form.title}
          onChange={(e) => patch('title', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => patch('category', e.target.value as PresetCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </Select>

          <Select
            label="Level"
            value={form.level}
            onChange={(e) => patch('level', e.target.value as PresetLevel)}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
            ))}
          </Select>
        </div>

        <Select
          label="Stroke"
          value={form.stroke}
          onChange={(e) => patch('stroke', e.target.value)}
        >
          <option value="">Choice / any</option>
          {STROKES.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Reps"
            type="number"
            min={1}
            value={form.reps}
            onChange={(e) => patch('reps', Math.max(1, Number(e.target.value)))}
          />
          <Input
            label="Distance (m)"
            type="number"
            min={25}
            step={25}
            value={form.distance}
            onChange={(e) => patch('distance', Math.max(25, Number(e.target.value)))}
          />
        </div>

        <div className={showRestValue ? 'grid grid-cols-2 gap-3' : ''}>
          <Select
            label="Rest type"
            value={form.rest_type}
            onChange={(e) => patch('rest_type', e.target.value as FormState['rest_type'])}
          >
            <option value="rest_seconds">Rest (seconds)</option>
            <option value="interval_seconds">Send-off interval</option>
            <option value="css_offset">CSS offset (s/100)</option>
            <option value="none">No rest</option>
          </Select>

          {showRestValue && (
            <Input
              label={
                form.rest_type === 'css_offset'
                  ? 'Offset (s/100 vs CSS)'
                  : 'Seconds'
              }
              type="number"
              value={form.rest_value}
              onChange={(e) => patch('rest_value', e.target.value)}
              hint={form.rest_type === 'css_offset' ? '+5 = slower · −2 = faster' : undefined}
            />
          )}
        </div>

        <Input
          label="Equipment (comma-separated)"
          placeholder="pull buoy, kickboard"
          value={form.equipment}
          onChange={(e) => patch('equipment', e.target.value)}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">
            Description (optional)
          </label>
          <textarea
            rows={2}
            placeholder="Purpose and one execution cue…"
            value={form.description}
            onChange={(e) => patch('description', e.target.value)}
            className="w-full rounded-component border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {error && (
          <p className="rounded-component border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={isSaving} disabled={!form.title.trim()} onClick={handleSave}>
            {isEdit ? 'Save changes' : 'Save preset'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
