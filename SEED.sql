-- ============================================================
-- Taxpicker — Seed Data
-- Run AFTER SCHEMA.sql in the Supabase SQL editor.
-- Adds best_for column, 10 tools, 5 articles, 30 reviews.
-- ============================================================

-- Add best_for column if it doesn't exist
ALTER TABLE tools ADD COLUMN IF NOT EXISTS best_for TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE tools ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

-- ============================================================
-- TOOLS (10 real crypto tax platforms)
-- ============================================================

INSERT INTO tools (
  name, slug, description, logo_url, website_url,
  pricing_type, price_from, pricing_details,
  features, supported_countries, supported_exchanges, supported_wallets,
  tax_report_types, pros, cons, best_for, affiliate_url,
  rating, is_published, is_featured, is_recommended, review_count,
  last_verified_at, last_verified_by
) VALUES

-- 1. Koinly (is_recommended)
(
  'Koinly',
  'koinly',
  'The most popular crypto tax software, trusted by 800,000+ investors. Supports 700+ exchanges and blockchains, automatically imports transactions, and generates IRS, HMRC, ATO, and 20+ other tax reports.',
  NULL,
  'https://koinly.io',
  'freemium',
  49,
  'Free plan (up to 10k transactions, no tax reports). Newbie $49/yr (100 txns), Hodler $99/yr (1,000 txns), Trader $179/yr (3,000 txns), Pro $279/yr (unlimited).',
  '["DeFi Transaction Tracking","NFT Tax Reporting","Tax-Loss Harvesting","Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Margin Trading Support","Staking / Income Tracking","API Integrations","TurboTax Integration","Mobile App"]',
  ARRAY['US','GB','CA','AU','DE','FR','SE','NO','DK','FI','IE','NL','AT','CH','SG','NZ'],
  ARRAY['Coinbase','Binance','Kraken','Gemini','FTX','KuCoin','Crypto.com','Bitfinex','Huobi','OKX','ByBit','Gate.io','Bitstamp','Bittrex'],
  ARRAY['MetaMask','Ledger','Trezor','Exodus','Trust Wallet','Phantom','Coinbase Wallet'],
  ARRAY['IRS Form 8949','Schedule D','FBAR','HMRC Capital Gains','ATO CGT','CRA T5008','TurboTax CSV','TaxAct CSV'],
  ARRAY['Supports 700+ exchanges and wallets','Free plan available','Excellent DeFi and NFT tracking','Supports 20+ countries','TurboTax & H&R Block integration','Smart transfer matching'],
  ARRAY['Free plan doesn''t include tax reports','Can be slow with large transaction volumes','Some DeFi chains require manual CSV import'],
  ARRAY['High-volume traders','DeFi & NFT investors','International users'],
  'https://koinly.io',
  4.6,
  TRUE, TRUE, TRUE, 2847,
  NOW(), 'editorial'
),

-- 2. CoinTracker (is_recommended)
(
  'CoinTracker',
  'cointracker',
  'Official TurboTax partner and top-rated crypto tax software. Automatically syncs transactions from 500+ exchanges and wallets, tracks portfolio in real-time, and generates accurate tax reports.',
  NULL,
  'https://www.cointracker.io',
  'freemium',
  59,
  'Free plan (up to 25 transactions). Base $59/yr (100 txns), Plus $199/yr (1,000 txns), Pro $599/yr (unlimited). Tax advisory add-on available.',
  '["DeFi Transaction Tracking","NFT Tax Reporting","Tax-Loss Harvesting","Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Staking / Income Tracking","API Integrations","TurboTax Integration","Mobile App"]',
  ARRAY['US','GB','CA','AU','IN'],
  ARRAY['Coinbase','Binance','Kraken','Gemini','FTX','Bitfinex','Bitstamp','KuCoin','Binance US','BlockFi','Celsius'],
  ARRAY['MetaMask','Ledger','Trezor','Coinbase Wallet','Exodus','Trust Wallet'],
  ARRAY['IRS Form 8949','Schedule D','TurboTax Direct Import','H&R Block CSV','TaxAct CSV'],
  ARRAY['Official TurboTax partner','Best-in-class portfolio tracking','Real-time P&L tracking','Excellent mobile app','SOC 2 certified security'],
  ARRAY['More expensive than competitors','Limited DeFi chain support on lower tiers','No support for non-English-speaking countries'],
  ARRAY['US investors filing with TurboTax','Portfolio tracking focus','Security-conscious users'],
  'https://www.cointracker.io',
  4.5,
  TRUE, TRUE, TRUE, 1923,
  NOW(), 'editorial'
),

