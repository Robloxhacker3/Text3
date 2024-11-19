import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'File upload failed' });
    }

    // Example: Save uploaded files temporarily
    const ipaPath = files.ipa.filepath;
    const p12Path = files.p12.filepath;
    const mobileProvisionPath = files.mobileprovision.filepath;
    const password = fields.password;

    // Send to external signing API
    try {
      // Replace with actual API endpoint for signing
      const signResponse = await fetch('https://example-signing-api.com/sign', {
        method: 'POST',
        body: JSON.stringify({
          ipaPath,
          p12Path,
          mobileProvisionPath,
          password,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await signResponse.json();

      if (!signResponse.ok) {
        throw new Error(result.error || 'Failed to sign IPA');
      }

      return res.status(200).json({ downloadUrl: result.downloadUrl });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    } finally {
      // Cleanup temporary files
      fs.unlinkSync(ipaPath);
      fs.unlinkSync(p12Path);
      fs.unlinkSync(mobileProvisionPath);
    }
  });
}
