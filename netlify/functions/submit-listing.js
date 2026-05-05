exports.handler = async (event) => {
  const allowedOrigins = ['https://thevibecompass.com', 'https://www.thevibecompass.com'];
  const origin = event.headers.origin || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.business_name || !data.email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Business name and email are required' })
      };
    }

    const token = process.env.AIRTABLE_WRITE_TOKEN;
    if (!token) throw new Error('Server configuration error');

    const response = await fetch(
      'https://api.airtable.com/v0/appPlwjJooRNdfWAR/tbl0CMaqSyIc1I9F9',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Business Name': data.business_name || '',
              'Category': data.category || '',
              'Neighborhood/City': data.neighborhood || '',
              'Ownership': data.ownership || '',
              'Description': data.description || '',
              'Website or Instagram': data.website || '',
              'Contact Email': data.email || '',
              'Listing Type': data.listing_type || 'Free Basic Listing',
              'Status': 'New'
            }
          }]
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error('Airtable error: ' + response.status);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('submit-listing error:', err.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Submission failed. Please try again.' })
    };
  }
};
