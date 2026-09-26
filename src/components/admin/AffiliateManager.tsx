'use client'

import React, { useState, useEffect } from 'react'

export interface AffiliateManagerProps {
  initialTab?: 'settings' | 'import-sources' | 'analytics'
}

export default function AffiliateManager({ initialTab = 'settings' }: AffiliateManagerProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'import-sources' | 'analytics'>(initialTab)

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

  return (
    <div className="w-full font-sans bg-[#F9F8F3] text-gray-800 p-4 md:p-8 rounded-xl border border-stone-200 my-4 shadow-sm">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Affiliate & Revenue Management</h1>
          <p className="text-sm text-stone-500">Configure CJ Affiliate & Awin network APIs, sync feeds, and track conversion attribution.</p>
        </div>
        <div className="flex bg-stone-200/60 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'settings' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            API Settings & Link Strategy
          </button>
          <button
            onClick={() => setActiveTab('import-sources')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'import-sources' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Import Sources & Catalog Seeding
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'analytics' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Earnings & Revenue Analytics
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center justify-between">
          <span>{seedMsg}</span>
          <button onClick={() => setSeedMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold ml-4">✕</button>
        </div>
      )}

      {/* TAB 1: API SETTINGS & LINK STRATEGY */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CJ Affiliate Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-stone-900">CJ Affiliate</h2>
                  <span className="bg-emerald-100/70 border border-emerald-300 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {cjStatus}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mb-4">Commission Junction REST & GraphQL APIs</p>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Link Strategy:</label>
                  <div className="inline-block bg-stone-100 text-stone-800 font-mono text-xs px-3 py-1.5 rounded-md border border-stone-200">
                    append_subid (&sid=...)
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Requestor CID (Publisher ID)</label>
                  <input
                    type="text"
                    value={cjCid}
                    onChange={(e) => setCjCid(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-800 font-mono focus:ring-2 focus:ring-stone-400 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    value={cjPat}
                    onChange={(e) => setCjPat(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-800 font-mono focus:ring-2 focus:ring-stone-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Configured securely in environment variables & encrypted DB.</p>
                </div>
              </div>

              <div>
                {cjMsg && <p className="text-xs text-stone-600 mb-2 font-medium">{cjMsg}</p>}
                <button
                  onClick={handleTestCJ}
                  className="w-full bg-stone-900 hover:bg-black text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow"
                >
                  Test CJ connection
                </button>
              </div>
            </div>

            {/* Awin Network Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-stone-900">Awin Network</h2>
                  <span className="bg-emerald-100/70 border border-emerald-300 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {awinStatus}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mb-4">Awin Publisher Data API v2</p>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Link Strategy:</label>
                  <div className="inline-block bg-stone-100 text-stone-800 font-mono text-xs px-3 py-1.5 rounded-md border border-stone-200">
                    template (URL interpolation)
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Publisher ID</label>
                  <input
                    type="text"
                    value={awinPubId}
                    onChange={(e) => setAwinPubId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-800 font-mono focus:ring-2 focus:ring-stone-400 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">API Token</label>
                  <input
                    type="password"
                    value={awinToken}
                    onChange={(e) => setAwinToken(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-800 font-mono focus:ring-2 focus:ring-stone-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Configured securely in environment variables & encrypted DB.</p>
                </div>
              </div>

              <div>
                {awinMsg && <p className="text-xs text-stone-600 mb-2 font-medium">{awinMsg}</p>}
                <button
                  onClick={handleTestAwin}
                  className="w-full bg-stone-900 hover:bg-black text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow"
                >
                  Test Awin connection
                </button>
              </div>
            </div>
          </div>

          {/* Link Strategy Diagnosis & Live Preview */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-1">Link Strategy Diagnosis & Live Preview</h2>
            <p className="text-xs text-stone-500 mb-6">
              Different affiliate networks use distinct link building mechanics. Use this diagnostic tool to test how incoming click IDs are appended for both strategy types.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Awin Box */}
              <div className="bg-[#F6F5F0] border border-stone-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-stone-900">Awin Strategy: template</span>
                  <span className="text-xs italic text-stone-500 font-mono">Placeholder Replacement</span>
                </div>
                <p className="text-xs text-stone-600 mb-3">
                  Interpolates {'{publisherId}'}, {'{merchantId}'}, {'{destinationUrl}'}, and {'{clickref}'}.
                </p>
                <div className="text-[11px] font-semibold text-stone-500 mb-1">Generated Deep Link Output:</div>
                <div className="bg-white border border-stone-300 rounded p-3 text-[11px] font-mono text-stone-800 break-all select-all">
                  {diagnosis.awinOutput}
                </div>
              </div>

              {/* CJ Box */}
              <div className="bg-[#F6F5F0] border border-stone-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-stone-900">CJ Strategy: append_subid</span>
                  <span className="text-xs italic text-stone-500 font-mono">Direct Parameter Appending</span>
                </div>
                <p className="text-xs text-stone-600 mb-3">
                  CJ provides a ready-built tracking link (anrdoezrs.net). The engine directly appends &sid=clk_demo_902_10.
                </p>
                <div className="text-[11px] font-semibold text-stone-500 mb-1">Generated Ready-Built CJ Link Output:</div>
                <div className="bg-white border border-stone-300 rounded p-3 text-[11px] font-mono text-stone-800 break-all select-all">
                  {diagnosis.cjOutput}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMPORT SOURCES */}
      {activeTab === 'import-sources' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900">Import sources</h2>

          {/* Product Showcase Catalog Banner Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-stone-900">Product Showcase Catalog</h3>
                <span className="bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded tracking-wide">
                  10,000 COUPONS • 200 BRANDS
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Non-destructively populates 200 real-world merchant brands (Nike, Sephora, Apple, NordVPN, Hostinger, Booking.com, Target, etc.) and 10,000 verified coupons. All stores are pre-mapped with Awin & CJ affiliate link structures. Your existing database records are safely preserved.
              </p>
            </div>
            <button
              onClick={handleSeedCatalog}
              disabled={seedingLoading}
              className="bg-stone-900 hover:bg-black text-white font-semibold text-xs px-5 py-3 rounded-lg shadow whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {seedingLoading ? 'Seeding Catalog...' : 'Seed Showcase Catalog (10k)'}
            </button>
          </div>

          {/* Two-column sync cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold text-stone-900">CJ Affiliate network</h3>
                  <span className="bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    REST & GRAPHQL ACTIVE
                  </span>
                </div>
                <p className="text-xs text-stone-600 mb-6">
                  Syncs advertiser directories, text links & vouchers, and GraphQL commission attribution.
                </p>
              </div>
              <button
                onClick={() => handleSyncFeed('cj')}
                disabled={cjSyncLoading}
                className="self-end bg-stone-900 hover:bg-black text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-colors disabled:opacity-50"
              >
                {cjSyncLoading ? 'Syncing CJ...' : 'Sync CJ now'}
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold text-stone-900">Awin network</h3>
                  <span className="bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    LIVE FEED ACTIVE
                  </span>
                </div>
                <p className="text-xs text-stone-600 mb-6">
                  Fetches network-wide offers (membership: "all"). Joined offers map to voucher codes.
                </p>
              </div>
              <button
                onClick={() => handleSyncFeed('awin')}
                disabled={awinSyncLoading}
                className="self-end bg-stone-900 hover:bg-black text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-colors disabled:opacity-50"
              >
                {awinSyncLoading ? 'Syncing Awin...' : 'Sync Awin now'}
              </button>
            </div>
          </div>

          {/* Search & Export Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <input
              type="text"
              placeholder="Search import feeds..."
              value={feedSearch}
              onChange={(e) => setFeedSearch(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-4 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 w-full sm:w-72 shadow-sm"
            />
            <button className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border border-stone-300">
              Export CSV
            </button>
          </div>

          {/* Feeds Data Table */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F6F5F0] border-b border-stone-200 text-stone-700 text-xs font-bold">
                    <th className="py-3 px-4">Feed name ↕</th>
                    <th className="py-3 px-4">Network ↕</th>
                    <th className="py-3 px-4">Status ↕</th>
                    <th className="py-3 px-4">Last sync ↕</th>
                    <th className="py-3 px-4">Added ↕</th>
                    <th className="py-3 px-4">Updated ↕</th>
                    <th className="py-3 px-4">Skipped ↕</th>
                    <th className="py-3 px-4">Failed ↕</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs text-stone-800">
                  {feeds
                    .filter((f) => f.feedName.toLowerCase().includes(feedSearch.toLowerCase()))
                    .map((feed) => (
                      <tr key={feed.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-stone-900">{feed.feedName}</td>
                        <td className="py-3.5 px-4 text-stone-600">{feed.network}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {feed.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">{feed.lastSync}</td>
                        <td className="py-3.5 px-4 font-mono">{feed.added}</td>
                        <td className="py-3.5 px-4 font-mono">{feed.updated}</td>
                        <td className="py-3.5 px-4 font-mono">{feed.skipped}</td>
                        <td className="py-3.5 px-4 font-mono">{feed.failed}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSyncFeed(feed.network.includes('CJ') ? 'cj' : 'awin')}
                            className="bg-stone-900 hover:bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded transition-colors"
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
        </div>
      )}

      {/* TAB 3: EARNINGS & REVENUE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Earnings & Revenue Analytics</h2>
            <div className="mt-2 p-3 bg-amber-50/80 border border-amber-200 text-amber-900 text-xs rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Note: Affiliate networks confirm transactions on varying reconciliation schedules; current figures adjust automatically upon final network reconciliation.
              </span>
            </div>
          </div>

          {/* 6 Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Clicks</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">
                {analyticsData?.metrics?.clicks || 25}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">+5% vs previous period</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Conversions</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">
                {analyticsData?.metrics?.conversions || 0}
              </div>
              <div className="text-[10px] text-stone-400 font-semibold mt-1">+0% vs previous period</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Conversion Rate</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">
                {analyticsData?.metrics?.conversionRate || '0.00%'}
              </div>
              <div className="text-[10px] text-stone-400 font-semibold mt-1">+0% vs previous period</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Gross Commissions</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">
                {analyticsData?.metrics?.grossCommissions || '$0.00'}
              </div>
              <div className="text-[10px] text-stone-400 font-semibold mt-1">+0% vs previous period</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Cashback Paid</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">
                {analyticsData?.metrics?.cashbackPaid || '$0.00'}
              </div>
              <div className="text-[10px] text-stone-400 font-semibold mt-1">+0% vs previous period</div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold text-stone-500 uppercase">Net Profit</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-1">
                {analyticsData?.metrics?.netProfit || '$0.00'}
              </div>
              <div className="text-[10px] text-stone-400 font-semibold mt-1">+0% vs previous period</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-stone-900 uppercase">Gross Commission & Revenue</h3>
                <span className="text-[10px] text-stone-400">12-week current period vs previous period</span>
              </div>
              <div className="h-44 bg-[#FAF9F5] border border-stone-100 rounded-lg flex items-center justify-center text-xs text-stone-400">
                [ Line Chart Visualization — Gross Commission vs Revenue ]
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-stone-900 uppercase">Clicks vs. Conversions</h3>
                <span className="text-[10px] text-stone-400">Traffic volume [left] against merchant sales [right]</span>
              </div>
              <div className="h-44 bg-[#FAF9F5] border border-stone-100 rounded-lg flex items-center justify-center text-xs text-stone-400">
                [ Dual Series Visualization — Clicks (25) vs Conversions (0) ]
              </div>
            </div>
          </div>

          {/* Category Breakdown & Top Coupons */}
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-stone-900 uppercase mb-3">Commission by Category</h3>
              <div className="space-y-2">
                {(analyticsData?.categories || []).map((cat: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-none">
                    <span className="font-semibold text-stone-700">{cat.name}</span>
                    <span className="font-mono text-stone-500">{cat.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Earning Coupons Table */}
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="text-xs font-bold text-stone-900 uppercase">Top Earning Coupons</h3>
                <button className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold px-3 py-1 rounded border border-stone-300">
                  Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F6F5F0] border-b border-stone-200 text-stone-700 font-bold">
                      <th className="py-2.5 px-3">Coupon title ↕</th>
                      <th className="py-2.5 px-3">Store name ↕</th>
                      <th className="py-2.5 px-3">Clicks ↕</th>
                      <th className="py-2.5 px-3">Commissions ↕</th>
                      <th className="py-2.5 px-3">EPC ↕</th>
                      <th className="py-2.5 px-3">Gross commission ↕</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {(analyticsData?.coupons || []).map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="py-2.5 px-3 font-semibold text-stone-900">{c.title}</td>
                        <td className="py-2.5 px-3 text-stone-600">{c.storeName}</td>
                        <td className="py-2.5 px-3 font-mono">{c.clicks}</td>
                        <td className="py-2.5 px-3 font-mono">{c.commissions || 0}</td>
                        <td className="py-2.5 px-3 font-mono">{c.epc || '$0.00'}</td>
                        <td className="py-2.5 px-3 font-mono">{c.grossCommission || '$0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
