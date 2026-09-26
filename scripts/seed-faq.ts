import 'dotenv/config'
import configPromise from '../src/payload.config'
import { getPayload } from 'payload'

function createHeading(tag: 'h1' | 'h2' | 'h3', text: string) {
  return {
    type: 'heading',
    tag,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      {
        type: 'text',
        text,
        detail: 0,
        format: 0,
        mode: 'normal' as const,
        style: '',
        version: 1,
      },
    ],
  }
}

function createParagraph(parts: Array<{ text: string; bold?: boolean } | string>) {
  return {
    type: 'paragraph',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: parts.map((part) => {
      if (typeof part === 'string') {
        return {
          type: 'text',
          text: part,
          detail: 0,
          format: 0,
          mode: 'normal' as const,
          style: '',
          version: 1,
        }
      }
      return {
        type: 'text',
        text: part.text,
        detail: 0,
        format: part.bold ? 1 : 0,
        mode: 'normal' as const,
        style: '',
        version: 1,
      }
    }),
  }
}

function createBulletList(items: string[]) {
  return {
    type: 'list',
    listType: 'bullet' as const,
    tag: 'ul' as const,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: items.map((item, idx) => ({
      type: 'listitem',
      value: idx + 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: 'text',
          text: item,
          detail: 0,
          format: 0,
          mode: 'normal' as const,
          style: '',
          version: 1,
        },
      ],
    })),
  }
}

