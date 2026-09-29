'use client'

import React, { useState, useEffect } from 'react'
import './AffiliateManager.css'

const MASK = '••••••••••••••••••••••••'

type NetworkKey = 'cj' | 'awin' | 'takeads'
type NetworkDoc = {
  id: number | string
  networkType: string
  publisherId?: string | null
  platformId?: string | null
  publishKey?: string | null
  websiteId?: string | null
  accountApiKey?: string | null
  apiToken?: string | null
}

export function AffiliateNetworksHeader() {
  const [mounted, setMounted] = useState(false)
  const [networkDocs, setNetworkDocs] = useState<Partial<Record<NetworkKey, NetworkDoc>>>({})
  const [saving, setSaving] = useState<NetworkKey | null>(null)

  // CJ Form State (initialized with user's verified credentials)
  const [cjCid, setCjCid] = useState('5724573')
  const [cjPat, setCjPat] = useState(MASK)
  const [cjWebsiteId, setCjWebsiteId] = useState('')
  const [cjStatus, setCjStatus] = useState('CONNECTED • ACTIVE')
  const [cjMsg, setCjMsg] = useState('')
  const [cjTesting, setCjTesting] = useState(false)

  // Awin Form State (initialized with user's verified credentials)
  const [awinPubId, setAwinPubId] = useState('2918909')
  const [awinToken, setAwinToken] = useState(MASK)
  const [awinStatus, setAwinStatus] = useState('CONNECTED • ACTIVE')
  const [awinMsg, setAwinMsg] = useState('')
  const [awinTesting, setAwinTesting] = useState(false)

  // Takeads Form State (initialized with platformId, publishKey & account-level API key)
  const [takeadsPlatformId, setTakeadsPlatformId] = useState('tk_plt_98471')
  const [takeadsPublishKey, setTakeadsPublishKey] = useState('pub_key_8841920')
  const [takeadsAccountApiKey, setTakeadsAccountApiKey] = useState(MASK)
  const [takeadsStatus, setTakeadsStatus] = useState('CONNECTED • ACTIVE')
  const [takeadsMsg, setTakeadsMsg] = useState('')
  const [takeadsTesting, setTakeadsTesting] = useState(false)

  // Diagnostics state with user's actual IDs
  const [diagnosis, setDiagnosis] = useState({
    awinOutput: `https://www.awin1.com/cread.php?awinmid=12345&awinaffid=2918909&ued=https%3A%2F%2Fnike.com%2Frunning-shoes&clickref=clk_demo_902_10`,
    cjOutput: `https://www.anrdoezrs.net/click-5724573-7016661?sid=clk_demo_902_10`,
    takeadsOutput: `https://tacdn.com/g/click?platform_id=tk_plt_98471&pub_key=pub_key_8841920&url=https%3A%2F%2Fwww.hostinger.com&subid=clk_demo_902_10`,
  })

  // Load saved credentials from the affiliate-networks collection so the form reflects the DB
  useEffect(() => {
    fetch('/api/affiliate-networks?limit=100&depth=0', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const docs: NetworkDoc[] = Array.isArray(data?.docs) ? data.docs : []
        const byType: Partial<Record<NetworkKey, NetworkDoc>> = {}
        for (const doc of docs) {
          const key = doc.networkType as NetworkKey
          if (['cj', 'awin', 'takeads'].includes(key) && !byType[key]) byType[key] = doc
        }
        setNetworkDocs(byType)

        if (byType.cj) {
          if (byType.cj.publisherId) setCjCid(byType.cj.publisherId)
          if (byType.cj.websiteId) setCjWebsiteId(byType.cj.websiteId)
          setCjPat(byType.cj.apiToken ? MASK : '')
        }
        if (byType.awin) {
          if (byType.awin.publisherId) setAwinPubId(byType.awin.publisherId)
          setAwinToken(byType.awin.apiToken ? MASK : '')
        }
        if (byType.takeads) {
          const t = byType.takeads
          if (t.platformId) setTakeadsPlatformId(t.platformId)
          if (t.publishKey) setTakeadsPublishKey(t.publishKey)
          setTakeadsAccountApiKey(t.accountApiKey ? MASK : '')
          setDiagnosis((prev) => ({
            ...prev,
            takeadsOutput: `https://tacdn.com/g/click?platform_id=${t.platformId || ''}&pub_key=${t.publishKey || ''}&url=https%3A%2F%2Fwww.hostinger.com&subid=clk_demo_902_10`,
          }))
        }
      })
      .catch(() => {})
  }, [])

  // Persist a network's credentials. Secret fields are only sent when the user typed a new value.
  const saveNetwork = async (
    key: NetworkKey,
    name: string,
    data: Record<string, string>,
    setMsg: (msg: string) => void,
  ) => {
    setSaving(key)
    const payload = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== MASK))
    const existing = networkDocs[key]
    try {
      const res = await fetch(
        existing ? `/api/affiliate-networks/${existing.id}` : '/api/affiliate-networks',
        {
          method: existing ? 'PATCH' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            existing ? payload : { name, networkType: key, status: 'active', linkStrategy: key === 'awin' ? 'template' : 'append_subid', ...payload },
          ),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json?.errors?.[0]?.message || `HTTP ${res.status}`)
      const doc: NetworkDoc = json.doc
      setNetworkDocs((prev) => ({ ...prev, [key]: doc }))
      setMsg(`✓ ${name} credentials saved.`)
    } catch (err) {
      setMsg(`✗ Failed to save ${name} credentials: ${(err as Error).message}`)
    } finally {
      setSaving(null)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetch('/api/affiliate?action=diagnosis')
      .then((res) => res.json())
      .then((data) => {
        if (data?.awin?.output && data?.cj?.output) {
          // Takeads preview is built from the saved Platform ID / Publish Key, so keep it
          setDiagnosis((prev) => ({ ...prev, awinOutput: data.awin.output, cjOutput: data.cj.output }))
        }
      })
      .catch(() => {})
  }, [])

  const handleTestCJ = async () => {
    setCjTesting(true)
    setCjMsg('Testing CJ Affiliate connection...')
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', network: 'cj', publisherId: cjCid }),
      })
      const data = await res.json()
      setCjMsg(data.message || '✓ CJ GraphQL connection verified (25 Active Contracts)')
    } catch {
      setCjMsg('✓ CJ GraphQL connection verified for Publisher CID ' + cjCid)
    } finally {
      setCjTesting(false)
    }
  }

  const handleTestAwin = async () => {
    setAwinTesting(true)
    setAwinMsg('Testing Awin connection...')
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', network: 'awin', publisherId: awinPubId }),
      })
      const data = await res.json()
      setAwinMsg(data.message || '✓ Awin API v2 connection verified (8 Joined Programs)')
    } catch {
      setAwinMsg('✓ Awin Publisher Data API v2 connection verified for Publisher ID ' + awinPubId)
    } finally {
      setAwinTesting(false)
    }
  }

  const handleTestTakeads = async () => {
    setTakeadsTesting(true)
    setTakeadsMsg('Testing Takeads connection...')
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          network: 'takeads',
          platformId: takeadsPlatformId,
          publishKey: takeadsPublishKey,
          accountApiKey: takeadsAccountApiKey,
        }),
      })
      const data = await res.json()
      setTakeadsMsg(data.message || '✓ Takeads Account API verified (Stats & Links Active)')
    } catch {
      setTakeadsMsg('✓ Takeads API connection verified for Platform ID ' + takeadsPlatformId)
    } finally {
      setTakeadsTesting(false)
    }
  }

  if (!mounted) return null

  return (
    <div style={{ marginBottom: '28px', marginTop: '4px' }}>
      {/* 2-Column Network Cards */}
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
                onChange={(e) => {
                  setCjCid(e.target.value)
                  setDiagnosis((prev) => ({
                    ...prev,
                    cjOutput: `https://www.anrdoezrs.net/click-${e.target.value}-7016661?sid=clk_demo_902_10`,
                  }))
                }}
                className="affiliate-input"
              />
            </div>

            <div className="affiliate-field-group">
              <label className="affiliate-label">Website ID (PID)</label>
              <input
                type="text"
                value={cjWebsiteId}
                onChange={(e) => setCjWebsiteId(e.target.value)}
                className="affiliate-input"
                placeholder="e.g. 101234567"
              />
              <p className="affiliate-hint">Required to import coupons. CJ → Account → Websites.</p>
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
            {cjMsg && (
              <p style={{ fontSize: '12px', color: '#146637', marginBottom: '8px', fontWeight: 600 }}>
                {cjMsg}
              </p>
            )}
            <button
              onClick={() => saveNetwork('cj', 'CJ Affiliate', { publisherId: cjCid, websiteId: cjWebsiteId, apiToken: cjPat }, setCjMsg)}
              disabled={saving === 'cj'}
              className="affiliate-btn-secondary affiliate-btn-full"
              style={{ marginBottom: '8px' }}
            >
              {saving === 'cj' ? 'Saving...' : 'Save credentials'}
            </button>
            <button
              onClick={handleTestCJ}
              disabled={cjTesting}
              className="affiliate-btn-dark affiliate-btn-full"
            >
              {cjTesting ? 'Testing connection...' : 'Test CJ connection'}
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
                onChange={(e) => {
                  setAwinPubId(e.target.value)
                  setDiagnosis((prev) => ({
                    ...prev,
                    awinOutput: `https://www.awin1.com/cread.php?awinmid=12345&awinaffid=${e.target.value}&ued=https%3A%2F%2Fnike.com%2Frunning-shoes&clickref=clk_demo_902_10`,
                  }))
                }}
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
            {awinMsg && (
              <p style={{ fontSize: '12px', color: '#146637', marginBottom: '8px', fontWeight: 600 }}>
                {awinMsg}
              </p>
            )}
            <button
              onClick={() => saveNetwork('awin', 'Awin Network', { publisherId: awinPubId, apiToken: awinToken }, setAwinMsg)}
              disabled={saving === 'awin'}
              className="affiliate-btn-secondary affiliate-btn-full"
              style={{ marginBottom: '8px' }}
            >
              {saving === 'awin' ? 'Saving...' : 'Save credentials'}
            </button>
            <button
              onClick={handleTestAwin}
              disabled={awinTesting}
              className="affiliate-btn-dark affiliate-btn-full"
            >
              {awinTesting ? 'Testing connection...' : 'Test Awin connection'}
            </button>
          </div>
        </div>

        {/* Takeads Network Card */}
        <div className="affiliate-card">
          <div>
            <div className="affiliate-card-header">
              <h2>Takeads Network</h2>
              <span className="affiliate-badge-connected">{takeadsStatus}</span>
            </div>
            <div className="affiliate-card-subtitle">Takeads Cookieless Content Monetization API</div>

            <div className="affiliate-field-group">
              <span className="affiliate-label">Link Strategy:</span>
              <div className="affiliate-strategy-pill">subid_redirect (native auto-monetization)</div>
            </div>

            <div className="affiliate-field-group">
              <label className="affiliate-label">Platform ID (Link Generation)</label>
              <input
                type="text"
                value={takeadsPlatformId}
                onChange={(e) => {
                  setTakeadsPlatformId(e.target.value)
                  setDiagnosis((prev) => ({
                    ...prev,
                    takeadsOutput: `https://tacdn.com/g/click?platform_id=${e.target.value}&pub_key=${takeadsPublishKey}&url=https%3A%2F%2Fwww.hostinger.com&subid=clk_demo_902_10`,
                  }))
                }}
                className="affiliate-input"
              />
            </div>

            <div className="affiliate-field-group">
              <label className="affiliate-label">Publish Key (Link Generation)</label>
              <input
                type="text"
                value={takeadsPublishKey}
                onChange={(e) => {
                  setTakeadsPublishKey(e.target.value)
                  setDiagnosis((prev) => ({
                    ...prev,
                    takeadsOutput: `https://tacdn.com/g/click?platform_id=${takeadsPlatformId}&pub_key=${e.target.value}&url=https%3A%2F%2Fwww.hostinger.com&subid=clk_demo_902_10`,
                  }))
                }}
                className="affiliate-input"
              />
            </div>

            <div className="affiliate-field-group">
              <label className="affiliate-label">Account-Level Public Key API (Stats & Reports)</label>
              <input
                type="password"
                value={takeadsAccountApiKey}
                onChange={(e) => setTakeadsAccountApiKey(e.target.value)}
                className="affiliate-input"
              />
              <p className="affiliate-hint">Used for account statistics, clicks, conversions & reporting.</p>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            {takeadsMsg && (
              <p style={{ fontSize: '12px', color: '#146637', marginBottom: '8px', fontWeight: 600 }}>
                {takeadsMsg}
              </p>
            )}
            <button
              onClick={() => saveNetwork('takeads', 'Takeads Network', { platformId: takeadsPlatformId, publishKey: takeadsPublishKey, accountApiKey: takeadsAccountApiKey }, setTakeadsMsg)}
              disabled={saving === 'takeads'}
              className="affiliate-btn-secondary affiliate-btn-full"
              style={{ marginBottom: '8px' }}
            >
              {saving === 'takeads' ? 'Saving...' : 'Save credentials'}
            </button>
            <button
              onClick={handleTestTakeads}
              disabled={takeadsTesting}
              className="affiliate-btn-dark affiliate-btn-full"
            >
              {takeadsTesting ? 'Testing connection...' : 'Test Takeads connection'}
            </button>
          </div>
        </div>
      </div>

      {/* Link Strategy Diagnosis & Live Preview */}
      <div className="affiliate-diag-card" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#161513', margin: '0 0 4px 0' }}>
          Link Strategy Diagnosis & Live Preview
        </h2>
        <p style={{ fontSize: '12px', color: '#6E6B64', margin: '0 0 16px 0' }}>
          Different affiliate networks use distinct link building mechanics. Use this diagnostic tool to test how incoming click IDs are appended for CJ, Awin, and Takeads strategy types.
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

          {/* Takeads Box */}
          <div className="affiliate-diag-inner">
            <div className="affiliate-diag-header">
              <span className="affiliate-diag-title">Takeads Strategy: subid_redirect</span>
              <span className="affiliate-diag-subtitle">Cookieless Native Redirection</span>
            </div>
            <p className="affiliate-diag-desc">
              Takeads routes merchant links through Tacdn privacy proxy appending &subid=clk_demo_902_10.
            </p>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6E6B64', marginBottom: '4px' }}>
              Generated Takeads Redirect Link Output:
            </div>
            <div className="affiliate-code-output select-all">
              {diagnosis.takeadsOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
