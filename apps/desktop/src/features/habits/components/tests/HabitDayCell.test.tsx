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

  it('opens the tier picker when clicked (not completed)', () => {
    // Clicking a non-completed cell should open the tier picker, NOT immediately call onToggle
    wrap(<HabitDayCell {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    // Tier picker portal renders "How did it go?" label
    expect(screen.getByText('How did it go?')).toBeInTheDocument()
  })

  it('calls onToggle with tier after selecting from picker', () => {
    const onToggle = vi.fn()
    wrap(<HabitDayCell {...defaultProps} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    // Click the "Target" tier option
    fireEvent.click(screen.getByText('Target'))
    expect(onToggle).toHaveBeenCalledWith('2024-01-01', 'plus')
  })

  it('applies completed styles for plus tier', () => {
    wrap(<HabitDayCell {...defaultProps} isCompleted={true} tier="plus" />)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('applies sky styles for mini tier', () => {
    wrap(<HabitDayCell {...defaultProps} isCompleted={true} tier="mini" />)
    // Mini tier uses sky-500 class
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-sky')
  })

  it('shows the today indicator', () => {
    wrap(<HabitDayCell {...defaultProps} isToday={true} />)
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
