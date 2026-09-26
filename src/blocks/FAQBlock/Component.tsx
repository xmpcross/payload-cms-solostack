import React from 'react'
import { FAQSection, type FAQItem } from '@/components/FAQSection'

export interface FAQBlockProps {
  title?: string
  items?: FAQItem[]
  disableInnerContainer?: boolean
}

export const FAQBlockComponent: React.FC<FAQBlockProps> = ({
  title = 'Frequently Asked Questions',
  items = [],
  disableInnerContainer,
}) => {
  if (!items || items.length === 0) return null

  return (
    <div className={disableInnerContainer ? '' : 'container'}>
      <div className="max-w-4xl mx-auto">
        <FAQSection title={title} items={items} className="my-8" />
      </div>
    </div>
  )
}
