export const dynamic = 'force-dynamic'

import ContentPageHeader from '@/components/admin/ContentPageHeader'
import ContentEditor, { type ContentSection } from '@/components/admin/ContentEditor'
import FaqItemsManager from '@/components/admin/FaqItemsManager'

const headerSections: ContentSection[] = [
  {
    title: 'Page Header',
    description: 'Title and description shown at the top of the FAQ page.',
    fields: [
      { section: 'hero', key: 'page_title', label: 'Page Title', type: 'text' },
      { section: 'hero', key: 'page_description', label: 'Page Description', type: 'textarea' },
    ],
  },
]

export default function FaqContentPage() {
  return (
    <div className="p-6">
      <ContentPageHeader
        title="FAQ Content"
        description="Edit the FAQ page header and manage individual FAQ items."
        previewUrl="/faq"
      />
      <ContentEditor page="faq" sections={headerSections} />
      <FaqItemsManager />
    </div>
  )
}
