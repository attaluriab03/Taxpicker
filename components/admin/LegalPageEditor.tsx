import ContentPageHeader from '@/components/admin/ContentPageHeader'
import ContentEditor, { type ContentSection } from '@/components/admin/ContentEditor'

interface Props {
  pageSlug: string
  pageTitle: string
  previewUrl: string
}

export default function LegalPageEditor({ pageSlug, pageTitle, previewUrl }: Props) {
  const sections: ContentSection[] = [
    {
      title: pageTitle,
      fields: [
        {
          section: 'page',
          key: 'page_title',
          label: 'Page Title',
          type: 'text',
        },
        {
          section: 'page',
          key: 'last_updated',
          label: 'Last Updated',
          hint: 'e.g. January 15, 2025',
          type: 'text',
        },
        {
          section: 'page',
          key: 'content',
          label: 'Full Page Content',
          hint: 'Supports markdown. Use # for headings, ** for bold, - for bullet lists.',
          type: 'richtext',
        },
      ],
    },
  ]

  return (
    <div className="p-6">
      <ContentPageHeader
        title={`${pageTitle} Content`}
        description={`Edit the ${pageTitle.toLowerCase()} page title, last updated date, and full content.`}
        previewUrl={previewUrl}
      />
      <ContentEditor page={pageSlug} sections={sections} />

      {/* Markdown reference card */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Markdown Reference</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
          {[
            { syntax: '# Heading 1', desc: 'Large heading' },
            { syntax: '## Heading 2', desc: 'Medium heading' },
            { syntax: '**bold text**', desc: 'Bold text' },
            { syntax: '*italic text*', desc: 'Italic text' },
            { syntax: '- bullet point', desc: 'Unordered list item' },
            { syntax: '1. numbered item', desc: 'Ordered list item' },
            { syntax: '[link text](url)', desc: 'Hyperlink' },
            { syntax: '> blockquote', desc: 'Highlighted callout' },
            { syntax: '| col | col |', desc: 'Table row' },
          ].map(({ syntax, desc }) => (
            <div key={syntax} className="flex items-baseline gap-2">
              <code className="text-xs font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded shrink-0">{syntax}</code>
              <span className="text-xs text-slate-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