-- 3. TaxBit
(
  'TaxBit',
  'taxbit',
  'Enterprise-grade crypto tax automation used by leading exchanges and institutions. Offers compliant tax reporting for individual investors and businesses across the US and internationally.',
  NULL,
  'https://taxbit.com',
  'paid',
  50,
  'Individual plans from $50/yr. Enterprise pricing available. All plans include unlimited tax forms. Pricing tiers based on transaction volume.',
  '["DeFi Transaction Tracking","NFT Tax Reporting","Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Staking / Income Tracking","API Integrations","TurboTax Integration"]',
  ARRAY['US','GB','CA','AU','EU'],
  ARRAY['Coinbase','Gemini','Binance US','Kraken','FTX','BlockFi','Celsius','Ledn'],
  ARRAY['MetaMask','Ledger','Trezor'],
  ARRAY['IRS Form 8949','Schedule D','TurboTax Import','FBAR'],
  ARRAY['Unlimited tax forms on all plans','Enterprise-trusted platform','Excellent customer support','Used by major exchanges','IRS compliant reporting'],
  ARRAY['No free plan','Primarily focused on US market','Interface less intuitive than competitors'],
  ARRAY['US active traders','Business & enterprise users','Users needing unlimited forms'],
  'https://taxbit.com',
  4.2,
  TRUE, FALSE, FALSE, 743,
  NOW(), 'editorial'
),

-- 4. ZenLedger
(
  'ZenLedger',
  'zenledger',
  'Crypto tax software built for both individual investors and tax professionals. Offers CPA-friendly exports, DeFi tracking, and an optional full-service tax filing add-on.',
  NULL,
  'https://zenledger.io',
  'freemium',
  49,
  'Free plan (up to 25 transactions). Starter $49/yr (100 txns), Premium $149/yr (5,000 txns), Executive $399/yr (unlimited). CPA add-on available.',
  '["DeFi Transaction Tracking","NFT Tax Reporting","Tax-Loss Harvesting","Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Margin Trading Support","Staking / Income Tracking","API Integrations","TurboTax Integration"]',
  ARRAY['US','CA'],
  ARRAY['Coinbase','Binance','Kraken','Gemini','KuCoin','Bittrex','Poloniex','Huobi','OKX'],
  ARRAY['MetaMask','Ledger','Trezor','Exodus'],
  ARRAY['IRS Form 8949','Schedule D','FBAR','TurboTax CSV','TaxAct CSV'],
  ARRAY['CPA-friendly export formats','Good DeFi support','Tax-loss harvesting tool','Optional full-service tax filing','Priority support on premium plans'],
  ARRAY['Primarily US-focused','Free plan very limited','Higher-tier plans pricey'],
  ARRAY['US investors needing CPA exports','DeFi users','Tax-loss harvesting'],
  'https://zenledger.io',
  4.1,
  TRUE, FALSE, FALSE, 512,
  NOW(), 'editorial'
),

-- 5. Accointing (now Blockpit)
(
  'Blockpit',
  'blockpit',
  'European crypto tax leader, formerly Accointing. Provides fully automated tax reports compliant with German, Austrian, Swiss, and EU regulations. Ideal for European investors.',
  NULL,
  'https://blockpit.io',
  'freemium',
  49,
  'Free plan (up to 25 transactions). Lite €49/yr (50 txns), Basic €99/yr (1,000 txns), Advanced €199/yr (unlimited).',
  '["DeFi Transaction Tracking","NFT Tax Reporting","Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Staking / Income Tracking","API Integrations","Mobile App"]',
  ARRAY['DE','AT','CH','FR','NL','ES','IT','BE','PL','PT','EU'],
  ARRAY['Coinbase','Binance','Kraken','Bitpanda','Bybit','OKX','KuCoin','Gate.io','Huobi'],
  ARRAY['MetaMask','Ledger','Trezor','Exodus','Trust Wallet'],
  ARRAY['German Tax Report','Austrian Tax Report','Swiss Tax Report','DACH CGT Report','EU General Report'],
  ARRAY['Best EU compliance coverage','Free plan available','Supports German FIFO/LIFO methods','Excellent DeFi tracking','DACH tax law expertise'],
  ARRAY['Limited US support','English documentation sometimes lacking','Fewer exchange integrations than Koinly'],
  ARRAY['EU & DACH investors','German tax compliance','European DeFi users'],
  'https://blockpit.io',
  4.3,
  TRUE, FALSE, FALSE, 634,
  NOW(), 'editorial'
),

