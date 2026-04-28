export const dynamic = 'force-dynamic'

import LegalPageEditor from '@/components/admin/LegalPageEditor'

export default function DisclaimerContentPage() {
  return (
    <LegalPageEditor
      pageSlug="disclaimer"
      pageTitle="Disclaimer"
      previewUrl="/disclaimer"
    />
  )
}
