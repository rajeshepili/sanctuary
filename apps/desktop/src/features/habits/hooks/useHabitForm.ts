import { useState, useCallback } from 'react'
import type { HabitFrequency, HabitPriority } from '#/types'

interface HabitFormData {
  name: string
  identityLabel: string
  miniDesc: string
  plusDesc: string
  eliteDesc: string
  intention: string
  frequency: HabitFrequency
  interval: number
  customDays: number[]
  priority: HabitPriority
  categoryId: number | null
}

export function useHabitForm(initialData?: Partial<HabitFormData>) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [identityLabel, setIdentityLabel] = useState(initialData?.identityLabel ?? '')
  const [miniDesc, setMiniDesc] = useState(initialData?.miniDesc ?? '')
  const [plusDesc, setPlusDesc] = useState(initialData?.plusDesc ?? '')
  const [eliteDesc, setEliteDesc] = useState(initialData?.eliteDesc ?? '')
  const [intention, setIntention] = useState(initialData?.intention ?? '')
  const [frequency, setFrequency] = useState<HabitFrequency>(initialData?.frequency ?? 'daily')
  const [interval, setInterval] = useState<number>(initialData?.interval ?? 1)
  const [customDays, setCustomDays] = useState<number[]>(initialData?.customDays ?? [])
  const [priority, setPriority] = useState<HabitPriority>(initialData?.priority ?? 'medium')
  const [categoryId, setCategoryId] = useState<number | null>(initialData?.categoryId ?? null)

  const resetForm = useCallback(() => {
    setName('')
    setIdentityLabel('')
    setMiniDesc('')
    setPlusDesc('')
    setEliteDesc('')
    setIntention('')
    setFrequency('daily')
    setInterval(1)
    setCustomDays([])
    setPriority('medium')
    setCategoryId(null)
  }, [])

  const toggleCustomDay = useCallback((day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }, [])

  const getSubmitData = useCallback(() => {
    return {
      name: name.trim(),
      identityLabel: identityLabel.trim() || null,
      miniDesc: miniDesc.trim() || null,
      plusDesc: plusDesc.trim() || null,
      eliteDesc: eliteDesc.trim() || null,
      intention: intention.trim() || null,
      frequency,
      interval,
      daysOfWeek: frequency === 'weekly' || frequency === 'custom' || frequency === 'monthly' ? (customDays.length > 0 ? customDays : null) : null,
      priority,
      categoryId,
    }
  }, [
    name,
    identityLabel,
    miniDesc,
    plusDesc,
    eliteDesc,
    intention,
    frequency,
    interval,
    customDays,
    priority,
    categoryId,
  ])

  return {
    state: {
      name,
      identityLabel,
      miniDesc,
      plusDesc,
      eliteDesc,
      intention,
      frequency,
      interval,
      customDays,
      priority,
      categoryId,
    },
    actions: {
      setName,
      setIdentityLabel,
      setMiniDesc,
      setPlusDesc,
      setEliteDesc,
      setIntention,
      setFrequency,
      setInterval,
      setCustomDays,
      setPriority,
      setCategoryId,
      resetForm,
      toggleCustomDay,
    },
    getSubmitData,
  }
}
