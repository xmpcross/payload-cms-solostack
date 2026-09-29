import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { ArrowRight, Camera, Headphones, Lightbulb, Mic, Armchair, CheckCircle2 } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { FAQSection, type FAQItem } from '@/components/FAQSection'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://solostack.au'
const PAGE_URL = `${SITE_URL}/best-gear`
const TITLE = 'Best Gear for Solo Creators (2026): Mics, Cameras, Lighting & Desk'
const DESCRIPTION =
  'A practical buying guide to the gear solo creators and one-person businesses actually need: microphones, cameras, lighting, audio and an ergonomic desk setup, with what to buy first and what to skip.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: 'article', siteName: 'SoloStack' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const FAQS: FAQItem[] = [
  {
    question: 'What is the best microphone for a solo podcaster or video creator?',
    answer:
      'A dynamic XLR microphone such as the Shure SM7B is a proven choice because it rejects room noise and echo well, which suits untreated home rooms. It needs an audio interface or preamp with plenty of clean gain. If you want plug-and-play, a good USB dynamic microphone is the simpler alternative.',
  },
  {
    question: 'Do I need an expensive camera to make good videos?',
    answer:
      'No. Lighting and audio have a bigger effect on perceived quality than the camera. A recent smartphone or an entry-level mirrorless camera with a decent lens, good light and clean sound will look better than a high-end camera in a dim room.',
  },
  {
    question: 'What should I buy first on a small budget?',
    answer:
      'Audio first, then lighting, then camera. Viewers tolerate average video but not poor sound. A quality microphone, a soft key light near your face and a stable place to sit will improve your content more than any camera upgrade.',
  },
  {
    question: 'Is an ergonomic chair really worth the money for a one-person business?',
    answer:
      'If you sit for six or more hours a day, yes. Your body is the one piece of equipment you cannot replace. Look for adjustable lumbar support, seat depth and armrests, and try to test a chair or check the return policy before committing.',
  },
  {
    question: 'How do I find discounts on creator gear?',
    answer:
      'Check the SoloStack deals page for current coupon codes on software and gear, buy from authorised retailers, and watch for seasonal sales. Manufacturer refurbished units often carry the full warranty at a lower price.',
  },
]

const SECTIONS = [
  {
    id: 'audio',
    icon: Mic,
    heading: 'Microphones: Buy Audio Quality First',
    intro:
      'Clear sound is the single biggest upgrade for podcasts, courses, calls and video. Viewers forgive average visuals far more readily than muffled or echoey audio.',
    points: [
      ['Dynamic vs condenser', 'Dynamic microphones pick up less room noise, which suits untreated home offices. Condensers capture more detail but need a quiet, treated space.'],
      ['XLR vs USB', 'XLR gives you upgrade room and better sound but needs an audio interface. USB is cheaper and simpler to start with.'],
      ['Position matters more than price', 'Keep the microphone a few centimetres from your mouth, slightly off-axis, with a pop filter. A mid-range mic used well beats an expensive one used badly.'],
    ],
  },
  {
    id: 'camera',
    icon: Camera,
    heading: 'Cameras: Start With What You Have',
    intro:
      'A modern smartphone shoots excellent video. Upgrade to a mirrorless camera only when you hit a real limit such as low-light performance or lens choice.',
    points: [
      ['Stabilise the shot', 'A tripod or fixed mount removes the amateur look immediately.'],
      ['Eye level and framing', 'Place the lens at eye level, leave a little headroom and keep the background tidy.'],
      ['Record locally', 'Where possible record on-device rather than compressing over a call, so you keep full quality for editing.'],
    ],
  },
  {
    id: 'lighting',
    icon: Lightbulb,
    heading: 'Lighting: The Cheapest Big Improvement',
    intro:
      'Good lighting makes budget cameras look professional. One soft light source positioned correctly outperforms an expensive camera in poor light.',
    points: [
      ['Soft key light', 'Place a diffused light slightly above and to one side of your face, at about 45 degrees.'],
      ['Use a window', 'Face natural light where possible and avoid sitting with a bright window behind you.'],
      ['Add separation', 'A small background or accent light adds depth and stops you blending into the wall.'],
    ],
  },
  {
    id: 'audio-monitoring',
    icon: Headphones,
    heading: 'Headphones and Monitoring',
    intro:
      'Closed-back headphones let you hear exactly what your microphone captures and prevent sound leaking into the recording.',
    points: [
      ['Closed-back for recording', 'They keep playback out of your microphone.'],
      ['Comfort over hours', 'Long editing sessions make weight and ear-cup comfort matter as much as sound.'],
    ],
  },
  {
    id: 'desk',
    icon: Armchair,
    heading: 'Desk and Chair: Protect Your Body',
    intro:
      'For a business that depends on one person, comfort is a productivity issue. Chair, desk height and monitor position affect focus over long days.',
    points: [
      ['Chair', 'Look for adjustable lumbar support, seat depth and armrests.'],
      ['Monitor height', 'The top of the screen should sit at or slightly below eye level, about an arm’s length away.'],
      ['Move regularly', 'A sit-stand desk helps only if you actually change position through the day.'],
    ],
  },
]

