-- ============================================================
-- Taxpicker — Complete Supabase Schema
-- Run this in the Supabase SQL editor to create all tables.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE pricing_type AS ENUM ('free', 'freemium', 'paid');

-- ============================================================
-- TABLES
-- ============================================================

-- Tools
CREATE TABLE IF NOT EXISTS tools (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  logo_url          TEXT,
  website_url       TEXT,
  pricing_type      pricing_type NOT NULL DEFAULT 'freemium',
  price_from        NUMERIC(10,2),
  pricing_details   TEXT,
  features          JSONB NOT NULL DEFAULT '[]',
  supported_countries TEXT[] NOT NULL DEFAULT '{}',
  supported_exchanges TEXT[] NOT NULL DEFAULT '{}',
  supported_wallets   TEXT[] NOT NULL DEFAULT '{}',
  tax_report_types    TEXT[] NOT NULL DEFAULT '{}',
  pros              TEXT[] NOT NULL DEFAULT '{}',
  cons              TEXT[] NOT NULL DEFAULT '{}',
  affiliate_url     TEXT NOT NULL,
  rating            NUMERIC(3,2),
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  is_recommended    BOOLEAN NOT NULL DEFAULT FALSE,
  last_verified_at  TIMESTAMPTZ,
  last_verified_by  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content          TEXT NOT NULL DEFAULT '',
  author           TEXT,
  published_at     TIMESTAMPTZ,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  meta_description TEXT,
  og_image_url     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Affiliate Clicks
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id      UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  clicked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent   TEXT,
  referrer     TEXT,
  ip           TEXT,
  gdpr_consent BOOLEAN NOT NULL DEFAULT FALSE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id    UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  author     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cookie Consents
CREATE TABLE IF NOT EXISTS cookie_consents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip           TEXT
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_published ON tools(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_tools_sort ON tools(is_recommended DESC, is_featured DESC, rating DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clicks_tool_id ON affiliate_clicks(tool_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON affiliate_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON reviews(tool_id);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_consents ENABLE ROW LEVEL SECURITY;

-- Public: read published tools
CREATE POLICY "Public can read published tools"
  ON tools FOR SELECT
  USING (is_published = TRUE);

-- Authenticated (admin): full access to tools
CREATE POLICY "Admins can manage tools"
  ON tools FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public: read published articles
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());

-- Authenticated (admin): full access to articles
CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public: insert affiliate clicks (for tracking)
CREATE POLICY "Public can insert affiliate clicks"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (TRUE);

-- Authenticated (admin): read affiliate clicks
CREATE POLICY "Admins can read affiliate clicks"
  ON affiliate_clicks FOR SELECT
  USING (auth.role() = 'authenticated');

-- Public: read reviews
CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT
  USING (TRUE);

-- Authenticated (admin): manage reviews
CREATE POLICY "Admins can manage reviews"
  ON reviews FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public: insert cookie consents
CREATE POLICY "Public can insert cookie consents"
  ON cookie_consents FOR INSERT
  WITH CHECK (TRUE);

-- Authenticated: read cookie consents
CREATE POLICY "Admins can read cookie consents"
  ON cookie_consents FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- REALTIME
-- Enable realtime on affiliate_clicks for live admin dashboard
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE affiliate_clicks;

-- ============================================================
-- STORAGE BUCKETS
-- Run separately in Supabase dashboard or via API
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('assets', 'assets', true)
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE DATA (optional — remove before production)
-- ============================================================
INSERT INTO tools (
  name, slug, description, website_url, pricing_type,
  price_from, pricing_details, affiliate_url,
  features, supported_countries, supported_exchanges,
  supported_wallets, tax_report_types, pros, cons,
  rating, is_published, is_featured, is_recommended
) VALUES
(
  'CryptoTaxCalculator', 'cryptotaxcalculator',
  'CryptoTaxCalculator is a comprehensive platform that helps you calculate, report, and file your crypto taxes with ease. Supports over 100 exchanges and 500+ chains.',
  'https://cryptotaxcalculator.io', 'freemium', 49,
  'Free for up to 100 transactions. Starter $49/year, Pro $99/year, Enterprise custom.',
  'https://cryptotaxcalculator.io',
  '["DeFi transaction tracking","Margin trading support","Portfolio tracking","Smart contract support","API integrations","CPA report formats","NFT tax reporting","Tax-loss harvesting","Automated exchange imports","Multi-year reporting","Audit report generation"]',
  ARRAY['US','UK','Canada','Australia','Germany','France'],
  ARRAY['Binance','Coinbase','Kraken','FTX','Gemini','Bitfinex'],
  ARRAY['MetaMask','Ledger','Trezor','Coinbase Wallet'],
  ARRAY['Capital Gains','Income','DeFi','NFT'],
  ARRAY['Excellent DeFi support','User-friendly interface','Comprehensive exchange coverage','Great customer support'],
  ARRAY['Premium price point','Learning curve for complex scenarios','Limited free tier'],
  4.8, TRUE, TRUE, TRUE
),
(
  'Koinly', 'koinly',
  'Koinly is a popular crypto tax calculator that supports over 700 integrations. Generate compliant tax reports for any country in minutes.',
  'https://koinly.io', 'freemium', 49,
  'Free plan available. Newbie $49/year, Hodler $99/year, Trader $179/year.',
  'https://koinly.io',
  '["Automatic import","Tax-loss harvesting","Portfolio tracking","700+ integrations","DeFi support","NFT support"]',
  ARRAY['US','UK','Canada','Australia','Germany','Sweden'],
  ARRAY['Binance','Coinbase','Kraken','Bitfinex','OKX'],
  ARRAY['MetaMask','Ledger','Trezor'],
  ARRAY['Capital Gains','Income','Mining','Staking'],
  ARRAY['Huge integration library','Easy to use','Supports all major countries'],
  ARRAY['Expensive for high-volume traders','DeFi support could be better'],
  4.7, TRUE, FALSE, FALSE
),
(
  'TaxBit', 'taxbit',
  'TaxBit automates crypto tax forms and portfolio tracking. Trusted by top exchanges and used by millions of taxpayers.',
  'https://taxbit.com', 'paid', 175,
  '$175/year for Individual plan. Enterprise pricing available.',
  'https://taxbit.com',
  '["Automated tax forms","Real-time portfolio tracking","CPA review","Audit trail","Exchange partnerships"]',
  ARRAY['US'],
  ARRAY['Coinbase','Binance.US','Gemini','Kraken'],
  ARRAY['Ledger','Trezor'],
  ARRAY['Capital Gains','Income','Form 8949','Schedule D'],
  ARRAY['Excellent US tax form generation','Clean interface','CPA-ready reports'],
  ARRAY['US only','Higher price point','Limited DeFi support'],
  4.6, TRUE, FALSE, FALSE
),
(
  'CoinTracker', 'cointracker',
  'CoinTracker provides portfolio tracking and tax reporting for cryptocurrency. Supports automatic syncing with major exchanges.',
  'https://cointracker.io', 'freemium', 0,
  'Free for up to 25 transactions. Plans from $59/year.',
  'https://cointracker.io',
  '["Portfolio tracking","Tax optimization","Automatic sync","300+ integrations","Mobile app"]',
  ARRAY['US','UK','Canada','Australia'],
  ARRAY['Coinbase','Binance','Kraken','Gemini'],
  ARRAY['MetaMask','Coinbase Wallet'],
  ARRAY['Capital Gains','Income'],
  ARRAY['Good free tier','Clean mobile app','Easy setup'],
  ARRAY['Expensive for full features','Limited DeFi support'],
  4.5, TRUE, FALSE, FALSE
),
(
  'ZenLedger', 'zenledger',
  'ZenLedger simplifies crypto tax preparation with automatic import from 400+ exchanges and wallets. Integrates with TurboTax and TaxAct.',
  'https://zenledger.io', 'freemium', 0,
  'Free plan for up to 25 transactions. Plans from $49/year.',
  'https://zenledger.io',
  '["TurboTax integration","400+ exchange support","Audit trail","Tax-loss harvesting","DeFi support"]',
  ARRAY['US'],
  ARRAY['Binance','Coinbase','Kraken','Bittrex'],
  ARRAY['MetaMask','Ledger'],
  ARRAY['Capital Gains','Income','Form 8949'],
  ARRAY['Great TurboTax integration','Easy import','Good support'],
  ARRAY['US only','Limited NFT support','UI could be improved'],
  4.4, TRUE, FALSE, FALSE
),
(
  'Accointing', 'accointing',
  'Accointing offers crypto portfolio tracking and tax reporting for investors worldwide. Features a clean dashboard and solid exchange support.',
  'https://accointing.com', 'freemium', 0,
  'Free for up to 25 transactions. Plans from $79/year.',
  'https://accointing.com',
  '["Portfolio tracking","Tax reporting","250+ integrations","Tax-loss harvesting","Mobile app"]',
  ARRAY['US','UK','Germany','Switzerland','Austria'],
  ARRAY['Binance','Coinbase','Kraken'],
  ARRAY['MetaMask','Ledger','Trezor'],
  ARRAY['Capital Gains','Income'],
  ARRAY['Good European support','Clean UI','Solid portfolio tracking'],
  ARRAY['Smaller integration library','Limited DeFi support'],
  4.3, TRUE, FALSE, FALSE
)
ON CONFLICT (slug) DO NOTHING;

-- Sample article
INSERT INTO articles (title, slug, content, author, published_at, tags, meta_description)
VALUES (
  'Complete Guide to Crypto Taxes in 2026',
  'complete-guide-crypto-taxes-2026',
  '# Complete Guide to Crypto Taxes in 2026

Understanding your crypto tax obligations is essential for every investor. This comprehensive guide covers everything you need to know about reporting cryptocurrency on your taxes.

## What Do You Owe Crypto Taxes?

In most countries, cryptocurrency is treated as property for tax purposes. This means every time you sell, trade, or use crypto, you may trigger a taxable event.

### Common Taxable Events
- Selling crypto for fiat currency
- Trading one crypto for another
- Using crypto to buy goods or services
- Receiving crypto as income (mining, staking, airdrops)

## Capital Gains vs Ordinary Income

Capital gains rates apply when you sell or trade crypto. Short-term gains (held less than a year) are taxed as ordinary income. Long-term gains (held more than a year) receive preferential rates.

## Record Keeping Best Practices

The key to stress-free crypto tax filing is maintaining thorough records:
- Date and time of each transaction
- Amount and type of crypto
- Fair market value in USD at time of transaction
- Purpose of the transaction

## Using Crypto Tax Software

The easiest way to stay compliant is using dedicated crypto tax software. These tools automatically import your transaction history and calculate your tax liability.',
  'Taxpicker Editorial',
  NOW(),
  ARRAY['taxes', 'guide', 'crypto'],
  'Complete guide to understanding and filing crypto taxes in 2026. Covers capital gains, income, DeFi, and NFT taxation.'
)
ON CONFLICT (slug) DO NOTHING;
