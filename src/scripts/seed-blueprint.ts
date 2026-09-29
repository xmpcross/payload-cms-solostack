// @ts-nocheck
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function seedBlueprint() {
  const payload = await getPayload({ config })

  console.log('Seeding B2B SaaS Creator Blueprint data...')

  // 1. Seed Categories
  const categoriesList = [
    { title: 'Creator Media Lab', slug: 'creator-media-lab' },
    { title: 'Solopreneur Operations', slug: 'solopreneur-operations' },
    { title: 'AI & Automation', slug: 'ai-automation' },
    { title: 'Stack Blueprints', slug: 'stacks' },
  ]

  const categoryDocs: Record<string, any> = {}
  for (const cat of categoriesList) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
    })
    if (existing.docs.length > 0) {
      categoryDocs[cat.title] = existing.docs[0]
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: { title: cat.title, slug: cat.slug },
      })
      categoryDocs[cat.title] = created
      console.log(`Created Category: ${cat.title}`)
    }
  }

  // 2. Seed Tools
  const sampleTools = [
    {
      name: 'Riverside.fm',
      slug: 'riverside-fm',
      tagline: 'Studio-quality 4K local recording for podcasts and remote video interviews.',
      pricingType: 'freemium',
      startingPrice: '$15/mo',
      affiliateUrl: 'https://impact.com/riverside-ref',
      rating: 5,
      pros: [{ pro: 'Local 4K video and lossless audio recording' }, { pro: 'AI transcript and text-based video editing' }],
      cons: [{ con: 'Requires stable local storage space on guest browser' }],
      summary: 'The gold standard for recording remote podcasts and video interviews with uncompressed local multi-track recordings.',
    },
    {
      name: 'Descript',
      slug: 'descript',
      tagline: 'All-in-one AI audio and video editing that works like a doc.',
      pricingType: 'freemium',
      startingPrice: '$12/mo',
      affiliateUrl: 'https://impact.com/descript-ref',
      rating: 4.8,
      pros: [{ pro: 'Text-based video and audio editing' }, { pro: 'One-click AI filler word removal and Studio Sound' }],
      cons: [{ con: 'Export rendering can occasionally lag on complex timelines' }],
      summary: 'Essential tool for creators editing podcasts, YouTube videos, and short-form clips directly by editing text transcripts.',
    },
    {
      name: 'Bonsai',
      slug: 'bonsai',
      tagline: 'All-in-one business management for freelancers and small agencies.',
      pricingType: 'paid',
      startingPrice: '$25/mo',
      affiliateUrl: 'https://impact.com/bonsai-ref',
      rating: 4.9,
      pros: [{ pro: 'Integrated contracts, proposals, and invoicing' }, { pro: 'Automated client payment reminders' }],
      cons: [{ con: 'No free tier available' }],
      summary: 'Comprehensive operational portal replacing separate invoicing, contract signature, and client management tools.',
    },
    {
      name: 'Make.com',
      slug: 'make-com',
      tagline: 'Visual automation platform for connecting apps and building workflows.',
      pricingType: 'freemium',
      startingPrice: '$9/mo',
      affiliateUrl: 'https://partnerstack.com/make-ref',
      rating: 4.9,
      pros: [{ pro: '70% cheaper than Zapier for high-volume tasks' }, { pro: 'Visual scenario builder with error handling' }],
      cons: [{ con: 'Slightly steeper learning curve than Zapier' }],
      summary: 'The top choice for solopreneurs building zero-employee automation pipelines across Webflow, Notion, and email services.',
    },
    {
      name: 'Canva Pro',
      slug: 'canva-pro',
      tagline: 'Visual suite for designing presentations, YouTube thumbnails, and social assets.',
      pricingType: 'freemium',
      startingPrice: '$13/mo',
      affiliateUrl: 'https://impact.com/canva-ref',
      rating: 4.9,
      pros: [{ pro: 'Massive template library and brand kit management' }, { pro: 'AI background remover and Magic Resize' }],
      cons: [{ con: 'Advanced vector graphic editing is limited compared to Illustrator' }],
      summary: 'The fastest design tool for solo creators producing YouTube thumbnails, brand assets, and marketing graphics.',
    },
  ]

  const toolDocs: Record<string, any> = {}
  for (const tool of sampleTools) {
    const existing = await payload.find({
      collection: 'tools',
      where: { slug: { equals: tool.slug } },
    })
    if (existing.docs.length > 0) {
      toolDocs[tool.slug] = existing.docs[0]
    } else {
      const created = await payload.create({
        collection: 'tools',
        data: tool as any,
      })
      toolDocs[tool.slug] = created
      console.log(`Created Tool: ${tool.name}`)
    }
  }

  // 3. Seed Hardware
  const sampleHardware = [
    {
      name: 'Shure SM7B',
      slug: 'shure-sm7b',
      manufacturer: 'Shure',
      retailUrl: 'https://skimlinks.com/shure-sm7b-auction',
      priceRange: '$399 - $449',
      specs: [{ spec: 'Dynamic Cardioid Microphone' }, { spec: 'Flat, wide-range frequency response' }, { spec: 'XLR Connection' }],
      verdict: 'The industry benchmark vocal microphone for podcasters, YouTubers, and broadcast professionals.',
    },
    {
      name: 'Herman Miller Embody',
      slug: 'herman-miller-embody',
      manufacturer: 'Herman Miller',
      retailUrl: 'https://skimlinks.com/herman-miller-embody-auction',
      priceRange: '$1,500 - $1,800',
      specs: [{ spec: 'Pixelated Support Matrix' }, { spec: 'Fully adjustable armrests and seat depth' }, { spec: '12-year warranty' }],
      verdict: 'The premier ergonomic chair for remote operators spending 8+ hours a day at a workstation.',
    },
  ]

  const hardwareDocs: Record<string, any> = {}
  for (const hw of sampleHardware) {
    const existing = await payload.find({
      collection: 'hardware',
      where: { slug: { equals: hw.slug } },
    })
    if (existing.docs.length > 0) {
      hardwareDocs[hw.slug] = existing.docs[0]
    } else {
      const created = await payload.create({
        collection: 'hardware',
        data: hw as any,
      })
      hardwareDocs[hw.slug] = created
      console.log(`Created Hardware: ${hw.name}`)
    }
  }

  // 4. Seed Stack Blueprint
  const existingStack = await payload.find({
    collection: 'stacks',
    where: { slug: { equals: '1-person-youtube-studio' } },
  })

  if (existingStack.docs.length === 0) {
    await payload.create({
      collection: 'stacks',
      data: {
        title: 'The 1-Person YouTube Studio Stack',
        slug: '1-person-youtube-studio',
        businessModel: 'creator',
        description: 'Complete production workflow for recording, editing, thumbnail creation, and publishing high-performing YouTube videos solo.',
        tools: [
          toolDocs['riverside-fm']?.id,
          toolDocs['descript']?.id,
          toolDocs['canva-pro']?.id,
        ].filter(Boolean),
        hardware: [
          hardwareDocs['shure-sm7b']?.id,
        ].filter(Boolean),
        monthlySoftwareCost: '$40/mo',
      } as any,
    })
    console.log('Created Stack Blueprint: The 1-Person YouTube Studio Stack')
  }

  console.log('Seeding completed successfully!')
  process.exit(0)
}

seedBlueprint().catch((err) => {
  console.error('Seeding error:', err)
  process.exit(1)
})
