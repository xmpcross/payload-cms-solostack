import 'dotenv/config'

async function testNetworkAPIs() {
  const cjToken = 'I6RdTp0hEscu0v_O6C_wLoMOcQ'
  const cjPublisherId = '5724573'

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

  const awinToken = '4fe4b17c-16d0-4a18-93f9-1ecdee4c70ed'
  const awinPublisherId = '2918909'

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