-- 6. TokenTax
(
  'TokenTax',
  'tokentax',
  'Full-service crypto tax platform combining software automation with optional CPA review. Handles complex scenarios including DeFi, NFTs, futures, and margin trading.',
  NULL,
  'https://tokentax.co',
  'paid',
  65,
  'Basic $65/yr (500 txns). Premium $199/yr (5,000 txns, DeFi included). VIP $2,499/yr (unlimited, CPA review, audit support).',
  '["DeFi Transaction Tracking","NFT Tax Reporting","Tax-Loss Harvesting","Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Margin Trading Support","Staking / Income Tracking","API Integrations","TurboTax Integration"]',
  ARRAY['US','GB','CA','AU','EU'],
  ARRAY['Coinbase','Binance','Kraken','Gemini','Bitfinex','FTX','KuCoin','Huobi','OKX','ByBit','dYdX','Uniswap'],
  ARRAY['MetaMask','Ledger','Trezor','Coinbase Wallet','Phantom'],
  ARRAY['IRS Form 8949','Schedule D','FBAR','TurboTax Import','HMRC Capital Gains'],
  ARRAY['Handles most complex crypto scenarios','CPA review option available','Excellent DeFi/NFT/futures support','Audit support on top tier','International filing support'],
  ARRAY['No free plan','Most expensive option','Overkill for casual investors'],
  ARRAY['High-volume active traders','Complex DeFi portfolios','US investors needing CPA review'],
  'https://tokentax.co',
  4.0,
  TRUE, FALSE, FALSE, 389,
  NOW(), 'editorial'
),

-- 7. CryptoTaxCalculator
(
  'CryptoTaxCalculator',
  'cryptotaxcalculator',
  'Powerful crypto tax platform particularly popular in Australia, UK, and Canada. Handles complex DeFi and NFT scenarios with rule-based categorization and supports 3,000+ integrations.',
  NULL,
  'https://cryptotaxcalculator.io',
  'freemium',
  49,
  'Free plan (review only, no reports). Rookie $49/yr (100 txns). Hobbyist $99/yr (1,000 txns). Investor $189/yr (unlimited). Trader $299/yr (unlimited + margin).',
  '["DeFi Transaction Tracking","NFT Tax Reporting","Tax-Loss Harvesting","Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Margin Trading Support","Staking / Income Tracking","API Integrations","Mobile App"]',
  ARRAY['AU','GB','CA','US','NZ','SG','DE','FR'],
  ARRAY['Coinbase','Binance','Kraken','ByBit','OKX','KuCoin','Bitfinex','Gate.io','Huobi','Crypto.com','Independent Reserve'],
  ARRAY['MetaMask','Ledger','Trezor','Trust Wallet','Exodus','Coinbase Wallet'],
  ARRAY['ATO CGT Report','HMRC Capital Gains','CRA T5008','IRS Form 8949','Schedule D'],
  ARRAY['Best ATO compliance for Australia','Strong UK and Canada support','3,000+ integrations','Excellent DeFi classification','Rule-based categorization'],
  ARRAY['Free plan doesn''t export reports','US features less comprehensive','Interface has learning curve'],
  ARRAY['Australian investors','UK & Canada crypto users','Complex DeFi portfolios'],
  'https://cryptotaxcalculator.io',
  4.4,
  TRUE, FALSE, FALSE, 856,
  NOW(), 'editorial'
),

-- 8. Recap
(
  'Recap',
  'recap',
  'UK-focused crypto tax software with HMRC-compliant reporting. Uses the correct share pooling and bed-and-breakfasting rules required by UK tax law. Designed specifically for UK crypto investors.',
  NULL,
  'https://recap.io',
  'freemium',
  99,
  'Free forever plan (portfolio tracking, no reports). Annual plans: Solo £99/yr (unlimited transactions, 1 tax year report). Pro £199/yr (unlimited years).',
  '["Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Staking / Income Tracking","API Integrations","NFT Tax Reporting","DeFi Transaction Tracking"]',
  ARRAY['GB'],
  ARRAY['Coinbase','Binance','Kraken','Gemini','Bitfinex','eToro','Revolut','Coinbase Pro','Bitstamp'],
  ARRAY['MetaMask','Ledger','Trezor','Exodus'],
  ARRAY['HMRC Capital Gains Report','SA100','SA108','Share Pooling Report'],
  ARRAY['Best HMRC compliance','Correct share pooling rules','Bed & breakfasting detection','Free portfolio tracking','Clean UK-focused interface'],
  ARRAY['UK only — no other countries','Limited exchange support vs Koinly','Expensive for casual investors'],
  ARRAY['UK crypto investors','HMRC compliance focus','Share pooling complexity'],
  'https://recap.io',
  4.2,
  TRUE, FALSE, FALSE, 287,
  NOW(), 'editorial'
),

