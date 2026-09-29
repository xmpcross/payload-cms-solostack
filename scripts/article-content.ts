/**
 * Structured article definitions. scripts/generate-category-articles.ts turns these into Lexical
 * content and publishes them. Inline markup in text: **bold** and [label](/internal-path).
 */
export type Section = {
  h: string
  p?: string[]
  list?: [label: string, text: string][]
  banner?: ['info' | 'success' | 'warning', title: string, text: string]
}

export type ArticleDef = {
  categorySlug: string
  title: string
  slug: string
  heroPrompt: string
  metaTitle: string
  metaDescription: string
  banner: ['info' | 'success' | 'warning', string, string]
  intro: string
  sections: Section[]
  closing: string
}

const NO_TEXT = ', no text, no letters, no words, no logos'

export const structuredArticles: ArticleDef[] = [
  /* ------------------------------ Marketing & Growth ------------------------------ */
  {
    categorySlug: 'marketing-growth',
    title: 'Landing Page Basics: How to Turn Visitors into Leads',
    slug: 'landing-page-basics-visitors-to-leads',
    heroPrompt: 'Clean modern desk with a laptop showing an abstract website wireframe with a large button, soft daylight, minimal styling, teal accents' + NO_TEXT,
    metaTitle: 'Landing Page Basics: Turn Visitors into Leads (2026)',
    metaDescription: 'A simple framework for landing pages that convert: one goal, a clear headline, proof, a single call to action and the small details that lift signups.',
    banner: ['info', 'One Page, One Job', 'A landing page has a single goal. Every element that does not support it is a distraction and costs you signups.'],
    intro: 'Traffic only matters if visitors do something. A landing page is where a click becomes a lead, a booking or a sale, and for a solo business it is often the highest-leverage page you own.',
    sections: [
      {
        h: 'Start With One Goal and One Audience',
        p: ['Decide what a successful visit looks like: an email signup, a booked call or a purchase. Then write for the specific person arriving from your ad, post or search result. A page that tries to serve everyone convinces no one.'],
      },
      {
        h: 'The Anatomy of a Page That Converts',
        list: [
          ['Headline', 'State the outcome the visitor gets, in plain words. Clarity beats cleverness.'],
          ['Subheadline', 'Add who it is for and how it works in one sentence.'],
          ['Proof', 'Testimonials, client logos or a short case study. Use real, specific results rather than vague praise.'],
          ['Benefits over features', 'Explain what changes for the reader, then back it up with detail.'],
          ['One call to action', 'Repeat the same button or form at natural stopping points. Avoid competing links.'],
        ],
      },
      {
        h: 'Reduce Friction',
        p: ['Ask only for what you need. An email address converts better than a long form. Keep the page fast and readable on a phone, where most visitors will see it first, and remove the main navigation so there is nowhere to wander.'],
        banner: ['warning', 'Test Before You Trust', 'Change one thing at a time, such as the headline or the button text, and give each version enough visitors before deciding. Small samples mislead.'],
      },
      {
        h: 'Measure and Improve',
        p: ['Track the percentage of visitors who take your goal action, and where they drop off. Session recordings and a simple analytics tool are enough. Rewrite the weakest section first, usually the headline or the proof.'],
      },
    ],
    closing: 'Build the page once, then improve it monthly. Pair it with a lead magnet from our [email marketing guide](/posts/solo-founder-email-marketing-engine) and check [current deals](/deals) on landing page and email tools before you commit to a plan.',
  },
  {
    categorySlug: 'marketing-growth',
    title: 'Social Media for Solo Founders: A 5-Hour-a-Week Content System',
    slug: 'social-media-system-solo-founders',
    heroPrompt: 'Overhead view of a tidy desk with a smartphone with a plain dark screen, a laptop showing a grid of empty coloured squares, and a closed plain notebook with no cover markings, warm light' + NO_TEXT,
    metaTitle: 'Social Media for Solo Founders: A 5-Hour Weekly System',
    metaDescription: 'A realistic social media routine for one-person businesses: pick one or two platforms, batch your posts, repurpose what works and track results that matter.',
    banner: ['success', 'Consistency Over Volume', 'You do not need to be everywhere. You need a repeatable routine on the platform where your customers already spend time.'],
    intro: 'Social media can swallow a whole week if you let it. A fixed weekly system keeps it useful: a few focused hours, planned in advance, aimed at conversations and clicks that actually lead to customers.',
    sections: [
      {
        h: 'Pick One or Two Platforms',
        p: ['Choose the platforms where your buyers already look for answers. A B2B consultant may do best on LinkedIn; a visual creator on Instagram or YouTube. Mastering one channel beats posting thinly on five.'],
      },
      {
        h: 'A Five-Hour Weekly Routine',
        list: [
          ['One hour, plan', 'Pick the week\'s theme from customer questions and your recent work.'],
          ['Two hours, create', 'Write and record in one batch: text posts, short clips and any graphics.'],
          ['One hour, schedule', 'Load the posts into a scheduler so they publish without you.'],
          ['One hour, engage', 'Reply to comments and message people who engage. This is where relationships form.'],
        ],
      },
      {
        h: 'Post What Helps, Then What Sells',
        p: ['Aim for mostly useful content: how-tos, lessons, behind-the-scenes and honest opinions. Mix in a clear offer now and then. People buy from creators they already trust, and trust comes from generosity first.'],
      },
      {
        h: 'Repurpose Instead of Starting From Scratch',
        p: ['One long piece can become many posts. Our [content repurposing guide](/posts/content-repurposing-flywheel) shows how to turn a single video or article into a week of content.'],
      },
      {
        h: 'Track What Matters',
        p: ['Followers and likes are easy to see but rarely pay the bills. Watch profile visits, link clicks, email signups and enquiries. Double down on the formats that produce those, and drop the rest.'],
      },
    ],
    closing: 'Design templates once in [Canva Pro](/tools/canva-pro), automate hand-offs with [Make.com](/tools/make-com), and revisit your results every month.',
  },

  /* ------------------------------ Websites & Hosting ------------------------------ */
  {
    categorySlug: 'websites-hosting',
    title: 'How to Choose Web Hosting for a Small Business Site',
    slug: 'how-to-choose-web-hosting',
    heroPrompt: 'Rows of tidy server racks with soft blue lighting in a modern data centre, shallow depth of field' + NO_TEXT,
    metaTitle: 'How to Choose Web Hosting for a Small Business (2026)',
    metaDescription: 'What to look for in web hosting: uptime, speed, support, backups, security and renewal pricing, plus the red flags that cost small sites time and money.',
    banner: ['info', 'Hosting Is Infrastructure', 'Your host affects speed, uptime and security. Cheap introductory prices can hide expensive renewals, so compare the long-term cost.'],
    intro: 'Your website is only useful when it is online and fast. Choosing a host well takes an hour and saves you from migrations, outages and surprise bills later.',
    sections: [
      {
        h: 'What Actually Matters',
        list: [
          ['Reliability', 'Look for a published uptime commitment and read independent reviews about real-world outages.'],
          ['Speed', 'Servers close to your visitors, modern storage and built-in caching make pages load faster.'],
          ['Support', 'Live chat or fast tickets matter when something breaks at a bad time.'],
          ['Backups', 'Daily automatic backups with easy restore are essential. Confirm restores are included in your plan.'],
          ['Security', 'Free SSL certificates, malware scanning and a firewall should be standard.'],
        ],
      },
      {
        h: 'Read the Renewal Price',
        p: ['Many hosts advertise a low first-term price that rises sharply at renewal. Check the renewal rate, the minimum term, and any fees for domains, email or migration. Compare the total cost over three years, not the headline monthly figure.'],
      },
      {
        h: 'Match the Plan to Your Site',
        p: ['A simple brochure site or blog runs happily on entry-level hosting. Growing traffic, online stores and heavy plugins need more resources or managed hosting. Start modest and upgrade when your analytics show a real need.'],
        banner: ['warning', 'Red Flags', 'Unlimited everything, no clear backup policy, no visible support channel or forced long contracts are all reasons to keep looking.'],
      },
      {
        h: 'Plan for Moving Later',
        p: ['Keep your domain registered separately from your host so you can switch providers without losing your address. Choose a host that offers a free or affordable migration if you outgrow it.'],
      },
    ],
    closing: 'Next, read how the main [hosting types compare](/posts/hosting-types-explained), and check [our deals page](/deals) for current hosting discounts before you buy.',
  },
  {
    categorySlug: 'websites-hosting',
    title: 'Shared vs VPS vs Cloud vs Managed WordPress Hosting Explained',
    slug: 'hosting-types-explained',
    heroPrompt: 'Four simple isometric illustrations of stacked server blocks in different sizes, clean pastel colours, white background' + NO_TEXT,
    metaTitle: 'Shared vs VPS vs Cloud vs Managed WordPress Hosting',
    metaDescription: 'The main types of web hosting explained in plain English, with who each one suits, what it costs in effort and when to upgrade.',
    banner: ['info', 'Four Common Options', 'Most small businesses start on shared or managed hosting and move up only when traffic or complexity demands it.'],
    intro: 'Hosting plans have confusing names, but they differ in two things: how much of the server you share with others, and how much of the technical work you do yourself.',
    sections: [
      {
        h: 'Shared Hosting',
        p: ['Your site lives on a server with many others. It is the cheapest and simplest option, ideal for a new blog or small brochure site. The trade-off is that a busy neighbour can slow you down and you have limited control.'],
      },
      {
        h: 'Managed WordPress Hosting',
        p: ['Built specifically for WordPress, with automatic updates, caching, backups and expert support included. It costs more than shared hosting but removes maintenance work, which suits businesses that value their time.'],
      },
      {
        h: 'VPS Hosting',
        p: ['A virtual private server gives you guaranteed resources and root access. It is flexible and powerful, but you or a developer must manage security updates and configuration. Choose it when you need custom software or predictable performance.'],
      },
      {
        h: 'Cloud Hosting',
        p: ['Your site runs across several connected servers and can scale as demand changes. It handles traffic spikes well and is often billed by usage, which can make costs less predictable.'],
      },
      {
        h: 'Which Should You Choose?',
        list: [
          ['New or small site', 'Shared or entry-level managed hosting.'],
          ['Business site on WordPress', 'Managed WordPress hosting.'],
          ['Custom app or heavy workload', 'VPS or cloud hosting.'],
          ['Spiky traffic', 'Cloud hosting with a spending limit set.'],
        ],
      },
    ],
    closing: 'If you are still deciding, start with our guide to [choosing web hosting](/posts/how-to-choose-web-hosting) and compare current offers on the [deals page](/deals).',
  },
  {
    categorySlug: 'websites-hosting',
    title: 'How to Pick and Register the Right Domain Name',
    slug: 'how-to-choose-domain-name',
    heroPrompt: 'A minimalist white desk with a laptop showing a plain empty browser window with a blank rounded bar, a closed plain notebook and a potted plant, soft light' + NO_TEXT,
    metaTitle: 'How to Choose and Register a Domain Name (2026 Guide)',
    metaDescription: 'A practical guide to choosing a memorable domain name, picking the right extension, checking trademarks and registering it safely without overpaying.',
    banner: ['success', 'Your Address for Years', 'A good domain is short, easy to say and easy to spell. Changing it later costs traffic, links and trust.'],
    intro: 'Your domain name appears on every email, business card and link. Spend a little time choosing it well, because it is one of the few website decisions that is painful to undo.',
    sections: [
      {
        h: 'What Makes a Good Domain',
        list: [
          ['Short', 'Fewer characters are easier to type and remember.'],
          ['Easy to say', 'If you have to spell it out over the phone, it is too complicated.'],
          ['No awkward characters', 'Avoid hyphens and numbers that people will guess wrongly.'],
          ['Brandable', 'A distinctive name beats a keyword-stuffed one.'],
        ],
      },
      {
        h: 'Choosing an Extension',
        p: ['.com is the most recognised and the safest default. A country extension such as .com.au or .co.uk signals local focus and can help local trust. Newer extensions can work when the name reads naturally, but check your audience will not mistype them.'],
      },
      {
        h: 'Check Before You Buy',
        p: ['Search the name on social platforms so your handles match. Look up trademarks in your target country to avoid legal trouble, and check the domain has no bad history that could hurt email delivery.'],
      },
      {
        h: 'Registering It Safely',
        p: ['Use a reputable registrar and register in your own name or business name. Turn on auto-renew, enable domain privacy so your contact details are hidden, and use two-factor authentication on the account. Check the renewal price, which is often higher than the first-year price.'],
        banner: ['warning', 'Own It Yourself', 'Never let a web designer register your domain under their account. If the relationship ends, you can lose control of your address.'],
      },
    ],
    closing: 'Once you have a name, pick a host with our guide to [choosing web hosting](/posts/how-to-choose-web-hosting), and browse [current domain and hosting deals](/deals).',
  },
  {
    categorySlug: 'websites-hosting',
    title: 'Website Builder vs WordPress: Which Is Right for a Solo Business?',
    slug: 'website-builder-vs-wordpress',
    heroPrompt: 'Split composition of two laptops on a desk, one showing an abstract drag-and-drop layout and the other an abstract code-style dashboard, bright neutral tones' + NO_TEXT,
    metaTitle: 'Website Builder vs WordPress for a Solo Business (2026)',
    metaDescription: 'Compare website builders and WordPress on cost, control, speed, SEO and maintenance to choose the right platform for your one-person business.',
    banner: ['info', 'There Is No Universal Winner', 'The right choice depends on how much control you want and how much upkeep you are willing to do.'],
    intro: 'Builders like Wix, Squarespace and Webflow promise a site in an afternoon. WordPress promises almost unlimited flexibility. Both can look professional; the difference is the trade-off in time and control.',
    sections: [
      {
        h: 'Website Builders',
        list: [
          ['Pros', 'Hosting, security and updates are handled for you. Visual editors make launching quick.'],
          ['Cons', 'Less flexibility, monthly fees that continue, and moving your site to another platform is difficult.'],
          ['Best for', 'Portfolios, simple service sites and small shops where speed to launch matters most.'],
        ],
      },
      {
        h: 'WordPress',
        list: [
          ['Pros', 'You own the site and can move hosts freely. Thousands of themes and plugins cover almost any need.'],
          ['Cons', 'You are responsible for updates, backups and security, or you pay for managed hosting to handle them.'],
          ['Best for', 'Content-heavy sites, blogs, memberships and businesses planning to grow or customise heavily.'],
        ],
      },
      {
        h: 'Compare What Matters',
        p: ['On cost, builders bundle everything into one predictable fee, while WordPress splits it between hosting, theme and plugins. On SEO, both can rank well when set up properly; WordPress has more advanced options. On maintenance, builders win on ease and WordPress wins on freedom.'],
      },
      {
        h: 'A Simple Way to Decide',
        p: ['If you want to launch this week and never think about servers, choose a builder. If content and long-term ownership are central to your business, choose WordPress on good managed hosting. Whichever you pick, keep your domain registered separately so you can change your mind.'],
      },
    ],
    closing: 'Read our guide to [hosting types](/posts/hosting-types-explained) if you choose WordPress, and check the [deals page](/deals) for current builder and hosting offers.',
  },
  {
    categorySlug: 'websites-hosting',
    title: 'Website Speed and Security Checklist for Small Sites',
    slug: 'website-speed-security-checklist',
    heroPrompt: 'A laptop on a desk showing an abstract dashboard with a green gauge and a padlock icon, cool blue lighting, clean modern style' + NO_TEXT,
    metaTitle: 'Website Speed and Security Checklist for Small Sites',
    metaDescription: 'A practical checklist to make a small website faster and safer: image optimisation, caching, updates, backups, SSL, strong logins and monitoring.',
    banner: ['warning', 'Fast and Safe Sites Rank and Sell', 'Slow pages lose visitors and hacked sites lose trust. Most fixes are simple and free.'],
    intro: 'You do not need to be a developer to keep a site healthy. A short, regular checklist covers the majority of speed and security problems small businesses run into.',
    sections: [
      {
        h: 'Speed Checklist',
        list: [
          ['Compress images', 'Resize images to the size they display and use modern formats such as WebP.'],
          ['Enable caching', 'Use your host\'s caching or a reputable caching plugin so pages are not rebuilt for every visitor.'],
          ['Use a CDN', 'A content delivery network serves files from a location near each visitor.'],
          ['Limit plugins and scripts', 'Every plugin and tracker adds weight. Remove what you do not use.'],
          ['Test regularly', 'Run a page speed test monthly, on mobile as well as desktop.'],
        ],
      },
      {
        h: 'Security Checklist',
        list: [
          ['Keep everything updated', 'Apply updates to your platform, themes and plugins promptly.'],
          ['Strong logins', 'Use a password manager, unique passwords and two-factor authentication.'],
          ['SSL certificate', 'Make sure the whole site loads over HTTPS.'],
          ['Automatic backups', 'Store backups off the server and test that you can restore them.'],
          ['Limit access', 'Give other users only the permissions they need and remove old accounts.'],
        ],
      },
      {
        h: 'Set Up Monitoring',
        p: ['Free uptime monitors alert you when your site goes down, so you find out before your customers do. Add security alerts from your host or a security plugin, and review them weekly.'],
      },
      {
        h: 'Build the Habit',
        p: ['Put a monthly reminder in your calendar: test speed, check updates, verify a backup, review user accounts. Fifteen minutes a month prevents most emergencies.'],
      },
    ],
    closing: 'If your host makes this difficult, compare options in our [web hosting guide](/posts/how-to-choose-web-hosting) and see [current hosting deals](/deals).',
  },

  /* -------------------------------- Stack Blueprints -------------------------------- */
  {
    categorySlug: 'stacks',
    title: 'The Solo Consultant Stack: Tools to Run a Client Business',
    slug: 'solo-consultant-tech-stack',
    heroPrompt: 'Tidy professional home office with a laptop, notebook and coffee, calm morning light, neutral colours' + NO_TEXT,
    metaTitle: 'The Solo Consultant Tech Stack: Tools for Client Work',
    metaDescription: 'A lean tool stack for independent consultants: proposals, contracts, invoicing, scheduling, project delivery and marketing, chosen for a one-person team.',
    banner: ['info', 'Blueprint', 'Fewer tools, connected well, beat a long list of subscriptions. This stack covers the client lifecycle from first call to final invoice.'],
    intro: 'A consultant sells expertise and reliability. The right stack makes you look organised, saves administrative hours and keeps money flowing, without hiring anyone.',
    sections: [
      {
        h: 'Find and Win Clients',
        list: [
          ['Website and landing page', 'A simple site that explains who you help and how to book a call.'],
          ['Email list', 'A newsletter to stay in front of prospects between projects.'],
          ['Scheduling', 'A booking link so calls do not require email back-and-forth.'],
        ],
      },
      {
        h: 'Sell and Onboard',
        list: [
          ['Proposals and contracts', 'Send branded proposals with e-signature and deposit collection built in.'],
          ['Client portal', 'One place for files, questions and approvals so nothing is lost in email.'],
        ],
        p: ['An all-in-one platform such as [Bonsai](/tools/bonsai) combines proposals, contracts, invoicing and time tracking in one system.'],
      },
      {
        h: 'Deliver the Work',
        list: [
          ['Project management', 'A light task board with deadlines, shared with clients where needed.'],
          ['Documents and design', 'Templates for reports and slides, for example in [Canva Pro](/tools/canva-pro).'],
          ['Automation', 'Connect your forms, calendar and CRM with [Make.com](/tools/make-com) to remove repeat data entry.'],
        ],
      },
      {
        h: 'Get Paid and Stay Compliant',
        p: ['Automate invoices and payment reminders, keep receipts in one folder, and review outstanding invoices weekly. Set money aside for tax as income arrives.'],
      },
    ],
    closing: 'Start with the client lifecycle above and add one tool at a time. See our [operations engine guide](/posts/building-50k-solo-operations-engine) and browse all [stack blueprints](/stacks).',
  },
  {
    categorySlug: 'stacks',
    title: 'The One-Person Course Creator Stack',
    slug: 'course-creator-stack',
    heroPrompt: 'A creator desk with microphone, laptop showing an abstract video lesson layout and a ring light, warm and tidy' + NO_TEXT,
    metaTitle: 'The One-Person Online Course Creator Tech Stack',
    metaDescription: 'The tools a solo course creator needs: recording, editing, hosting, payments, email and community, plus how they fit together.',
    banner: ['info', 'Blueprint', 'A course business is a content business with a sales system attached. This stack keeps both simple enough to run alone.'],
    intro: 'Creating a course involves recording lessons, delivering them to students and selling reliably. Choose a small set of tools that work together so you spend your time teaching, not troubleshooting.',
    sections: [
      {
        h: 'Create the Lessons',
        list: [
          ['Recording', 'Capture clean audio and video. Local recording tools such as [Riverside.fm](/tools/riverside-fm) protect quality.'],
          ['Editing', 'Edit by transcript with [Descript](/tools/descript) and remove filler words in minutes.'],
          ['Slides and worksheets', 'Design consistent materials in [Canva Pro](/tools/canva-pro).'],
        ],
      },
      {
        h: 'Deliver and Sell',
        list: [
          ['Course platform', 'Choose a platform that hosts videos, handles payments and gives students a simple login.'],
          ['Landing page', 'A focused sales page with the outcome, curriculum and proof. Our [landing page guide](/posts/landing-page-basics-visitors-to-leads) explains the layout.'],
          ['Payments', 'Accept cards and local payment methods, and offer a payment plan for higher prices.'],
        ],
      },
      {
        h: 'Grow and Support',
        list: [
          ['Email', 'A welcome sequence and launch emails. See our [email marketing guide](/posts/solo-founder-email-marketing-engine).'],
          ['Community', 'A private group or forum for questions, kept small enough for you to moderate.'],
          ['Feedback', 'Short surveys after each module to improve the course and collect testimonials.'],
        ],
      },
      {
        h: 'Start Smaller Than You Think',
        p: ['Validate the idea with a pilot cohort before recording everything. A small, well-supported first group gives you feedback, testimonials and confidence.'],
      },
    ],
    closing: 'Compare platform pricing on the [deals page](/deals) and see the full [YouTube studio stack](/stacks/1-person-youtube-studio) for recording gear ideas.',
  },
  {
    categorySlug: 'stacks',
    title: 'The Solo Podcaster Stack: From Recording to Distribution',
    slug: 'solo-podcaster-stack',
    heroPrompt: 'Close-up of a black dynamic podcast microphone on a boom arm with black over-ear headphones hanging beside it, soft blurred warm studio background, nothing else in frame' + NO_TEXT,
    metaTitle: 'The Solo Podcaster Stack: Record, Edit and Publish',
    metaDescription: 'Everything a solo podcaster needs: microphone, recording, editing, hosting, artwork and promotion, arranged into a simple weekly workflow.',
    banner: ['info', 'Blueprint', 'A podcast is a repeatable pipeline. Once the tools are set, each episode should follow the same steps.'],
    intro: 'Podcasting rewards consistency. A stable, simple stack means you can record an episode, publish it and promote it in a predictable block of time every week.',
    sections: [
      {
        h: 'Gear',
        list: [
          ['Microphone', 'A dynamic microphone reduces room noise. Our [best gear guide](/best-gear) covers mic choices and setup.'],
          ['Headphones', 'Closed-back headphones so you can monitor without feedback.'],
          ['Space', 'Soft furnishings, a rug and curtains reduce echo cheaply.'],
        ],
      },
      {
        h: 'Record and Edit',
        list: [
          ['Recording', 'Record locally for guests as well as yourself so internet glitches do not damage the audio. [Riverside.fm](/tools/riverside-fm) does this.'],
          ['Editing', 'Edit by transcript in [Descript](/tools/descript), remove filler words and level the volume.'],
          ['Show notes', 'Summarise the episode with key points, links and timestamps.'],
        ],
      },
      {
        h: 'Publish and Promote',
        list: [
          ['Podcast host', 'A hosting service stores your files and creates the feed that Apple Podcasts, Spotify and others read.'],
          ['Artwork', 'Create cover art and episode graphics in [Canva Pro](/tools/canva-pro).'],
          ['Promotion', 'Cut short clips for social media using our [repurposing workflow](/posts/content-repurposing-flywheel).'],
        ],
      },
      {
        h: 'A Weekly Rhythm',
        p: ['Plan on Monday, record on Tuesday, edit and write notes on Wednesday, publish Thursday and promote through the following days. Batch two episodes in one recording session when you can.'],
      },
    ],
    closing: 'For a detailed recording setup, read the [video and podcast setup guide](/posts/1-person-video-podcast-setup).',
  },
  {
    categorySlug: 'stacks',
    title: 'The Newsletter Business Stack: Write, Grow and Monetise',
    slug: 'newsletter-business-stack',
    heroPrompt: 'Writer\'s desk with a laptop showing an abstract email layout, a notebook and a cup of tea, soft window light' + NO_TEXT,
    metaTitle: 'The Newsletter Business Stack: Write, Grow, Monetise',
    metaDescription: 'The tools and workflow for a one-person newsletter business: writing, email platform, growth, sponsorships and paid subscriptions.',
    banner: ['info', 'Blueprint', 'A newsletter turns attention into an asset you own. Keep the stack light so writing stays the main job.'],
    intro: 'Newsletters are one of the most direct ways for a solo creator to build an audience and an income. The stack is small, but choosing well early avoids painful migrations later.',
    sections: [
      {
        h: 'Write',
        list: [
          ['Drafting', 'A distraction-free editor and a simple content calendar.'],
          ['Research', 'Save links and notes as you go so each issue has raw material.'],
          ['Design', 'Header images and simple graphics in [Canva Pro](/tools/canva-pro).'],
        ],
      },
      {
        h: 'Send and Grow',
        list: [
          ['Email platform', 'Choose one built for creators with landing pages, forms and easy segmentation.'],
          ['Growth', 'Recommendations from other newsletters, a strong signup page and social posts that link to your best issues.'],
          ['Search traffic', 'Publish key issues as web articles so they are found. See our [SEO guide](/posts/seo-for-one-person-businesses).'],
        ],
      },
      {
        h: 'Monetise',
        list: [
          ['Sponsorships', 'Sell one clear ad slot once you have a defined, engaged audience.'],
          ['Paid tier', 'Offer extra depth or archives for paying subscribers.'],
          ['Affiliate recommendations', 'Recommend tools you genuinely use and disclose the relationship.'],
          ['Your own products', 'Templates, courses or consulting are often the most profitable.'],
        ],
      },
      {
        h: 'Keep It Healthy',
        p: ['Publish on a fixed schedule, prune inactive subscribers, and protect deliverability with domain authentication. Read our [email marketing guide](/posts/solo-founder-email-marketing-engine) for the details.'],
      },
    ],
    closing: 'Automate hand-offs between forms, payments and your list with [Make.com](/tools/make-com), and see all [stack blueprints](/stacks).',
  },

  /* ------------------------------- Creator Media Lab ------------------------------- */
  {
    categorySlug: 'creator-media-lab',
    title: 'Podcast Recording Workflow for Solo Hosts',
    slug: 'solo-podcast-recording-workflow',
    heroPrompt: 'Close view of a podcast microphone with pop filter in front of a soft acoustic panel, warm side lighting, shallow depth of field' + NO_TEXT,
    metaTitle: 'Podcast Recording Workflow for Solo Hosts (2026)',
    metaDescription: 'A repeatable workflow for solo podcasters: prepare an outline, set levels, record cleanly, back up files and edit efficiently.',
    banner: ['info', 'Process Over Gear', 'A consistent routine makes a modest setup sound professional and cuts editing time.'],
    intro: 'Talking to a microphone alone is harder than it looks. A clear routine keeps your energy up, your audio clean and your editing time short.',
    sections: [
      {
        h: 'Before You Hit Record',
        list: [
          ['Outline, do not script', 'Write key points and a strong opening. Reading a full script often sounds flat.'],
          ['Prepare the room', 'Silence notifications, close windows and switch off fans or noisy appliances.'],
          ['Hydrate and warm up', 'Water and a minute of gentle humming loosen your voice.'],
        ],
      },
      {
        h: 'Set Levels and Test',
        p: ['Speak at your normal volume and adjust gain so peaks sit comfortably below clipping. Record a short test, listen back with headphones, and fix any hiss, echo or plosives before starting the real take.'],
      },
      {
        h: 'Record Cleanly',
        list: [
          ['Keep a consistent distance', 'A few centimetres from the microphone, slightly off-axis.'],
          ['Pause instead of restarting', 'If you stumble, stop, pause and repeat the line. Editing is quick when the mistakes are easy to spot.'],
          ['Record a backup', 'Run a second recording or a local backup in case of a crash.'],
        ],
      },
      {
        h: 'Edit Efficiently',
        p: ['Edit by transcript in [Descript](/tools/descript) to remove filler words and cut mistakes quickly, then apply noise reduction and volume levelling. Export a final file and archive the raw recording.'],
      },
    ],
    closing: 'For equipment choices see our [best gear guide](/best-gear), and for a full pipeline read the [video and podcast setup](/posts/1-person-video-podcast-setup).',
  },
  {
    categorySlug: 'creator-media-lab',
    title: 'YouTube Thumbnails and Titles That Get Clicks (Without Clickbait)',
    slug: 'youtube-thumbnails-titles-guide',
    heroPrompt: 'Creative desk with a monitor showing several abstract colourful video thumbnail layouts in a grid, vibrant but tidy' + NO_TEXT,
    metaTitle: 'YouTube Thumbnails and Titles That Get Clicks',
    metaDescription: 'How to design YouTube thumbnails and write titles that earn clicks honestly: contrast, clear focal points, curiosity, promise and testing.',
    banner: ['success', 'Packaging Decides Who Watches', 'Even a great video fails if nobody clicks. Thumbnail and title are the promise; the video must deliver it.'],
    intro: 'On YouTube the thumbnail and title work together as your storefront. Good packaging is a skill you can learn, and it improves every video you publish.',
    sections: [
      {
        h: 'Thumbnail Principles',
        list: [
          ['One clear focal point', 'A face, an object or a single idea. Clutter loses attention.'],
          ['High contrast', 'Bold colours and a clear separation between subject and background work at small sizes.'],
          ['Readable at a glance', 'If you add text, keep it to a few large words that add to the title rather than repeat it.'],
          ['Consistent style', 'Recognisable colours and layout help returning viewers spot your videos.'],
        ],
      },
      {
        h: 'Writing Better Titles',
        p: ['State a clear benefit or spark honest curiosity. Front-load the important words, keep titles short enough not to be cut off, and match what people search for. Avoid promises the video cannot keep.'],
      },
      {
        h: 'Be Honest',
        p: ['Misleading packaging may win a click but loses trust and hurts retention. Aim for a promise that is exciting and true, and deliver on it in the first thirty seconds.'],
        banner: ['warning', 'Retention Is the Real Test', 'If viewers leave immediately, the platform learns your packaging did not match the video and shows it to fewer people.'],
      },
      {
        h: 'Test and Learn',
        p: ['Design two or three thumbnail ideas before publishing, and use the platform\'s testing tools where available. Review click-through rate and watch time together and note which patterns work for your audience.'],
      },
    ],
    closing: 'Create thumbnail templates in [Canva Pro](/tools/canva-pro) and see our [4K editing pipeline](/posts/solo-creator-4k-video-editing-pipeline) for the rest of the workflow.',
  },
  {
    categorySlug: 'creator-media-lab',
    title: 'Batch Recording: How to Shoot a Month of Content in Two Days',
    slug: 'batch-content-recording',
    heroPrompt: 'Studio corner with a camera on a tripod, soft key light and a neat rail of plain folded shirts, calm and organised' + NO_TEXT,
    metaTitle: 'Batch Recording: A Month of Content in Two Days',
    metaDescription: 'Plan, shoot and edit content in batches so a solo creator can stay consistent without burning out: topic planning, shoot-day setup and workflow.',
    banner: ['info', 'Batch to Beat Burnout', 'Switching between planning, recording and editing every day is slow. Doing each stage in a block is faster and less tiring.'],
    intro: 'Solo creators rarely fail from lack of ideas. They fail because producing content daily is exhausting. Batching turns content creation into a few focused sessions per month.',
    sections: [
      {
        h: 'Plan the Month First',
        list: [
          ['Collect topics', 'List questions your audience asks and results you have delivered.'],
          ['Choose a mix', 'Balance teaching, storytelling and offers across the calendar.'],
          ['Write hooks and outlines', 'Prepare an opening line and three bullet points per piece before shoot day.'],
        ],
      },
      {
        h: 'Set Up for Shoot Days',
        p: ['Fix your camera, lighting and microphone in one spot and leave them untouched. Keep a few outfit changes and backgrounds so videos feel varied. Test audio at the start and after each break.'],
      },
      {
        h: 'Record in Blocks',
        list: [
          ['Group similar formats', 'Record all talking-head clips together, then any screen recordings.'],
          ['Keep energy up', 'Take breaks, drink water and warm up before each block.'],
          ['Slate each clip', 'Say the title at the start or clap so editing is easy to organise.'],
        ],
      },
      {
        h: 'Edit and Schedule',
        p: ['Edit in a separate session, ideally by transcript in [Descript](/tools/descript). Create thumbnails and captions together, then schedule everything so the month publishes itself.'],
      },
    ],
    closing: 'Turn each recording into many pieces with our [repurposing flywheel](/posts/content-repurposing-flywheel), and use a scheduler with [Make.com](/tools/make-com) to automate hand-offs.',
  },

  /* ---------------------------- Solopreneur Operations ---------------------------- */
  {
    categorySlug: 'solopreneur-operations',
    title: 'Client Onboarding System: From Signed Proposal to Kickoff',
    slug: 'client-onboarding-system',
    heroPrompt: 'Organised desk with a laptop showing an abstract checklist with ticked boxes, a notebook and a plant, bright natural light' + NO_TEXT,
    metaTitle: 'Client Onboarding System for Solopreneurs (2026)',
    metaDescription: 'Build a repeatable client onboarding process: signed proposal, deposit, welcome pack, intake form, kickoff call and clear expectations.',
    banner: ['success', 'First Impressions Stick', 'A smooth onboarding builds trust, prevents scope disputes and gets projects moving faster.'],
    intro: 'The days after a client says yes shape the whole relationship. A documented onboarding system saves you time and makes a one-person business feel established.',
    sections: [
      {
        h: 'The Onboarding Sequence',
        list: [
          ['1. Proposal accepted', 'Contract signed electronically with scope, timeline and terms.'],
          ['2. Deposit paid', 'An automatic invoice for the deposit, with the project starting once it is received.'],
          ['3. Welcome message', 'An email with what happens next, who to contact and response times.'],
          ['4. Intake form', 'Collect brand assets, access details and goals in one structured form.'],
          ['5. Kickoff call', 'Confirm goals, milestones and how you will communicate.'],
        ],
      },
      {
        h: 'Set Expectations Early',
        p: ['State working hours, how feedback rounds work and what counts as out of scope. Clear boundaries prevent most client friction and scope creep.'],
      },
      {
        h: 'Automate the Repeatable Parts',
        p: ['Use a platform such as [Bonsai](/tools/bonsai) for contracts, invoices and forms, and connect steps with [Make.com](/tools/make-com) so a signed contract triggers the welcome email, the invoice and a task list automatically.'],
      },
      {
        h: 'Review After Every Project',
        p: ['Ask what confused the client and what took you the most time. Update the checklist so each new client gets a slightly better experience.'],
      },
    ],
    closing: 'See how onboarding fits into your wider systems in our [operations engine guide](/posts/building-50k-solo-operations-engine).',
  },
  {
    categorySlug: 'solopreneur-operations',
    title: 'Pricing Your Services as a Solopreneur: Hourly, Project or Retainer',
    slug: 'pricing-services-solopreneur',
    heroPrompt: 'Desk with a calculator, notebook and laptop showing abstract charts, calm professional mood, soft daylight' + NO_TEXT,
    metaTitle: 'Pricing Your Services: Hourly, Project or Retainer',
    metaDescription: 'How to price solo services: compare hourly, project and retainer models, calculate your minimum rate and raise prices with confidence.',
    banner: ['info', 'Price Reflects Value', 'Pricing is a business decision, not just a maths problem. Choose a model that rewards results and protects your time.'],
    intro: 'Underpricing is one of the most common solo business mistakes. It creates overwork, resentment and no room to invest. A clear pricing model fixes that.',
    sections: [
      {
        h: 'Three Common Models',
        list: [
          ['Hourly', 'Simple to explain, but it caps your income and rewards slowness. Best for unpredictable or short tasks.'],
          ['Fixed project fee', 'Priced on the outcome. It rewards efficiency and gives clients certainty. Define scope carefully.'],
          ['Retainer', 'A monthly fee for ongoing access or deliverables. It creates predictable income and stronger relationships.'],
        ],
      },
      {
        h: 'Find Your Floor',
        p: ['Work out the annual income you need, add taxes, tools, insurance, holidays and unpaid admin time, then divide by the hours you can realistically bill. Your floor is the lowest price that keeps the business healthy, not a target.'],
      },
      {
        h: 'Price on Value',
        p: ['Ask what the result is worth to the client. A project that saves or earns them a significant amount justifies a higher fee than the hours involved suggest. Offer three packages so clients choose a level rather than whether to buy.'],
      },
      {
        h: 'Raise Prices Confidently',
        p: ['Review prices at least yearly. If most prospects say yes without hesitation, you are probably too cheap. Give existing clients notice, and apply the new rate to new work first.'],
      },
    ],
    closing: 'Send professional proposals and invoices with [Bonsai](/tools/bonsai) and follow the full process in our [client onboarding guide](/posts/client-onboarding-system).',
  },
  {
    categorySlug: 'solopreneur-operations',
    title: 'A Simple Money System for Solo Businesses: Invoices, Tax and Cash Buffer',
    slug: 'solo-business-money-system',
    heroPrompt: 'Tidy desk with a laptop showing an abstract balance chart, a small jar of coins and a notebook, warm neutral tones' + NO_TEXT,
    metaTitle: 'A Simple Money System for Solo Businesses',
    metaDescription: 'Organise solo business finances: separate accounts, timely invoicing, setting money aside for tax, a cash buffer and a monthly review.',
    banner: ['warning', 'General Information Only', 'This is general guidance, not tax or legal advice. Rules differ by country, so confirm details with a qualified accountant.'],
    intro: 'Money stress is usually a systems problem. A few simple habits keep a one-person business calm, compliant and ready for slow months.',
    sections: [
      {
        h: 'Separate Business and Personal',
        p: ['Open a dedicated business account and use it for all income and expenses. It makes bookkeeping easier, protects you in an audit and shows you what the business really earns.'],
      },
      {
        h: 'Invoice Promptly and Follow Up',
        list: [
          ['Invoice immediately', 'Send invoices the moment work is delivered or a milestone is reached.'],
          ['Clear terms', 'State the due date and accepted payment methods.'],
          ['Automatic reminders', 'Set reminders before and after the due date so you are not chasing manually.'],
        ],
      },
      {
        h: 'Set Money Aside Automatically',
        list: [
          ['Tax pot', 'Move a fixed percentage of every payment into a separate account. Ask your accountant which percentage suits you.'],
          ['Cash buffer', 'Build savings covering several months of expenses so a slow period does not become a crisis.'],
          ['Owner pay', 'Pay yourself a regular amount rather than whatever is left over.'],
        ],
      },
      {
        h: 'Do a Monthly Money Review',
        p: ['Once a month, reconcile transactions, check unpaid invoices, review subscriptions you no longer use and note your profit. Thirty minutes is enough if you do it consistently.'],
      },
    ],
    closing: 'Use invoicing and expense tools such as [Bonsai](/tools/bonsai), and read how money fits with the rest of your systems in the [operations engine guide](/posts/building-50k-solo-operations-engine).',
  },
]
