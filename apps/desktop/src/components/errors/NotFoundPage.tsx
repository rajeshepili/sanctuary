import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Compass, Home } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'

export function NotFoundPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_22%)]" />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-12 sm:px-6">
        <Card className="w-full max-w-2xl border-border/60 bg-card/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl sm:p-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            404
          </p>

          <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
            You’ve wandered off the path.
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This page isn’t part of your sanctuary yet.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="h-4 w-4" />
                Return home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <BookOpen className="h-4 w-4" />
                Open journal
              </Link>
            </Button>
          </div>

          <div className="mt-8 rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              If you’re looking for a specific entry or section, try going back
              to the sanctuary home and searching from there.
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
