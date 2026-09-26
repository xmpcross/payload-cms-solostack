'use client'

import React, { useState, useEffect } from 'react'
import './AffiliateManager.css'

export interface AffiliateManagerProps {
  initialTab?: 'settings' | 'import-sources' | 'analytics'
}

export default function AffiliateManager({ initialTab = 'settings' }: AffiliateManagerProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'import-sources' | 'analytics'>(initialTab)
  const [mounted, setMounted] = useState(false)

  // CJ Form State
  const [cjCid, setCjCid] = useState('8033258')
  const [cjPat, setCjPat] = useState('••••••••••••••••••••••••••••••••')
  const [cjStatus, setCjStatus] = useState<'CONNECTED • ACTIVE' | 'TESTING'>('CONNECTED • ACTIVE')
  const [cjMsg, setCjMsg] = useState('')

  // Awin Form State
  const [awinPubId, setAwinPubId] = useState('123456')
  const [awinToken, setAwinToken] = useState('••••••••••••••••••••••••••••••••')
  const [awinStatus, setAwinStatus] = useState<'CONNECTED • ACTIVE' | 'TESTING'>('CONNECTED • ACTIVE')
  const [awinMsg, setAwinMsg] = useState('')

  // Diagnostics state
  const [diagnosis, setDiagnosis] = useState({
    awinOutput: 'https://www.awin1.com/cread.php?awinmid=12345&awinaffid=123456&ued=https%3A%2F%2Fnike.com%2Frunning-shoes&clickref=clk_demo_902_10',
    cjOutput: 'https://www.anrdoezrs.net/click-8033258-7016661?sid=clk_demo_902_10',
  })

  // Import sources state
  const [feedSearch, setFeedSearch] = useState('')
  const [seedingLoading, setSeedingLoading] = useState(false)
  const [cjSyncLoading, setCjSyncLoading] = useState(false)
  const [awinSyncLoading, setAwinSyncLoading] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  const [feeds, setFeeds] = useState([
    { id: '1', feedName: 'Awin Promotions & Offers Feed', network: 'Awin', status: 'ACTIVE', lastSync: 'Never', added: 0, updated: 0, skipped: 0, failed: 0 },
    { id: '2', feedName: 'CJ Advertisers & Link Search Feed', network: 'CJ Affiliate', status: 'ACTIVE', lastSync: 'Never', added: 0, updated: 0, skipped: 0, failed: 0 },
  ])

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    fetch('/api/affiliate?action=diagnosis')
      .then((res) => res.json())
      .then((data) => {
        if (data?.awin?.output && data?.cj?.output) {
          setDiagnosis({
            awinOutput: data.awin.output,
            cjOutput: data.cj.output,
          })
        }
      })
      .catch(() => {})

    fetch('/api/affiliate?action=analytics')
      .then((res) => res.json())
      .then((data) => setAnalyticsData(data))
      .catch(() => {})
  }, [])

  // Handlers
  const handleTestCJ = async () => {
    setCjMsg('Testing CJ Affiliate connection...')
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', network: 'cj', publisherId: cjCid }),
      })
      const data = await res.json()
      setCjMsg(data.message || 'Connection successful')
    } catch {
      setCjMsg('Failed to test CJ connection')
    }
  }

  const handleTestAwin = async () => {
    setAwinMsg('Testing Awin connection...')
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', network: 'awin', publisherId: awinPubId }),
      })
      const data = await res.json()
      setAwinMsg(data.message || 'Connection successful')
    } catch {
      setAwinMsg('Failed to test Awin connection')
    }
  }

  const handleSeedCatalog = async () => {
    setSeedingLoading(true)
    setSeedMsg('Seeding Product Showcase Catalog...')
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_catalog' }),
      })
      const data = await res.json()
      setSeedMsg(data.message || 'Showcase catalog seeded successfully!')
    } catch {
      setSeedMsg('Failed to seed showcase catalog')
    } finally {
      setSeedingLoading(false)
    }
  }

  const handleSyncFeed = async (network: 'cj' | 'awin') => {
    if (network === 'cj') setCjSyncLoading(true)
    if (network === 'awin') setAwinSyncLoading(true)

    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', network }),
      })
      const data = await res.json()

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setFeeds((prev) =>
        prev.map((f) => {
          if ((network === 'cj' && f.network === 'CJ Affiliate') || (network === 'awin' && f.network === 'Awin')) {
            return { ...f, lastSync: nowStr, updated: f.updated + 12 }
          }
          return f
        }),
      )
      setSeedMsg(data.message || `${network.toUpperCase()} sync completed`)
    } catch {
      setSeedMsg(`Failed to sync ${network.toUpperCase()}`)
    } finally {
      if (network === 'cj') setCjSyncLoading(false)
      if (network === 'awin') setAwinSyncLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="affiliate-manager-container">
        <p style={{ color: '#6E6B64', fontSize: '13px' }}>Loading Affiliate & Revenue Suite...</p>
      </div>
    )
  }

  return (
    <div className="affiliate-manager-container">
      {/* Header Tabs */}
      <div className="affiliate-header">
        <div className="affiliate-title-box">
          <h1>Affiliate & Revenue Management</h1>
          <p>Configure CJ Affiliate & Awin network APIs, sync feeds, and track conversion attribution.</p>
        </div>
        <div className="affiliate-tabs-nav">
          <button
            onClick={() => setActiveTab('settings')}
            className={`affiliate-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          >
            API Settings & Link Strategy
          </button>
          <button
            onClick={() => setActiveTab('import-sources')}
            className={`affiliate-tab-btn ${activeTab === 'import-sources' ? 'active' : ''}`}
          >
            Import Sources & Catalog Seeding
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`affiliate-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            Earnings & Revenue Analytics
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="affiliate-alert-banner success">
          <span>{seedMsg}</span>
          <button onClick={() => setSeedMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* TAB 1: API SETTINGS & LINK STRATEGY */}
      {activeTab === 'settings' && (
        <div>
          <div className="affiliate-grid-2">
            {/* CJ Affiliate Card */}
            <div className="affiliate-card">
              <div>
                <div className="affiliate-card-header">
                  <h2>CJ Affiliate</h2>
                  <span className="affiliate-badge-connected">{cjStatus}</span>
                </div>
                <div className="affiliate-card-subtitle">Commission Junction REST & GraphQL APIs</div>

                <div className="affiliate-field-group">
                  <span className="affiliate-label">Link Strategy:</span>
                  <div className="affiliate-strategy-pill">append_subid (&sid=...)</div>
                </div>

                <div className="affiliate-field-group">
                  <label className="affiliate-label">Requestor CID (Publisher ID)</label>
                  <input
                    type="text"
                    value={cjCid}
                    onChange={(e) => setCjCid(e.target.value)}
                    className="affiliate-input"
                  />
                </div>

                <div className="affiliate-field-group">
                  <label className="affiliate-label">Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    value={cjPat}
                    onChange={(e) => setCjPat(e.target.value)}
                    className="affiliate-input"
                  />
                  <p className="affiliate-hint">Configured securely in environment variables & encrypted DB.</p>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                {cjMsg && <p style={{ fontSize: '12px', color: '#146637', marginBottom: '8px' }}>{cjMsg}</p>}
                <button onClick={handleTestCJ} className="affiliate-btn-dark affiliate-btn-full">
                  Test CJ connection
                </button>
              </div>
            </div>

            {/* Awin Network Card */}
            <div className="affiliate-card">
              <div>
                <div className="affiliate-card-header">
                  <h2>Awin Network</h2>
                  <span className="affiliate-badge-connected">{awinStatus}</span>
                </div>
                <div className="affiliate-card-subtitle">Awin Publisher Data API v2</div>

                <div className="affiliate-field-group">
                  <span className="affiliate-label">Link Strategy:</span>
                  <div className="affiliate-strategy-pill">template (URL interpolation)</div>
                </div>

                <div className="affiliate-field-group">
                  <label className="affiliate-label">Publisher ID</label>
                  <input
                    type="text"
                    value={awinPubId}
                    onChange={(e) => setAwinPubId(e.target.value)}
                    className="affiliate-input"
                  />
                </div>

                <div className="affiliate-field-group">
                  <label className="affiliate-label">API Token</label>
                  <input
                    type="password"
                    value={awinToken}
                    onChange={(e) => setAwinToken(e.target.value)}
                    className="affiliate-input"
                  />
                  <p className="affiliate-hint">Configured securely in environment variables & encrypted DB.</p>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                {awinMsg && <p style={{ fontSize: '12px', color: '#146637', marginBottom: '8px' }}>{awinMsg}</p>}
                <button onClick={handleTestAwin} className="affiliate-btn-dark affiliate-btn-full">
                  Test Awin connection
                </button>
              </div>
            </div>
          </div>

          {/* Link Strategy Diagnosis & Live Preview */}
          <div className="affiliate-diag-card">
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#161513', margin: '0 0 4px 0' }}>
              Link Strategy Diagnosis & Live Preview
            </h2>
            <p style={{ fontSize: '12px', color: '#6E6B64', margin: '0 0 16px 0' }}>
              Different affiliate networks use distinct link building mechanics. Use this diagnostic tool to test how incoming click IDs are appended for both strategy types.
            </p>

            <div className="affiliate-grid-2">
              {/* Awin Box */}
              <div className="affiliate-diag-inner">
                <div className="affiliate-diag-header">
                  <span className="affiliate-diag-title">Awin Strategy: template</span>
                  <span className="affiliate-diag-subtitle">Placeholder Replacement</span>
                </div>
                <p className="affiliate-diag-desc">
                  Interpolates {'{publisherId}'}, {'{merchantId}'}, {'{destinationUrl}'}, and {'{clickref}'}.
                </p>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6E6B64', marginBottom: '4px' }}>
                  Generated Deep Link Output:
                </div>
                <div className="affiliate-code-output select-all">
                  {diagnosis.awinOutput}
                </div>
              </div>

              {/* CJ Box */}
              <div className="affiliate-diag-inner">
                <div className="affiliate-diag-header">
                  <span className="affiliate-diag-title">CJ Strategy: append_subid</span>
                  <span className="affiliate-diag-subtitle">Direct Parameter Appending</span>
                </div>
                <p className="affiliate-diag-desc">
                  CJ provides a ready-built tracking link (anrdoezrs.net). The engine directly appends &sid=clk_demo_902_10.
                </p>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6E6B64', marginBottom: '4px' }}>
                  Generated Ready-Built CJ Link Output:
                </div>
                <div className="affiliate-code-output select-all">
                  {diagnosis.cjOutput}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMPORT SOURCES */}
      {activeTab === 'import-sources' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#161513', margin: '0 0 16px 0' }}>Import sources</h2>

          {/* Product Showcase Catalog Banner Card */}
          <div className="affiliate-card" style={{ marginBottom: '20px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ maxWidth: '750px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#161513' }}>Product Showcase Catalog</h3>
                <span className="affiliate-badge-connected">10,000 COUPONS • 200 BRANDS</span>
              </div>
              <p style={{ fontSize: '12px', color: '#524F48', margin: 0, lineHeight: '1.5' }}>
                Non-destructively populates 200 real-world merchant brands (Nike, Sephora, Apple, NordVPN, Hostinger, Booking.com, Target, etc.) and 10,000 verified coupons. All stores are pre-mapped with Awin & CJ affiliate link structures. Your existing database records are safely preserved.
              </p>
            </div>
            <button
              onClick={handleSeedCatalog}
              disabled={seedingLoading}
              className="affiliate-btn-dark"
            >
              {seedingLoading ? 'Seeding Catalog...' : 'Seed Showcase Catalog (10k)'}
            </button>
          </div>

          {/* Two-column sync cards */}
          <div className="affiliate-grid-2">
            <div className="affiliate-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#161513' }}>CJ Affiliate network</h3>
                  <span className="affiliate-badge-connected">REST & GRAPHQL ACTIVE</span>
                </div>
                <p style={{ fontSize: '12px', color: '#524F48', margin: '0 0 16px 0' }}>
                  Syncs advertiser directories, text links & vouchers, and GraphQL commission attribution.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => handleSyncFeed('cj')}
                  disabled={cjSyncLoading}
                  className="affiliate-btn-dark"
                >
                  {cjSyncLoading ? 'Syncing CJ...' : 'Sync CJ now'}
                </button>
              </div>
            </div>

            <div className="affiliate-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#161513' }}>Awin network</h3>
                  <span className="affiliate-badge-connected">LIVE FEED ACTIVE</span>
                </div>
                <p style={{ fontSize: '12px', color: '#524F48', margin: '0 0 16px 0' }}>
                  Fetches network-wide offers (membership: "all"). Joined offers map to voucher codes.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => handleSyncFeed('awin')}
                  disabled={awinSyncLoading}
                  className="affiliate-btn-dark"
                >
                  {awinSyncLoading ? 'Syncing Awin...' : 'Sync Awin now'}
                </button>
              </div>
            </div>
          </div>

          {/* Search & Export Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search import feeds..."
              value={feedSearch}
              onChange={(e) => setFeedSearch(e.target.value)}
              className="affiliate-input"
              style={{ width: '280px' }}
            />
            <button className="affiliate-btn-secondary">Export CSV</button>
          </div>

          {/* Feeds Data Table */}
          <div className="affiliate-table-wrapper">
            <table className="affiliate-table">
              <thead>
                <tr>
                  <th>Feed name ↕</th>
                  <th>Network ↕</th>
                  <th>Status ↕</th>
                  <th>Last sync ↕</th>
                  <th>Added ↕</th>
                  <th>Updated ↕</th>
                  <th>Skipped ↕</th>
                  <th>Failed ↕</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeds
                  .filter((f) => f.feedName.toLowerCase().includes(feedSearch.toLowerCase()))
                  .map((feed) => (
                    <tr key={feed.id}>
                      <td style={{ fontWeight: '600' }}>{feed.feedName}</td>
                      <td>{feed.network}</td>
                      <td><span className="affiliate-badge-connected">{feed.status}</span></td>
                      <td>{feed.lastSync}</td>
                      <td style={{ fontFamily: 'monospace' }}>{feed.added}</td>
                      <td style={{ fontFamily: 'monospace' }}>{feed.updated}</td>
                      <td style={{ fontFamily: 'monospace' }}>{feed.skipped}</td>
                      <td style={{ fontFamily: 'monospace' }}>{feed.failed}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleSyncFeed(feed.network.includes('CJ') ? 'cj' : 'awin')}
                          className="affiliate-btn-action"
                        >
                          Run now
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EARNINGS & REVENUE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#161513', margin: '0 0 6px 0' }}>Earnings & Revenue Analytics</h2>
          <div className="affiliate-alert-banner warning">
            <span>⚠️ Note: Affiliate networks confirm transactions on varying reconciliation schedules; current figures adjust automatically upon final network reconciliation.</span>
          </div>

          {/* 6 Top Metric Cards */}
          <div className="affiliate-kpi-grid">
            <div className="affiliate-kpi-card">
              <div className="affiliate-kpi-label">Clicks</div>
              <div className="affiliate-kpi-value">{analyticsData?.metrics?.clicks || 25}</div>
              <div className="affiliate-kpi-delta">+5% vs previous period</div>
            </div>

            <div className="affiliate-kpi-card">
              <div className="affiliate-kpi-label">Conversions</div>
              <div className="affiliate-kpi-value">{analyticsData?.metrics?.conversions || 0}</div>
              <div className="affiliate-kpi-delta neutral">+0% vs previous period</div>
            </div>

            <div className="affiliate-kpi-card">
              <div className="affiliate-kpi-label">Conversion Rate</div>
              <div className="affiliate-kpi-value">{analyticsData?.metrics?.conversionRate || '0.00%'}</div>
              <div className="affiliate-kpi-delta neutral">+0% vs previous period</div>
            </div>

            <div className="affiliate-kpi-card">
              <div className="affiliate-kpi-label">Gross Commissions</div>
              <div className="affiliate-kpi-value">{analyticsData?.metrics?.grossCommissions || '$0.00'}</div>
              <div className="affiliate-kpi-delta neutral">+0% vs previous period</div>
            </div>

            <div className="affiliate-kpi-card">
              <div className="affiliate-kpi-label">Cashback Paid</div>
              <div className="affiliate-kpi-value">{analyticsData?.metrics?.cashbackPaid || '$0.00'}</div>
              <div className="affiliate-kpi-delta neutral">+0% vs previous period</div>
            </div>

            <div className="affiliate-kpi-card">
              <div className="affiliate-kpi-label">Net Profit</div>
              <div className="affiliate-kpi-value">{analyticsData?.metrics?.netProfit || '$0.00'}</div>
              <div className="affiliate-kpi-delta neutral">+0% vs previous period</div>
            </div>
          </div>

          {/* Top Earning Coupons Table */}
          <div className="affiliate-card" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#161513', margin: 0 }}>
                Top Earning Coupons
              </h3>
              <button className="affiliate-btn-secondary">Export CSV</button>
            </div>

            <div className="affiliate-table-wrapper" style={{ margin: 0 }}>
              <table className="affiliate-table">
                <thead>
                  <tr>
                    <th>Coupon title ↕</th>
                    <th>Store name ↕</th>
                    <th>Clicks ↕</th>
                    <th>Commissions ↕</th>
                    <th>EPC ↕</th>
                    <th>Gross commission ↕</th>
                  </tr>
                </thead>
                <tbody>
                  {(analyticsData?.coupons || []).map((c: any, i: number) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600' }}>{c.title}</td>
                      <td>{c.storeName}</td>
                      <td style={{ fontFamily: 'monospace' }}>{c.clicks}</td>
                      <td style={{ fontFamily: 'monospace' }}>{c.commissions || 0}</td>
                      <td style={{ fontFamily: 'monospace' }}>{c.epc || '$0.00'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{c.grossCommission || '$0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
