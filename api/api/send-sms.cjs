// api/send-sms.cjs
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { numbers, message, sender } = req.body || {};
    const apiKey = process.env.SMS_API_KEY || "";
    const senderName = sender || process.env.SMS_SENDER || "School1";
    if (!apiKey) return res.status(400).json({ success: false, message: "SMS_API_KEY غير موجود" });
    if (!numbers || !message) return res.status(400).json({ success: false, message: "بيانات ناقصة" });
    const numList = String(numbers).split(/[\n,،\s]+/).map(n=>n.trim()).filter(n=>n.length>=9).map(n=>n.startsWith("05")?"966"+n.slice(1):n.startsWith("5")?"966"+n:n);
    const results = [];
    for (const number of numList) {
      try {
        const r = await fetch("https://app.mobile.net.sa/api/v1/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
          body: JSON.stringify({ number, senderName, sendAtOption: "NOW", messageBody: message, allow_duplicate: true })
        });
        const text = await r.text();
        results.push({ number, status: r.status, response: text.substring(0, 200) });
      } catch (err) {
        results.push({ number, error: err.message });
      }
    }
    const anySuccess = results.some(r => r.status === 200 || r.status === 201);
    return res.status(200).json({ success: anySuccess, message: anySuccess ? "تم الإرسال بنجاح" : "فشل الإرسال", results });
  } catch (err) {
    return res.status(500).json({ success: false, message: "خطأ: " + err.message });
  }
};
