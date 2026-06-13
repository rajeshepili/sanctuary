import { forwardRef } from 'react'
import { cn } from '#/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { Slot } from 'radix-ui'

import { cva } from 'class-variance-authority'

type IconButtonVariant = 'default' | 'danger' | 'ghost'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text shown in the hover tooltip. */
  tooltip: string
  /** Applies the active / pressed color scheme when true. */
  active?: boolean
  /**
   * - `default` — muted → foreground on hover (covers most actions)
   * - `danger`  — muted → red on hover (destructive actions)
   * - `ghost`   — muted → foreground, lighter hover background
   */
  variant?: IconButtonVariant
  /** Render as a different element using Radix Slot */
  asChild?: boolean
}

const iconButtonVariants = cva(
  'flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'text-muted-foreground hover:text-foreground hover:bg-foreground/10',
        danger:
          'text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10',
        ghost:
          'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
      },
      active: {
        true: 'text-primary bg-primary/10',
        false:
          'text-muted-foreground hover:text-foreground hover:bg-foreground/10',
      },
    },
    defaultVariants: {
      variant: 'default',
      active: false,
    },
  },
)

/**
 * A compact icon-only button with a built-in Tooltip.
 *
 * Eliminates the repeated `<Tooltip><TooltipTrigger asChild><button>` boilerplate
 * across the codebase. Pass `className` to override coloring for special cases.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      tooltip,
      active = false,
      variant = 'default',
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : 'button'
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            ref={ref}
            type={asChild ? undefined : 'button'}
            className={cn(iconButtonVariants({ variant, active, className }))}
            {...props}
          >
            {children}
          </Comp>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  },
)

IconButton.displayName = 'IconButton'
