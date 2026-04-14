import { ShieldAlert } from 'lucide-react'

export default function DisclaimerCallout() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex gap-3">
      <ShieldAlert className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-slate-600 leading-6">
        <strong className="font-medium text-slate-700">Informational purposes only. </strong>
        This content does not constitute financial or legal advice. Always conduct your own research before choosing a crypto tax tool or making any financial decisions.
      </p>
    </div>
  )
}
