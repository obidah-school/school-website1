import React, { useState } from "react";

// ✅ تم استبدال الصورة الثقيلة بملف داخل public
const SCHOOL_LOGO = "/logo.jpg";

export default function App() {
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("School1");
  const [loading, setLoading] = useState(false);

  const sendSMS = async () => {
    if (!numbers || !message) {
      alert("أدخل الرقم والرسالة");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numbers, message, sender }),
      });

      const data = await res.json();

      if (data.success) {
        alert("تم الإرسال بنجاح");
        setNumbers("");
        setMessage("");
      } else {
        alert("فشل الإرسال");
      }
    } catch (error) {
      alert("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <img src={SCHOOL_LOGO} alt="logo" width={120} />

      <h2>إرسال رسائل SMS</h2>

      <input
        type="text"
        placeholder="أرقام الجوال (مفصولة بفاصلة)"
        value={numbers}
        onChange={(e) => setNumbers(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <textarea
        placeholder="نص الرسالة"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="text"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={sendSMS} disabled={loading}>
        {loading ? "جارٍ الإرسال..." : "إرسال"}
      </button>
    </div>
  );
}
