export const dynamic = 'force-dynamic'

import ContentPageHeader from '@/components/admin/ContentPageHeader'
import ContentEditor, { type ContentSection } from '@/components/admin/ContentEditor'

const sections: ContentSection[] = [
  {
    title: 'Hero',
    description: 'The page title and introductory paragraph at the top of the About page.',
    fields: [
      { section: 'hero', key: 'page_title', label: 'Page Title', type: 'text' },
      { section: 'hero', key: 'page_description', label: 'Page Description', type: 'textarea' },
    ],
  },
  {
    title: 'Why Taxpicker Exists',
    description: 'Section heading and subtitle above the three problem cards.',
    fields: [
      { section: 'why', key: 'section_title', label: 'Section Title', type: 'text' },
      { section: 'why', key: 'section_description', label: 'Section Subtitle', type: 'text' },
    ],
  },
  {
    title: 'Our Methodology',
    description: 'Section heading and subtitle above the four methodology cards.',
    fields: [
      { section: 'methodology', key: 'section_title', label: 'Section Title', type: 'text' },
      { section: 'methodology', key: 'section_description', label: 'Section Subtitle', type: 'text' },
    ],
  },
  {
    title: 'Affiliate Disclosure Box',
    description: 'Heading of the amber disclosure callout box. The body text of this box is hardcoded.',
    fields: [
      { section: 'affiliate', key: 'section_title', label: 'Box Heading', type: 'text' },
    ],
  },
  {
    title: 'CTA Section',
    description: 'The dark call-to-action banner at the bottom of the page.',
    fields: [
      { section: 'cta', key: 'section_title', label: 'CTA Heading', type: 'text' },
      { section: 'cta', key: 'description', label: 'CTA Description', type: 'textarea' },
      { section: 'cta', key: 'button_text', label: 'Button Text', type: 'text' },
    ],
  },
]

export default function AboutContentPage() {
  return (
    <div className="p-6">
      <ContentPageHeader
        title="About Page Content"
        description="Edit the about page text and sections."
        previewUrl="/about"
      />
      <ContentEditor page="about" sections={sections} />
    </div>
  )
}