-- 9. Coinpanda
(
  'Coinpanda',
  'coinpanda',
  'Global crypto tax solution supporting 65+ countries. Offers free portfolio tracking and tax-loss harvesting previews, with affordable paid plans for generating tax reports.',
  NULL,
  'https://coinpanda.io',
  'freemium',
  65,
  'Free forever (tracking only). Starter $65/yr (100 txns). Investor $99/yr (1,000 txns). Trader $189/yr (unlimited).',
  '["DeFi Transaction Tracking","NFT Tax Reporting","Tax-Loss Harvesting","Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Staking / Income Tracking","API Integrations","Mobile App"]',
  ARRAY['US','GB','CA','AU','DE','FR','NL','SE','NO','DK','FI','AT','CH','SG','NZ','IN','ZA','BR'],
  ARRAY['Coinbase','Binance','Kraken','KuCoin','Gate.io','Huobi','OKX','Bitfinex','ByBit','Crypto.com'],
  ARRAY['MetaMask','Ledger','Trezor','Trust Wallet','Exodus'],
  ARRAY['IRS Form 8949','HMRC Capital Gains','ATO CGT','Generic CSV Report','65+ country reports'],
  ARRAY['Supports 65+ countries','Free plan available','Good DeFi support','Affordable pricing','Tax-loss harvesting preview'],
  ARRAY['Report quality varies by country','Customer support response can be slow','Mobile app basic'],
  ARRAY['International investors','Budget-conscious users','Multi-country portfolios'],
  'https://coinpanda.io',
  3.9,
  TRUE, FALSE, FALSE, 421,
  NOW(), 'editorial'
),

-- 10. Divly
(
  'Divly',
  'divly',
  'Scandinavian crypto tax specialist with deep support for Sweden, Norway, Denmark, and Finland. Handles local tax rules like Swedish K4 forms and Norwegian RF-1159.',
  NULL,
  'https://divly.com',
  'freemium',
  39,
  'Free plan (preview only). Basic €39/yr (50 txns). Standard €79/yr (500 txns). Premium €149/yr (unlimited). Supports tax year split billing.',
  '["Portfolio Tracking","Automated Exchange Imports","Multi-year Reporting","Audit Report Generation","CPA Export Formats","Staking / Income Tracking","API Integrations","DeFi Transaction Tracking"]',
  ARRAY['SE','NO','DK','FI','DE','AT','NL','FR'],
  ARRAY['Coinbase','Binance','Kraken','Bitstamp','Bitpanda','Crypto.com','KuCoin','Gate.io'],
  ARRAY['MetaMask','Ledger','Trezor','Trust Wallet'],
  ARRAY['Swedish K4','Norwegian RF-1159','Danish Tax Report','Finnish Tax Report','Generic EU Report'],
  ARRAY['Best Nordic tax compliance','Swedish K4 automation','Free preview before purchase','Affordable pricing','Clean Scandinavian interface'],
  ARRAY['Limited to Nordic/EU countries','Fewer exchange integrations','Limited DeFi chain support'],
  ARRAY['Swedish investors','Nordic crypto users','Scandinavian tax compliance'],
  'https://divly.com',
  4.0,
  TRUE, FALSE, FALSE, 198,
  NOW(), 'editorial'
)

ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  pricing_type = EXCLUDED.pricing_type,
  price_from = EXCLUDED.price_from,
  pricing_details = EXCLUDED.pricing_details,
  features = EXCLUDED.features,
  supported_countries = EXCLUDED.supported_countries,
  supported_exchanges = EXCLUDED.supported_exchanges,
  supported_wallets = EXCLUDED.supported_wallets,
  tax_report_types = EXCLUDED.tax_report_types,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  best_for = EXCLUDED.best_for,
  rating = EXCLUDED.rating,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  is_recommended = EXCLUDED.is_recommended,
  review_count = EXCLUDED.review_count,
  updated_at = NOW();

-- ============================================================
-- ARTICLES (5 educational articles)
-- ============================================================

INSERT INTO articles (title, slug, content, author, published_at, tags, meta_description)
VALUES

