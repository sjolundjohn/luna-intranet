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

  if (!apiKey || !templateId) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error - missing API credentials'
    });
  }

  try {
    const fullName = firstName + ' ' + lastName;

    const requestBody = {
      template_ids: [templateId],
      subject: 'NDA - ' + companyName,
      message: 'Please review and sign the Non-Disclosure Agreement for ' + companyName + '.',
      signers: [
        {
          role: 'recipient_signer',
          email_address: email,
          name: fullName
        }
      ],
      custom_fields: [
        { name: 'recipient_company', value: companyName },
        { name: 'recipient_full_name', value: fullName },
        { name: 'recipient_title', value: title || '' },
        { name: 'recipient_addressl1', value: addressLine1 || '' },
        { name: 'recipient_addressL2', value: addressLine2 || '' },
        { name: 'recipient_addressL3', value: addressLine3 || '' },
        { name: 'recipient_phone', value: phone || '' },
        { name: 'recipient_email', value: email }
      ],
      test_mode: true
    };

    const response = await fetch('https://api.hellosign.com/v3/signature_request/send_with_template', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
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
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
}
