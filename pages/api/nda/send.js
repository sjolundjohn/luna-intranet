import * as DropboxSign from "@dropbox/sign";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    email,
    fullName,
    companyName,
    title,
    addressLine1,
    addressLine2,
    addressLine3,
    phone
  } = req.body;

  // Validate required fields
  if (!email || !fullName) {
    return res.status(400).json({ error: 'Email and full name are required' });
  }

  const apiKey = process.env.DROPBOX_SIGN_API_KEY;
  const templateId = process.env.NDA_TEMPLATE_ID;

  if (!apiKey || !templateId) {
    console.error('Missing API credentials:', { hasApiKey: !!apiKey, hasTemplateId: !!templateId });
    return res.status(500).json({ error: 'Missing API credentials' });
  }

  try {
    const signatureRequestApi = new DropboxSign.SignatureRequestApi();
    signatureRequestApi.username = apiKey;

    // Create the signature request using the template
    const signerData = {
      role: "Signer",
      emailAddress: email,
      name: fullName,
    };

    const signer = new DropboxSign.SubSignatureRequestTemplateSigner(signerData);

    // IMPORTANT: These field names must EXACTLY match the template fields
    // From Docsign.xlsx:
    // - recipient_company
    // - recipient_full_name
    // - recipient_title
    // - recipient_addressl1 (lowercase 'l')
    // - recipient_addressL2 (uppercase 'L')
    // - recipient_addressL3 (uppercase 'L')
    // - recipient_phone
    // - recipient_email

    const customFields = [
      { name: 'recipient_company', value: companyName || '' },
      { name: 'recipient_full_name', value: fullName || '' },
      { name: 'recipient_title', value: title || '' },
      { name: 'recipient_addressl1', value: addressLine1 || '' },
      { name: 'recipient_addressL2', value: addressLine2 || '' },
      { name: 'recipient_addressL3', value: addressLine3 || '' },
      { name: 'recipient_phone', value: phone || '' },
      { name: 'recipient_email', value: email || '' },
    ];

    const data = {
      templateIds: [templateId],
      subject: "NDA Agreement - Luna Health",
      message: "Please review and sign this Non-Disclosure Agreement from Luna Health.",
      signers: [signer],
      customFields: customFields,
      testMode: true, // Set to false for production
    };

    const request = new DropboxSign.SignatureRequestSendWithTemplateRequest(data);
    const response = await signatureRequestApi.signatureRequestSendWithTemplate(request);

    console.log('Dropbox Sign Response:', JSON.stringify(response.body, null, 2));

    return res.status(200).json({
      success: true,
      signatureRequestId: response.body.signatureRequest.signatureRequestId,
      message: 'NDA sent successfully'
    });

  } catch (error) {
    console.error('Dropbox Sign Error:', error);

    // Handle specific API errors
    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body, null, 2));
      return res.status(400).json({
        error: 'Failed to send NDA',
        details: error.body.error?.errorMsg || 'Unknown error'
      });
    }

    return res.status(500).json({
      error: 'Failed to send NDA',
      details: error.message
    });
  }
}
