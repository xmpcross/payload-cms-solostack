'use client'

import React from 'react'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export function DashboardNavLink() {
  return (
    <div
      style={{
        padding: '0 0 10px 0',
        marginBottom: '10px',
        borderBottom: '1px solid var(--theme-elevation-150, #E5E1D6)',
      }}
    >
      <Link
        href="https://solostack.au/admin"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-elevation-900, #1F1E1B)',
          backgroundColor: 'var(--theme-elevation-100, #F4F1EA)',
          textDecoration: 'none',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-elevation-200, #EAE6DC)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #F4F1EA)'
        }}
      >
        <LayoutDashboard style={{ width: '16px', height: '16px', flexShrink: 0 }} />
        <span>Dashboard</span>
      </Link>
    </div>
  )
}