async function getFeaturedGear() {
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({ collection: 'hardware', limit: 12, depth: 0, sort: 'createdAt' })
    return res.docs as any[]
  } catch (error) {
    console.warn('Featured gear fetch error on /best-gear:', error)
    return []
  }
}

const specText = (specs: any): string =>
  Array.isArray(specs)
    ? specs.map((s: any) => (typeof s === 'string' ? s : s?.spec)).filter(Boolean).join(' • ')
    : typeof specs === 'string'
      ? specs
      : ''

export default async function BestGearPage() {
  const gear = await getFeaturedGear()

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: TITLE,
      description: DESCRIPTION,
      mainEntityOfPage: PAGE_URL,
      author: { '@type': 'Organization', name: 'SoloStack' },
      publisher: { '@type': 'Organization', name: 'SoloStack' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Best Gear', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ]

  return (
    <div className="pt-20 pb-24 container max-w-4xl mx-auto px-4">
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:underline">Home</Link> <span aria-hidden>/</span> <span>Best Gear</span>
      </nav>

      <header className="space-y-4 mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Best Gear for Solo Creators (2026)
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          You do not need a studio to produce professional content. This guide covers the microphones, cameras, lighting
          and desk setup that make the biggest difference for one-person businesses, in the order worth buying them.
        </p>
      </header>

      <aside className="rounded-xl border bg-muted/30 p-5 mb-10">
        <h2 className="text-base font-bold mb-3">Quick answer: what to buy, in order</h2>
        <ol className="space-y-2 text-sm">
          {['Microphone and headphones', 'A soft key light', 'A stable camera setup (your phone may be enough)', 'An ergonomic chair and correct monitor height'].map((item, i) => (
            <li key={item} className="flex gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <nav aria-label="On this page" className="mt-4 flex flex-wrap gap-2 text-xs">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-full border px-2.5 py-1 hover:bg-muted">{s.heading.split(':')[0]}</a>
          ))}
        </nav>
      </aside>

      {gear.length > 0 && (
        <section aria-labelledby="picks" className="mb-12">
          <h2 id="picks" className="text-2xl font-bold tracking-tight mb-4">Gear We Recommend</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {gear.map((item) => (
              <article key={item.id} className="rounded-xl border bg-card p-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.manufacturer}</p>
                <h3 className="text-lg font-bold">{item.name}</h3>
                {specText(item.specs) && <p className="text-sm text-muted-foreground">{specText(item.specs)}</p>}
                {item.priceRange && <p className="text-sm font-semibold">Typical price: {item.priceRange}</p>}
                {item.verdict && typeof item.verdict === 'string' && <p className="text-sm">{item.verdict}</p>}
              </article>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Prices are typical ranges and change often; check the retailer before buying.
          </p>
        </section>
      )}

      {SECTIONS.map((section) => {
        const Icon = section.icon
        return (
          <section key={section.id} id={section.id} className="mb-12 scroll-mt-24" aria-labelledby={`${section.id}-h`}>
            <h2 id={`${section.id}-h`} className="flex items-center gap-2.5 text-2xl font-bold tracking-tight mb-3">
              <Icon className="h-6 w-6 text-amber-500" aria-hidden />
              {section.heading}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{section.intro}</p>
            <ul className="space-y-3">
              {section.points.map(([label, text]) => (
                <li key={label} className="flex gap-2.5">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" aria-hidden />
                  <span className="leading-relaxed">
                    <strong>{label}.</strong> {text}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <section className="rounded-xl border bg-card p-6 mb-12">
        <h2 className="text-xl font-bold mb-2">Pair Your Gear With the Right Software</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Good hardware is half the setup. Browse the software we use to record, edit and run a one-person business, and
          check current discounts before you buy.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Software directory <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/deals" className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">
            Current deals and coupons <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/stacks" className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">
            Stack blueprints <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <FAQSection title="Creator Gear FAQ" items={FAQS} />

      <p className="text-xs text-muted-foreground mt-8">
        SoloStack is reader-supported. Some links may earn us a commission at no extra cost to you. See our{' '}
        <Link href="/affiliate-disclosure" className="underline">affiliate disclosure</Link>.
      </p>
    </div>
  )
}
