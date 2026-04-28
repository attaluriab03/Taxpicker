export const dynamic = 'force-dynamic'

import LegalPageEditor from '@/components/admin/LegalPageEditor'

export default function AffiliateDisclosureContentPage() {
  return (
    <LegalPageEditor
      pageSlug="affiliate-disclosure"
      pageTitle="Affiliate Disclosure"
      previewUrl="/affiliate-disclosure"
    />
  )
}
