import { KeyRound } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Field, FieldLabel, FieldError } from '#/components/ui/field'

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onClose: () => void
  onSubmit: (passphrase: string) => void
}

export function PassphraseModal({
  open,
  title,
  description,
  confirmLabel = 'Continue',
  onClose,
  onSubmit,
}: Props) {
  const form = useForm({
    defaultValues: { passphrase: '' },
    onSubmit: ({ value }) => {
      if (!value.passphrase.trim()) return
      onSubmit(value.passphrase)
      form.reset()
    },
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent elevated className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4 pt-2"
        >
          <form.Field
            name="passphrase"
            validators={{
              onSubmit: ({ value }) =>
                !value.trim() ? 'Passphrase is required' : undefined,
            }}
            children={(field) => (
              <Field>
                <FieldLabel htmlFor="sync-passphrase">Passphrase</FieldLabel>
                <Input
                  id="sync-passphrase"
                  type="password"
                  autoComplete="off"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your passphrase"
                  autoFocus
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError
                  errors={field.state.meta.errors.map((e) => ({
                    message: String(e),
                  }))}
                />
              </Field>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => state.values.passphrase}
              children={(passphrase) => (
                <Button type="submit" disabled={!passphrase.trim()}>
                  {confirmLabel}
                </Button>
              )}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
