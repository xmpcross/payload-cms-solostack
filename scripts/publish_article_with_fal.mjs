import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import sharp from 'sharp'
import { execSync } from 'node:child_process'

// 1. Read .env file for FAL_KEY
const envContent = fs.readFileSync('/var/www/html/solostack-cms/.env', 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [k, ...v] = trimmed.split('=')
    env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '')
  }
}

const FAL_KEY = env.FAL_KEY
if (!FAL_KEY) {
  console.error('FAL_KEY missing in .env!')
  process.exit(1)
}

console.log('Using FAL_KEY:', FAL_KEY.slice(0, 8) + '...')

// 2. Call fal.ai API to generate image
async function generateFalImage(prompt) {
  console.log('Sending request to fal.ai flux/dev...')
  const body = JSON.stringify({
    prompt,
    image_size: 'landscape_16_9',
    num_images: 1,
    enable_safety_checker: true,
  })

  const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`fal.ai error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const imageUrl = data.images?.[0]?.url
  if (!imageUrl) throw new Error('No image URL returned from fal.ai')
  console.log('fal.ai image generated:', imageUrl)
  return imageUrl
}

// 3. Download image to Buffer
async function downloadImage(url) {
  console.log('Downloading image from fal.ai CDN...')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// 4. Main Execution
async function main() {
  const prompt =
    'Cinematic editorial tech photography of a modern 1-person video podcast recording studio. Professional Shure SM7B microphone on sleek low-profile boom arm in foreground, 4K Sony mirrorless camera on minimalist desk mount, warm ambient bi-color lighting, clean oak wood slat acoustic wall panels in background, ultra-sharp detail, 8k resolution, minimalist creator workspace'

  const falImageUrl = await generateFalImage(prompt)
  const imageBuffer = await downloadImage(falImageUrl)

  const mediaDir = '/var/www/html/solostack-cms/public/media'
  const baseFilename = '1-person-video-podcast-setup'

  // Convert main image to webp
  console.log('Processing responsive image sizes with sharp...')
  const originalWebpPath = path.join(mediaDir, `${baseFilename}.webp`)
  const mainMetadata = await sharp(imageBuffer)
    .webp({ quality: 85 })
    .toFile(originalWebpPath)

  console.log('Original image saved:', originalWebpPath, `${mainMetadata.width}x${mainMetadata.height}`, mainMetadata.size, 'bytes')

  // Generate responsive sizes according to Media.ts:
  // thumbnail: 300
  // square: 500x500
  // small: 600
  // medium: 900
  // large: 1400
  // xlarge: 1920
  // og: 1200x630 (crop center)

  const sizes = {
    thumbnail: { width: 300, filename: `${baseFilename}-300x169.webp` },
    square: { width: 500, height: 500, fit: 'cover', filename: `${baseFilename}-500x500.webp` },
    small: { width: 600, filename: `${baseFilename}-600x338.webp` },
    medium: { width: 900, filename: `${baseFilename}-900x506.webp` },
    large: { width: 1400, filename: `${baseFilename}-1400x788.webp` },
    xlarge: { width: 1920, filename: `${baseFilename}-1920x1080.webp` },
    og: { width: 1200, height: 630, fit: 'cover', position: 'center', filename: `${baseFilename}-1200x630.webp` },
  }

  const generatedSizes = {}

  for (const [key, conf] of Object.entries(sizes)) {
    const outPath = path.join(mediaDir, conf.filename)
    let s = sharp(imageBuffer)
    if (conf.fit === 'cover' && conf.height) {
      s = s.resize(conf.width, conf.height, { fit: 'cover', position: conf.position || 'centre' })
    } else {
      s = s.resize({ width: conf.width })
    }
    const info = await s.webp({ quality: 80 }).toFile(outPath)
    generatedSizes[key] = {
      filename: conf.filename,
      url: `/api/media/file/${conf.filename}`,
      width: info.width,
      height: info.height,
      filesize: info.size,
      mimeType: 'image/webp',
    }
    console.log(`Generated size [${key}]: ${conf.filename} (${info.width}x${info.height}, ${info.size} bytes)`)
  }

  // Insert into PostgreSQL
  console.log('Inserting Media record into database...')

  const mediaInsertSql = `
    INSERT INTO media (
      alt,
      filename,
      mime_type,
      filesize,
      width,
      height,
      focal_x,
      focal_y,
      url,
      thumbnail_u_r_l,
      sizes_thumbnail_filename, sizes_thumbnail_url, sizes_thumbnail_width, sizes_thumbnail_height, sizes_thumbnail_filesize, sizes_thumbnail_mime_type,
      sizes_square_filename, sizes_square_url, sizes_square_width, sizes_square_height, sizes_square_filesize, sizes_square_mime_type,
      sizes_small_filename, sizes_small_url, sizes_small_width, sizes_small_height, sizes_small_filesize, sizes_small_mime_type,
      sizes_medium_filename, sizes_medium_url, sizes_medium_width, sizes_medium_height, sizes_medium_filesize, sizes_medium_mime_type,
      sizes_large_filename, sizes_large_url, sizes_large_width, sizes_large_height, sizes_large_filesize, sizes_large_mime_type,
      sizes_xlarge_filename, sizes_xlarge_url, sizes_xlarge_width, sizes_xlarge_height, sizes_xlarge_filesize, sizes_xlarge_mime_type,
      sizes_og_filename, sizes_og_url, sizes_og_width, sizes_og_height, sizes_og_filesize, sizes_og_mime_type,
      created_at,
      updated_at
    ) VALUES (
      'Professional 1-Person Video Podcast Studio Setup with Shure SM7B and 4K Camera',
      '${baseFilename}.webp',
      'image/webp',
      ${mainMetadata.size},
      ${mainMetadata.width},
      ${mainMetadata.height},
      50,
      50,
      '/api/media/file/${baseFilename}.webp',
      '/api/media/file/${generatedSizes.thumbnail.filename}',
      '${generatedSizes.thumbnail.filename}', '${generatedSizes.thumbnail.url}', ${generatedSizes.thumbnail.width}, ${generatedSizes.thumbnail.height}, ${generatedSizes.thumbnail.filesize}, '${generatedSizes.thumbnail.mimeType}',
      '${generatedSizes.square.filename}', '${generatedSizes.square.url}', ${generatedSizes.square.width}, ${generatedSizes.square.height}, ${generatedSizes.square.filesize}, '${generatedSizes.square.mimeType}',
      '${generatedSizes.small.filename}', '${generatedSizes.small.url}', ${generatedSizes.small.width}, ${generatedSizes.small.height}, ${generatedSizes.small.filesize}, '${generatedSizes.small.mimeType}',
      '${generatedSizes.medium.filename}', '${generatedSizes.medium.url}', ${generatedSizes.medium.width}, ${generatedSizes.medium.height}, ${generatedSizes.medium.filesize}, '${generatedSizes.medium.mimeType}',
      '${generatedSizes.large.filename}', '${generatedSizes.large.url}', ${generatedSizes.large.width}, ${generatedSizes.large.height}, ${generatedSizes.large.filesize}, '${generatedSizes.large.mimeType}',
      '${generatedSizes.xlarge.filename}', '${generatedSizes.xlarge.url}', ${generatedSizes.xlarge.width}, ${generatedSizes.xlarge.height}, ${generatedSizes.xlarge.filesize}, '${generatedSizes.xlarge.mimeType}',
      '${generatedSizes.og.filename}', '${generatedSizes.og.url}', ${generatedSizes.og.width}, ${generatedSizes.og.height}, ${generatedSizes.og.filesize}, '${generatedSizes.og.mimeType}',
      NOW(),
      NOW()
    ) RETURNING id;
  `

  fs.writeFileSync('/tmp/insert_media.sql', mediaInsertSql)
  const mediaResult = execSync('sudo -u postgres psql -d payload_cms -t -A -f /tmp/insert_media.sql').toString().trim()
  const mediaId = parseInt(mediaResult, 10)
  console.log('Inserted Media ID:', mediaId)

  // Build the Lexical AST JSON for the Article Content
  const p = (children) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
    direction: 'ltr',
    children: Array.isArray(children) ? children : [t(children)],
  })

  const t = (text, format = 0) => ({
    type: 'text',
    detail: 0,
    format, // 0 = normal, 1 = bold, 2 = italic
    mode: 'normal',
    style: '',
    text,
    version: 1,
  })

  const h = (tag, text) => ({
    type: 'heading',
    tag,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [t(text)],
  })

  const link = (url, text, format = 0, newTab = false) => ({
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

  const banner = (style, title, text) => ({
    type: 'block',
    format: '',
    version: 2,
    fields: {
      blockName: title,
      blockType: 'banner',
      style, // 'info', 'warning', 'error', 'success'
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

  const ul = (items) => ({
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

  const lexicalContent = {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        banner('info', '2026 Production Standard', 'This guide outlines a zero-headcount, broadcast-grade video podcast workflow designed for solo operators. You will learn how to capture uncompressed 4K video and lossless 48kHz audio locally, bypass cloud compression, and edit full episodes in under 45 minutes using text-based AI.'),

        h('h2', 'The Death of the Traditional Production Studio'),
        p([
          t('In 2026, building a multi-million-dollar studio or hiring a three-person editing crew to produce a high-performing video podcast is obsolete. Solo operators, niche creators, and B2B founders are outranking legacy broadcast shows from modest 10x10 home offices. The secret is not more cameras or complex hardware switchers—it is '),
          t('friction elimination through modern software architecture', 1),
          t('.'),
        ]),
        p([
          t('When recording alone, every minute spent fiddling with SD cards, matching audio drift, or syncing multi-track files is wasted leverage. A world-class '),
          t('1-person video podcast setup', 1),
          t(' relies on three non-negotiable principles:'),
        ]),
        ul([
          [t('Local Track Isolation: ', 1), t('Never rely on platform compression like Zoom or Google Meet. Every speaker’s camera and microphone must record uncompressed directly to their local drive before cloud sync.')],
          [t('One-Touch Initialization: ', 1), t('Your entire studio—key lights, camera power, audio interface, and teleprompter—must be ready to record within 60 seconds.')],
          [t('Text-Based AI Post-Production: ', 1), t('No timeline scrubbing. You edit video transcripts like a Google Doc, apply automated room audio mastering, and auto-export 9:16 vertical shorts in batch.')],
        ]),

        h('h2', 'The Core Audio Stack: Broadcast Tone Without Background Noise'),
        p([
          t('Viewers will forgive average video quality, but they will immediately bounce from harsh, echoey, or compressed audio. In an untreated home office or apartment bedroom, dynamic broadcast microphones remain the undisputed gold standard.'),
        ]),
        p([
          t('The centerpiece of our recommended hardware audio chain is the legendary '),
          link('/hardware/shure-sm7b', 'Shure SM7B Dynamic Microphone', 1),
          t('. Unlike condenser microphones that pick up keyboard clicks, PC fan whirl, and street traffic outside your window, the SM7B features a tight cardioid polar pattern and internal air-suspension shock isolation that rejects off-axis ambient noise effortlessly.'),
        ]),
        banner('info', 'Gain Staging Tip', 'The Shure SM7B requires clean gain (+60dB). Pair it with modern interfaces like the Focusrite Vocaster or Elgato Wave XLR which provide built-in +70dB preamps, or use an inline Cloudlifter CL-1 if pairing with older Scarlett 2i2 audio boxes.'),
        p([
          t('For mounting, avoid bulky tripod arms that clutter your desk frame. We recommend low-profile boom arms (such as the Elgato Wave Mic Arm LP or Blue Compass) which tuck discreetly below your camera lens line, keeping your sightlines clean and open.'),
        ]),

        h('h2', 'The Visual Chain: 4K Sensor Clarity, Zero Overheating'),
        p([
          t('Webcams—even modern 4K models—suffer from tiny sensors, noisy low-light grain, and aggressive digital oversharpening. To command immediate authority and retain high viewer retention on YouTube, pair a dedicated mirrorless camera with an ultra-clean HDMI capture card.'),
        ]),
        ul([
          [t('Camera Body: ', 1), t('Sony ZV-E10 II or Sony FX30 with unlimited record limits, dedicated active heat dissipation, and USB-C dummy battery power.')],
          [t('Optics: ', 1), t('Sigma 16mm f/1.4 DC DN Contemporary lens. At f/1.8 to f/2.0, this provides sharp facial clarity with creamy, cinematic depth of field that separates you naturally from your backdrop.')],
          [t('Capture Card: ', 1), t('Elgato Cam Link 4K delivering uncompressed 3840x2160 video at 24fps or 30fps with near-zero latency.')],
          [t('Continuous Power: ', 1), t('Never rely on camera batteries during live recordings. Use an AC dummy battery adapter to ensure uninterrupted power all day.')],
        ]),

        h('h2', 'The Recording Platform: Riverside.fm Local 4K Capture'),
        p([
          t('The single biggest mistake new podcasters make is recording remote guest interviews over Zoom, Teams, or Skype. These conference tools aggressively compress video resolution down to 720p with muddy 64kbps audio, and introduce catastrophic dropouts whenever internet bandwidth dips.'),
        ]),
        p([
          t('The modern standard for solo operators is '),
          link('/tools/riverside-fm', 'Riverside.fm', 1),
          t('. Riverside records uncompressed 4K video and lossless 48kHz WAV audio '),
          t('locally on each participant’s computer', 1),
          t(', completely independent of internet connection speed. While you speak, it continuously uploads the pristine local files to the cloud in the background.'),
        ]),
        p([
          t('Key solo advantages of Riverside.fm:'),
        ]),
        ul([
          [t('Zero Audio Drift: ', 1), t('Separate audio and video stems for each host and guest, perfectly locked in sync.')],
          [t('Live Teleprompter & Producer Notes: ', 1), t('Keep your episode outline and guest questions in your eye line without switching desktop tabs.')],
          [t('Magic Clips Engine: ', 1), t('Built-in AI automatically detects viral moments, crops them to 9:16 vertical ratio, and generates animated captions while you take a coffee break.')],
        ]),
        p([
          t('You can read our comprehensive review and compare tier pricing in our dedicated '),
          link('/tools/riverside-fm', 'Riverside.fm Software Profile', 1),
          t(', or explore active discounts on our '),
          link('/deals', 'SoloStack Deals & Coupons Hub', 1),
          t('.'),
        ]),

        h('h2', 'The Zero-Friction Editing Pipeline: Descript AI'),
        p([
          t('Once your episode is captured in Riverside, traditional video editing involves opening Premiere Pro or DaVinci Resolve, creating multi-cam sequences, manually listening for "ums" and "ahs", and chopping silence. For a 60-minute interview, this easily devours 4 to 6 hours of solo operator time.'),
        ]),
        p([
          t('Enter '),
          link('/tools/descript', 'Descript', 1),
          t('—the ultimate AI-powered text-based video editor. Descript transcribes your audio and video in seconds, turning your entire timeline into an editable document.'),
        ]),
        ul([
          [t('Edit by Deleting Text: ', 1), t('Cut out a rambling guest paragraph or false start by simply highlighting the words and pressing Backspace. The video cuts seamlessly.')],
          [t('One-Click Filler Word Removal: ', 1), t('Automatically identify and remove every "um", "uh", "you know", and repeated word across all speakers with a single confirmation click.')],
          [t('Studio Sound AI: ', 1), t('Transform imperfect room acoustics into a professional soundproofed broadcast booth. Studio Sound removes HVAC hum, room reflections, and background noise while synthesizing crystal-clear vocal harmonics.')],
          [t('Eye Contact Correction: ', 1), t('Glancing at your script or notes? Descript’s AI subtly adjusts your gaze to maintain authentic eye contact with the camera lens.')],
        ]),
        p([
          t('For an in-depth breakdown of text-based video editing workflows, check our '),
          link('/tools/descript', 'Descript In-Depth Review & Alternatives Guide', 1),
          t('.'),
        ]),

        h('h2', 'Hardware & Software Budget Matrix'),
        p([
          t('Here is the exact cost and spec breakdown across budget-conscious and pro-tier setups:'),
        ]),
        ul([
          [t('Audio: ', 1), t('Shure SM7B ($399) + Focusrite Vocaster One ($99) + Wave LP Boom Arm ($99) = $597')],
          [t('Video: ', 1), t('Sony ZV-E10 II ($998) + Sigma 16mm f/1.4 ($399) + Elgato Cam Link 4K ($119) = $1,516')],
          [t('Lighting: ', 1), t('Neewer 660 LED Bi-Color Key Panel ($89) + Softbox Diffuser ($29) = $118')],
          [t('Software Suite: ', 1), t('Riverside.fm Standard ($15/mo) + Descript Creator ($12/mo) = $27/mo')],
          [t('Total One-Time Hardware: ', 1), t('$2,231 | Recurring Software: $27/mo')],
        ]),
        p([
          t('Want to see how this integrates with ergonomic sit-stand desks and dual-monitor creator workstations? Check out our complete '),
          link('/stacks/1-person-youtube-studio', '1-Person YouTube Studio Blueprint', 1),
          t('.'),
        ]),

        h('h2', 'Frequently Asked Questions (FAQ)'),
        p([
          t('Can I record a video podcast with just an iPhone?', 1),
        ]),
        p([
          t('Yes. Modern iPhones (iPhone 15 Pro and newer) feature 4K ProRes capture and can serve as dedicated webcams via macOS Continuity Camera or Camo Studio. However, pair it with an external USB microphone like the Shure MV7+ or Rode PodMic USB—built-in phone mics will still sound echoey.'),
        ]),
        p([
          t('Why not use Zoom to record remote interviews?', 1),
        ]),
        p([
          t('Zoom compresses video resolution dynamically to prioritize real-time bandwidth stability, often downgrading your recording to 720p or 540p. It also applies aggressive audio noise gates that clip your words. Riverside.fm records uncompressed 4K and lossless WAV locally on each participant’s computer, producing broadcast-quality output every time.'),
        ]),
        p([
          t('Do I need a Cloudlifter for the Shure SM7B in 2026?', 1),
        ]),
        p([
          t('Only if your audio interface delivers less than +60dB of clean analog gain. If you use a modern interface like the Focusrite Vocaster, Rodecaster Pro II, or Elgato Wave XLR (which deliver up to +70dB of clean gain), a Cloudlifter is completely unnecessary.'),
        ]),
        p([
          t('How much time does this setup save per episode?', 1),
        ]),
        p([
          t('By eliminating manual SD card transfers, using Riverside for background cloud syncing, and using Descript for one-click filler word removal and transcript editing, solo creators report cutting post-production turnaround from 5+ hours down to under 45 minutes per weekly episode.'),
        ]),

        banner('success', 'Ready to Build Your Stack?', 'Explore the full hardware setup and software discounts available across our verified partner networks to scale your solo media operations today.'),
      ],
    },
  }

  // Insert into PostgreSQL posts table
  console.log('Inserting Post record into database...')
  const postTitle = 'The 1-Person Video Podcast Setup: How to Record in 4K & Edit in Minutes (2026 Guide)'
  const postSlug = '1-person-video-podcast-setup'
  const metaTitle = 'The 1-Person Video Podcast Setup: Record 4K & Edit in Minutes (2026) | SoloStack'
  const metaDescription = 'The definitive 2026 blueprint for solo video podcasting. Master multi-track 4K local recording with Riverside.fm, broadcast audio with the Shure SM7B, and automated AI editing with Descript.'

  const postInsertSql = `
    INSERT INTO posts (
      title,
      slug,
      hero_image_id,
      content,
      meta_title,
      meta_description,
      meta_image_id,
      published_at,
      created_at,
      updated_at,
      _status
    ) VALUES (
      $TITLE$${postTitle}$TITLE$,
      $SLUG$${postSlug}$SLUG$,
      ${mediaId},
      $CONTENT$${JSON.stringify(lexicalContent)}$CONTENT$::jsonb,
      $MT$${metaTitle}$MT$,
      $MD$${metaDescription}$MD$,
      ${mediaId},
      NOW(),
      NOW(),
      NOW(),
      'published'
    ) RETURNING id;
  `

  fs.writeFileSync('/tmp/insert_post.sql', postInsertSql)
  const postResult = execSync('sudo -u postgres psql -d payload_cms -t -A -f /tmp/insert_post.sql').toString().trim()
  const postId = parseInt(postResult, 10)
  console.log('Inserted Post ID:', postId)

  // Insert relationships: category 12 (Creator Media Lab) and author 1 (kspellman)
  console.log('Inserting relationships into posts_rels...')
  const relsSql = `
    INSERT INTO posts_rels (parent_id, path, categories_id, "order")
    VALUES (${postId}, 'categories', 12, 1);

    INSERT INTO posts_rels (parent_id, path, users_id, "order")
    VALUES (${postId}, 'authors', 1, 1);
  `
  fs.writeFileSync('/tmp/insert_rels.sql', relsSql)
  execSync('sudo -u postgres psql -d payload_cms -f /tmp/insert_rels.sql')
  console.log('Relationships inserted successfully.')

  console.log('--- ALL DONE ---')
  console.log('Post published live at: https://solostack.au/posts/' + postSlug)
}

main().catch((err) => {
  console.error('Execution error:', err)
  process.exit(1)
})
