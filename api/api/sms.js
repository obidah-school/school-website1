// Vercel Serverless Function — SMS Proxy for mobile.net.sa (المدار التقني)
// المسار: /api/sms.js  في جذر المشروع

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, password, numbers, message, sender, debug } = req.body;

  if (!username || !password || !numbers || !message) {
    return res.status(400).json({ success: false, error: "بيانات ناقصة" });
  }

  // تنظيف الأرقام وتحويل 05X → 9665X
  const cleanNumbers = numbers
    .split(/[\n,،\s]+/)
    .map(n => n.trim()).filter(n => n.length >= 9)
    .map(n => {
      if (n.startsWith("05")) return "966" + n.slice(1);
      if (n.startsWith("5") && n.length === 9) return "966" + n;
      return n;
    }).join(",");

  const isArabic = /[\u0600-\u06FF]/.test(message);

  // محاولة 1: JSON + msgType
  let result = await tryFetch("https://app.mobile.net.sa/api/v1/sendSMS", "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ username, password, numbers: cleanNumbers, message, sender: sender || "School1", msgType: isArabic ? 2 : 0 })
  );

  // محاولة 2: form-encoded
  if (!result || result.status >= 400) {
    result = await tryFetch("https://app.mobile.net.sa/api/v1/sendSMS", "POST",
      { "Content-Type": "application/x-www-form-urlencoded" },
      new URLSearchParams({ username, password, numbers: cleanNumbers, message, sender: sender || "School1" }).toString()
    );
  }

  // محاولة 3: حقل mobile بدل numbers
  if (!result || result.status >= 400) {
    result = await tryFetch("https://app.mobile.net.sa/api/v1/sendSMS", "POST",
      { "Content-Type": "application/json" },
      JSON.stringify({ username, password, mobile: cleanNumbers, message, sender: sender || "School1", unicode: isArabic ? 1 : 0 })
    );
  }

  if (!result) return res.status(500).json({ success: false, error: "فشل الاتصال بـ mobile.net.sa" });

  const raw = result.text;
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch {}

  // دائماً أعد الرد الخام حتى نتمكن من التشخيص
  const isSuccess =
    (parsed?.success === true) ||
    (parsed?.code === 0 || parsed?.code === "0" || parsed?.code === "00") ||
    (parsed?.status === "success" || parsed?.status === "sent") ||
    (raw.trim() === "0") ||
    (raw.includes('"success":true'));

  const isError =
    result.status >= 400 ||
    (parsed?.status === "error" || parsed?.status === "fail") ||
    raw.toLowerCase().includes("invalid") ||
    raw.toLowerCase().includes("unauthorized") ||
    raw.toLowerCase().includes("authentication failed");

  return res.status(200).json({
    success: isSuccess && !isError,
    httpStatus: result.status,
    rawResponse: raw,
    parsedResponse: parsed,
    cleanNumbersSent: cleanNumbers,
    // إذا لم ينجح ولم يفشل بشكل صريح — اعرض للتشخيص
    debugNeeded: !isSuccess && !isError,
  });
}

async function tryFetch(url, method, headers, body) {
  try {
    const r = await fetch(url, { method, headers, body });
    const text = await r.text();
    return { status: r.status, text };
  } catch { return null; }
}
