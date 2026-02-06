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
    // Configure API with authentication
    const signatureRequestApi = new DropboxSign.SignatureRequestApi();
    signatureRequestApi.username = apiKey;

    // Create signer using SDK model
    const signer1 = new DropboxSign.SubSignatureRequestTemplateSigner();
    signer1.role = "recipient_signer";
    signer1.emailAddress = email;
    signer1.name = fullName;

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

    // Create custom fields using SDK models
    const customFields = [];

    const field1 = new DropboxSign.SubCustomField();
    field1.name = 'recipient_company';
    field1.value = companyName || '';
    customFields.push(field1);

    const field2 = new DropboxSign.SubCustomField();
    field2.name = 'recipient_full_name';
    field2.value = fullName || '';
    customFields.push(field2);

    const field3 = new DropboxSign.SubCustomField();
    field3.name = 'recipient_title';
    field3.value = title || '';
    customFields.push(field3);

    const field4 = new DropboxSign.SubCustomField();
    field4.name = 'recipient_addressl1';
    field4.value = addressLine1 || '';
    customFields.push(field4);

    const field5 = new DropboxSign.SubCustomField();
    field5.name = 'recipient_addressL2';
    field5.value = addressLine2 || '';
    customFields.push(field5);

    const field6 = new DropboxSign.SubCustomField();
    field6.name = 'recipient_addressL3';
    field6.value = addressLine3 || '';
    customFields.push(field6);

    const field7 = new DropboxSign.SubCustomField();
    field7.name = 'recipient_phone';
    field7.value = phone || '';
    customFields.push(field7);

    const field8 = new DropboxSign.SubCustomField();
    field8.name = 'recipient_email';
    field8.value = email || '';
    customFields.push(field8);

    // Create the signature request using SDK model
    const data = new DropboxSign.SignatureRequestSendWithTemplateRequest();
    data.templateIds = [templateId];
    data.subject = "NDA Agreement - Luna Health";
    data.message = "Please review and sign this Non-Disclosure Agreement from Luna Health.";
    data.signers = [signer1];
    data.customFields = customFields;
    data.testMode = true;

    console.log('Sending to Dropbox Sign with template:', templateId);
    console.log('Signer:', { email, fullName });
    console.log('Custom fields count:', customFields.length);

    const response = await signatureRequestApi.signatureRequestSendWithTemplate(data);

    console.log('Dropbox Sign Response:', JSON.stringify(response.body, null, 2));

    return res.status(200).json({
      success: true,
      signatureRequestId: response.body.signatureRequest.signatureRequestId,
      message: 'NDA sent successfully'
    });

  } catch (error) {
    console.error('Dropbox Sign Error:', error);
    console.error('Error message:', error.message);

    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body, null, 2));
      const errorDetail = error.body.error?.errorMsg || error.body.error?.errorName || JSON.stringify(error.body);
      return res.status(400).json({
        error: 'Failed to send NDA',
        details: errorDetail
      });
    }

    return res.status(500).json({
      error: 'Failed to send NDA',
      details: error.message || 'Unknown error'
    });
  }
}
