import { useState, useCallback } from 'react'
import type { HabitFrequency, HabitPriority, HabitCategory } from '#/types'

interface HabitFormData {
  name: string
  identityLabel: string
  miniDesc: string
  plusDesc: string
  eliteDesc: string
  intention: string
  frequency: HabitFrequency
  customDays: string[]
  priority: HabitPriority
  category: HabitCategory
}

export function useHabitForm(initialData?: Partial<HabitFormData>) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [identityLabel, setIdentityLabel] = useState(initialData?.identityLabel ?? '')
  const [miniDesc, setMiniDesc] = useState(initialData?.miniDesc ?? '')
  const [plusDesc, setPlusDesc] = useState(initialData?.plusDesc ?? '')
  const [eliteDesc, setEliteDesc] = useState(initialData?.eliteDesc ?? '')
  const [intention, setIntention] = useState(initialData?.intention ?? '')
  const [frequency, setFrequency] = useState<HabitFrequency>(initialData?.frequency ?? 'every_day')
  const [customDays, setCustomDays] = useState<string[]>(initialData?.customDays ?? [])
  const [priority, setPriority] = useState<HabitPriority>(initialData?.priority ?? 'medium')
  const [category, setCategory] = useState<HabitCategory>(initialData?.category ?? 'growth')

  const resetForm = useCallback(() => {
    setName('')
    setIdentityLabel('')
    setMiniDesc('')
    setPlusDesc('')
    setEliteDesc('')
    setIntention('')
    setFrequency('every_day')
    setCustomDays([])
    setPriority('medium')
    setCategory('growth')
  }, [])

  const toggleCustomDay = useCallback((day: string) => {
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
      daysOfWeek: frequency === 'custom' ? customDays.join(',') : null,
      priority,
      category,
    }
  }, [
    name,
    identityLabel,
    miniDesc,
    plusDesc,
    eliteDesc,
    intention,
    frequency,
    customDays,
    priority,
    category,
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
      customDays,
      priority,
      category,
    },
    actions: {
      setName,
      setIdentityLabel,
      setMiniDesc,
      setPlusDesc,
      setEliteDesc,
      setIntention,
      setFrequency,
      setCustomDays,
      setPriority,
      setCategory,
      resetForm,
      toggleCustomDay,
    },
    getSubmitData,
  }
}