(
  'How to File Crypto Taxes in 2025: The Complete Guide',
  'how-to-file-crypto-taxes-2025',
  '# How to File Crypto Taxes in 2025: The Complete Guide

Crypto taxes can be confusing — but they don''t have to be. This guide walks you through everything you need to know to file accurately and avoid penalties.

## Is Crypto Taxable?

Yes. In the United States, the IRS classifies cryptocurrency as property. This means every time you:

- Sell crypto for fiat (e.g., USD)
- Trade one crypto for another
- Use crypto to buy goods or services
- Receive crypto as payment, staking rewards, or mining income

...you have a taxable event.

## Capital Gains: Short-Term vs Long-Term

If you held the asset for **less than 12 months**, gains are taxed as ordinary income (10–37%).

If you held for **more than 12 months**, you qualify for long-term capital gains rates (0%, 15%, or 20% depending on income).

## What Tax Forms Do You Need?

- **Form 8949**: Report each individual sale or disposal
- **Schedule D**: Summarize your capital gains and losses
- **Schedule 1 / Schedule C**: Report crypto income (staking, mining, freelance payments)

## How Crypto Tax Software Helps

Instead of manually tracking thousands of transactions, tools like Koinly or CoinTracker:

1. Import all transactions automatically via API or CSV
2. Calculate your gains and losses using FIFO, LIFO, or HIFO
3. Generate ready-to-file Form 8949, Schedule D, and TurboTax imports

## Key Deadlines

- **April 15**: US federal tax deadline
- **October 15**: Extended deadline (if you file for extension)
- **January 31**: 1099-DA forms from brokers (new for 2025)

## Common Mistakes to Avoid

1. **Forgetting DeFi transactions**: Swaps, liquidity provision, and yield farming are all taxable
2. **Missing small transactions**: Every on-chain transaction counts
3. **Wrong cost basis method**: FIFO is the IRS default; switching methods requires planning
4. **Ignoring NFT sales**: NFT flips are taxed as capital gains

## Bottom Line

Start with good record-keeping, use reliable crypto tax software, and consider working with a crypto-savvy CPA for complex portfolios.
',
  'Editorial Team',
  NOW() - INTERVAL '5 days',
  ARRAY['taxes','guide','IRS','2025'],
  'Complete guide to filing crypto taxes in 2025. Learn which forms you need, how capital gains work, and how crypto tax software can save you hours.'
),

(
  'DeFi Taxes Explained: How to Handle Uniswap, Aave, and Compound',
  'defi-taxes-explained',
  '# DeFi Taxes Explained: How to Handle Uniswap, Aave, and Compound

DeFi (Decentralized Finance) has created a whole new category of crypto tax complexity. Here''s how to think about the most common DeFi activities.

## Token Swaps (Uniswap, Curve, etc.)

When you swap ETH for USDC on Uniswap, it''s a taxable event — you disposed of ETH and acquired USDC. You owe capital gains tax on the ETH''s appreciation since you acquired it.

**Example**: You bought 1 ETH at $1,000. You swap it for USDC when ETH is worth $3,000. You have a $2,000 capital gain.

## Liquidity Provision

Adding liquidity to a pool (e.g., ETH/USDC on Uniswap v2) is generally treated as a disposal of the deposited assets and acquisition of LP tokens.

When you remove liquidity, you dispose of the LP tokens and reacquire the underlying assets. Any price difference is a taxable gain or loss.

## Lending & Borrowing (Aave, Compound)

- **Supplying assets**: Depositing assets to earn interest is generally not immediately taxable. However, interest earned (in the form of aTokens or cTokens accruing) is taxable as ordinary income.
- **Borrowing**: Borrowing against collateral is NOT a taxable event (you haven''t sold anything).
- **Liquidations**: If your position gets liquidated, it''s treated as a sale — taxable event.

## Yield Farming Rewards

Rewards received from yield farming are taxable as ordinary income at the fair market value when received. When you later sell those reward tokens, you have a capital gain/loss based on cost basis (the FMV at receipt).

## Which Tools Handle DeFi Best?

- **Koinly**: Excellent multi-chain DeFi support (Ethereum, Polygon, BSC, Solana, etc.)
- **CoinTracker**: Good DeFi support on premium plans
- **ZenLedger**: Solid DeFi tracking with CPA export options

## Pro Tips

1. Keep records of every DeFi transaction — blockchain explorers like Etherscan are your friend
2. Use a tool that can pull transactions directly via wallet address
3. Consult a CPA familiar with DeFi for complex positions
',
  'Editorial Team',
  NOW() - INTERVAL '12 days',
  ARRAY['DeFi','taxes','Uniswap','Aave','guide'],
  'How to handle crypto taxes for DeFi activities including Uniswap swaps, Aave lending, Compound, and yield farming. Tax implications explained clearly.'
),

