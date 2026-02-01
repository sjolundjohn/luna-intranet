export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, companyName } = req.body;

  if (!email || !firstName || !lastName || !companyName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.DROPBOX_SIGN_API_KEY;
  const templateId = process.env.NDA_TEMPLATE_ID;

  if (!apiKey || !templateId) {
    console.error('Missing environment variables: DROPBOX_SIGN_API_KEY or NDA_TEMPLATE_ID');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error - missing API credentials'
    });
  }

  try {
    // Prepare the signature request using Dropbox Sign API
    const formData = new FormData();
    formData.append('template_ids[]', templateId);
    formData.append('subject', `NDA - ${companyName}`);
    formData.append('message', `Please review and sign the Non-Disclosure Agreement for ${companyName}.`);
    formData.append('signers[0][role]', 'Signer');
    formData.append('signers[0][email_address]', email);
    formData.append('signers[0][name]', `${firstName} ${lastName}`);
    formData.append('test_mode', '1'); // Remove this line for production

    const response = await fetch('https://api.hellosign.com/v3/signature_request/send_with_template', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
      },
      body: formData,
    });

    const data = await response.json();

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
      error: 'Internal server error'
    });
  }
}
