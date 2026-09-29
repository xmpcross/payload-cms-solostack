import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const FAL_KEY = process.env.FAL_KEY

async function generateFalImage(prompt: string, baseFilename: string): Promise<string> {
  const mediaDir = path.resolve(process.cwd(), 'public/media')
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true })
  }

  const outPath = path.join(mediaDir, `${baseFilename}.webp`)

  if (FAL_KEY) {
    try {
      console.log(`Generating fal.ai image for prompt: "${prompt.slice(0, 40)}..."`)
      const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: {
          Authorization: `Key ${FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image_size: 'landscape_16_9',
          num_images: 1,
          enable_safety_checker: true,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const imageUrl = data.images?.[0]?.url
        if (imageUrl) {
          console.log(`Downloaded image from fal.ai: ${imageUrl}`)
          const imgRes = await fetch(imageUrl)
          const arrayBuffer = await imgRes.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          await sharp(buffer).webp({ quality: 85 }).toFile(outPath)
          console.log(`Saved fal.ai image to ${outPath}`)
          return outPath
        }
      } else {
        console.warn(`fal.ai response error (${res.status}): ${await res.text()}`)
      }
    } catch (err) {
      console.warn(`fal.ai fetch failed: ${(err as Error).message}. Falling back to sharp graphic.`)
    }
  }

  // Fallback: Generate clean SVG graphic converted to WebP with sharp
  console.log(`Creating fallback SVG header for ${baseFilename}...`)
  const svg = `
    <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#311042" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <circle cx="900" cy="200" r="300" fill="#6366f1" opacity="0.15" filter="blur(60px)" />
      <circle cx="300" cy="500" r="250" fill="#a855f7" opacity="0.15" filter="blur(60px)" />
      <rect x="80" y="80" width="80" height="6" fill="url(#accent)" rx="3" />
      <text x="80" y="240" font-family="system-ui, sans-serif" font-size="48" font-weight="800" fill="#ffffff">${escapeXml(prompt.slice(0, 45))}</text>
      <text x="80" y="300" font-family="system-ui, sans-serif" font-size="24" font-weight="400" fill="#94a3b8">SoloStack 2026 Industry Blueprint</text>
    </svg>
  `
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outPath)
  return outPath
}

function escapeXml(str: string): string {
  return str.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '"': return '&quot;'
      case "'": return '&apos;'
      default: return c
    }
  })
}

// Lexical AST helper generators
const t = (text: string, format = 0) => ({
  type: 'text',
  detail: 0,
  format, // 0 = normal, 1 = bold, 2 = italic
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const p = (children: any) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
  direction: 'ltr',
  children: Array.isArray(children) ? children : [t(children)],
})

const h = (tag: 'h1' | 'h2' | 'h3' | 'h4', text: string) => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [t(text)],
})

const link = (url: string, text: string, format = 0, newTab = false) => ({
  type: 'link',
  fields: {
    linkType: 'custom',
    newTab,
    url,
  },
  format: '',
  indent: 0,
  version: 3,
  direction: 'ltr',
  children: [t(text, format)],
})

const banner = (style: 'info' | 'warning' | 'error' | 'success', title: string, text: string) => ({
  type: 'block',
  format: '',
  version: 2,
  fields: {
    blockName: title,
    blockType: 'banner',
    style,
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          p([t(`${title}: `, 1), t(text)]),
        ],
      },
    },
  },
})

const ul = (items: any[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: items.map((item, idx) => ({
    type: 'listitem',
    value: idx + 1,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: Array.isArray(item) ? item : [t(item)],
  })),
})

const articlesData = [
  {
    categorySlug: 'creator-media-lab',
    title: "The Solo Creator's 4K Video Editing Pipeline: From Raw Footage to Published Clips",
    slug: 'solo-creator-4k-video-editing-pipeline',
    heroPrompt: 'Cinematic studio video editing suite with ultrawide curved monitor showing color grading scopes, neon ambient lights, high end camera setup',
    imageFilename: 'solo-creator-4k-editing-pipeline',
    metaTitle: "Solo Creator's 4K Video Editing Pipeline (2026 Guide)",
    metaDescription: 'Discover the ultimate zero-bloat 4K video editing workflow for 1-person media labs. Master proxy workflows, AI transcription, and auto-clipping.',
    content: [
      banner('info', '2026 Creator Media Standard', 'Producing high-impact 4K long-form and short-form video content solo requires a streamlined post-production pipeline that eliminates redundant rendering and timeline scrubbing.'),
      h('h2', 'The Shift to Text-Based AI Video Editing'),
      p([
        t('Traditional timeline scrubbing in heavy video editors consumes hours of manual work. For solo creators, adopting '),
        t('text-based video editing platforms', 1),
        t(' like Descript and Riverside transforms video editing into a process as intuitive as editing a text document.'),
      ]),
      p([
        t('By generating accurate AI transcripts immediately after recording, you can instantly slice out filler words, re-order interview segments, and generate multi-angle vertical clips for social platforms without touching raw video keyframes.'),
      ]),
      ul([
        [t('Local Multi-Track Recording: ', 1), t('Record lossless 48kHz WAV audio and uncompressed 4K video locally on each speaker’s device.')],
        [t('AI Auto-Clipping: ', 1), t('Identify peak engagement moments in long-form episodes and extract 9:16 vertical shorts automatically.')],
        [t('Studio Sound Enhancement: ', 1), t('Apply neural noise removal and dynamic range levelling in one click.')],
      ]),
      h('h2', 'Recommended Tooling for Media Operators'),
      p([
        t('Pairing high-performance video recording software like '),
        link('/tools/riverside-fm', 'Riverside.fm', 1),
        t(' with rapid editing tools like '),
        link('/tools/descript', 'Descript', 1),
        t(' allows solo operators to churn out broadcast-grade videos on a weekly cadence.'),
      ]),
      p([
        t('For graphics and thumbnail production, using '),
        link('/tools/canva-pro', 'Canva Pro', 1),
        t(' ensures consistent visual branding with minimal overhead.'),
      ]),
    ],
  },
  {
    categorySlug: 'solopreneur-operations',
    title: 'Building a $50k/Mo Solo Operations Engine: Contracts, Invoicing & Asynchronous Workflows',
    slug: 'building-50k-solo-operations-engine',
    heroPrompt: 'Modern minimalist solopreneur office with digital revenue growth chart on tablet, sleek laptop, clean desk layout, warm morning sunlight',
    imageFilename: 'building-50k-solo-operations-engine',
    metaTitle: 'Building a $50k/Mo Solo Operations Engine (2026 Guide)',
    metaDescription: 'Learn how to scale a high-margin one-person business with automated client onboarding, streamlined invoicing, and async operations.',
    content: [
      banner('success', 'Operational Efficiency', 'Scaling a solo business to $50,000/month requires removing manual client communication and replacing it with automated asynchronous portals.'),
      h('h2', 'The Asynchronous Solopreneur Operating System'),
      p([
        t('The biggest bottleneck for solo founders is trading time for administrative tasks. From drafting customized proposals to chasing unpaid invoices, operational drag severely limits revenue potential.'),
      ]),
      p([
        t('By building an automated operations stack, you establish transparent expectations, automate payment collections, and deliver project milestones on autopilot.'),
      ]),
      ul([
        [t('Self-Serve Onboarding: ', 1), t('Automate intake forms, contract execution, and initial deposit collection upon booking.')],
        [t('Recurring Retainers: ', 1), t('Utilize automated credit card charges or direct ACH billing to maintain predictable cash flow.')],
        [t('Client Portals: ', 1), t('Centralize task progress, asset delivery, and feedback loops into a unified dashboard.')],
      ]),
      h('h2', 'Essential Tools for Solo Founders'),
      p([
        t('Using integrated business management platforms like '),
        link('/tools/bonsai', 'Bonsai', 1),
        t(' replaces separate contract signature, invoicing, and time-tracking tools with a single unified system.'),
      ]),
      p([
        t('Combined with automated scheduling and payment integrations, solopreneurs can focus 90% of their energy on core client deliverables.'),
      ]),
    ],
  },
  {
    categorySlug: 'ai-automation',
    title: 'Zero-Code AI Orchestration for Solopreneurs: Connecting Make.com, OpenAI & Webhooks',
    slug: 'zero-code-ai-orchestration-solopreneurs',
    heroPrompt: 'Abstract futuristic 3D network nodes connecting glowing data pathways, deep blue dark mode, sleek high tech automation concept',
    imageFilename: 'zero-code-ai-orchestration-solopreneurs',
    metaTitle: 'Zero-Code AI Orchestration for Solopreneurs (2026 Blueprint)',
    metaDescription: 'Build high-throughput automated workflows connecting Make.com, OpenAI, and webhooks to operate as a zero-employee enterprise.',
    content: [
      banner('warning', 'Automation Standard', 'AI is not just for chat assistance—it is the glue that connects disparate SaaS tools into an autonomous background workforce.'),
      h('h2', 'Connecting API Webhooks to AI Models'),
      p([
        t('Modern automation goes far beyond simple IF-THIS-THEN-THAT triggers. By using visual workflow builders like Make.com alongside OpenAI API endpoints, you can construct context-aware automation scenarios.'),
      ]),
      p([
        t('Whether it is auto-summarizing incoming customer support queries, parsing lead intake data, or generating social media assets, visual AI pipelines enable solo creators to perform the workload of a team of 10.'),
      ]),
      ul([
        [t('Webhook Triggers: ', 1), t('Receive instant payload events from forms, webhooks, or CRM state updates.')],
        [t('JSON Prompt Engineering: ', 1), t('Enforce strict JSON schema responses from AI models for reliable data parsing.')],
        [t('Error Handling Scenarios: ', 1), t('Implement fallback routes and notifications for API downtime.')],
      ]),
      h('h2', 'The Solopreneur Automation Toolkit'),
      p([
        t('Platforms such as '),
        link('/tools/make-com', 'Make.com', 1),
        t(' provide unprecedented flexibility for connecting databases, storage buckets, and LLM APIs with zero lines of traditional code.'),
      ]),
    ],
  },
  {
    categorySlug: 'remote-desk',
    title: 'Ergonomic & Minimalist Remote Workstation Setup: The Ultimate 2026 Desk Guide',
    slug: 'ergonomic-minimalist-remote-workstation-setup',
    heroPrompt: 'Clean minimalist dark wood standing desk with ergonomic office chair, curved monitor, magnetic cable management, warm ambient backlight',
    imageFilename: 'ergonomic-minimalist-remote-workstation-setup',
    metaTitle: 'Ergonomic & Minimalist Remote Workstation Setup (2026 Guide)',
    metaDescription: 'Design the ultimate ergonomic remote desk setup for 8+ hour focus sessions. Explore monitors, ergonomic seating, and microphone setups.',
    content: [
      banner('info', 'Workstation Design', 'Physical environment directly impacts cognitive focus and posture longevity. A clutter-free, ergonomically calibrated workstation is essential.'),
      h('h2', 'Biomechanics of the Modern Knowledge Worker'),
      p([
        t('Spending 8 to 12 hours a day seated at a desk without proper ergonomic support causes micro-fatigue, posture degeneration, and lower back strain. Investing in scientifically engineered seating and monitor positioning is critical for long-term health.'),
      ]),
      p([
        t('The foundation of an ergonomic desk setup lies in three core principles: pelvic support, eye-level display positioning, and natural arm alignment.'),
      ]),
      ul([
        [t('Dynamic Lumbar Support: ', 1), t('Chairs with pixelated support matrices adapt to subtle posture shifts throughout the day.')],
        [t('Monitor Geometry: ', 1), t('The top third of your display should sit directly at eye level, roughly an arm’s length away.')],
        [t('Acoustic & Cable Management: ', 1), t('Under-desk cable trays and sound isolation panels reduce visual clutter and audio reverberation.')],
      ]),
      h('h2', 'Key Hardware Recommendations'),
      p([
        t('For seating, the '),
        link('/hardware/herman-miller-embody', 'Herman Miller Embody', 1),
        t(' remains the benchmark ergonomic chair for remote operators.'),
      ]),
      p([
        t('For broadcast-quality voice transmission during meetings and podcasts, pairing it with the '),
        link('/hardware/shure-sm7b', 'Shure SM7B', 1),
        t(' delivers unmatched voice clarity while rejecting ambient room reflections.'),
      ]),
    ],
  },
  {
    categorySlug: 'stacks',
    title: 'The Ultimate Solopreneur Tech Stack Blueprint (2026): Top Software & Hardware',
    slug: 'ultimate-solopreneur-tech-stack-blueprint-2026',
    heroPrompt: 'Sleek dark layout displaying high tech gadgets, microphones, camera equipment, and software interface cards neatly arranged',
    imageFilename: 'ultimate-solopreneur-tech-stack-blueprint-2026',
    metaTitle: 'The Ultimate Solopreneur Tech Stack Blueprint (2026)',
    metaDescription: 'A complete breakdown of essential software, hardware, and automation tools for running a modern 1-person business.',
    content: [
      banner('info', 'Tech Stack Architecture', 'Building a modern 1-person business requires carefully curated software and hardware tools that integrate seamlessly with minimal upkeep.'),
      h('h2', 'Anatomy of the 2026 Solopreneur Stack'),
      p([
        t('A successful solopreneur tech stack is built in distinct layers: Content Production, Operations & Invoicing, Automation, and Physical Workstation Hardware.'),
      ]),
      p([
        t('Rather than subscribing to dozens of single-purpose software apps, top-performing solo founders consolidate their stack around high-leverage tools with robust APIs and native integration capabilities.'),
      ]),
      ul([
        [t('Content Engine: ', 1), t('Software for recording, editing, and designing multimedia marketing assets.')],
        [t('Operations & Billing: ', 1), t('Platforms managing client proposals, contracts, payments, and client communications.')],
        [t('Workflow Automation: ', 1), t('Integrations connecting lead capture forms to CRMs and AI content tools.')],
        [t('Physical Hardware: ', 1), t('Microphones, cameras, lighting, and ergonomic seating for long-term comfort.')],
      ]),
      h('h2', 'Featured Stack Blueprints'),
      p([
        t('Explore complete pre-configured stacks like '),
        link('/stacks/1-person-youtube-studio', 'The 1-Person YouTube Studio Stack', 1),
        t(' to see how leading solo creators structure their hardware and software for maximum productivity.'),
      ]),
    ],
  },
]

async function main() {
  console.log('Initializing Payload CMS...')
  const payload = await getPayload({ config })

  // Find all categories in DB
  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 100,
  })

  console.log(`Found ${categoriesRes.docs.length} categories in Payload database.`)

  // Find demo author / user
  const usersRes = await payload.find({
    collection: 'users',
    limit: 10,
  })
  const authorId = usersRes.docs[0]?.id

  for (const articleDef of articlesData) {
    console.log(`\n==================================================`)
    console.log(`Processing article for category slug: "${articleDef.categorySlug}"`)

    const categoryDoc = categoriesRes.docs.find((c: any) => c.slug === articleDef.categorySlug)
    if (!categoryDoc) {
      console.warn(`Category slug "${articleDef.categorySlug}" not found! Skipping.`)
      continue
    }

    // Generate/prepare image
    const imagePath = await generateFalImage(articleDef.heroPrompt, articleDef.imageFilename)

    // Create Media record in Payload Local API
    console.log(`Creating Media collection entry in Payload...`)
    const mediaDoc = await payload.create({
      collection: 'media',
      filePath: imagePath,
      data: {
        alt: articleDef.title,
      },
    })
    console.log(`Created Media ID: ${mediaDoc.id}`)

    // Check if post already exists by slug
    const existingPostRes = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: articleDef.slug },
      },
    })

    const lexicalContentData = {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: articleDef.content,
      },
    }

    const postData: any = {
      title: articleDef.title,
      slug: articleDef.slug,
      categories: [categoryDoc.id],
      heroImage: mediaDoc.id,
      content: lexicalContentData,
      _status: 'published',
      publishedAt: new Date().toISOString(),
      authors: authorId ? [authorId] : [],
      meta: {
        title: articleDef.metaTitle,
        description: articleDef.metaDescription,
        image: mediaDoc.id,
      },
    }

    if (existingPostRes.docs.length > 0) {
      const existingId = existingPostRes.docs[0].id
      console.log(`Post with slug "${articleDef.slug}" already exists (ID: ${existingId}). Updating...`)
      const updatedPost = await payload.update({
        collection: 'posts',
        id: existingId,
        data: postData,
        context: { disableRevalidate: true },
      })
      console.log(`Updated post ID: ${updatedPost.id} for Category: ${categoryDoc.title}`)
    } else {
      console.log(`Creating new Post for Category: ${categoryDoc.title}...`)
      const createdPost = await payload.create({
        collection: 'posts',
        data: postData,
        context: { disableRevalidate: true },
      })
      console.log(`Successfully created Post ID: ${createdPost.id} for Category: ${categoryDoc.title}`)
    }
  }

  console.log('\nAll articles auto-generated and published successfully!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Error generating articles:', err)
  process.exit(1)
})
