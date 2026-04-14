'use client'

import { Button } from '@/components/ui/button'
import { Cookie } from 'lucide-react'

export default function CookieSettingsButton() {
  const openSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cookie_consent')
      window.dispatchEvent(new Event('show-cookie-banner'))
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={openSettings}
      className="gap-2"
    >
      <Cookie className="h-4 w-4" />
      Manage Cookie Settings
    </Button>
  )
}
