export const dynamic = 'force-dynamic'

import ContentPageHeader from '@/components/admin/ContentPageHeader'
import ContentEditor, { type ContentSection } from '@/components/admin/ContentEditor'

const sections: ContentSection[] = [
  {
    title: 'Hero Section',
    description: 'The main headline and call-to-action at the top of the homepage.',
    fields: [
      { section: 'hero', key: 'trusted_badge_text', label: 'Trusted Badge Text', type: 'text' },
      { section: 'hero', key: 'title_line_1', label: 'Title Line 1', type: 'text' },
      { section: 'hero', key: 'title_line_2', label: 'Title Line 2', type: 'text' },
      {
        section: 'hero', key: 'description', label: 'Hero Description',
        hint: 'Shown below the headline.',
        type: 'textarea',
      },
    ],
  },
  {
    title: 'Metrics Bar',
    description: 'Four statistics displayed below the hero.',
    fields: [
      { section: 'metrics', key: 'metric_1_value', label: 'Metric 1 Number', type: 'text' },
      { section: 'metrics', key: 'metric_1_label', label: 'Metric 1 Label', type: 'text' },
      { section: 'metrics', key: 'metric_2_value', label: 'Metric 2 Number', type: 'text' },
      { section: 'metrics', key: 'metric_2_label', label: 'Metric 2 Label', type: 'text' },
      { section: 'metrics', key: 'metric_3_value', label: 'Metric 3 Number', type: 'text' },
      { section: 'metrics', key: 'metric_3_label', label: 'Metric 3 Label', type: 'text' },
      { section: 'metrics', key: 'metric_4_value', label: 'Metric 4 Number', type: 'text' },
      { section: 'metrics', key: 'metric_4_label', label: 'Metric 4 Label', type: 'text' },
    ],
  },
  {
    title: 'Comparison Table',
    description: 'Heading for the tool comparison/filter section.',
    fields: [
      { section: 'comparison_table', key: 'section_title', label: 'Section Title', type: 'text' },
      {
        section: 'comparison_table', key: 'section_description', label: 'Section Description',
        hint: 'Optional subtitle shown below the section title.',
        type: 'textarea',
      },
    ],
  },
  {
    title: 'Feature Matrix',
    description: 'Heading for the feature comparison matrix section.',
    fields: [
      { section: 'feature_matrix', key: 'section_title', label: 'Section Title', type: 'text' },
      { section: 'feature_matrix', key: 'section_description', label: 'Section Description', type: 'text' },
    ],
  },
]

export default function HomepageContentPage() {
  return (
    <div className="p-6">
      <ContentPageHeader
        title="Homepage Content"
        description="Edit the homepage hero, metrics, and section titles."
        previewUrl="/"
      />
      <ContentEditor page="homepage" sections={sections} />
    </div>
  )
}
