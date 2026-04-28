export const dynamic = 'force-dynamic'

import LegalPageEditor from '@/components/admin/LegalPageEditor'

export default function PrivacyPolicyContentPage() {
  return (
    <LegalPageEditor
      pageSlug="privacy-policy"
      pageTitle="Privacy Policy"
      previewUrl="/privacy-policy"
    />
  )
}