async function run() {
  console.log('Connecting to Payload CMS...')
  const payload = await getPayload({ config: configPromise })

  console.log('Seeding FAQs page...')

  const faqContent = {
    root: {
      type: 'root',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        // SECTION 1
        createHeading('h2', '1. About SoloStack & FXN Holdings'),
        createHeading('h3', 'What is SoloStack?'),
        createParagraph([
          'SoloStack (solostack.au) is a curated technology directory, hardware guide, and workflow blueprint platform engineered specifically for solopreneurs, indie hackers, freelance consultants, and 1-person businesses. We cut through software bloat to highlight high-leverage tools, desk setups, and automated workflows that maximize output without hiring a team.',
        ]),

        createHeading('h3', 'Who operates this website?'),
        createParagraph([
          'SoloStack is operated by ',
          { text: 'FXN Holdings', bold: true },
          ' (ABN: ',
          { text: '53 274 423 748', bold: true },
          '), an Australian digital venture company headquartered in West Perth, Western Australia. solostack.au is a subsidiary business under FXN Holdings.',
        ]),

        createHeading('h3', 'What makes SoloStack different from generic software directories?'),
        createParagraph([
          'Most review sites are bloated with enterprise software designed for 500-person companies with massive IT budgets. SoloStack focuses strictly on ',
          { text: 'solopreneur leverage', bold: true },
          '—tools that are fast to set up, cost-effective, easily automated, and deliver high ROI for a single operator.',
        ]),

        // SECTION 2
        createHeading('h2', '2. Editorial Standards & Product Selection'),
        createHeading('h3', 'How do you evaluate and select products?'),
        createParagraph([
          'Our editorial team conducts independent hands-on evaluations and architectural benchmarks. We score products across five key criteria:',
        ]),
        createBulletList([
          'Speed to Value: How quickly a solo operator can achieve tangible results without extensive onboarding.',
          'Workflow Integration: How cleanly the tool connects with automation platforms like Make.com, APIs, or existing solo stacks.',
          'Pricing Transparency: Fair, predictable pricing tiers that do not penalize growing independent businesses.',
          'Reliability & Uptime: Mission-critical stability you can rely on when operating with zero IT support.',
          'Ergonomic & Hardware Durability: Long-term build quality, spinal ergonomics, and acoustic performance for home studio setups.',
        ]),

        createHeading('h3', 'Can brands pay for a positive review or higher ranking?'),
        createParagraph([
          { text: 'No.', bold: true },
          ' We do not accept sponsored reviews, paid placements in top rankings, or promotional bias. While we maintain commercial affiliate relationships with select merchants and networks, our editorial recommendations are formed independently. If a tool is slow, overpriced, or poorly supported, we explicitly state it.',
        ]),

        createHeading('h3', 'How frequently is product information and pricing updated?'),
        createParagraph([
          'We review our product directories, hardware benchmarks, and coupon feeds weekly. However, third-party SaaS vendors and hardware retailers update subscription tiers and pricing at their discretion. We always encourage checking the official merchant site via our verified links for current promotional rates.',
        ]),

        // SECTION 3
        createHeading('h2', '3. Affiliate Links, Coupons & Deals'),
        createHeading('h3', 'Does using your links cost me anything extra?'),
        createParagraph([
          { text: 'Never.', bold: true },
          ' Using affiliate links on solostack.au costs you zero additional money. In fact, through our direct network partnerships with CJ Affiliate, Awin, and merchant programs, our links often unlock exclusive discounts, coupon codes, and extended trial periods that save you money compared to standard retail checkout.',
        ]),

        createHeading('h3', 'How do the discounts on the /deals page work?'),
        createParagraph([
          'Our ',
          { text: 'Deals & Coupons page', bold: true },
          ' (https://solostack.au/deals) tracks live promotional offers, coupon codes, and verified discounts from top software hosts, security tools, and developer platforms. Simply click "Get Deal" or copy the voucher code and apply it during checkout on the merchant platform.',
        ]),

        createHeading('h3', 'What should I do if a coupon code does not apply?'),
        createParagraph([
          'Promotional discounts and coupons are managed directly by external merchants and may expire or change regional eligibility. If you encounter an inactive code, please send a quick note to ',
          { text: 'contact@solostack.au', bold: true },
          ' so our team can verify and update the listing.',
        ]),

        // SECTION 4
        createHeading('h2', '4. Stack Blueprints'),
        createHeading('h3', 'What is a "Stack Blueprint"?'),
        createParagraph([
          'Instead of recommending tools in isolation, a ',
          { text: 'Stack Blueprint', bold: true },
          ' provides an end-to-end recipe showing how software, hardware, and automation connect together to run a specific business model (such as The 1-Person YouTube Studio, The Micro-SaaS Solo Founder, or The Remote Consulting Desk).',
        ]),

        createHeading('h3', 'Can I suggest a new stack blueprint or tool review?'),
        createParagraph([
          'Absolutely! We actively welcome suggestions from our community. If you have built an exceptional solo workflow or discovered a tool that transformed your business, reach out via our contact page.',
        ]),

        // SECTION 5
        createHeading('h2', '5. Contact & Support'),
        createHeading('h3', 'How do I contact the SoloStack team?'),
        createParagraph([
          'You can contact our editorial and operations team anytime through our official channels:',
        ]),
        createBulletList([
          'Online Form: Visit our Contact page at https://solostack.au/contact',
          'Direct Email: contact@solostack.au',
          'Mailing Address: FXN Holdings, PO Box 500, WEST PERTH, WA 6872, Australia',
        ]),
        createParagraph([
          'We strive to respond to all editorial, partnership, and reader inquiries within 1 to 2 business days.',
        ]),
      ],
    },
  }

  const existingFaq = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'faqs' } },
  })

  if (existingFaq.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existingFaq.docs[0].id,
      data: {
        title: 'Frequently Asked Questions (FAQ)',
        _status: 'published',
        hero: {
          type: 'lowImpact',
          richText: {
            root: {
              type: 'root',
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
              children: [
                createHeading('h1', 'Frequently Asked Questions (FAQ)'),
                createParagraph([
                  'Answers to common questions regarding SoloStack tools, stack blueprints, affiliate partnerships, and verified deals.',
                ]),
              ],
            },
          },
        },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                size: 'full',
                richText: faqContent,
              },
            ],
          },
        ],
      },
      context: { disableRevalidate: true },
    })
    console.log('✓ FAQs page updated successfully.')
  } else {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Frequently Asked Questions (FAQ)',
        slug: 'faqs',
        _status: 'published',
        hero: {
          type: 'lowImpact',
          richText: {
            root: {
              type: 'root',
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
              children: [
                createHeading('h1', 'Frequently Asked Questions (FAQ)'),
                createParagraph([
                  'Answers to common questions regarding SoloStack tools, stack blueprints, affiliate partnerships, and verified deals.',
                ]),
              ],
            },
          },
        },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                size: 'full',
                richText: faqContent,
              },
            ],
          },
        ],
      },
      context: { disableRevalidate: true },
    })
    console.log('✓ FAQs page created successfully.')
  }

  // Update Footer with FAQs link
  console.log('Adding FAQs to Footer navigation...')
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        {
          link: {
            type: 'custom',
            url: '/',
            label: 'Home',
            newTab: false,
          },
        },
        {
          link: {
            type: 'custom',
            url: '/deals',
            label: 'Deals & Coupons',
            newTab: false,
          },
        },
        {
          link: {
            type: 'custom',
            url: '/faqs',
            label: 'FAQs',
            newTab: false,
          },
        },
        {
          link: {
            type: 'custom',
            url: '/privacy-policy',
            label: 'Privacy Policy',
            newTab: false,
          },
        },
        {
          link: {
            type: 'custom',
            url: '/terms',
            label: 'Terms of Service',
            newTab: false,
          },
        },
        {
          link: {
            type: 'custom',
            url: '/affiliate-disclosure',
            label: 'Affiliate Disclosure',
            newTab: false,
          },
        },
        {
          link: {
            type: 'custom',
            url: '/contact',
            label: 'Contact',
            newTab: false,
          },
        },
      ],
    },
    context: { disableRevalidate: true },
  })

  console.log('✓ Footer navigation updated with FAQs link.')
  process.exit(0)
}

run().catch((err) => {
  console.error('Error seeding FAQs:', err)
  process.exit(1)
})
