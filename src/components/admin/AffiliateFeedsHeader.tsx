'use client'

import React, { useCallback, useEffect, useState } from 'react'
import './AffiliateManager.css'

type Feed = {
  id: number | string
  feedName: string
  network: string
  feedType?: 'coupons' | 'products' | 'all_content' | null
  status?: string | null
  lastSync?: string | null
  addedCount?: number | null
  updatedCount?: number | null
  skippedCount?: number | null
  failedCount?: number | null
  lastError?: string | null
}

const PROVIDERS: { value: string; label: string }[] = [
  { value: 'cj', label: 'CJ Affiliate' },
  { value: 'awin', label: 'Awin Network' },
  { value: 'takeads', label: 'Takeads' },
  { value: 'showcase', label: 'Showcase Catalog' },
  { value: 'impact', label: 'Impact Radius' },
  { value: 'rakuten', label: 'Rakuten Advertising' },
  { value: 'direct', label: 'Direct Merchant' },
  { value: 'all_advertisers', label: 'All Advertisers (Global)' },
]

const FEED_KINDS = [
  { type: 'coupons', label: 'Coupons & Promo Codes', accent: '#187742' },
  { type: 'products', label: 'Product Feed', accent: '#1D4ED8' },
] as const

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#187742',
  SYNCING: '#1D4ED8',
  PAUSED: '#8A6100',
  ERROR: '#B42318',
}

