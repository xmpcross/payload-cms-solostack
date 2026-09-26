import React from 'react'
import Link from 'next/link'
import { ExternalLink, Globe, Tag, Sparkles, SlidersHorizontal } from 'lucide-react'

const BeforeDashboard: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--theme-elevation-50, #FAF8F2)',
        border: '1px solid var(--theme-elevation-150, #E5E1D6)',
        borderRadius: '10px',
        padding: '20px 24px',
        marginBottom: '28px',
        marginTop: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--theme-elevation-900, #161513)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            SoloStack Admin Dashboard
          </h2>
          <span
            style={{
              backgroundColor: '#E2F5EA',
              border: '1px solid #BCE5CE',
              color: '#187742',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Live Site Active
          </span>
        </div>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--theme-elevation-600, #6E6B64)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Manage software directories, solopreneur stacks, hardware reviews, and verified CJ/Awin partner deals.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        {/* Main View Frontend Button */}
        <a
          href="https://solostack.au"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#161513',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            padding: '9px 16px',
            borderRadius: '7px',
            textDecoration: 'none',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.12)',
            transition: 'opacity 0.15s ease',
          }}
        >
          <Globe style={{ width: '15px', height: '15px' }} />
          <span>View Frontend Site</span>
          <ExternalLink style={{ width: '13px', height: '13px', opacity: 0.8 }} />
        </a>

        {/* View /deals page */}
        <a
          href="https://solostack.au/deals"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--theme-elevation-100, #FFFFFF)',
            color: 'var(--theme-elevation-900, #1F1E1B)',
            border: '1px solid var(--theme-elevation-200, #D5D1C5)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: '7px',
            textDecoration: 'none',
            transition: 'background-color 0.15s ease',
          }}
        >
          <Tag style={{ width: '14px', height: '14px', color: '#10B981' }} />
          <span>View /deals Page</span>
          <ExternalLink style={{ width: '12px', height: '12px', opacity: 0.6 }} />
        </a>

        {/* Link to Affiliate Networks */}
        <Link
          href="/admin/collections/affiliate-networks"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--theme-elevation-100, #FFFFFF)',
            color: 'var(--theme-elevation-900, #1F1E1B)',
            border: '1px solid var(--theme-elevation-200, #D5D1C5)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: '7px',
            textDecoration: 'none',
            transition: 'background-color 0.15s ease',
          }}
        >
          <SlidersHorizontal style={{ width: '14px', height: '14px', opacity: 0.7 }} />
          <span>Affiliate Networks</span>
        </Link>
      </div>
    </div>
  )
}

export default BeforeDashboard
