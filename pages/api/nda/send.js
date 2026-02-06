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

    // Log all incoming field values
    console.log('=== NDA SEND REQUEST ===');
    console.log('Email:', email);
    console.log('Full Name:', fullName);
    console.log('Company:', companyName);
    console.log('Title:', title);
    console.log('Address Line 1:', addressLine1);
    console.log('Address Line 2:', addressLine2);
    console.log('Address Line 3:', addressLine3);
    console.log('Phone:', phone);

    // Using plain objects as per official SDK documentation
    // https://developers.hellosign.com/docs/sdks/node/migration-guide/
    const data = {
      templateIds: [templateId],
      subject: "NDA Agreement - Luna Health",
      message: "Please review and sign this Non-Disclosure Agreement from Luna Health.",
      signers: [
        {
          role: "recipient_signer",
          emailAddress: email,
          name: fullName,
        }
      ],
      // Using API IDs from Docsign.xlsx as field names
      customFields: [
        { name: "608af3aa-0112-4555-b508-58de5338533d", value: companyName || "" },
        { name: "86dd0dfb-435a-40a6-9bdd-cee1533bf60d", value: fullName || "" },
        { name: "afa71294-589d-4afd-9f7d-99c4a01e802c", value: title || "" },
        { name: "67ea968c-2735-46f4-a8e3-c0e9b62e4f7d", value: addressLine1 || "" },
        { name: "16e87bea-ab75-4fd7-a204-05d6e06e6381", value: addressLine2 || "" },
        { name: "55b87e9b-db85-44c0-861c-163281881c42", value: addressLine3 || "" },
        { name: "5fe1655f-d47d-47f2-90ac-7f9581b225a4", value: phone || "" },
        { name: "33ccd4ac-5a35-4919-993d-7a6f296cf725", value: email || "" },
      ],
      testMode: true,
    };

    console.log('Sending to Dropbox Sign:', JSON.stringify(data, null, 2));

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