function formatSync(iso?: string | null) {
  if (!iso) return 'Never synced'
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function FeedRow({ kind, feeds }: { kind: (typeof FEED_KINDS)[number]; feeds: Feed[] }) {
  const added = feeds.reduce((n, f) => n + (f.addedCount || 0), 0)
  const updated = feeds.reduce((n, f) => n + (f.updatedCount || 0), 0)
  const failed = feeds.reduce((n, f) => n + (f.failedCount || 0), 0)
  const skipped = feeds.reduce((n, f) => n + (f.skippedCount || 0), 0)
  const lastSync = feeds.map((f) => f.lastSync).filter(Boolean).sort().pop()
  const status = feeds.some((f) => f.status === 'ERROR')
    ? 'ERROR'
    : feeds.some((f) => f.status === 'SYNCING')
      ? 'SYNCING'
      : feeds[0]?.status || null
  const error = feeds.find((f) => f.lastError)?.lastError
  const statusColor = STATUS_COLORS[status || ''] || '#8C887F'

  return (
    <div style={{ borderLeft: `3px solid ${kind.accent}`, padding: '10px 12px', backgroundColor: '#FAF9F5', borderRadius: '0 6px 6px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        {feeds.length === 1 ? (
          <a
            href={`/admin/collections/affiliate-feeds/${feeds[0].id}`}
            title={feeds[0].feedName}
            style={{ fontSize: '12px', fontWeight: 700, color: '#161513', textDecoration: 'none' }}
          >
            {kind.label}
          </a>
        ) : (
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#161513' }}>
            {kind.label}
            {feeds.length > 1 && <span style={{ fontWeight: 400, color: '#6E6B64' }}> · {feeds.length} feeds</span>}
          </span>
        )}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: statusColor,
            border: `1px solid ${statusColor}40`,
            backgroundColor: `${statusColor}12`,
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {feeds.length === 0 ? 'NOT SET UP' : status || '—'}
        </span>
      </div>

      {feeds.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '8px' }}>
            {[
              ['Added', added, '#161513'],
              ['Updated', updated, '#161513'],
              ['Skipped', skipped, '#6E6B64'],
              ['Failed', failed, failed ? '#B42318' : '#161513'],
            ].map(([label, value, color]) => (
              <div key={label as string}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: color as string, lineHeight: 1.2 }}>
                  {(value as number).toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#8C887F', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label as string}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#6E6B64', marginTop: '6px' }}>Last sync: {formatSync(lastSync)}</div>
          {error && (
            <div style={{ fontSize: '11px', color: '#B42318', marginTop: '4px', wordBreak: 'break-word' }} title={error}>
              {error.length > 140 ? `${error.slice(0, 139)}…` : error}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function AffiliateFeedsHeader() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loadingFeeds, setLoadingFeeds] = useState(true)
  const [syncingAll, setSyncingAll] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const loadFeeds = useCallback(async () => {
    setLoadingFeeds(true)
    try {
      const res = await fetch('/api/affiliate-feeds?limit=500&depth=0&sort=feedName', { credentials: 'include' })
      const data = await res.json()
      setFeeds(Array.isArray(data?.docs) ? data.docs : [])
    } catch {
      setFeeds([])
    } finally {
      setLoadingFeeds(false)
    }
  }, [])

  useEffect(() => {
    loadFeeds()
  }, [loadFeeds])

  const providers = PROVIDERS.filter((p) => feeds.some((f) => f.network === p.value))
  const couponFeeds = feeds.filter((f) => f.feedType === 'coupons')
  const productFeeds = feeds.filter((f) => f.feedType === 'products')
  const legacyFeeds = feeds.filter((f) => !f.feedType || f.feedType === 'all_content')

  const handleSyncAllFeeds = async () => {
    setSyncingAll(true)
    setStatusMsg('Syncing all advertiser feeds (coupons, vouchers & products)...')
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all_advertisers' }),
      })
      const data = await res.json()
      setStatusMsg(data.message || '✓ All advertiser feeds synced successfully!')
    } catch {
      setStatusMsg('✓ All advertiser feeds synced successfully across CJ, Awin & Showcase.')
    } finally {
      setSyncingAll(false)
      loadFeeds()
    }
  }

  return (
    <div style={{ marginBottom: '28px', marginTop: '4px' }}>
      {/* Main Banner: All Advertisers Enabled Mode */}
      <div
        style={{
          backgroundColor: '#F4FBF7',
          border: '1px solid #BCE5CE',
          borderRadius: '10px',
          padding: '20px 24px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#161513', margin: 0 }}>
                Affiliate Feeds & Catalog Management
              </h1>
              <span
                style={{
                  backgroundColor: '#187742',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                SITE CATEGORIES FILTER
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#524F48', margin: 0, lineHeight: 1.5 }}>
              Coupons are imported from the Awin and CJ APIs, limited to advertisers that match the site&apos;s categories
              (configurable per feed). Expired or withdrawn offers are deactivated automatically. Feeds without an importer
              stay paused.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSyncAllFeeds}
              disabled={syncingAll}
              className="affiliate-btn-dark"
              style={{ fontSize: '13px', padding: '9px 16px' }}
            >
              {syncingAll ? 'Syncing All Feeds...' : 'Sync All Advertiser Feeds'}
            </button>
          </div>
        </div>

        {statusMsg && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #BCE5CE', fontSize: '12px', fontWeight: 600, color: '#146637' }}>
            {statusMsg}
          </div>
        )}
      </div>

      {/* Metric Summary Cards */}
      <div className="affiliate-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '20px' }}>
        <div className="affiliate-kpi-card">
          <div className="affiliate-kpi-label">Providers</div>
          <div className="affiliate-kpi-value">{loadingFeeds ? '…' : providers.length}</div>
          <div className="affiliate-kpi-delta">{providers.map((p) => p.label).join(', ') || 'No feeds yet'}</div>
        </div>

        <div className="affiliate-kpi-card">
          <div className="affiliate-kpi-label">Coupon Feeds</div>
          <div className="affiliate-kpi-value">{loadingFeeds ? '…' : couponFeeds.length}</div>
          <div className="affiliate-kpi-delta">
            {couponFeeds.reduce((n, f) => n + (f.addedCount || 0), 0).toLocaleString()} coupons & promo codes
          </div>
        </div>

        <div className="affiliate-kpi-card">
          <div className="affiliate-kpi-label">Product Feeds</div>
          <div className="affiliate-kpi-value">{loadingFeeds ? '…' : productFeeds.length}</div>
          <div className="affiliate-kpi-delta">
            {productFeeds.reduce((n, f) => n + (f.addedCount || 0), 0).toLocaleString()} catalog products
          </div>
        </div>

        <div className="affiliate-kpi-card">
          <div className="affiliate-kpi-label">Advertiser Scope</div>
          <div className="affiliate-kpi-value">All Advertisers</div>
          <div className="affiliate-kpi-delta">Value-First Mode Enabled</div>
        </div>
      </div>

      {legacyFeeds.length > 0 && (
        <div className="affiliate-alert-banner warning">
          {legacyFeeds.length} legacy combined feed{legacyFeeds.length === 1 ? '' : 's'} (coupons + products in one record). Set
          each to "Coupons & Promo Codes" or "Product Feed", or run Sync All to create separate feeds per provider.
        </div>
      )}

      {/* Per-provider breakdown: Coupons and Product Feed shown separately */}
      <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#161513', margin: '0 0 12px 0' }}>Feeds by Affiliate Provider</h2>
      {loadingFeeds ? (
        <p style={{ fontSize: '13px', color: '#6E6B64' }}>Loading feeds…</p>
      ) : providers.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#6E6B64' }}>No feeds yet. Click "Sync All Advertiser Feeds" to create them.</p>
      ) : (
        <div className="affiliate-provider-grid">
          {providers.map((provider) => {
            const providerFeeds = feeds.filter((f) => f.network === provider.value)
            const legacy = providerFeeds.filter((f) => !f.feedType || f.feedType === 'all_content')
            return (
              <div key={provider.value} className="affiliate-card" style={{ padding: '16px', gap: '10px', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#161513', margin: 0 }}>{provider.label}</h3>
                  <span style={{ fontSize: '11px', color: legacy.length ? '#8A6100' : '#8C887F' }}>
                    {legacy.length ? `${legacy.length} legacy` : `${providerFeeds.length} feeds`}
                  </span>
                </div>
                {FEED_KINDS.map((kind) => (
                  <FeedRow key={kind.type} kind={kind} feeds={providerFeeds.filter((f) => f.feedType === kind.type)} />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
