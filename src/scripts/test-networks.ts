import 'dotenv/config'

async function testNetworkAPIs() {
  const cjToken = process.env.CJ_API_TOKEN || ''
  const cjPublisherId = process.env.CJ_PUBLISHER_ID || ''

  console.log('Testing CJ Affiliate GraphQL / REST API...')
  try {
    // CJ link search / promotion query
    const cjRes = await fetch('https://programs.api.cj.com/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cjToken}`,
      },
      body: JSON.stringify({
        query: `{ publisher { contracts(publisherId: "${cjPublisherId}", limit: 10) { totalCount resultList { advertiserId advertiserName programTerms { actionTerms { id name } } } } } }`,
      }),
    })
    const cjData = await cjRes.json()
    console.log('CJ Response:', JSON.stringify(cjData, null, 2).slice(0, 500))
  } catch (err: any) {
    console.error('CJ Error:', err.message)
  }

  const awinToken = process.env.AWIN_API_TOKEN || ''
  const awinPublisherId = process.env.AWIN_PUBLISHER_ID || ''

  console.log('\nTesting Awin API programmes...')
  try {
    const awinRes = await fetch(`https://api.awin.com/publishers/${awinPublisherId}/programmes?relationship=joined`, {
      headers: {
        Authorization: `Bearer ${awinToken}`,
      },
    })
    const awinData = await awinRes.json()
    console.log('Awin Joined Programmes:', Array.isArray(awinData) ? `Count: ${awinData.length}` : JSON.stringify(awinData).slice(0, 300))
    if (Array.isArray(awinData) && awinData.length > 0) {
      console.log('Sample Awin Programme:', JSON.stringify(awinData[0], null, 2))
    }
  } catch (err: any) {
    console.error('Awin Error:', err.message)
  }
}

testNetworkAPIs()
