'use client'

import { toast } from 'sonner'

export const useToast = () => {
  const success = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    })
  }

  const error = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    })
  }

  const info = (message: string) => {
    toast.info(message, {
      duration: 3000,
      position: 'top-right',
    })
  }

  const warning = (message: string) => {
    toast.warning(message, {
      duration: 4000,
      position: 'top-right',
    })
  }

  const loading = (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    })
  }

  const dismiss = (toastId: string | number) => {
    toast.dismiss(toastId)
  }

  return { success, error, info, warning, loading, dismiss }
}
