/**
 * SoloStack Affiliate Integration Engine
 * Supports CJ Affiliate (Commission Junction) & Awin Network
 */

export interface CJConfig {
  publisherId: string
  apiToken: string
  linkStrategy: 'append_subid' | 'template'
}

export interface AwinConfig {
  publisherId: string
  apiToken: string
  linkStrategy: 'append_subid' | 'template'
}

/**
 * Generate deep link for Awin using template interpolation
 * Template format: https://www.awin1.com/cread.php?awinmid={merchantId}&awinaffid={publisherId}&ued={destinationUrl}&clickref={clickref}
 */
export function generateAwinDeepLink({
  publisherId = '123456',
  merchantId = '12345',
  destinationUrl = 'https://nike.com/running-shoes',
  clickref = 'clk_demo_902_10',
}: {
  publisherId?: string
  merchantId?: string
  destinationUrl?: string
  clickref?: string
}): string {
  const encodedDest = encodeURIComponent(destinationUrl)
  return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${publisherId}&ued=${encodedDest}&clickref=${clickref}`
}

/**
 * Generate deep link for CJ Affiliate using ready-built link + append_subid (&sid=...)
 */
export function generateCJDeepLink({
  publisherId = '8033258',
  adId = '7016661',
  clickref = 'clk_demo_902_10',
  baseLink,
}: {
  publisherId?: string
  adId?: string
  clickref?: string
  baseLink?: string
}): string {
  const rootLink = baseLink || `https://www.anrdoezrs.net/click-${publisherId}-${adId}`
  const separator = rootLink.includes('?') ? '&' : '?'
  return `${rootLink}${separator}sid=${clickref}`
}

/**
 * Diagnostic test helpers
 */
export function runLinkDiagnosis() {
  return {
    awin: {
      strategy: 'template',
      label: 'Placeholder Replacement',
      explanation: 'Interpolates {publisherId}, {merchantId}, {destinationUrl}, and {clickref}.',
      output: generateAwinDeepLink({
        publisherId: '123456',
        merchantId: '12345',
        destinationUrl: 'https://nike.com/running-shoes',
        clickref: 'clk_demo_902_10',
      }),
    },
    cj: {
      strategy: 'append_subid',
      label: 'Direct Parameter Appending',
      explanation: 'CJ provides a ready-built tracking link (anrdoezrs.net). The engine directly appends &sid=clk_demo_902_10.',
      output: generateCJDeepLink({
        publisherId: '8033258',
        adId: '7016661',
        clickref: 'clk_demo_902_10',
      }),
    },
  }
}
