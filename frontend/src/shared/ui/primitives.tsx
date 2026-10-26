import * as Alert from '@radix-ui/react-alert-dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx, type ClassValue } from 'clsx'
import { AlertCircle, LoaderCircle, Sprout, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import {
  useRef,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type PropsWithChildren,
} from 'react'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
const buttonVariants = cva('button', {
  variants: {
    variant: {
      primary: 'button-primary',
      secondary: 'button-secondary',
      ghost: 'button-ghost',
      danger: 'button-danger',
    },
  },
  defaultVariants: { variant: 'primary' },
})
export function Button({
  className,
  variant,
  asChild,
  busy,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; busy?: boolean }) {
  if (asChild)
    return (
      <Slot className={cn(buttonVariants({ variant }), className)} {...props}>
        {children}
      </Slot>
    )
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      disabled={disabled || busy}
      {...props}
    >
      {busy && <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />}
      {children}
    </button>
  )
}
export function Card({ className, ...props }: ComponentProps<'section'>) {
  return <section data-slot="card" className={cn('card', className)} {...props} />
}
export function Page({ children, className }: PropsWithChildren<{ className?: string }>) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={cn('page', className)}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.div>
  )
}
export function Progress({
  value,
  label,
  category = 'save',
}: {
  value: number
  label: string
  category?: string
}) {
  const reduced = useReducedMotion()
  return (
    <ProgressPrimitive.Root className={`progress ${category}`} value={value} aria-label={label}>
      <ProgressPrimitive.Indicator asChild>
        <motion.div
          className="progress-fill"
          initial={false}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: reduced ? 0 : 0.45 }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: PropsWithChildren<{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
}>) {
  const returnFocus = useRef<HTMLElement | null>(null)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content
          className="dialog-content"
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement as HTMLElement
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (returnFocus.current?.isConnected) returnFocus.current.focus()
          }}
        >
          <div className="dialog-heading">
            <div>
              <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
              <DialogPrimitive.Description>{description}</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="icon-button" aria-label="Закрыть">
              <X size={22} />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
export function Confirm({
  trigger,
  title,
  description,
  onConfirm,
  busy,
}: {
  trigger: React.ReactNode
  title: string
  description: string
  onConfirm: () => void
  busy: boolean
}) {
  return (
    <Alert.Root>
      <Alert.Trigger asChild>{trigger}</Alert.Trigger>
      <Alert.Portal>
        <Alert.Overlay className="dialog-overlay" />
        <Alert.Content className="dialog-content confirm-dialog">
          <Alert.Title>{title}</Alert.Title>
          <Alert.Description>{description}</Alert.Description>
          <div className="button-row">
            <Alert.Cancel asChild>
              <Button variant="secondary">Отмена</Button>
            </Alert.Cancel>
            <Alert.Action asChild>
              <Button variant="danger" busy={busy} onClick={onConfirm}>
                Да, сбросить
              </Button>
            </Alert.Action>
          </div>
        </Alert.Content>
      </Alert.Portal>
    </Alert.Root>
  )
}
export function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="field-error" role="alert">
      {message}
    </p>
  ) : null
}
export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="empty-state" role="alert">
      <AlertCircle size={40} />
      <h2>Копилка пока не отвечает</h2>
      <p>{message}</p>
      <Button onClick={retry}>Повторить</Button>
    </div>
  )
}
export function EmptyState({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <div className="empty-state">
      <Sprout size={44} strokeWidth={1.5} />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  )
}
export function Loading() {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="animate-spin" size={32} />
      <p>Открываем копилку…</p>
    </div>
  )
}
