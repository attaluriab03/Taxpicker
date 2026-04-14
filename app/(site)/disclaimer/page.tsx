import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Taxpicker liability disclaimer — all content is informational only, not financial advice.',
  robots: { index: false, follow: false },
}

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-10">
        <p className="text-sm text-red-800 font-semibold">
          This content is for informational purposes only and does not constitute financial, tax, or legal advice. Always conduct your own research and consult a qualified professional before making any decisions.
        </p>
      </div>

      <div className="space-y-8 text-slate-700 text-sm leading-7">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">No Financial or Legal Advice</h2>
          <p>Taxpicker is an informational platform only. Nothing on this website constitutes financial, investment, tax, or legal advice. The content is provided for general informational purposes and should not be relied upon as a substitute for professional advice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">No Responsibility for Decisions</h2>
          <p>Taxpicker and its operators bear no responsibility for any decisions made based on information found on this platform. You acknowledge that your use of any crypto tax tool, and any financial decisions you make as a result, are entirely at your own risk.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Accuracy of Tool Information</h2>
          <p>While we make reasonable efforts to ensure the accuracy of tool listings, pricing, and feature information, we cannot guarantee that all information is current or correct. Crypto tax software pricing, features, and capabilities change frequently. Always verify details directly with the tool provider before purchasing.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Third-Party Content</h2>
          <p>This platform contains links to third-party websites and tools. We have no control over the content, privacy practices, or reliability of those third-party services and accept no liability for them.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, Taxpicker, its operators, employees, and contributors shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Your use of or reliance on information on this platform</li>
            <li>Errors or omissions in tool listings</li>
            <li>Any actions taken based on content published here</li>
            <li>Tax penalties, fines, or compliance issues resulting from tool use</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Professional Advice</h2>
          <p>We strongly recommend consulting a qualified tax professional or accountant for advice specific to your situation. Crypto tax laws vary significantly by country and change frequently.</p>
        </section>
      </div>
    </div>
  )
}