(
  'NFT Taxes: Everything You Need to Know for 2025',
  'nft-taxes-guide-2025',
  '# NFT Taxes: Everything You Need to Know for 2025

NFTs had explosive growth and left many investors confused about their tax obligations. Here''s a clear breakdown.

## Are NFT Sales Taxable?

Yes. Selling an NFT is treated as selling a capital asset, just like selling stock or cryptocurrency.

- **Short-term**: Held less than 12 months → ordinary income tax rates
- **Long-term**: Held more than 12 months → long-term capital gains rates (0%, 15%, or 20%)

## Buying an NFT with Crypto

This is a two-step taxable event:
1. **Disposing of the crypto** used to purchase (capital gain/loss on the crypto)
2. **Acquiring the NFT** at its purchase price (new cost basis)

## Minting NFTs

If you mint an NFT (create it), the minting costs (gas fees) are generally added to your cost basis. There''s no taxable event at the point of minting — only when you sell.

## NFT Royalties

If you''re an NFT creator receiving royalties, that income is taxable as ordinary income (or self-employment income if you''re in the business of creating NFTs).

## Collectibles Tax Rate Warning

The IRS may treat some NFTs as "collectibles," subjecting long-term gains to a 28% rate instead of the standard 0/15/20%. This remains an area of uncertainty — consult a CPA.

## Tools That Handle NFTs

- **Koinly**: Auto-imports OpenSea, Blur, Magic Eden transactions
- **CoinTracker**: Good OpenSea integration on premium plans
- **CryptoTaxCalculator**: Strong NFT support, particularly for multiple marketplaces

## Practical Tips

1. Keep records of every NFT purchase and sale (date, price in USD, gas fees)
2. Don''t forget gas fees — they''re often deductible as part of your cost basis or as a loss
3. Wash sale rules do NOT currently apply to crypto/NFTs (unlike stocks)
',
  'Editorial Team',
  NOW() - INTERVAL '20 days',
  ARRAY['NFT','taxes','guide','collectibles'],
  'Complete guide to NFT taxes in 2025. Learn how selling NFTs, minting, royalties, and buying NFTs with crypto are all taxed.'
),

(
  'Koinly vs CoinTracker: Which Is Better in 2025?',
  'koinly-vs-cointracker',
  '# Koinly vs CoinTracker: Which Is Better in 2025?

Koinly and CoinTracker are the two most popular crypto tax tools. Here''s an in-depth comparison to help you choose.

## Quick Summary

| Feature | Koinly | CoinTracker |
|---|---|---|
| Starting Price | $49/yr | $59/yr |
| Free Plan | Yes (no reports) | Yes (25 txns) |
| Exchange Integrations | 700+ | 500+ |
| Countries | 20+ | 5 main |
| TurboTax Integration | Yes | Yes (official partner) |
| DeFi Support | Excellent | Good (premium) |
| Mobile App | Yes | Yes |

## Koinly: Best For International Users

Koinly''s biggest strength is its international coverage — supporting 20+ countries including the US, UK, Canada, Australia, and most of Europe. If you''re outside the US, Koinly is almost always the better choice.

It also has broader exchange and wallet support (700+) and handles complex DeFi scenarios well at all price tiers.

**Best for**: International investors, DeFi users, high transaction volumes

## CoinTracker: Best for US TurboTax Users

CoinTracker is the official TurboTax partner, meaning its integration is seamless — you can import your tax data directly into TurboTax with one click. It also has excellent portfolio tracking and a polished mobile app.

However, it''s primarily US-focused and more expensive for equivalent features.

**Best for**: US investors, TurboTax users, portfolio tracking focus

## Pricing Comparison

Both have free plans that include portfolio tracking but require paid plans for tax reports:

- **Koinly** is cheaper at the entry level ($49 vs $59)
- **CoinTracker** Pro is significantly more expensive ($599 vs $279 for Koinly)
- Both offer unlimited transactions on top tiers

## Our Verdict

- **Choose Koinly** if you''re outside the US, or if you have complex DeFi activity
- **Choose CoinTracker** if you''re a US investor who files with TurboTax and values portfolio tracking

Both are excellent tools — you can''t go wrong with either.
',
  'Editorial Team',
  NOW() - INTERVAL '30 days',
  ARRAY['comparison','Koinly','CoinTracker','review'],
  'Koinly vs CoinTracker compared in 2025. Pricing, features, DeFi support, international coverage, and TurboTax integration compared side-by-side.'
),

