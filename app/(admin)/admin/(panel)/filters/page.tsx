export const dynamic = 'force-dynamic'

import FilterEditor from './FilterEditor'

const CATEGORIES = [
  {
    value: 'region',
    label: 'Regions',
    hint: "These regions appear in the Region filter on the homepage and the Feature Matrix filter. They also appear as options when editing a tool's supported regions. Deactivating a region hides it from all filters immediately but does not remove it from tools that already have it selected. Hard-deleting a region also removes it from every tool.",
    labelExample: 'Japan',
    valueExample: 'JP',
  },
  {
    value: 'price_range',
    label: 'Price Range',
    hint: 'Price range options are used programmatically to filter tools on the homepage by their starting price. They are never shown as labels on tool cards — only used to determine which tools appear when a visitor selects a price range. The threshold value in the metadata field is compared against each tool\'s computed starting price. Adding a new range (e.g. Under $1000/year) will automatically work in the homepage filter without any code changes.',
    labelExample: 'Under $50/year',
    valueExample: 'under_50',
  },
  {
    value: 'trading_volume',
    label: 'Trading Volume',
    hint: 'These options appear in the Trading Volume filter on the homepage. Tools must have matching values in their Trading Volume field to appear in filtered results. Hard-deleting removes the value from all tools.',
    labelExample: 'High Volume Trader',
    valueExample: 'high',
  },
  {
    value: 'user_type',
    label: 'User Types',
    hint: 'These options appear in the User Type filter on the homepage. Tools must have matching values in their User Type field to appear in filtered results. Hard-deleting removes the value from all tools.',
    labelExample: 'Beginner',
    valueExample: 'beginner',
  },
  {
    value: 'required_features',
    label: 'Required Features',
    hint: 'These features appear in the Required Features filter on the homepage and as rows in the Feature Comparison Matrix. Adding a feature here makes it available to select when editing any tool. Deactivating hides it from filters but keeps it on tools. Hard-deleting removes it from all tools.',
    labelExample: 'DeFi Support',
    valueExample: 'defi_support',
  },
  {
    value: 'supported_exchanges',
    label: 'Exchanges',
    hint: "The full list of exchanges available when editing a tool's Supported Exchanges. Displayed on tool detail pages. Hard-deleting removes the exchange from all tools.",
    labelExample: 'Coinbase',
    valueExample: 'coinbase',
  },
  {
    value: 'supported_wallets',
    label: 'Wallets',
    hint: "The full list of wallets available when editing a tool's Supported Wallets. Displayed on tool detail pages. Hard-deleting removes the wallet from all tools.",
    labelExample: 'MetaMask',
    valueExample: 'metamask',
  },
  {
    value: 'tax_report_types',
    label: 'Tax Report Types',
    hint: 'The full list of tax report types available when editing a tool. Displayed on tool detail pages. Hard-deleting removes the report type from all tools.',
    labelExample: 'IRS Form 8949',
    valueExample: 'irs_8949',
  },
]

export default function FiltersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Filter Options</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage all filter options that appear on the public homepage and tool detail pages.
          Changes take effect immediately — no deployment needed.
        </p>
      </div>
      <FilterEditor categories={CATEGORIES} />
    </div>
  )
}
