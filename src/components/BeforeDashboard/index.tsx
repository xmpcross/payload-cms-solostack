import React from 'react'
import AffiliateManager from '@/components/admin/AffiliateManager'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <AffiliateManager />
    </div>
  )
}

export default BeforeDashboard