(
  'Crypto Tax-Loss Harvesting: How to Reduce Your Tax Bill',
  'crypto-tax-loss-harvesting',
  '# Crypto Tax-Loss Harvesting: How to Reduce Your Tax Bill

Tax-loss harvesting is one of the most effective (and legal) strategies to reduce your crypto tax bill. Here''s how it works.

## What Is Tax-Loss Harvesting?

Tax-loss harvesting means selling assets that have declined in value to realize a capital loss. These losses can then offset your capital gains, reducing your overall tax liability.

**Example**: You made $10,000 in gains from selling Bitcoin. But you also hold Ethereum at a $4,000 unrealized loss. By selling the ETH to realize that loss, your net taxable gain drops to $6,000.

## The Wash Sale Rule (Does It Apply to Crypto?)

For stocks, the "wash sale rule" prevents you from repurchasing the same security within 30 days of selling it at a loss (which would disallow the loss).

**Crypto is currently exempt from the wash sale rule** under existing IRS guidance — meaning you can sell BTC at a loss and immediately rebuy it. This may change with future legislation, so check current rules.

## How Much Can You Deduct?

- Capital losses first offset capital gains dollar-for-dollar
- If losses exceed gains, you can deduct up to **$3,000** against ordinary income per year
- Remaining losses **carry forward** to future tax years (indefinitely)

## Best Practices

1. **Harvest before year-end**: You must realize the loss by December 31
2. **Track your cost basis carefully**: Know which lots you''re selling
3. **Consider HIFO**: Using Highest-In, First-Out cost basis method can maximize losses
4. **Don''t over-harvest**: If you have large carry-forwards, additional harvesting may not help much

## Tools With Tax-Loss Harvesting Features

- **Koinly**: Shows unrealized gains/losses and helps identify harvesting opportunities
- **CoinTracker**: Tax-loss harvesting dashboard on premium plans
- **ZenLedger**: Dedicated tax-loss harvesting tool

## Caveats

- Tax-loss harvesting is most valuable in high-income years
- Short-term losses offset short-term gains first (at higher rates) — generally more valuable
- State taxes vary — some states don''t recognize capital loss carryforwards the same way

Always consult a tax professional before making significant tax decisions.
',
  'Editorial Team',
  NOW() - INTERVAL '45 days',
  ARRAY['tax-loss-harvesting','strategy','tips'],
  'How crypto tax-loss harvesting works in 2025. Learn to offset capital gains, whether the wash sale rule applies, and which tools help automate the process.'
)

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  tags = EXCLUDED.tags,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();

-- ============================================================
-- REVIEWS (3 per tool = 30 total)
-- ============================================================

-- Helper: get tool IDs by slug for reviews
DO $$
DECLARE
  koinly_id UUID;
  cointracker_id UUID;
  taxbit_id UUID;
  zenledger_id UUID;
  blockpit_id UUID;
  tokentax_id UUID;
  ctc_id UUID;
  recap_id UUID;
  coinpanda_id UUID;
  divly_id UUID;
