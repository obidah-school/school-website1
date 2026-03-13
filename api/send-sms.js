// api/send-sms.js — ضع هذا الملف في مجلد api/ الموجود في مشروعك
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { apiKey, numbers, message, sender } = req.body;
  if (!apiKey || !numbers || !message) return res.status(400).json({ error: 'Missing fields' });

  const BASE = 'https://app.mobile.net.sa/api/v1';
  const AUTH = {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // جميع المسارات والصيغ الممكنة من توثيق MadarSMSAPI
  const attempts = [
    { url: `${BASE}/send-sms`,      body: { mobile: numbers[0],          message, sender: sender||'School1' } },
    { url: `${BASE}/send-sms`,      body: { mobile: numbers.join(','),    message, sender: sender||'School1' } },
    { url: `${BASE}/send-sms`,      body: { numbers: numbers.join(','),   message, sender: sender||'School1' } },
    { url: `${BASE}/send-sms`,      body: { mobiles: numbers,             message, sender: sender||'School1' } },
    { url: `${BASE}/send-bulk-sms`, body: { mobiles: numbers,             message, sender: sender||'School1' } },
    { url: `${BASE}/send-bulk-sms`, body: { numbers: numbers.join(','),   message, sender: sender||'School1' } },
    { url: `${BASE}/SendSMS`,       body: { mobile: numbers[0],           message, sender: sender||'School1' } },
    { url: `${BASE}/SendSMS`,       body: { numbers: numbers.join(','),   message, sender: sender||'School1' } },
    { url: `${BASE}/sendSMS`,       body: { numbers: numbers.join(','),   message, sender: sender||'School1' } },
  ];

  const results = [];

  for (const a of attempts) {
    try {
      const r = await fetch(a.url, {
        method: 'POST',
        headers: AUTH,
        body: JSON.stringify(a.body),
      });
      const text = await r.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}

      results.push({
        url: a.url.replace(BASE, ''),
        bodyKeys: Object.keys(a.body).join('+'),
        status: r.status,
        response: text.substring(0, 200),
      });

      const success =
        json?.status === 'Success' ||
        json?.status === 'success' ||
        json?.success === true ||
        json?.code === 0 ||
        json?.code === '0' ||
        (r.status === 200 && json?.status !== 'Error' && !text.includes('Not found'));

      if (success) {
        return res.status(200).json({
          success: true,
          usedEndpoint: a.url.replace(BASE, ''),
          usedBody: Object.keys(a.body).join('+'),
          response: text,
        });
      }
    } catch (e) {
      results.push({ url: a.url.replace(BASE, ''), error: e.message });
    }
  }

  return res.status(500).json({ success: false, tried: results });
}
