// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const crypto = require('crypto');

const verifySignature = (body, signature, signingSecret) => {
  const digest = crypto
    .createHmac('sha256', signingSecret)
    .update(body)
    .digest('base64');
  const computedHmac = Buffer.from(digest, 'base64');
  try {
    if (crypto.timingSafeEqual(computedHmac, Buffer.from(signature, 'base64'))) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err.message);
    return false;
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { headers, body } = req;

  // Verify signature
  const event = headers['x-chat-data-topic'];
  const signature = headers['x-chat-data-hmac-sha256'];
  const isSignatureValid = verifySignature(body, signature, process.env.SIGNING_SECRET); // Implement this function to verify the signature

  if (!isSignatureValid) {
    return res.status(403).json({ error: '❌ Invalid signature' });
  }
  try {
    switch (event) {
      case 'chat':
        const payload = JSON.parse(body);
        console.log(`Received Chat Event`);
        console.log(payload);
        break;
      default:
        console.log(`Unhandled event type ${event}`);
    }
    return res.status(200).json({ message: 'Webhook event received successfully' });
  } catch (err) {
    console.log(`❌ Error message: ${err.message}`);
    return res.status(400).json({ processed: false });
  }
}