BEGIN
  SELECT id INTO koinly_id FROM tools WHERE slug = 'koinly';
  SELECT id INTO cointracker_id FROM tools WHERE slug = 'cointracker';
  SELECT id INTO taxbit_id FROM tools WHERE slug = 'taxbit';
  SELECT id INTO zenledger_id FROM tools WHERE slug = 'zenledger';
  SELECT id INTO blockpit_id FROM tools WHERE slug = 'blockpit';
  SELECT id INTO tokentax_id FROM tools WHERE slug = 'tokentax';
  SELECT id INTO ctc_id FROM tools WHERE slug = 'cryptotaxcalculator';
  SELECT id INTO recap_id FROM tools WHERE slug = 'recap';
  SELECT id INTO coinpanda_id FROM tools WHERE slug = 'coinpanda';
  SELECT id INTO divly_id FROM tools WHERE slug = 'divly';

  -- Koinly reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (koinly_id, 5, 'Koinly saved me 8 hours of work. Imported all my transactions from 6 exchanges automatically and the tax report was ready in minutes. Worth every penny.', 'Alex M.'),
    (koinly_id, 4, 'Great tool overall. DeFi support is solid — handled all my Uniswap swaps correctly. Knocked off a star because the free plan doesn''t include reports.', 'Sarah K.'),
    (koinly_id, 5, 'I''ve been using Koinly for 3 years. Best crypto tax tool for international users — I''m in Australia and the ATO reports are perfect.', 'Jamie L.')
  ON CONFLICT DO NOTHING;

  -- CoinTracker reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (cointracker_id, 5, 'The TurboTax integration is seamless. Imported my crypto taxes directly with one click. Portfolio tracking is also excellent — best UI of any crypto tax app.', 'Ryan T.'),
    (cointracker_id, 4, 'Solid tool for US investors. The mobile app is great for checking portfolio performance. Wish the Pro plan wasn''t so expensive though.', 'Emma R.'),
    (cointracker_id, 4, 'CoinTracker got all my Coinbase and Kraken transactions right. The real-time P&L tracking is a nice bonus. Only issue was some DeFi transactions needed manual review.', 'David W.')
  ON CONFLICT DO NOTHING;

  -- TaxBit reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (taxbit_id, 4, 'TaxBit''s unlimited forms on all plans is a game changer. I have thousands of transactions and didn''t have to worry about hitting a limit.', 'Michael B.'),
    (taxbit_id, 4, 'Very reliable for US tax reporting. Customer support was responsive when I had questions. Interface could be more modern but it gets the job done.', 'Jennifer S.'),
    (taxbit_id, 3, 'Good for basic crypto tax reporting but struggled with some of my more complex DeFi positions. Works best for straightforward exchange trading.', 'Chris P.')
  ON CONFLICT DO NOTHING;

  -- ZenLedger reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (zenledger_id, 4, 'ZenLedger''s CPA export is the best I''ve seen. My accountant loved the format — no back-and-forth needed. The tax-loss harvesting tool is also handy.', 'Patricia H.'),
    (zenledger_id, 4, 'Good DeFi support and the interface is clean. The full-service CPA filing add-on saved me a lot of stress this year.', 'Marcus J.'),
    (zenledger_id, 3, 'Does the job for US taxes. A bit pricey for the transaction limits on lower tiers compared to Koinly. But the CPA export is genuinely excellent.', 'Olivia N.')
  ON CONFLICT DO NOTHING;

  -- Blockpit reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (blockpit_id, 5, 'Ich nutze Blockpit seit 2 Jahren für meine deutschen Steuern. Die FIFO-Berechnung ist korrekt und der Steuerreport wurde von meinem Steuerberater akzeptiert.', 'Klaus B.'),
    (blockpit_id, 4, 'Best tool for European crypto investors. The German tax report is accurate and the interface is well-designed. Free plan is useful for previewing.', 'Anna V.'),
    (blockpit_id, 4, 'Perfect for my Austrian tax filing. Handles all my DeFi positions on Uniswap and Aave. Support team knows EU tax law well.', 'Thomas W.')
  ON CONFLICT DO NOTHING;

  -- TokenTax reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (tokentax_id, 5, 'TokenTax is the only tool that handled my complex situation: futures trading, DeFi, NFTs, and international exchanges. The VIP CPA review was worth it.', 'Nathan C.'),
    (tokentax_id, 4, 'Expensive but handles edge cases that other tools get wrong. If you have a complex portfolio with margin trading and DeFi, this is worth the premium.', 'Rebecca L.'),
    (tokentax_id, 4, 'Used the audit support feature and it was excellent. Having a professional review my crypto taxes gave me peace of mind. Premium pricing but justified.', 'Daniel F.')
  ON CONFLICT DO NOTHING;

  -- CryptoTaxCalculator reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (ctc_id, 5, 'The best ATO-compliant crypto tax tool for Australians. Handles the CGT discount correctly and all my Independent Reserve trades imported perfectly.', 'Ben A.'),
    (ctc_id, 4, 'Great for UK taxes. The share pooling calculation is accurate and the HMRC report is exactly what you need. 3,000 integrations means everything imports.', 'Sophie M.'),
    (ctc_id, 4, 'Solid tool for Canadian crypto taxes. CRA T5008 support is good. The rule-based DeFi categorization is a smart approach for handling new protocols.', 'Ethan G.')
  ON CONFLICT DO NOTHING;

  -- Recap reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (recap_id, 5, 'Finally a tool built specifically for UK investors! The share pooling rules are applied correctly and the SA108 report is exactly what HMRC expects.', 'Oliver T.'),
    (recap_id, 5, 'The bed-and-breakfasting detection saved me from an expensive mistake. No other tool caught that I''d rebought within 30 days. Highly recommend for UK investors.', 'Charlotte B.'),
    (recap_id, 4, 'Excellent HMRC compliance and clean interface. Only issue is it''s UK-only so if you ever move abroad you''d need to switch. But for UK users, it''s the best.', 'Harry W.')
  ON CONFLICT DO NOTHING;

  -- Coinpanda reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (coinpanda_id, 4, 'Good international coverage at a reasonable price. I''m in South Africa and Coinpanda is one of the few tools that supports our tax rules. Reports are accurate.', 'Sipho M.'),
    (coinpanda_id, 4, 'Affordable and supports all the exchanges I use. The 65+ country support is impressive. Tax-loss harvesting preview is a nice feature on all plans.', 'Priya S.'),
    (coinpanda_id, 3, 'Works well for basic crypto trading but I had to manually categorize some DeFi transactions. Support was helpful though. Good value for the price.', 'Lucas B.')
  ON CONFLICT DO NOTHING;

  -- Divly reviews
  INSERT INTO reviews (tool_id, rating, comment, author) VALUES
    (divly_id, 5, 'Som svensk kryptoinvesterare är Divly det bästa verktyget. K4-blanketten genereras automatiskt och är korrekt. Sparar massor av tid.', 'Erik L.'),
    (divly_id, 4, 'Perfect for Norwegian crypto taxes. The RF-1159 form is generated correctly and the interface is clean and easy to use. Great Nordic focus.', 'Ingrid H.'),
    (divly_id, 4, 'Divly is the only tool that correctly handles Danish crypto tax rules. Worth the subscription for peace of mind knowing the report is accurate.', 'Mads K.')
  ON CONFLICT DO NOTHING;

END $$;
