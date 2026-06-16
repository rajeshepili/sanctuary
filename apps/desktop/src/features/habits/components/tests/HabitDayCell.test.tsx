import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HabitDayCell } from '../HabitDayCell'
import { TooltipProvider } from '#/components/ui/tooltip'

describe('HabitDayCell', () => {
  const defaultProps = {
    dayStr: '2024-01-01',
    isCompleted: false,
    isToday: false,
    activeOnDate: true,
    dateLabel: 'Jan 1',
    dayNumber: 1,
    onToggle: vi.fn(),
  }

  const wrap = (ui: React.ReactNode) =>
    render(<TooltipProvider>{ui}</TooltipProvider>)

  it('renders the day number', () => {
    wrap(<HabitDayCell {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', () => {
    wrap(<HabitDayCell {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(defaultProps.onToggle).toHaveBeenCalledWith('2024-01-01')
  })

  it('applies completed styles', () => {
    wrap(<HabitDayCell {...defaultProps} isCompleted={true} tier="plus" />)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('shows the today indicator', () => {
    wrap(<HabitDayCell {...defaultProps} isToday={true} />)
    // today cell gets a ring, not an aria-label indicator — verify button exists with today label
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Today'),
    )
  })

  it('renders off-day cell without a button', () => {
    wrap(<HabitDayCell {...defaultProps} activeOnDate={false} />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

