'use client'

import { AlertTriangle, Info, Loader2, Trash2, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  loading?: boolean
}

const variantConfig = {
  danger: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    Icon: Trash2,
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white border-0',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon: AlertTriangle,
    confirmClass: 'bg-amber-600 hover:bg-amber-700 text-white border-0',
  },
  default: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    Icon: Info,
    confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white border-0',
  },
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const { iconBg, iconColor, Icon, confirmClass } = variantConfig[variant]

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (loading) return
        onOpenChange(next)
      }}
    >
      <AlertDialogContent className="bg-white rounded-xl shadow-xl max-w-md p-6 border-0">
        <button
          onClick={() => !loading && onOpenChange(false)}
          disabled={loading}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 disabled:opacity-40 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
              <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
            </div>
            <AlertDialogTitle className="font-semibold text-slate-900 text-base leading-snug">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed mt-1 pl-12">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-5 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={confirmClass}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
