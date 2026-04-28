export const dynamic = 'force-dynamic'

import LegalPageEditor from '@/components/admin/LegalPageEditor'

export default function TermsContentPage() {
  return (
    <LegalPageEditor
      pageSlug="terms"
      pageTitle="Terms of Service"
      previewUrl="/terms"
    />
  )
}
