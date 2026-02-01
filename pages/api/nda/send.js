export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    email,
    firstName,
    lastName,
    companyName,
    title,
    phone,
    addressLine1,
    addressLine2,
    addressLine3
  } = req.body;

  if (!email || !firstName || !lastName || !companyName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.DROPBOX_SIGN_API_KEY;
  const templateId = process.env.NDA_TEMPLATE_ID;

  console.log('API Key exists:', !!apiKey);
  console.log('Template ID exists:', !!templateId);

  if (!apiKey || !templateId) {
    const missing = [];
    if (!apiKey) missing.push('DROPBOX_SIGN_API_KEY');
    if (!templateId) missing.push('NDA_TEMPLATE_ID');
    console.error('Missing environment variables:', missing.join(', '));
    return res.status(500).json({
      success: false,
      error: `Server configuration error - missing: ${missing.join(', ')}`
    });
  }

  try {
    const fullName = `${firstName} ${lastName}`;

    // Build the request body for Dropbox Sign API
    const requestBody = {
      template_ids: [templateId],
      subject: `NDA - ${companyName}`,
      message: `Please review and sign the Non-Disclosure Agreement for ${companyName}.`,
      signers: [
        {
          role: 'recipient_signer',
          email_address: email,
          name: fullName
        }
      ],
      custom_fields: [
        { name: 'Company', value: companyName },
        { name: 'Full name', value: fullName },
        { name: 'Title', value: title || '' },
        { name: 'Recipient AddressL1', value: addressLine1 || '' },
        { name: 'Recipient_AddressL1', value: addressLine1 || '' },
        { name: 'Recipient AddressL2', value: addressLine2 || '' },
        { name: 'Recipient_AddressL2', value: addressLine2 || '' },
        { name: 'Recipient Phone', value: phone || '' },
        { name: 'Email address', value: email }
      ],
      test_mode: true
    };

    console.log('Sending request to Dropbox Sign:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.hellosign.com/v3/signature_request/send_with_template', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log('Dropbox Sign response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Dropbox Sign API error:', data);
      return res.status(response.status).json({
        success: false,
        error: data.error?.error_msg || 'Failed to send signature request'
      });
    }

    return res.status(200).json({
      success: true,
      signatureRequestId: data.signature_request?.signature_request_id
    });

  } catch (error) {
    console.error('Error sending NDA:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
}
