export const dynamic = 'force-dynamic'

import LegalPageEditor from '@/components/admin/LegalPageEditor'

export default function CookiePolicyContentPage() {
  return (
    <LegalPageEditor
      pageSlug="cookie-policy"
      pageTitle="Cookie Policy"
      previewUrl="/cookie-policy"
    />
  )
}
