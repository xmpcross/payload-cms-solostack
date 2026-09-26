'use client'

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export interface FAQItem {
  question: string
  answer: string
}

export const FAQSection: React.FC<{
  title?: string
  items: FAQItem[]
  className?: string
}> = ({
  title = 'Frequently Asked Questions',
  items,
  className = '',
}) => {
  if (!items || items.length === 0) return null

  return (
    <section className={`not-prose my-12 ${className}`} aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6"
      >
        {title}
      </h2>
      <div className="border-t border-slate-200 dark:border-neutral-800">
        <Accordion type="multiple" className="w-full">
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
