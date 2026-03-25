import React, { useState, useEffect, useRef } from "react";
const SCHOOL_LOGO = "/school-logo.jpg";

const FIREBASE_URL = "https://school-website-e3b8d-default-rtdb.firebaseio.com";

const DB = {
  async get(key, fallback) {
    try {
      const r = await fetch(`${FIREBASE_URL}/school/${key}.json`);
      const data = await r.json();
      return data !== null ? data : fallback;
    } catch { return fallback; }
  },
  async set(key, value) {
    try {
      await fetch(`${FIREBASE_URL}/school/${key}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value)
      });
    } catch (e) { console.error(e); }
  }
};

const DEFAULT_TEACHERS = [
  "طالب حمدي مبروك اليوبي","نايف عقال شريم الزهراني","حبيب سعد حبيب السلمي",
  "عبدالحميد عبدالمعطي حميد اللقماني","معيض صالح محمد القرني",
  "عبدالواحد بن مبارك بن عبدالواحد الجبعه الخنفري القحطاني",
  "حامد محمد عبدالله الزهراني","رامي علي حسن ال مطر الغامدي","حسن حامد إبراهيم الساعدي",
  "فواز محمد عطيه الثقفي","رجيان رويحي عتيق الله السلمي","صالح احمد سعيد الغامدي",
  "بندر فيحان طلق السلمي","عبدالله عبدالرحيم محمد الطلحي","عبدالرحمن ابراهيم علي الفقيه",
  "سلطان حمد محمد المقاطي العتيبي","عبدالهادي بن سالم بن عويتق المعبدي الحربي",
  "فهد عبيد عبدالله النباتي","طلال سعد ساعد السلمي","هاني رده لافي الجحدلي",
  "عبد الله حامد خليوي اللقماني","ضيف الله حلسان صالح الزهراني",
  "حامد بن عبد الله بن علي المحمادي","صالح أحمد سميح المجنوني","محمد عوض عبدالله الجابري",
  "محمد مساعد فويران اللحياني","مسلم سعد مسعود الجهني","مشعل مساعد عيد الحربي",
  "بدر سرور مسعد العتيبي","وليد مسلم سليم السهلي","مصلح محمد مصلح المعبدي",
  "جازي عبدالرحمن عبدربه الثبيتي","بدر حمد محمد اللهيبي","عطيه سعيد علي الغامدي",
  "علي عبدالله حزام بن عبود","محمد علي عبدالله المحوري"
];

const DEFAULT_WEEK = {
  days: [
    { name: "الأحد",    dateH: "10/10/1447", dateM: "05/04/2026" },
    { name: "الاثنين",  dateH: "11/10/1447", dateM: "06/04/2026" },
    { name: "الثلاثاء", dateH: "12/10/1447", dateM: "07/04/2026" },
    { name: "الأربعاء", dateH: "13/10/1447", dateM: "08/04/2026" },
    { name: "الخميس",  dateH: "14/10/1447", dateM: "09/04/2026" },
  ]
};

const ATTENDANCE_STATUS = ["حاضر", "متأخر", "غائب"];
const PERIODS = ["الأولى","الثانية","الثالثة","الرابعة","الخامسة","السادسة","السابعة"];
const ABSENCE_TYPES = ["حاضر", "اضطراري", "مرضي", "اعتيادي"];
const FARES_OPTIONS = ["—", "نعم ✓", "لا ✗"];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, title: "تعميم بخصوص اختبارات منتصف الفصل", date: "28/08/1447 هـ", category: "تعاميم", priority: "عاجل", content: "يُعلن عن بدء اختبارات منتصف الفصل الدراسي الثالث يوم الأحد القادم.", pinned: true },
  { id: 2, title: "دورة تدريبية في استراتيجيات التعلم النشط", date: "27/08/1447 هـ", category: "تدريب", priority: "عادي", content: "تُقام دورة تدريبية بعنوان استراتيجيات التعلم النشط يوم الثلاثاء.", pinned: false },
  { id: 3, title: "إجازة اليوم الوطني", date: "25/08/1447 هـ", category: "إعلانات", priority: "عادي", content: "تُمنح إجازة رسمية بمناسبة اليوم الوطني السعودي.", pinned: false },
  { id: 4, title: "اجتماع مجلس الآباء", date: "24/08/1447 هـ", category: "اجتماعات", priority: "مهم", content: "يُعقد اجتماع مجلس الآباء والمعلمين يوم الأربعاء الساعة 6 مساءً.", pinned: true },
];

const DEFAULT_ACTIVITIES = [
  { id: 1, title: "مسابقة القرآن الكريم", date: "01/09/1447 هـ", type: "ديني", description: "مسابقة في حفظ وتلاوة القرآن الكريم.", responsible: "أحمد العتيبي", status: "قادم", image: "📖" },
  { id: 2, title: "بطولة كرة القدم", date: "02/09/1447 هـ", type: "رياضي", description: "بطولة كرة القدم بين فصول المدرسة.", responsible: "خالد الشهري", status: "جاري", image: "⚽" },
  { id: 3, title: "معرض العلوم", date: "03/09/1447 هـ", type: "علمي", description: "معرض للمشاريع العلمية والابتكارات الطلابية.", responsible: "فهد القحطاني", status: "قادم", image: "🔬" },
  { id: 4, title: "ورشة الخط العربي", date: "04/09/1447 هـ", type: "ثقافي", description: "ورشة عمل لتعليم فنون الخط العربي.", responsible: "عبدالرحمن الغامدي", status: "مكتمل", image: "🖋️" },
  { id: 5, title: "رحلة متحف التاريخ", date: "05/09/1447 هـ", type: "ترفيهي", description: "رحلة ميدانية لزيارة متحف التاريخ الوطني.", responsible: "محمد الدوسري", status: "قادم", image: "🏛️" },
];

const DEFAULT_USERS = [
  { username: import.meta.env.VITE_ADMIN_USER || "admin", password: import.meta.env.VITE_ADMIN_PASS || "admin123", role: "مدير", name: "مدير المدرسة" },
  { username: import.meta.env.VITE_WAKIL_USER || "wakil", password: import.meta.env.VITE_WAKIL_PASS || "wakil123", role: "وكيل", name: "وكيل شؤون المعلمين" },
];

const FONTS = [
  { label: "نوتو نسخ", value: "'Noto Naskh Arabic', serif" },
  { label: "نوتو كوفي", value: "'Noto Kufi Arabic', sans-serif" },
  { label: "القاهرة", value: "'Cairo', sans-serif" },
  { label: "تجوال", value: "'Tajawal', sans-serif" },
  { label: "ريم الكوفي", value: "'Reem Kufi', sans-serif" },
  { label: "لطيف", value: "'Lateef', serif" },
  { label: "أميري", value: "'Amiri', serif" },
];

// ===== ثوابت سجل التقييم =====
const SUBJECTS = [
  { key: "math",    label: "رياضيات",        icon: "🔢", color: "#C00000", bg: "#fee2e2" },
  { key: "sci",     label: "علوم",            icon: "🔬", color: "#166534", bg: "#dcfce7" },
  { key: "eng",     label: "إنجليزي",         icon: "🔤", color: "#7030A0", bg: "#ede9fe" },
  { key: "arab",    label: "لغتي",            icon: "📖", color: "#C55A11", bg: "#fff7ed" },
  { key: "isl",     label: "تربية إسلامية",   icon: "🌙", color: "#833C00", bg: "#fef3c7" },
  { key: "soc",     label: "دراسات اجتماعية", icon: "🌍", color: "#2E75B6", bg: "#eff6ff" },
  { key: "digital", label: "مهارات رقمية",    icon: "💻", color: "#0891b2", bg: "#ecfeff" },
  { key: "life",    label: "مهارات حياتية",   icon: "🌱", color: "#15803d", bg: "#f0fdf4" },
  { key: "think",   label: "التفكير الناقد",  icon: "🧠", color: "#7c3aed", bg: "#f5f3ff" },
];

// مستويات درجات المواد
const SUBJECT_GRADES = [
  { value: "",       label: "—",       bg: "#f5f5f5", color: "#aaa" },
  { value: "a+",     label: "ممتاز+",  bg: "#059669", color: "#fff" },
  { value: "a",      label: "ممتاز",   bg: "#10b981", color: "#fff" },
  { value: "b+",     label: "جيد جداً+",bg: "#0ea5e9",color: "#fff" },
  { value: "b",      label: "جيد جداً",bg: "#38bdf8", color: "#fff" },
  { value: "c+",     label: "جيد+",    bg: "#84cc16", color: "#fff" },
  { value: "c",      label: "جيد",     bg: "#a3e635", color: "#166534" },
  { value: "d",      label: "مقبول",   bg: "#fbbf24", color: "#92400e" },
  { value: "f",      label: "دون المستوى", bg: "#ef4444", color: "#fff" },
];

const GRADE_OPTIONS = [
  { value: "",       label: "— اختر —",  bg: "#f5f5f5",  color: "#aaa",    border: "#ddd"    },
  { value: "weak",   label: "ضعيف",      bg: "#FF6B6B",  color: "#fff",    border: "#e05555" },
  { value: "accept", label: "مقبول",     bg: "#FFD93D",  color: "#5a4200", border: "#e6c100" },
  { value: "good",   label: "جيد",       bg: "#A8E6CF",  color: "#1a4a30", border: "#7dc8a0" },
  { value: "vgood",  label: "جيد جداً", bg: "#4ECDC4",  color: "#fff",    border: "#2db8ae" },
  { value: "excel",  label: "ممتاز",     bg: "#2ECC71",  color: "#fff",    border: "#27ae60" },
];

// ===== فصل مُحمَّل مسبقاً من ملف الإكسل =====
const PRELOADED_CLASS = {
  id: "cls-preloaded-1a",
  name: "الصف الأول / أ",
  level: "الصف الأول",
  section: "أ",
  teacher: "",
  semester: "الثالث",
  students: [
    {id:1700000000,num:1,name:"أحمد عطيه احمد الزهراني",nationalId:"1182501021",grades:{}},
    {id:1700000001,num:2,name:"أحمد محمد عويض القثامي",nationalId:"1165040138",grades:{}},
    {id:1700000002,num:3,name:"أنس سعود ابن مسري العتيبي",nationalId:"1166167831",grades:{}},
    {id:1700000003,num:4,name:"أنس غازي فرح العتيبي",nationalId:"1165535574",grades:{}},
    {id:1700000004,num:5,name:"البراء جابر احمد العمري",nationalId:"1165690155",grades:{}},
    {id:1700000005,num:6,name:"بتال عبدالله سعيد عطيه الزهراني",nationalId:"1166803187",grades:{}},
    {id:1700000006,num:7,name:"حماده محمد أحمد كناني",nationalId:"401231",grades:{}},
    {id:1700000007,num:8,name:"حمود تركي حصين البقمي",nationalId:"1164649848",grades:{}},
    {id:1700000008,num:9,name:"خالد عبدالله سعد الربيعي",nationalId:"1164213611",grades:{}},
    {id:1700000009,num:10,name:"راكان اسعد بن عيضه الحربي",nationalId:"1159582798",grades:{}},
    {id:1700000010,num:11,name:"رداد ضيف الله الراجحي",nationalId:"0160793238",grades:{}},
    {id:1700000011,num:12,name:"ريان حسين أحمد الزبيدي",nationalId:"1167468303",grades:{}},
    {id:1700000012,num:13,name:"عبدالرحمن نواف حجاب العتيبي",nationalId:"1165700863",grades:{}},
    {id:1700000013,num:14,name:"عبدالعزيز رجيان بن رويحي السلمي",nationalId:"1166369197",grades:{}},
    {id:1700000014,num:15,name:"عبدالعزيز عبدربه عبدالقادر اليامي",nationalId:"1166018455",grades:{}},
    {id:1700000015,num:16,name:"عبدالعزيز مشاري شباب العتيبي",nationalId:"1163926809",grades:{}},
    {id:1700000016,num:17,name:"عبداللطيف احمد علي الشهري",nationalId:"1166779452",grades:{}},
    {id:1700000017,num:18,name:"عبدالله محمد سفر العتيبى",nationalId:"1163919697",grades:{}},
    {id:1700000018,num:19,name:"علي محمد علي الزهراني",nationalId:"1165091149",grades:{}},
    {id:1700000019,num:20,name:"عمر مشعل محمد النفيعي",nationalId:"1166159960",grades:{}},
    {id:1700000020,num:21,name:"فارس عائض مقعد الغامدي",nationalId:"1162985525",grades:{}},
    {id:1700000021,num:22,name:"فراس عبدالله متعب الزهراني",nationalId:"1163565870",grades:{}},
    {id:1700000022,num:23,name:"فراس عجاب بعاج العضياني",nationalId:"1161629686",grades:{}},
    {id:1700000023,num:24,name:"فراس محمد عوض الشهري",nationalId:"1164941682",grades:{}},
    {id:1700000024,num:25,name:"فواز زكريا محمد الشريف",nationalId:"1166796266",grades:{}},
  ]
};

const SchoolLogo = ({ size = 'md', animate = true }) => {
  const circleMap = {
    xl: { outer: 300, ring1: 286, ring2: 268, img: 250 },
    lg: { outer: 200, ring1: 190, ring2: 176, img: 164 },
    md: { outer: 56,  ring1: 52,  ring2: 48,  img: 42  },
    sm: { outer: 40,  ring1: 37,  ring2: 34,  img: 30  },
  };
  const s = circleMap[size] || circleMap.md;

  const kf = `
    @keyframes logo-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes logo-pulse   { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
    @keyframes logo-shimmer { 0%{transform:translateX(-120%) rotate(45deg)} 100%{transform:translateX(320%) rotate(45deg)} }
    @keyframes logo-glow    { 0%,100%{box-shadow:0 0 8px 2px rgba(212,175,55,.4),0 0 16px 4px rgba(13,148,136,.25)} 50%{box-shadow:0 0 20px 7px rgba(212,175,55,.75),0 0 34px 12px rgba(13,148,136,.45)} }
    @keyframes logo-wave    { 0%,100%{border-color:rgba(212,175,55,.5)} 50%{border-color:rgba(212,175,55,1)} }
    @keyframes banner-glow  { 0%,100%{box-shadow:0 2px 14px rgba(212,175,55,.35)} 50%{box-shadow:0 2px 26px rgba(212,175,55,.75)} }
    @keyframes ban-shine    { 0%{transform:translateX(-150%)} 100%{transform:translateX(250%)} }
  `;

  const circleEl = (
    <div style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', width:s.outer, height:s.outer, flexShrink:0 }}>
      {animate && (size==='xl'||size==='lg') && (
        <div style={{ position:'absolute', width:s.outer, height:s.outer, borderRadius:'50%',
          border: size==='xl' ? '3px dashed rgba(212,175,55,.55)' : '2px dashed rgba(212,175,55,.4)',
          animation:'logo-spin 22s linear infinite' }} />
      )}
      <div style={{ position:'absolute', width:s.ring1, height:s.ring1, borderRadius:'50%',
        border: size==='xl' ? '3px solid rgba(212,175,55,.8)' : size==='lg' ? '2.5px solid rgba(212,175,55,.7)' : '1.5px solid rgba(212,175,55,.5)',
        animation: animate ? 'logo-wave 2.5s ease-in-out infinite, logo-glow 2.5s ease-in-out infinite' : 'none' }} />
      <div style={{ position:'absolute', width:s.ring2, height:s.ring2, borderRadius:'50%',
        border:'1.5px solid rgba(13,148,136,.45)',
        animation: animate ? 'logo-pulse 3s ease-in-out infinite' : 'none' }} />
      <div style={{ width:s.img, height:s.img, borderRadius:'50%', overflow:'hidden', position:'relative',
        boxShadow:(size==='xl'||size==='lg') ? '0 6px 28px rgba(0,0,0,.3)' : 'none' }}>
        <img src={SCHOOL_LOGO} alt="شعار المدرسة" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 90%', display:'block' }} />
        {animate && (size==='xl'||size==='lg') && (
          <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(135deg,transparent 25%,rgba(255,255,255,.45) 50%,transparent 75%)',
            animation:'logo-shimmer 3.2s ease-in-out infinite', pointerEvents:'none' }} />
        )}
      </div>
    </div>
  );

  if (size === 'sm' || size === 'md') {
    return <><style>{kf}</style>{circleEl}</>;
  }

  const bw  = size==='xl' ? s.outer + 20 : s.outer + 10;
  const bfs = size==='xl' ? 15 : 12;
  const bpy = size==='xl' ? 10 : 7;
  const bannerStyle = (delay) => ({
    width:bw, textAlign:'center', direction:'rtl',
    background:'linear-gradient(135deg,#1a5c33,#0d7a47,#1a5c33)',
    borderRadius:14, padding:`${bpy}px 16px`,
    position:'relative', overflow:'hidden',
    animation: animate ? `banner-glow 2.5s ease-in-out infinite ${delay}` : 'none',
  });
  const shineStyle = (delay) => ({
    position:'absolute', top:0, left:0, right:0, bottom:0,
    background:'linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent)',
    animation:`ban-shine 2.8s ease-in-out infinite ${delay}`,
    pointerEvents:'none',
  });
  const textStyle = (fs) => ({
    color:'#fff', fontWeight:900, fontSize:fs,
    textShadow:'0 1px 4px rgba(0,0,0,.35)',
    position:'relative', letterSpacing:'.4px',
  });

  return (
    <>
      <style>{kf}</style>
      <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap: size==='xl' ? 14 : 10 }}>
          <div style={bannerStyle('0s')}>
          {animate && <div style={shineStyle('0s')} />}
          <span style={textStyle(bfs)}>وزارة التعليم — الإدارة العامة للتعليم بجدة</span>
        </div>
        {circleEl}
        <div style={{ ...bannerStyle('1.2s'), width: bw * 0.85 }}>
          {animate && <div style={shineStyle('.6s')} />}
          <span style={textStyle(bfs + 1)}>تعليم ✦ تميّز ✦ انتماء</span>
        </div>
      </div>
    </>
  );
};
function Badge({ children, color = "teal" }) {
  const c = { teal: "bg-teal-100 text-teal-800", red: "bg-red-100 text-red-700", amber: "bg-amber-100 text-amber-800", blue: "bg-blue-100 text-blue-800", green: "bg-green-100 text-green-800", purple: "bg-purple-100 text-purple-800", gray: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c[color] || c.teal}`}>{children}</span>;
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`rounded-2xl p-4 ${color} shadow-sm flex items-center gap-4 transition-transform hover:scale-105`}>
      <div className="text-3xl">{icon}</div>
      <div><div className="text-2xl font-black">{value}</div><div className="text-sm opacity-80 font-medium">{label}</div></div>
    </div>
  );
}

function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);
  const [showFonts, setShowFonts] = useState(false);

  const emojis = ["⭐","🎉","📢","📌","🔔","✅","❌","❗","⚠️","💡","📅","🏫","👨‍🏫","👨‍🎓","📖","🖋️","🎓","🏆","🥇","⚽","🔬","🎨","🎵","💪","👏","🤝","💐","🌟","✨","🔥","💯","❤️","💚","💙","🇸🇦","🌙","☀️","🌈","🎯","📝","🏅","🌺","🍀","🦁","🦅","🕌","🤲","🫶","😊","😄","👍","🙏"];
  const stickers = ["🏆 تهانينا!","⭐ ممتاز!","✅ تم بنجاح","📢 تنبيه مهم","🎉 مبروك!","💡 تذكير","⚠️ عاجل","📌 ملاحظة","🏫 من إدارة المدرسة","👨‍🏫 للمعلمين الكرام","👨‍🎓 للطلاب الأعزاء","🤝 بالتوفيق للجميع","🌟 إعلان هام","🎯 للاهتمام"];
  const textColors = ["#000000","#DC2626","#059669","#2563EB","#7C3AED","#D97706","#DB2777","#0D9488","#B45309","#1D4ED8","#065F46","#7F1D1D","#1E40AF","#166534"];
  const bgColors = ["transparent","#FEF3C7","#DCFCE7","#DBEAFE","#F3E8FF","#FFE4E6","#E0F2FE","#FEF9C3","#D1FAE5","#FCE7F3","#FFF7ED","#F0FDF4"];

  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };
  const handleImage = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    readFileAsync(file, "dataurl").then(dataUrl => { exec("insertHTML", `<img src="${dataUrl}" style="max-width:100%;border-radius:12px;margin:8px 0;display:block;" />`); }); e.target.value = "";
  };
  const handleInput = () => { if (editorRef.current) onChange(editorRef.current.innerHTML); };
  useEffect(() => { if (editorRef.current && !editorRef.current.innerHTML && value) editorRef.current.innerHTML = value; }, []);
  const closeAll = () => { setShowEmoji(false); setShowStickers(false); setShowColors(false); setShowBgColors(false); setShowFonts(false); };

  const ToolBtn = ({ onClick, title, children }) => (
    <button type="button" onClick={onClick} title={title}
      className="h-8 px-2 rounded-lg flex items-center justify-center text-xs hover:bg-teal-100 bg-gray-50 text-gray-700 font-medium transition-all whitespace-nowrap">
      {children}
    </button>
  );

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-visible focus-within:border-teal-400 transition-all">
      <div className="bg-gray-50 p-2 flex flex-wrap gap-1 border-b border-gray-200">
        <ToolBtn onClick={() => exec("bold")} title="غامق"><b>غامق</b></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="مائل"><i>مائل</i></ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="تحته خط"><u>خط</u></ToolBtn>
        <div className="w-px bg-gray-300 mx-1"></div>
        <select onChange={e => exec("fontSize", e.target.value)} defaultValue="3"
          className="h-8 px-1 rounded-lg bg-gray-50 border border-gray-200 text-xs cursor-pointer focus:outline-none">
          <option value="1">صغير جداً</option><option value="2">صغير</option><option value="3">متوسط</option>
          <option value="4">كبير</option><option value="5">كبير جداً</option><option value="6">ضخم</option><option value="7">ضخم جداً</option>
        </select>
        <div className="relative">
          <ToolBtn onClick={() => { closeAll(); setShowFonts(!showFonts); }} title="نوع الخط">🔤 الخط</ToolBtn>
          {showFonts && (
            <div className="absolute top-10 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 w-44">
              {FONTS.map(f => (
                <button key={f.value} onClick={() => { exec("fontName", f.value); setShowFonts(false); }}
                  className="w-full text-right px-3 py-2 rounded-lg hover:bg-teal-50 text-sm" style={{ fontFamily: f.value }}>{f.label}</button>
              ))}
            </div>
          )}
        </div>
        <div className="w-px bg-gray-300 mx-1"></div>
        <ToolBtn onClick={() => exec("justifyRight")} title="يمين">⬅ يمين</ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="وسط">↔ وسط</ToolBtn>
        <ToolBtn onClick={() => exec("justifyLeft")} title="يسار">➡ يسار</ToolBtn>
        <div className="w-px bg-gray-300 mx-1"></div>
        <div className="relative">
          <ToolBtn onClick={() => { closeAll(); setShowColors(!showColors); }} title="لون النص">🎨 لون</ToolBtn>
          {showColors && (
            <div className="absolute top-10 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 flex gap-1 flex-wrap w-44">
              {textColors.map(c => (
                <button key={c} onClick={() => { exec("foreColor", c); setShowColors(false); }}
                  className="w-7 h-7 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }}></button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <ToolBtn onClick={() => { closeAll(); setShowBgColors(!showBgColors); }} title="خلفية">🖌 خلفية</ToolBtn>
          {showBgColors && (
            <div className="absolute top-10 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 flex gap-1 flex-wrap w-44">
              {bgColors.map(c => (
                <button key={c} onClick={() => { exec("hiliteColor", c); setShowBgColors(false); }}
                  className="w-7 h-7 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c === "transparent" ? "#fff" : c }}>{c === "transparent" ? "✕" : ""}</button>
              ))}
            </div>
          )}
        </div>
        <div className="w-px bg-gray-300 mx-1"></div>
        <ToolBtn onClick={() => fileRef.current?.click()} title="إضافة صورة">📷 صورة</ToolBtn>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        <div className="relative">
          <ToolBtn onClick={() => { closeAll(); setShowEmoji(!showEmoji); }} title="إيموجي">😊 إيموجي</ToolBtn>
          {showEmoji && (
            <div className="absolute top-10 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 flex gap-1 flex-wrap w-64 max-h-48 overflow-y-auto">
              {emojis.map(e => (
                <button key={e} onClick={() => { exec("insertText", e); setShowEmoji(false); }}
                  className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-xl">{e}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <ToolBtn onClick={() => { closeAll(); setShowStickers(!showStickers); }} title="ملصقات">🏷️ ملصق</ToolBtn>
          {showStickers && (
            <div className="absolute top-10 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 w-56 max-h-52 overflow-y-auto">
              {stickers.map(s => (
                <button key={s} onClick={() => {
                  exec("insertHTML", `<span style="display:inline-block;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:2px 10px;margin:2px;font-size:13px;">${s}</span>`);
                  setShowStickers(false);
                }} className="w-full text-right px-2 py-2 rounded-lg hover:bg-teal-50 text-sm">{s}</button>
              ))}
            </div>
          )}
        </div>
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="قائمة">• قائمة</ToolBtn>
      </div>
      <div ref={editorRef} contentEditable dir="rtl" onInput={handleInput}
        className="min-h-36 p-4 text-sm leading-relaxed focus:outline-none"
        style={{ direction: "rtl", fontFamily: "'Noto Naskh Arabic', serif" }}
        data-placeholder="اكتب محتوى الإعلان هنا…"></div>
      <style>{`[contenteditable]:empty:before { content: attr(data-placeholder); color: #9CA3AF; pointer-events: none; }`}</style>
    </div>
  );
}

const LOGO_URL = "/logo-edu.webp";
const SCHOOL_LOGO_URL = "data:image/webp;base64,UklGRu44AABXRUJQVlA4IOI4AADQrACdASo2AV4BPlEijkUjoiET2LYkOAUEpu7obiJuU7wB4xv7tB5F9m/qv7R6XFwf1X9o/wPq97qOt/N76H87v+b/5/+f9wf6p/8XuAfrF53nqg/vf/O/XP/QfAH+of6D/vf4b3nf8/+2fuX/xf+w/Zf4Av7f/tf/b2Bv+T/23/t9wX+f/3n/s+uF+5f/q+Tr+z/7r9x//H72H/79gD9//YA/f///9pv2C/un43eD39u/tv7TegPi48q+zn949u7KP2Gf63oT/JftJ+H/t/+I/0/5b/fP9h/2n25+ifxn/yvth+QL8c/lP9//Lb/Dfu77tf8d2wYAfzL+gf5j+5/5D/sf4z5Afqv+r6IfZf/Lf139o/oA/Uj/F/3z9s/8Z///ex/13jM+m/QB9gP8z/pf+W/tX7x/4/6df53/uf5X/Y/+3/W+3f9F/xP/Y/xvwGfzD+pf7b+5f5r/2/5v////P7y///7kf26///uwftT/6zwipoANMb1DqGZXQlqeSu2CusocRq1gP4OKHRkCrF+BumjDNlkAtmu08mP6KjcjBV2R7p+N/E7j+1e7UaEG4a7OBp3GPWVuXuw+l/9LPdZ4Orh6F3gsjoT6R8orf/j87cPwOx+PEzqP/R9EpMn3rvz8bB56H/wzJB4whpbGIr/zFme+EQxIiII4tnaKjWhH54lA1ar6kiCNgk4mkNyG1a4DL0wa93tQIBrDSIFPhJRIbUblo5ZDQoZ4+wAbt/QYrri98Cml2wm239wKYfhf0fn6MStOuR9lpkZBKGFsbEoeC6ROLFeZgN+KAJkVC3RoU2MOftG3opcRi56bycYAFS5E+m7zII7cD7BsPO0U5pP5VyEGjs1gLKThMEPjPlaOH5F6CRjUjUvCs6z2CauwMFDusrkek1syclTI8QjsStOAOWEQH+Gt4h6ZaZKjAlk/XedHUHxWj6EKJF/zlNWhpCo8nEXPwt/JGmBoqFakmfpOOE519GlQoXZ2ZdwkypE9W7klKTfCzymM76nI8MDN4U3dCfifuU6q8QKghkqAp+0Sb3Oo6sZt7TWxHnlhvO6+m5VMg7r7LA6ZTwaJ39C6ocipw5BiBck0Y8m5bBdrJC6b04zyo5jjZ02EgZRDf+VXXoef6V9feeu280Oi5tyWmIdj5li7isRAWozcnsVNpXbx/T0WOEBjgdaNfFdJHed0ojaTYuO9C3RIX3ivssUgjEW9/vJX6I68eWzXbd9oMVn/UEqtOB3HeuhchFT4q2T6DNlgkTXQ5RTF/+blHBi/ZsnAulteIW+m8ZwI9EyFHCTx41c+uCxHIe+1a/5gU0znfdUni1byEaPm4vh0roWDYgCuT87l2h8SG4VjB5CPXezcGw86/Vq0o8wN8PKgXB+LsgBdj8g2GHgHFWwwVumvraUki0gZ6ROIW2dRDfnJPcdyaYXOWaqwRMNcEsfFRLHSF9XNU1TDE6ccBIQuOPEbtQ+6td5nd2VAm+a7JRo3YUYupJIRo3+GoSd6rGcy5/pnki+LUOpqien4wtrajsHaS+ujTANBumZOgK3sKm50SxM6n6Msfslf4p6f/sSv/DrEvqGLwx9uWCR+B6Jgiga6X/sB3S0OUpJNb84Lpmf+b9XvHHQQ2bxx5ZG7JuWOSMhB0c+cA7NtCIir6kNfuUNA83nTOy1VyWnUnmBrbPW6ZxcllDQwIxeN8jku2wlVkQc0u3nQSsB3I86N4NY/W+0N8wd4FpRy47zpVANVY13b8dHmJJG9ZLoWrwCwQiHhA3PSNAoX33mlVWGfvVsdTbzhlonldR7uyyCzROH5OoHHs+tko4lom0cOaa0UrWozgrdN4OepnR2C8gdJ6ZiT4JnTgAD+7DKS8rx2MEio3QK4/KH5en6K+XusbUTOo6y+j1BVEXWLKyv23QVZWDI96Qd3Pb+WyT/NEQWdjXIlOnVK10Ff+GL0yFtvi0PUuDxcftp80RbYA73Slv0S4o7iNToGA5iME9Hal8UvEIp/D//9E4DFtL1GDZoFHaDRqnHXm1ZAHfIiTIWH9cAo7eXcLGHsbnfy3kSqFKz9599aKnfD33vx/1hDnzi3A6cElEgrXE1J5knsrsuAQwuNDfquK+NdS44ERV6HdPLjVXBn3dHkEFAbNfWduKljQEf3I6mw5guVwtenGmOhQPRLw0BrBhp0Q/jEM4AT5jqzJkrnt8M4di+ddVmTnK7NLvh7Yn9CCTKB1/WeDBY7jKGRgCKy7+To8QHPkoYYvYPqbQTuYPYXt7SSm5L+yPOV8Ct1Ht0ZXg40+du4YD3oN5glz6mJld1gtzRmeudrgGMgpgOeh7nS00ajbhJVvuGh6aLSZ32Xz37FomYTsRLIWsIcHpG2zpcEqBFqVoUDlBb+hxzulD1+nTkdDGTFiwg7gDFO93CtReDyFiqK77i0AYJpkPmvIWE3FFkvamaO/oQg0chLuW9ed1FO+e/VHSfju7Zmy2paMjJA+v8PEAUYOUVJpgGeS+00mKgC1fiDsrru+PlryHlnK7dlG3nbdMf4INPOSuF9YghIdyeGGDQ8+rgSBo82xu0lAGeVOUcLKhph06c3YEp1J4zY+BR/MSSJW4AHVP2eg6Uh1FQv9pAcF0fmFamQ9f/ixlkn7czXXPeNn5/urHeo1+Ed1pLljQsdPxrQ9xteQ8bkssf1pwcsdzO0kp3DOnVj63/WJinK5tpwxIGvtX1i/bLGPjMEvftUaL76RKGti7EvaSGBe667+7LSDj1hCJjnyf7D4DytNaFqXikHj8o4aBr5Vl7XumWD0bc0NdMeniCCuJBblyehYPOYfym7arCfsh/uKH+8FmX6pkXzOxA1aAjXCEpG6VIYyzNZ8mxNE2gh0ydCej1hjrO10ftYP1ruMjtZge0SRpXSeO5fnXh0FMY5MiHi9p9HnN/UdjnoHbZeFeq70NnUxsm2PC/A9XKprTM3Fd8pROJyu4sGIWxKfLk259RtHsvAvfMolN1qtXa+5VCLU0cTANiDUhr8OLEnyvJluvAj3WuWGz3FmxvUp3SltD/DlagP9K+58gvSdhtQi8xI7g3o4nfqqSkU8hgMes0yXcdYrFKwseEvDcXo5djGkFEcei0keo830lQm+Jzx9uJYkPQMu+vqz/BRC85t2Zo2nROA1X1XXonnIeIRVYyv1QQwkCf33kTks02uturXF8nGYg/DvCXSxIaiwnmgFVq8BRBzx/QFioHQfxYfpCiLO3yAMS5kn3/bDyVRfQG4MaEfoWzlcs78eLjpWL1tkNiyPnu0URA4mRuHGUekAd0R4P88CMUYljcWnZXjQHc+bJMiFhJW9SzUP+F5mU0qMYfvjAjyIbwkrnE7baS7SUIIOtxNDujQqlTTNYAZoC1q2PBcDY4f6Otz5xCTpNyKCO5f760rHijT1QTLCIjO7q+6oZo4HtmUbs4OHk8USbX/BZW7apx13+GgdoUzgH+cUFsIurJjdnE707dRKpHT5/xER9D68tM53I+wkm0El8WFzB/Kcx1GnOcrWDF9MylhIoznnibAEOonghUsdDOtc/Kau3z9Hczs5RWT0CuItBzLyJR5WPZUWD0K/m/QYcBheUI9Qfb0mVMZXiYT/9TnvgLgHCZOpYPhKVUYHqwh5bbOojhwfrtObQFiVrq+J8QGgLGLhIzfkKwYNzFn1rCXw2O6AHPssp+2Dp2qLVzHy6iut2ukzPkb+ZJfddq3s4baDhCwAyCDpyrIPtwyZESuGR8nGhrOBO9HPhMdjpb1GH+1UPwFz8/XOoU/t+rEO2mrzlwHA5X6cI9F98X4HCiEO24+NHa7d6p6D08ag1MmM+wxv1ces0eVv80qn9UChIoLo2Ns3HmbOJ+x8Oybe0+ag5HtRqP3wGDlmX3twuR5B/pK3U0qrOQ7omEzi3cenJqJnW3zrwyZex1kTxf0Es+q3v+BWTAGlI8OY3Ba2RQ0pbd/JNmFef4sJCUARHdr4xG1Gs6Fpm8gck4bW4KqRPFF+I3Crvo0KvXnG5/7vF5sto+zbc8lOczarZvMYzQEwvuqGnjTneJ1W2duIIHJrBuvD08AJl6coBkDPZwCAQLCwcaH27Hwdz49MAcR8OzQlbMqwdTunYZEKWrhui6lA/NzEirEDv/03TJS+87iyg9/6OEpfczeq2SAydW+rRVmGbSmMtp8rxsag+u+HTjIcLdWecEiEp+cOXPPs61qoiQ+N53MRdWV3Rw+V7NiWkADOIlpZFGiDw5fMqfIvmVb7hVvHZXcQH9KOri2F/NFuvKjr0CiG7gNvgcU9yUrOTWYUMFMbxyqofS+IdeAqQs+GwHcrtxZDuUD8J4QoqktXcdO3Ua/huUeUsgPDRmiIQy0iKQXFRPAoYn4e+Ko2izWduU54y3LuuZpuY4RLwdjoZLgbYHDn67TARTovhHpuWVIX6rXQgjvv8UlcfGe+yGXBbTNPZi33zzUjfHDnK+KOUuadB1IBWrIVvYdcSMX1ajCjss0glUrmdMqn+8txnO3Mc6+KwvrKQhbUO9u0cHSNaCT6+jWTPBjDQSJf/TO4Y20nv/rfOnVJW8Sq0wVSsQUlmZvtf2UoU0yHEeukJCXDf+lehzPEctweGlUyYQZzU/UN+T0cpJS4GSItTnhmQIQSngdr03cYp5wGhQxJN1YPGP1FocwfyKz5vEFPN/U+wuUgRAAJhNPL3FzJToXL470zGpTWknzs0Yh6Wq6jns8FPZyWcMzMRTzC7qsT3dYIUdt092SJY7oS0byVZoubh7bXMddekzm9qVb5WWqnjbPxhQREq3h0yyv7DzdvOQoeEFLhJrBqDV75WQSwzzvQepr4f9CEBjsO4BEqu8Xr6obO0OPEZagV+lMXy8NAfweuhxPSBpuxQWCRpbceA8j85Vurr9637l2KcCFjGJKvkgsDgswWlRipvwZQm6fDnpLZ+2bmo49VsnY7M72gxjxGfxhPrOlMpygy3+Ga89I8+RhhqiNTC2LuzSnuzavsY0WIWcKSBVi7FpXrM+/8rx6xueuDdHdDUl5TMnjvDCEsOQ8GPm4qxpMyWIrhvAii2KMNsF4LwC2kMoXlCoNv1mOadpXKKq3MXtz2wKV+TAopDgRXy+NRISJuLa4TIg86pqzwI4vNxQUJDTCpE6YgxY9goLm4g2CaHcZCB+RLVphGvxQJsv5cu2Uj1IjILC1SN9qLd5MgDgOJYt4UcDHtyCig1VXFv9sRxb1EAunb5Gc87+0LEER2VCxAaLl6RREokMif4HqeZCRP84tBd9NWEUMN7i2Z7ElDAd9Gf34H6RkUEXlKhWvK5Bbr3e1Q2tbFkt/0JkWeZrs/WYurtteiXE/R/ay7BhXZJQDu3n0VbYBJE/U/ptGCgbq/IBm1c62yjVlqtHMz+r6848L7rIlo9beVWT+GwB+BebBHSfeSJJl6+r6mtQrW8y2BZ1u1jTUaTSxP63sI6ymvolR1wyA6TEGSkId0smb+LowO7dG1jcxpz9lCvbb9MuKnwLTCRubwhnauX6dpfGp7y9bfKM+CiS93u+2yXSEwYVLkDy8p2Ums7T1ELns/dMri9faMPlk8GizjFRL4aBVUNmQAABhVDa5rhMq8VegYRe9z7W9a+I+vjx6j422Mc1XrTXO4Tyfb5ZX2BBu03165MLCtVu1r6uNHOQzsJd8ZWxJWJgDaMUjCftoUbIUKfpD8xSSmruDYe+RdERqiVOYIi6+a87+xMSeWqqOCrVQzd6LExm3Mgmkz3+WOr9P5LeTMp7uv6Ryu1s3tfhuIlGxC88KJQ1OdDaOIvFXufr9T2zQykw3f3qjQ5V1HD0LcPWMlmGI/0nftclnuIOcVNy2bc86edw6HIiQSMU8X1/jvi1ipPLPDBMKZv+npgtSqcPuTzYkQJIM9RCLowkSkBFPLAEDwtPIkcZbKToePw1OywBQxGpWgZaxgs19Re0HQYjptOlrweV8sDavKBg5rPMdfSJJOL9QxLByK2Tg/SdOFlWE+wA7iInGYzJ3eLge7kVVti+idAe8SI+3+XxN0QBB+muZR2voyNLXSW+XV8NYsJ2Pc6m9e8oBE6W74bFtO9rQgBPZNCcX7tQxc0EjJnoLfxGo+FxYGMq4QIFw4AEQWA+DakqFZ530RsQHGquBwSXD9E1MRazHP8lNng4r8r9bYtFKdrVxZQYSwZVTTmuz2hIXMjZCyeh/jIi+9Gn8DEgv9CXfx1X859DSkv2RH0szzPVq7utHqSTaXktdOG51pYCqEJIuhBkLGOpW+QCNiOFspWYvaPS7e1epyiNhgjssd0219X6BKfDxkUO1eXoIE5wmikPZWYEINxgbKaKRStgaj6xgmgLM0nTTSVjHrj6luOuLRoV3Gtfr1CkHVUyHjX0FuYF5xtoWGtONhJln8RoMB1oGT2nq9SS4BzwpzT9DVYK4FfFA6AJ5e9Pg5gNNbrsfbC0UXrLWS6yCC8KIsN5Wb0Qo13Qnc6dUAfX0oiLav3cW9WSDD+Vtbn4rENRlqKLMVwtystKzSv4rKDBF1gQsgbeaXl9lrxNWe5e47VENPVcEMnTYGvzSx+oCGxqQpJEHrLRpVKI/7l3GbOlFyhQE/JKskzlLI/UNaZ1BmSbGQ82oW4HXmdLxpBKU65Hsb5FnfKtVbozF4SpM5QmElPdOnkfWS9tAzfSsKZiHaQXS/S2CLPv2c1XSyIMQBBvSHat/cxBxTA8GhoHC6So7UNU0ccjEIgzu4tu+USJefJ7bBLs0AKEle5WCskhJTReQKjvYH8v58ld6TAiYuWdaD4Kk7b2Be1MWXnsB43eaROePUsLM1KsbjF1IGyKy7/K93odua7oAi5stiVY+O+rZ1em6nvPIR3k5DWANfy0lAfo/Du4ug4VA2DtCQCGKuTPfsyCBldPOme3IMDWjXljKpdtAcDLVi9YPmboxeX/QgJ82vigWsOYuZwVTEyTezZj8jdAZCXyMVqLImuYZmMmESX7zbXmmNaUqq4i9gNOVnrAmeyJXa+TCJ2w5ek/DAXR7DSMCH4ktpEFrZyfgQAHTTKxFrjZLlAb4v5XJ54tLJG29x7a9SRJ099DvomX4l7OEDuI/CIwXZ79sZDEAE33Se7ZfQT0zP+cQ5lKsPtfjWNH0/KyT/pIxuMN6SuOkLbR7Ib9LecqUInAZiMBQ1e94EhSnck82RrTLQlsLWdp0YBXsYEr30/EwTA8pFTMRLTPfC+NFbt+xg71OFdi54tHar2jbF1wgL29w3SjQYWDZ53Lfu4RV2ZU9tSziASYCiuj08Z5qNm7i/1aZD6JvLptgeLpTRoKiC9B5H+seMIsYI8LQ6yfjrNuHy0I0L2spM5xhfR6foiA83OaTsIvCMGGUvLWWObsvxp0xM5R7kXoUJEP1IH27GbBL3gQtZpBKQbNR7yquO8ek/vFAZA41fmeGyXAqiHjInh3dBSpQvhmXyulo6lq3FJRwq/CRw9dntwjB2JccXdok+V8lCWJX5uak8ADD6y315lKugzOrE3TXPcdxbG98Zh6Wc6YrCHUQ54/v3Z+qsxQpfff9P0CqA0RU7Jqf0r7M/zRrUPfFsuUgP1JHoqEX9yA0Ah/LfXXu0toNyk8csX4452bX4Vv1t1daFVDW/tFhpqxp5+RKb1ifhRjZANsXsOpdGMH9FISFO3clYEIU4v7DbwBDuRbaWL2WPEOpA0oDi7n2QjHoPvdmZG4e646dltQ57rHyNvzG9xzi5YQq/p3BNzrpNtdnyRqj2P9w3UsoVZqffQEH7L0xFPgEn99W/vzYjMxqhiMqJyfIfQFMrIM/M6ZQ/QWOj24Gh4iy7azMsieXY9PTCnTuYGP+ekS+3rVwso3Luzvk9WDrQ8/UWIZwqfEKrCBJf0H8YQSDm9fu55fWCTnq4MiBhPimjKuWmeKt8Cx5WeK2iCBaWWKMYfmDBEFeX345WGjjbABOD7pAX99P9tjySKUz1bc5ZetsIKzwYEOkA/QuwYOeioBlkIhPps8qrjnvex2uuvXpXhp3xxnKh1LaMTqeEJF/pEkpZ1sEvjTAnYJyVtvexM9NJI8lzkmahyjLLWvgIgQSLfQDxfo0yYlNmJ72KZXYhmzd8BSzphL2skFRL4b9Lh57EyhIWf7a6krfGQlcNhoU9NW9qIELBpf9U38ADi+yWuaV24xQJx8FKMc3joUjBM0QRyPT5EOenY2LPXAklpzDmF7rb8F53SA+Zgw0bcZFHXFT4RRmUXscs2+B6vbjIXB/p5EmoEQi5ja8SdQP2SMNoBgiRlwYAhVzcEQND/XwegYowhzaV3efojii5pQLK6f4b2R1PytIrqXLpHujQmC9RYSES/74oWMvJ75zIiR1AYKqDz+I30x5dl2FOiqISJgbRGNepgbtaWbpW3ckkv99yaf31w+QZ6jQY3m8a7KWGVaSMFmMZVRANtaEY2i/xdIV+YjgUBN+kZMS1hXiq0fYrqCr7VmIrHf4XRSz328G1OsBoqcqDmWu5LbuNdtCU1/xKu4ehjHA6t7u+IEYArzsz1s47OBJ649Vlig4wzgkAlnz8hOSXCMcUXYWyYCKTzN9dSocOPN2BfN7znv3JhNhxMe+c+P/VqHWilPrmVixb5Iymz+ow9czlK+Z406XguUs2fjkRtS6aWSe6HogWfNmEEsOi3Uoahvf96T7gd+aSj2MP4zAG4x0jbigWpgX6UwLN/UgC5P3LttULCrmn4qEcsX4V79brb/62Odj2gJWwTq4C6oCYdApdW5oFs863walkKE240WR9C651FQPKFSozhseUUiDTbE1RbyM4beQhSzIZLtvMppV/s8lGX6YhIuHsVHFu0zns9kcr66ggg5OY9ahVG8Gt4p/GAqYpkSvEebF5hYsefLq2sTEpGsmk3bXR2lPOmcOQfg7aQhbxdOhrOoTqCo8N7w1ysEhTMmhJ8fIekTNJ9SvYPaxcjaC74x96Qh95oy58QEW+RdnYqaZH2p8LRTIxMRe/zkcCIladrzwr83seSRkUQnWjKALMYlK8UeiYZFZCI592fLo+18qp3fKdFg+d+TGbBokXI45LZhzClpbBMJMPPxo2fY5MvbGAuEYyhyuBso3wPs8EPUq0uMnH0jVYPY/Dg7iAOgxx9xK4fqL1JVpLDzHnMQEE6m2HUiEC6NE3o3mlxDaWponm48grvGGwBgr9knNWxqsNT+6LjY2yTYDi+N6v0JHF9M7H0pGlJLbT50NvI6y4AnZzSTZXRb+anwGq+t+Ba38J7jlazbxAAseyZ6fJn7NMa1bB1wywmsctwWuefAoHRJi0Pe6dmylqg7j83pWLnz9xisNaP80ZhotEyePLvyUAUQEUKhx1N8gNUWvvIcpl2o5Tx6jQXSqRN1x4qgqPdks9WJoAAmJWh9isqOuRTybzSfzEqFYumfZ6D2jhPvcWmjPsUpuMorD4zQuG4bzROeNaFwBcdBb97HdoEGx/4v3PHx1iW6xCrz7cV0DRE/JzVyCSyRLiT7RJr1Eepuwuu7VzfXMlfa5MWlB+IVrCnc9VosttmRivFUSsGg98ioYS9hTEWgSk1Kxbhs1tBseqfonmSyszxa+qWxgMBNcwtSE37+hzmxjfIiJf1UH6wazwVvZGQJYGcOWjtFiB2PXSr3LlVB/1yf/Fitv+3lk+LUFFx3aAYPejeqn3hgaX7EQIXKRcOCvwD+/wPB/bDZIxz71wMAJA5LKsbZsCy82VokWZ4iUv/yPSCyHh/OlGESh0fh33FIarJ0a+PMy0iPak2h1Qyn2KdlafZugMHPMdrlb229T1XmffEwY3xDgtpfEqjgBMt5d1aEtfnchptVtjkVpwDNZDjywakoDeRFlf8o0ExdCda20ND70pME/XpSYiICKIssjh0OjjtopZOBP5A7pQAQ/e+7K/Jj96jWNVsLKkaOkGVpqZvlMUnOwFMctfEn9xyQiLEb6JbcN1ETcTnx+oBzqhdwWxgAy51BixwSaH0qyUPlFLmdcdFdHlnkQPNPLD8gHsQA757Xc31Frnikagr/snO52lrA1rHReehfGwK+Iyot/AH4FxmbSKLH1F2+fLAFNDw0eSSb0UjvDOh/ik21lLPGY+lB93FObFmtV1CUBVjxbs/zQAIjNfg0QbA9DX03FgMIGhSO8FmAU+G5OxGwdCWPrxHWkmlE3Q7gr63RWXgkLROZTWOmWh3+xm9R3GppstB4PjoPP3so8tHykbGA1cBt7W3BPjtGcon3UQI+xdRqOfxllDHc65lG9fNOq7GHCIwrMAPfTj0Erl7BgC2PrprO/Xxer11FsbBUPgq1bMNrorPoU+hNP/Pcc9WdhiQCyhr6IK+GzmjMJzD9mTFa4QgpQMj8aV8IeL9MlTMqT3C4lx+4jcSLLN1/LSLVCUbmN4wNVwC7WClkMcRi9X6QhyOugYgi/ZLA8XFKs0LRn6/CRFWhbn7JsLZBwq+/tar28VlmuoxeQPqE6+5yr0oFJUhd2CcV2WI1AzBEwywPfQEHUoZYv/yjaZDBclOD0pmzYbOITxuVCP1gRR7hgQ+DIrgo5/kCtHn7v351dLx68xzbtPbtB4mniRea7ufUAE/IZcZovxYHZyjXg45yrHpjkJnGuGhBrx35q8R1i7FG0LXmLjRrrRfg4ArnxNQCq1FSSf2aRdb3qY2v40AO49275Mp//z7ivFJNjk3zngYYmkWEF912Ezpv7n3PiZl1kK7LKD3qFqR/fQaVttOkQKp47CiSQXNDb1SqmvqOD5xI0jTnyeJrlvZ7ACAHrqBJ2dAaRBSbuovhbfWEcbYaDyWeJLbTacxuBhxMMdwYiFFawaQt4wtRFe1rJ4GaAdJvEhgc6atF7m5ofAfMHP2yvqxVGTSBkR2cSh2k1T8G08P3/bOkwhqVpKdAiy6Ra2elhPRXYjtX8U9l0y7pZ2d3xQG2Zihcdd5LpyiXBKgdXwj6Y5UJnJgPaixYbRLNnrfO1VmJFOKwU5qhPIWzvI779iJqMHnXsRykiUrgkx5CvsnpJSmJWB5SWPR/6lFMko/dH0FhXN1ylIJu7QLC1xlZEJl1KXnq4pOCf2OxHy5PpZqzuLViR3AfSl6sJC8GmtdtP5av6K9vBg02nJEZ5CviHSVSIhz5LSkXlPrxSc/T5WxUE0MdKTnZt3iVGg8YlAIItOs7TkGlnwcbhzuFZvvyuk6TVtPLGjBTxSXpEW0+sQP8+N2SI9E3VccMfakaLJk9vob5kXI/aWWxMflt469biNyzqzpUPEWeN8r7ae1jvJvd9zxCo+LkmeUAn6RwnsPqYra/JbK5/ecJKoxY2P4k/LTaGeSWvFhIhPbYOE4u+lJRiIfAvyvslq8jaueXy9S/vu/F9am4q8ISE1z0MWfZmoZxUbkM+coxNSCH9NjLO9O24aQV1U2YOABqJ67WFVISzlFViBB9uheFlJXTD3MO5ZeNYuZTuFLwO5suFOfzHMmR1n2/aZCbCpS/rvc53ZFYaZIEca1nOpGfmsMwOYatI4kdzf5UZOPDe0w1nOwx3lLzXcnyQg2jEwnK8naNywiqdcw9SrtepXISaeQ6Aui+o0ACGm+z8FOO73riq+68NsYR8haEyKdMtq+REdyqWpSiYf8wsj7uMkpY/Y51ldp5GMki8sHPL720sg0jM0htu5iwdntOz/wCe+UzhNb5fshjBPYVrIRNBzBPDawYBXOl/a9TB3BdCD7yDex6Qklfg166VIEM51p7G5mPrxr0LSKngBWCoOR05yH9iKWg+hGzT9tthh0aGBLuUruk+bASbwqX3YjPVHbL7oXCAASh8STlRdu/z1fp5zcsjdgJ3ak3X52oJL0C1Cck/eZExZBsgued3NrAG/LJXWmiBvsVZdalcQzwNU2VkpQdz75ZJ7tZg5UlT2YTqDGGvGeNXGiuCbq32HP486pJZZQzAfCXlah8RBYYGadLMJJWj67NnJigtQN4qdmTlRns8sjfcgA2ezXFtjmqqVUfxiJEIgYs9yrWrw4CKYRjGRZO3AuGnWdKsUPqBOCitOOf2tkloq5y61/Px8xeqhrFilZuymzxSIz1mGw/A/JzKynm3fwIChoJMRjpRGJEldX49OemX53zk3yPEpldy8DsfXl4lq/UhZrwkI4JfOOYepbnwa8JvNvL64+34Vy01YB37M5FlicNvmngAfmbZKFrh8uf79haWB7qcO2/DdLhlO31wj1RDkMtoaqSKcsp7jtb2WFMJnq+/zc1EvVxJM1XMGOwHgW1oz5nvWKxfRC8k4bfXE5HzDDIWKaWEgldwui+RD2JQIJ0gb2ML7wz9WN1NTtjOo85SiRraU1sSw0KMKU+4730FXgV6CAPzNehG2ipsh5R7eA8cF1cJl27Io8Y/yEc+h81bziDL2v2UM6iyXmornwlb8hyjXVQ6EmF/mQYwGK+GZG01z/i9+qi33stPUHEw+Jtdf9IkRPiCRegPqhrgHKsTyUwB546yQhWYAJ86N93AS4zXM/VxHk7Bk+CEpdIYkhCeSCE0I0/1y9ZZl1JlHXhhOnymcJwdc3Y7HjXAVYIoPS+BuwH/UYua3fWW8hz6jKDwHZj9g+A12sHGcafEavrPvlY1RDHgupnVIpplJzxC6tKQqvuDPaOyeDxJ8keeX8w38cDbWAZGfAfBl7nwl71m0Xgy2kKvsEePHy73VIg0bRSHmB3Rwsp/YwIBV8CLlrBJ6YP2NR79lXstkcG+vXS/ELO94o+yQDlvBVBSvufOK499yLT+XKal+KuRem36+cPgzQygcs87VR+qJG9XtQUKLHuZsy9Gl5tCJSnhLD4Pgzjwe9IvUMNniFpIVH3LjnPLU0gl8wZmJx1S1qKLBSMz44dVwofF/HzGZorwaQyA0oSYJqoL1WbxF4fXkWtnlGDhNj+INed5uekUMOqQkfEf8Tn9BnnQvTKt8HfmBIfXNR0BMgvJjRdxfeYkTeM8ZQFCTCpFiNSeDfgYptfwuqkZSO4BAdiEYxSSRsKHSwmeId53QS/RyT5jg1++atxSErm5WcYQ7ReSFknY+DfXFPJzYKVnJInC3EAqOAXeHFdSjok15rNLFbm4S4XpNE0D3EchRKaKPtMvTm0fgkUn6FBtMvhJe7g3Euhl1BwEGu2FE4IjJzDu686IQZWSHNy8PQBSU5rT9FJAyLSeRBhPWjvzp0qzTqnu/rSWkmsc6S5SrCKQksA6P0EruLhSqElzQS7iZSrzqjjQg3Pzhnr7DrTq4bDZA78RwtGenZFqbi/vnYgO5oZoGpLSK5KrMFQEQWd6duNFyihuaMchD4cQB6XQPHtc+A2xX1Sek326PXdZ/8+3uFt1D2d9HP3NuejRnrjdgoIUayOc/O/xTbw2e0xZtUIp7jlusw52uOzfn4l5QGxa0y5d2VWjMNrut/m9Z+33wV1pbBxB0UgrHdpYR8Bk6il6d+x6iKIUWhA9Kijm/kmyJW40259uUC2wupjo9ZEIhaNNxKYQKnJ+r6C+4hTNmRvZLYxSKtrsQOH5hy+rO85wfmu5o7lxrAG/cAK4lp9Qlk5wBPPdyJ9wfFzH/qlw2iztaLyhP7R9B3JqgFGBqCO8qW+d+L2Qme+WKUVZXztYRf6jDs0455uKiKPJpBiBxSa5L3xwvXGgZ2jHioFfLVKnO+thtqui68BCbCgP4ryyvlQeAiYu4r2mUqecMN3x/ZXnfNKkmUI9TWVK5xIsvnVcp36wmM44IXu02s0vcVXVSLTgCKZtu5HwH16Oe6Hq93LBg6Z5Ub9+Zg/o1E54grTtck6StyQv0NbLtlnDI/ZeoH4SwjTwuWXDS7O9JIfm6EsZxXGTpjNL8OofcLbnVdHy8XrUcyNpTGLuXNyuD+C9zV7HS6PFQatfP8S5Syn7G+I9xilvH7bL7hbvAiufU+r5hYb6tMprVmVUR1m28ot7LJOFdV9Dt3Ij0XvvPTCJaFbl1wYIUSbhuZBHGEMrHSVAZy13v2XexKkKGpMm9j5s162g9rTzgPz0yvk2BzKjhfAP39pRk3w8AakvZuduazu/mc0WlgmMdZ1+A3jhkRGrfg+8S+dQatbvlPZEiPxm2iQ18jcXzSaQzeQOuweP7u7gmQn7Ix07EnsBQNXJ3U9w550Cg4omDZsWzl8r8ub7MKjNCTSWyQ44Xt9txK6rUPvLLviBiiJqqFYLPjcUqSb/XgSs32heTVC2SBAe38jYsHOUHzM5Sdrb1kRLfCWjfSc1L7WLoFPLn0H4IhKEbCrijan6zATUQSqB5YGC3kLdUEMHgJKrC/wdMz0esUKxYwMTrEel6h4aOA/+Bjyi/KunPj0aCg+sMxBUR4lpyvFHYZpyyAMdC8Zwi2dgeXqLsBNYST1Cn8L7tUPcBfH+KYAC8JE3+SpS0121VYlRFl7EndDp0In7o+9IaYycpCf32YmFRL1FuCjueSxRG8FF4lC5Y9TzOQHXUnDBuqcDR6EZVtLwL8hyZ+lQRYN9cnehrnKJPDypTaD6bWPkZar64ioh6HpaO2Sds3+ufdRuXmGSHXSCAR89gt5R6prrrDfll8eoOPAA6X4oAicg9i/0VT3pZM0lbCZAjv82LlxoGttf1352FHA7AXNTV/fONQStiMzFQ8ZHxzzbVGMFTEFsubEKT6v6pZYYzC2NlmFowOyokOc1NSH+jHYUlrF9As8CptmXgSQQE/ihxSflcegRbPgahe723gZIXhM8LoIr0Lkwzzy9R1pf7SQuUV9xmUlA4V/XzACUTYviPCroiqCbEdHHz81qgODkKMyaSiFiXmqg37rs9RcrP//PGRrPjbujQKWkQi8Pyl5jVevi6Jp6MyagZ9+tPhjgZ0OigCwcdJ4OFH1demj8xuNJUqiyAAAbrefHGltBCqltEVqtC5RfmCBDSVv/CPhXwT1GVcSizE3ChxMYdpu0OdYVcfmiQwwvZGMHxYqjWZgyDnI8WuWxvpIUtCSaugThvqM5KPRB0nFnwj4soXMzfWeJ4dOhgBTHMLdopYjzqApx00o3/IgG3U0e38QM7eYwnym0eOxgzWANwKIS5kY+bwNZOziO0geOCl0sexrmAv/arKSuHjMmtxNmnW/qmcrhfcCcaEzdcQJNOJI15D8aB+cwKjQkzD8tT5tniK6/0V/CsJVrvoN49QJMEIzVWvPqJ2J78TGuaSnM9wYM+uzJr34QW1X6LjOgrOHMeA2w+jK8jNv9qGtXsAm7GMJMGIabpE07XR2+O7xpMK0rZC+XaQX85esFgsPdbJPTfp95JNMaS5ICoazwEjwNIfnOYEc2KaHPsO525HTB5YIEU1DIKcBUpR+bolCYO+UzcNtVyqqHzCa4lQi9ttO9CBV034xtC437tdzhFvOlrdSfZX5OOwgHOzZOgmdPDOlEZmvY8zrYlVwzqTderS18jNYN0aydZOldd1PcWFGpJACr8klV81zfW8QCoU7ACN0Q6u69qrhAngwAKEZZkArWTb7ZE+h97uAiabPPi/G/q+cZqfRovl2JSrJ46J8sgpmBsGsojza0M8u7OsMJQpqgbpQtsD+6XaENBozKbLYCRx62IyuOjQIgdONT+i0SGtW0wvL/Jg5NBmvMovxFi4ho4uGZK5t1nIq96ZglOsYN7Zc35jOqoRpikQh7YpSc/DVzTyO3gXPR+Zht9E6gPfw2ddniwvvff92N4sQPcw1+/iO3dkS1se7rFl3Z3C8dJGf+dMNLAqS9hB4wFOwDNwUmmWqZlAXHuCAk3Xa71lzsgmnziwFK9ZfEIV73xpR7kyVjKH6A0M2BRZ67BA5LAAAAFKSC10ZUiBlYdOjoC7EtUGOKt4XbxLpcyUHzeC0xOqWaCnfAU5DsiJTkLNhO1N5lS1P3W3UVmmShLeag1b1lujqsQ8fXNT53GeTxuQ8rVkp4Zhb28+S/iltsH2g4QqitWgxT++ANxqaZhNZF8jc8o5kxUFAOsfZ+ahmIlsjBykOhhqxLwH4k4jljikFpzKPztAtVpB3mZAELJwVLlcgdZatBoqbHDUGwVf1RV/TaR1ZsJ/oyZeuIa4oFjwAdhgTNQaS8MGOtOhOsODFX7ubeyvQCBTXLxu9qR6jD/TZK0q5v2Il8CvECph9u2ehGzJihEjT1Y+ne5ubROrufTZOuqEcmtnAC72isvTUSl4tPwY1ID8z+SoSKAnxw7+qA4r1/Qif5RJ6DDab7wj/yQugewBrdfyz4i67v5dOOKmRyR+vPgEeLThBSGSosA/c6YPianCjvFeTbUJtZtnK6s6OHcabUKmLs063K0izNY4xrhWpDBsYbm1MsOAp1CPS37435POLSFjcbeiPAKrUvlS1wGI27Ca2NISC9v3OBvRtAg0JcW5Q7weVJYTvT9R4KFg7779QVoRVXDojmyvyEzYOGks4gzYwMh3I6E5Q1SvPkOmhNLGvw1B5szT8fB2ySObxGPAFrFeff4CMXwYypzJFlXd/CgBqFflI8XL5aPmVS5LlZ6+3mDRKuuOkONdsJ2nDQ1IACCNLJ9aF3RT41qelLOg8huse2yY8RIqFH+uH+Cka1nrNN4rR9iy/h4qS3JLMCRnFEvvxR/ZHGiA0fk3NrM/JIMU2MJff0zhbZy6nyi2PUYRmAuZWsYQUce+/9WmTIZIlnUqb0+JyLmXISAcYGiRzQekpyWWgeGvULdU+f7Rncicm4M5XeYyOFy4GqMX03fttt/dihbgTFYKtNjs8FgQgd+udoDGTkxkOWG4i2V0s1Hc90wnlWEkq8fue01vf5x/bf8qjVJnMEovImkFIaivut1Q6jrLf2s/Dd+qAIfGDEa6PMvHeDs3hFQjoS3ilLQ1s+FVDe3MNkwj49r73Xv3xnIOqlHlpKt8tD5QSYpAt4W4Cq4z8AAAFDpux7o+/DZDskDHyN7R7VTcjREJ86ieNm03SOVa+g7h+LNGbEawK1dPV4WRZhJUgM6B50wsl6AzTZenlMgIGvK5vNV9ZUMKPad6SXz2VxHnCHlewDnZVJ/NihD43vBY0ZRiq+/cxdlvtuKpfHsHdJOWOm5vf+4R/eNSxpTOvfiqCc/XGPJpR2YW/YS52yc8+o/wRORbDZQI9RbhKNGDD0oiyz+OX28aB9QXHT42UrRSg0MOqPfs/yhVSkW4S7xexYYNHpMHQo6G9ET5Hrr6bb8L3XgE+MhXqo5de1PP7B1xiPxbEA0z+dkOX7jZHzlmeefAUwhwVAPK18as8DmhmlTqEu4mHe9umPdvO28GfoQe1O+hGjPWWliMcp7CFafCy4oS7+/JtXyll9h2GJM2wmbOjah3BHvyisFFyY+iF9yIIGaKZ/MES4sTyHuRoHmvW83lq+ucRs/2BGlRQ4jONJnq+u4w3/sXvecg4bH2C8EyX6dQn5PQpjBpscyTL8YJyflGoIDCXu0DmyO1YC1OszIS4FoN9nrOgeY6cxSf4yM7cGC2Cy8KmDwEUQ+nvmWtaqIeZvMbnWtIVahzEtCU/dsVuukoS2q4lNQZlHrZ4gMYv+AqTHUt0AaxJ5QlghXdeCr5kkn+P5xvuOMQmx4XWUK5gfvz1kn9Fy6eysrZLsYMNd2ZCCffH8llbcSgX501FDzIiXqL/xwlgOh6waN9KOHzhvHegt/O/AxbOAHXhv14hr5NxNg2NjBmLIENDAJcsADTWqugJ6stQHqWSCmvzlF6kaOrVdTeJ82pgXck7ydCySnCmVddR756LKzCxYZ2u19W7/4zkndc32DHNY0pDOkNOqg2Q6SxLbMmru5Ta7EXatPygq5sjwDDPgbkxNcz6GaqHycjrP1vYU6trQGdCAw1BbYb3Zruz5evDRHs28UGJZ6kuVUuesas3DG4udzefRVSXvY79ZtG2TiFFr0M7Z6fuL6KN/qlS4qmLrPmXsyfIRG9GA0fdxmVXooCjtXjuaGz8HDOdtjldRMHpRht3SAByGLYw7RP8tlEMKzvzIWhvD26PDwsOyBaydiBtMuCbZrGI8oR34pkqMch1j35sgcPkG8Z5KxrQ2oVljk6LE9dwSdAaDAo3tRZaNUBVZNcFnPfPxQayd/eTQqa2sJWpN+Ej0wo3gY/jYChf3+S6rEjEZRtv9H30keohBcAni0G2Q+doA/sz7MS96jUSQ5MJxxVCFXCC0NtBjv5MZUJjyLAQG7EnU6sBBvgXUAB1rAO3AU6Kb83bwW4jIC/OlSM/0QNp1jRT3OAWconhb+FfgoKoTT/y7yzZ/cqALriowryCZdIBc8U7eWue0ICnQkgA9lqnbG2dFYONZ/xcPISJEiLaFV5bpLLd4/yj4r+tPZX1Me3oW4i5gNf3Nzw9U/QDSzYdMq9WDQFFOHKoP4/JjjBzjdxOBVcEVmP+q28Qzh+So7hoarnwLIWZ5H1JLybYQjbj19LwpKyBXjaSg5L6Vdaas16T4ekQIH9YACAMvaJLTo4+4FudIJGepHL8GR1ozBIgTTTqnrQGCxaX3/bzc5OEqCuO+yzGwjzlnX5Jr9yhcA7/4s+4vJGaRbPMZVva49dbVmrm+32gP032YDQdfFzFX4ES0qIKt0iQtrHTYgt8jrIrPBKq3ZjMG2GD32TGTXG4J4jM0hf4UASCp/16plwX0o9uTVlmHsWRVSjvJXl72/S35fF37dwzHxfpQzb6zxwTCjfaPEO/uFyQSxLd/jAc6qZUf7hOuQAX41ISEHRXJaK65aiaKDpzgt+xPvfmOWYjwWOkz45/LDT2uf2VDP2L1UJZrjQjOF1Eo//IVeWUMtFdFui/7Em+zmXIF0v1o89/g5N+XiBShQSb/IzRqRAoQHp2zuOxmBgaKsKYUe6gYI7OhDV2VpZQD1sc6VJMBMw2DjMzwAMlGBxjMddQfyFMc+KHeTpb/+V92GXjyC6Ux/5PiuumvWvAv40E221HM1xgVi7cVzBgUt5gbnIjlZDPTUBjVXGJabo98xnao9oODII/f/Et0CAO2h4/6olpaY0w8gX9qBn81xU9gdZIoShu2wdihANfSTxqhh19AGRI+cEvDx3dDiw/T5VRLqbITWcfTEkqb7T30PLG3cpFycti41o31SzKs3HIrkAYSzujGZtonkzgs94+4FUzI2r9fGaZbCB1qYkazqWoNpQ3SInC9/Mf33I3NmIfc69KyzvXxzlgx/S2J5qo+8SFYxidc6EJ/FXhTtOAJhNCuZ074HSx1UolQBiHH3MkaZduTC6K15kRygfJVejkM2BdQHGBlxj79l6hwlkGAaxGmltzRSSUiy3LGD2SHfM4YsgXlICt3t6OApSpHxNjLMFTMvC0XWRIxTUzomKQoymtXNNkm5h493tB6Ys1OW+bNla8NItHKdLCD+/+rjCIgH5kah4mF9pNBUXB2Ea+OwyO6vccVe9Z/xpBdICJfzrbaotB3T6fbrqYr5N+hrNfO7bgUS7gcT5T9+jXLIhJnqUxVqffiYAAFh5I6GHS+LP0evAiOSogFEICAtXzlhpWfRlH0FzAVMmX54PcPtUph/NOGIcCbuqdHb1zvOeZ41oAAAAA=";

function SingleAnnouncementPage({ announcements, siteFont, annId }) {
  const cIcons = { "تعاميم": "📜", "إعلانات": "📢", "تدريب": "🎓", "اجتماعات": "🤝" };
  const priorityColor = { "عاجل": "bg-red-100 text-red-700", "مهم": "bg-amber-100 text-amber-700", "عادي": "bg-gray-100 text-gray-600" };
  const ann = announcements.find(a => String(a.id) === String(annId));
  return (
    <div dir="rtl" className="min-h-screen"
      style={{ fontFamily: siteFont, background: "linear-gradient(135deg, #0d9488 0%, #065f46 50%, #064e3b 100%)" }}>
      {/* شريط العنوان */}
      <div className="flex items-center justify-between px-6 py-4 bg-black bg-opacity-20">
        <p className="font-black text-white text-sm">🏫 مدرسة عبيدة بن الحارث المتوسطة</p>
        <button onClick={() => { window.location.hash = ""; window.location.reload(); }}
          className="px-4 py-1.5 rounded-xl bg-white bg-opacity-20 text-white font-bold text-sm hover:bg-opacity-30 transition-all">
          ← الرئيسية
        </button>
      </div>
      {/* المحتوى */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!ann ? (
          <div className={cx.empty}>
            <div className="text-4xl mb-2">📭</div>
            <p className="font-bold">الإعلان غير موجود</p>
          </div>
        ) : (
          <div className={"bg-white rounded-2xl shadow-2xl overflow-hidden border-r-8 " + (ann.pinned ? "border-amber-400" : "border-teal-400")}
            style={{ backgroundColor: ann.bgColor || "#ffffff" }}>
            {/* رأس الإعلان */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-start gap-3 mb-3 flex-wrap">
                <span className="text-3xl">{cIcons[ann.category] || "📢"}</span>
                <h1 className={"font-black flex-1 leading-snug " + (ann.titleSize||"text-2xl")} style={{color: ann.titleColor||"#1f2937"}}>{ann.title}</h1>
                {ann.pinned && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">📌 مثبت</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={"text-xs px-3 py-1 rounded-full font-bold " + (priorityColor[ann.priority] || "bg-gray-100 text-gray-600")}>{ann.priority}</span>
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-teal-50 text-teal-700">{ann.category}</span>
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-gray-50 text-gray-500">{ann.date}</span>
              </div>
            </div>
            {/* فاصل */}
            <div className="border-t border-gray-100 mx-8"></div>
            {/* محتوى الإعلان */}
            <div className="px-8 py-6 text-gray-700 leading-loose text-base"
              dangerouslySetInnerHTML={{ __html: ann.content }}>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== دوال مساعدة مشتركة =====
// قراءة ملف كـ base64 أو نص
function readFileAsync(file, mode = "base64") {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(mode === "base64" ? e.target.result.split(",")[1] : e.target.result);
    r.onerror = () => rej(new Error("فشل قراءة الملف"));
    if (mode === "text") r.readAsText(file);
    else if (mode === "buffer") r.readAsArrayBuffer(file);
    else r.readAsDataURL(file);
  });
}
// تحميل مكتبة XLSX مرة واحدة
let _xlsxLoaded = false;
function loadXLSX() {
  return new Promise((res) => {
    if (window.XLSX) { _xlsxLoaded = true; return res(window.XLSX); }
    if (_xlsxLoaded && window.XLSX) return res(window.XLSX);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => { _xlsxLoaded = true; res(window.XLSX); };
    document.head.appendChild(s);
  });
}
// فتح نافذة طباعة
function printWindow(html) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

function PublicAnnouncementsPage({ announcements, siteFont, onLogin, onTeacherPortal, onParentPortal, onStudentRaffle }) {
  const cIcons = { "تعاميم": "📜", "إعلانات": "📢", "تدريب": "🎓", "اجتماعات": "🤝" };
  const priorityColor = { "عاجل": "bg-red-100 text-red-700", "مهم": "bg-amber-100 text-amber-700", "عادي": "bg-gray-100 text-gray-600" };
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const pinned = announcements.filter(a => a.pinned);
  const rest = announcements.filter(a => !a.pinned);
  const all = [...pinned, ...rest];
  return (
    <div dir="rtl" className="min-h-screen p-4" style={{ fontFamily: siteFont, background: "linear-gradient(135deg, #0d9488 0%, #065f46 50%, #064e3b 100%)" }}>
      <div className="max-w-lg mx-auto">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="text-center flex-1">
            <div className="text-4xl mb-1">🏫</div>
            <h1 className="text-lg font-black text-white">مدرسة عبيدة بن الحارث المتوسطة</h1>
            <p className="text-white opacity-70 text-xs">بوابة الإعلانات المدرسية</p>
          </div>
          <button onClick={() => setShowLogin(!showLogin)}
            className="shrink-0 px-4 py-2 rounded-xl bg-white bg-opacity-20 text-white font-bold text-sm hover:bg-opacity-30 transition-all border border-white border-opacity-30">
            {showLogin ? "✕ إغلاق" : "🔐 دخول الإدارة"}
          </button>
        </div>

        {/* نموذج الدخول — يظهر عند الضغط */}
        {showLogin && (
          <div className="bg-white rounded-2xl p-5 shadow-2xl mb-5">
            <h2 className="font-black text-gray-800 text-center mb-4">تسجيل الدخول</h2>
            <div className="space-y-3">
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm" />
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm"
                  onKeyDown={e => { if (e.key === "Enter") { const u = DEFAULT_USERS.find(u => u.username === username && u.password === password); if (u) { onLogin(u); } else setError("بيانات غير صحيحة"); }}} />
                <button onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? "🙈" : "👁️"}</button>
              </div>
              {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-2 rounded-xl text-center">{error}</div>}
              <button onClick={() => { const u = DEFAULT_USERS.find(u => u.username === username && u.password === password); if (u) { onLogin(u); } else setError("بيانات غير صحيحة"); }}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-600 text-white font-bold hover:shadow-lg transition-all text-sm">
                دخول — الإدارة
              </button>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <button onClick={onTeacherPortal} className="w-full py-2.5 rounded-xl font-bold text-white text-sm" style={{background:"linear-gradient(135deg,#1e3a5f,#2563eb)"}}>
                  👨‍🏫 بوابة المعلم
                </button>
                <button onClick={onParentPortal} className="w-full py-2.5 rounded-xl font-bold text-white text-sm bg-gradient-to-l from-blue-500 to-indigo-600">
                  👨‍👦 بوابة أولياء الأمور
                </button>
                <button onClick={onStudentRaffle} className="w-full py-2.5 rounded-xl font-bold text-white text-sm" style={{background:"linear-gradient(135deg,#7c3aed,#db2777,#f59e0b)"}}>
                  🎰 سحب الجوائز
                </button>
              </div>
            </div>
          </div>
        )}

        {/* الإعلانات */}
        <h2 className="text-white font-black text-base mb-3">📢 آخر الإعلانات</h2>
        <div className="space-y-3 mb-6">
          {all.length === 0 && (
            <div className={cx.empty}>
              <div className="text-4xl mb-2">📭</div>
              <p className="font-bold">لا توجد إعلانات حالياً</p>
            </div>
          )}
          {all.map(ann => (
            <div key={ann.id} className={"bg-white rounded-2xl p-4 shadow-md border-r-4 " + (ann.pinned ? "border-amber-400" : "border-teal-400")}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg shrink-0">{cIcons[ann.category] || "📢"}</span>
                  <span className={"font-black truncate " + (ann.titleSize||"text-sm")} style={{color: ann.titleColor||"#1f2937"}}>{ann.title}</span>
                  {ann.pinned && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shrink-0">📌 مثبت</span>}
                </div>
                <span className={"text-xs px-2 py-0.5 rounded-full font-bold shrink-0 " + (priorityColor[ann.priority] || "bg-gray-100 text-gray-600")}>{ann.priority}</span>
              </div>
              <div className="text-gray-600 text-sm leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: ann.content }}></div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{ann.category}</span>
                <span>{ann.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ users, onLogin, siteFont, onParentPortal, onTeacherPortal, onStudentRaffle, onPublicAnnouncements }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    const u = users.find(u => u.username === username && u.password === password);
    if (u) { onLogin(u); setError(""); } else setError("اسم المستخدم أو كلمة المرور غير صحيحة");
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4"
      style={{ fontFamily: siteFont, background: "linear-gradient(135deg, #0d9488 0%, #065f46 50%, #064e3b 100%)" }}>
      <div className="relative w-full max-w-sm">
        <div className="text-center text-white mb-8">
          <div className="flex justify-center mb-5">
            <SchoolLogo size="lg" animate={true} />
          </div>
          <h1 className="text-xl font-black mb-1 mt-2">مدرسة عبيدة بن الحارث المتوسطة</h1>
          <p className="opacity-70 text-sm">بوابة الإدارة المدرسية الإلكترونية</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-center font-bold text-gray-800 mb-5">تسجيل الدخول</h2>
          <div className="space-y-4">
            <div>
              <label className={cx.label}>اسم المستخدم</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="أدخل اسم المستخدم"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div>
              <label className={cx.label}>كلمة المرور</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm" onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <button onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl text-center">{error}</div>}
            <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-600 text-white font-bold hover:shadow-lg transition-all">دخول — الإدارة</button>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button onClick={onTeacherPortal}
              className="w-full py-3 rounded-xl font-bold hover:shadow-lg transition-all text-sm text-white mb-2"
              style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}>
              👨‍🏫 بوابة المعلم — إدخال مستويات الطلاب
            </button>
            <button onClick={onParentPortal}
              className="w-full py-3 rounded-xl bg-gradient-to-l from-blue-500 to-indigo-600 text-white font-bold hover:shadow-lg transition-all text-sm">
              👨‍👦 بوابة أولياء الأمور — متابعة مستوى الطالب
            </button>
            <button onClick={onStudentRaffle}
              className="w-full py-3 rounded-xl font-bold hover:shadow-lg transition-all text-sm text-white mt-2"
              style={{ background: "linear-gradient(135deg,#7c3aed,#db2777,#f59e0b)" }}>
              🎰 سحب الجوائز — تسجيل الطلاب
            </button>
            <button onClick={onPublicAnnouncements}
              className="w-full py-3 rounded-xl font-bold hover:shadow-lg transition-all text-sm text-white mt-2"
              style={{ background: "linear-gradient(135deg,#0d9488,#065f46)" }}>
              📢 إعلانات المدرسة — للطلاب وأولياء الأمور
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function HomePage({ teachers, announcements, activities, navigate, attendance, week, messages, classList, weekArchive }) {
  const today = new Date();
  const todayStr = today.toLocaleDateString("ar-SA", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const jsDay = today.getDay();
  const todayDi = jsDay <= 4 ? jsDay : 0;
  const todayAbsent  = teachers.filter((_,ti) => (attendance[ti]?.[todayDi]?.status || "حاضر") === "غائب").length;
  const todayLate    = teachers.filter((_,ti) => (attendance[ti]?.[todayDi]?.status || "حاضر") === "متأخر").length;
  const todayPresent = teachers.length - todayAbsent - todayLate;
  const attendRate   = teachers.length > 0 ? Math.round((todayPresent / teachers.length) * 100) : 100;
  const totalStudents = classList.reduce((s,c) => s + c.students.filter(st=>st.name).length, 0);
  const unreadMsgs  = messages.filter(m => !m.read && m.type !== "teacher_note").length;
  const unreadNotes = messages.filter(m => !m.read && m.type === "teacher_note").length;
  const recentAnn   = [...announcements].slice(0,3);
  const upcomingAct = activities.filter(a => a.status === "قادم").slice(0,3);
  const weekStats = (() => {
    let total=0, present=0;
    week.days.forEach((_,di) => { teachers.forEach((_,ti) => { const st=attendance[ti]?.[di]?.status||"حاضر"; total++; if(st==="حاضر") present++; }); });
    return total > 0 ? Math.round(present/total*100) : 100;
  })();
  const mostAbsent = teachers.map((name,ti) => ({ name, count: week.days.filter((_,di) => (attendance[ti]?.[di]?.status||"حاضر")==="غائب").length })).filter(t=>t.count>0).sort((a,b)=>b.count-a.count).slice(0,3);
  const kpiColor = (v,good,warn) => v>=good?"#22c55e":v>=warn?"#f59e0b":"#ef4444";
  const kpiBg   = (v,good,warn) => v>=good?"#dcfce7":v>=warn?"#fef3c7":"#fee2e2";

  return (
    <div>
      {/* - الترويسة الأصلية - */}
      <div className="bg-gradient-to-l from-teal-600 via-teal-700 to-emerald-800 rounded-3xl p-8 mb-6 text-white text-center shadow-xl" style={{overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 0%,rgba(212,175,55,.15) 0%,transparent 60%)",pointerEvents:"none"}} />
        <div className="flex justify-center mb-4 relative z-10">
          <SchoolLogo size="xl" animate={true} />
        </div>
        <h1 className="text-xl font-black relative z-10 mt-2">مدرسة عبيدة بن الحارث المتوسطة</h1>
        <p className="opacity-80 text-base relative z-10 mt-1">بوابة الإدارة المدرسية الإلكترونية</p>
        <p className="opacity-60 text-sm mt-1 relative z-10">{todayStr}</p>
        {/* شريط حضور اليوم */}
        <div className="flex items-center justify-center gap-6 mt-4 relative z-10">
          <div className="text-center bg-white bg-opacity-15 rounded-2xl px-5 py-2">
            <div className="text-2xl font-black">{attendRate}%</div>
            <div className="text-xs opacity-70">حضور اليوم</div>
          </div>
          <div className="w-px h-10 bg-white bg-opacity-30"/>
          <div className="text-center bg-white bg-opacity-15 rounded-2xl px-5 py-2">
            <div className="text-2xl font-black">{weekStats}%</div>
            <div className="text-xs opacity-70">حضور الأسبوع</div>
          </div>
        </div>
        {/* شريط تقدم */}
        <div className="h-1.5 flex mt-4 rounded-full overflow-hidden relative z-10">
          <div style={{width:attendRate+"%",background:"#22c55e"}}/>
          <div style={{width:(todayLate/Math.max(teachers.length,1)*100)+"%",background:"#f59e0b"}}/>
          <div style={{width:(todayAbsent/Math.max(teachers.length,1)*100)+"%",background:"#ef4444"}}/>
        </div>
      </div>

      {/* - بطاقات KPI - */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        <div className="rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
          style={{background:kpiBg(attendRate,90,75)}} onClick={()=>navigate("attendance")}>
          <div className="text-3xl mb-1">✅</div>
          <div className="text-3xl font-black" style={{color:kpiColor(attendRate,90,75)}}>{todayPresent}</div>
          <div className="text-xs font-bold mt-1 opacity-80" style={{color:kpiColor(attendRate,90,75)}}>حاضر اليوم</div>
          <div className="text-xs opacity-60" style={{color:kpiColor(attendRate,90,75)}}>{teachers.length} معلم</div>
        </div>
        <div className="rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
          style={{background:todayAbsent===0?"#dcfce7":"#fee2e2"}} onClick={()=>navigate("attendance")}>
          <div className="text-3xl mb-1">❌</div>
          <div className="text-3xl font-black" style={{color:todayAbsent===0?"#16a34a":"#dc2626"}}>{todayAbsent}</div>
          <div className="text-xs font-bold mt-1 opacity-80" style={{color:todayAbsent===0?"#16a34a":"#dc2626"}}>غائب اليوم</div>
          <div className="text-xs opacity-60" style={{color:todayAbsent===0?"#16a34a":"#dc2626"}}>{todayAbsent>0?"يحتاج متابعة":"ممتاز"}</div>
        </div>
        <div className="rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
          style={{background:todayLate===0?"#dcfce7":"#fef3c7"}} onClick={()=>navigate("attendance")}>
          <div className="text-3xl mb-1">⚠️</div>
          <div className="text-3xl font-black" style={{color:todayLate===0?"#16a34a":"#b45309"}}>{todayLate}</div>
          <div className="text-xs font-bold mt-1 opacity-80" style={{color:todayLate===0?"#16a34a":"#b45309"}}>متأخر اليوم</div>
          <div className="text-xs opacity-60" style={{color:todayLate===0?"#16a34a":"#b45309"}}>{todayLate>0?"تأخر صباحي":"لا تأخر"}</div>
        </div>
        <div className="rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
          style={{background:"#eff6ff"}} onClick={()=>navigate("students")}>
          <div className="text-3xl mb-1">👨‍🎓</div>
          <div className="text-3xl font-black" style={{color:"#1d4ed8"}}>{totalStudents}</div>
          <div className="text-xs font-bold mt-1 opacity-80" style={{color:"#1d4ed8"}}>الطلاب</div>
          <div className="text-xs opacity-60" style={{color:"#1d4ed8"}}>{classList.length} فصل</div>
        </div>
      </div>

      {/* - تنبيهات + إعلانات + أنشطة - */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2 text-sm">
            🔔 التنبيهات
            {(unreadMsgs+unreadNotes)>0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{unreadMsgs+unreadNotes}</span>}
          </h3>
          <div className="space-y-2">
            {todayAbsent>0 && <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2 cursor-pointer" onClick={()=>navigate("attendance")}><span className="text-red-500">❌</span><span className="text-xs font-bold text-red-700">{todayAbsent} معلم غائب اليوم</span></div>}
            {todayLate>0  && <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 cursor-pointer" onClick={()=>navigate("attendance")}><span className="text-amber-500">⚠️</span><span className="text-xs font-bold text-amber-700">{todayLate} معلم متأخر اليوم</span></div>}
            {unreadMsgs>0 && <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 cursor-pointer" onClick={()=>navigate("messages")}><span className="text-blue-500">✉️</span><span className="text-xs font-bold text-blue-700">{unreadMsgs} رسالة غير مقروءة</span></div>}
            {unreadNotes>0&& <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 cursor-pointer" onClick={()=>navigate("messages")}><span>📨</span><span className="text-xs font-bold text-amber-700">{unreadNotes} ملاحظة بلا رد</span></div>}
            {todayAbsent===0&&todayLate===0&&unreadMsgs===0&&unreadNotes===0 && <div className="text-center py-3"><div className="text-2xl mb-1">🎉</div><div className="text-xs text-gray-400 font-bold">لا توجد تنبيهات</div></div>}
            <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2 cursor-pointer" onClick={()=>navigate("earlywarning")}>
              <span className="text-red-500">🚨</span><span className="text-xs font-bold text-red-700">مراقبة الطلاب المعرضين للتعثر</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-3 flex items-center justify-between text-sm">
            <span>📢 آخر الإعلانات</span>
            <button onClick={()=>navigate("announcements")} className="text-xs text-teal-600 font-bold">الكل</button>
          </h3>
          {recentAnn.length===0 ? <div className="text-center py-4 text-xs text-gray-400">لا توجد إعلانات</div> :
            <div className="space-y-2">{recentAnn.map(a=>(
              <div key={a.id} className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-lg flex-shrink-0">{a.emoji||"📢"}</span>
                <div className="flex-1 min-w-0"><div className="text-xs font-black text-gray-800 truncate">{a.title}</div><div className="text-xs text-gray-400 mt-0.5">{a.date}</div></div>
              </div>))}
            </div>}
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-3 flex items-center justify-between text-sm">
            <span>📅 الأنشطة القادمة</span>
            <button onClick={()=>navigate("activities")} className="text-xs text-teal-600 font-bold">الكل</button>
          </h3>
          {upcomingAct.length===0 ? <div className="text-center py-4 text-xs text-gray-400">لا توجد أنشطة قادمة</div> :
            <div className="space-y-2">{upcomingAct.map(a=>(
              <div key={a.id} className="flex items-start gap-2 bg-teal-50 rounded-xl px-3 py-2">
                <span className="text-lg flex-shrink-0">{a.image||"⚡"}</span>
                <div className="flex-1 min-w-0"><div className="text-xs font-black text-gray-800 truncate">{a.title}</div><div className="text-xs text-teal-600 mt-0.5 font-bold">{a.dateH}</div></div>
              </div>))}
            </div>}
        </div>
      </div>

      {/* - رؤية المدرسة ورسالتها (مُعادة) - */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-teal-900 mb-1">رؤيتنا ورسالتنا</h3>
          <div className="w-16 h-1 bg-teal-500 rounded-full mx-auto"></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-gradient-to-b from-teal-50 to-white rounded-2xl p-5 text-center border border-teal-100">
            <div className="text-3xl mb-3">🔭</div>
            <h4 className="font-black text-teal-800 mb-2">الرؤية</h4>
            <p className="text-sm text-gray-600 leading-relaxed">بيئة تعليمية محفّزة تصنع جيلاً واعياً ومبدعاً قادراً على بناء مستقبل وطنه.</p>
          </div>
          <div className="bg-gradient-to-b from-emerald-50 to-white rounded-2xl p-5 text-center border border-emerald-100">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-black text-emerald-800 mb-2">الرسالة</h4>
            <p className="text-sm text-gray-600 leading-relaxed">تقديم تعليم نوعي يُراعي الفروق الفردية في شراكة فاعلة بين المدرسة والأسرة.</p>
          </div>
          <div className="bg-gradient-to-b from-green-50 to-white rounded-2xl p-5 text-center border border-green-100">
            <div className="text-3xl mb-3">⭐</div>
            <h4 className="font-black text-green-800 mb-2">أهدافنا</h4>
            <p className="text-sm text-gray-600 leading-relaxed">تعزيز القيم الإسلامية ورفع التحصيل الدراسي وتطوير مهارات المعلمين.</p>
          </div>
        </div>
      </div>

      {/* - الغياب هذا الأسبوع - */}
      {mostAbsent.length>0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 mb-6">
          <h3 className="font-black text-gray-800 mb-3 text-sm flex items-center gap-2">
            ⚠️ الأكثر غياباً هذا الأسبوع
            <button onClick={()=>navigate("absencestats")} className="text-xs text-red-500 font-bold hover:underline mr-auto">تحليل كامل</button>
          </h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {mostAbsent.map(t=>(
              <div key={t.name} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-gray-800 truncate">{t.name}</span>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0 mr-2">{t.count} أيام</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* - الأسبوع الحالي - */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-black text-gray-800 mb-3 text-sm">📊 حضور الأسبوع الحالي</h3>
        <div className="grid grid-cols-5 gap-2">
          {week.days.map((day,di)=>{
            const abs=teachers.filter((_,ti)=>(attendance[ti]?.[di]?.status||"حاضر")==="غائب").length;
            const late=teachers.filter((_,ti)=>(attendance[ti]?.[di]?.status||"حاضر")==="متأخر").length;
            const rate=teachers.length>0?Math.round(((teachers.length-abs)/teachers.length)*100):100;
            const col=rate>=95?"#22c55e":rate>=85?"#f59e0b":"#ef4444";
            return(
              <div key={di} className="rounded-xl p-2 text-center border cursor-pointer hover:shadow-md transition-all"
                style={{borderColor:col+"44",background:col+"11"}} onClick={()=>navigate("attendance")}>
                <div className="text-xs font-black text-gray-700">{day.name}</div>
                <div className="text-xs text-amber-600 font-bold">🌙 {day.dateH}</div>
                <div className="text-lg font-black mt-1" style={{color:col}}>{rate}%</div>
                {abs>0&&<div className="text-xs text-red-500 font-bold">{abs}غ</div>}
                {late>0&&<div className="text-xs text-amber-500 font-bold">{late}ت</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* - روابط سريعة - */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {[
          {id:"attendance",    icon:"📋", label:"الحضور",        color:"#0d9488"},
          {id:"students",      icon:"👨‍🎓", label:"التقييمات",     color:"#7c3aed"},
          {id:"messages",      icon:"✉️",  label:"الرسائل",       color:"#2563eb"},
          {id:"earlywarning",  icon:"🚨",  label:"الإنذار المبكر",color:"#dc2626"},
          {id:"gradeanalysis", icon:"📊",  label:"تحليل الدرجات", color:"#6366f1"},
          {id:"portfolio",     icon:"📁",  label:"ملف الطالب",    color:"#7c3aed"},
          {id:"meetings",      icon:"📅",  label:"الاجتماعات",    color:"#0891b2"},
          {id:"settings",      icon:"⚙️",  label:"الإعدادات",     color:"#64748b"},
        ].map(p=>(
          <button key={p.id} onClick={()=>navigate(p.id)}
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:shadow-md transition-all border border-gray-100 hover:scale-105">
            <span className="text-2xl">{p.icon}</span>
            <span className="text-xs font-black" style={{color:p.color}}>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AttendancePage({ teachers, setTeachers, saveTeachers, week, setWeek, saveWeek, attendance, setAttendance, saveAttendance }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dpCalType, setDpCalType] = useState("hijri");
  const [dpDay,   setDpDay]   = useState(10);
  const [dpMonth, setDpMonth] = useState(10);
  const [dpYear,  setDpYear]  = useState(1447);
  const [dpPreview, setDpPreview] = useState(null);
  const GREG_M_ATT = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

  const handleDpGenerate = () => {
    try {
      const gen = dpCalType === "hijri"
        ? generateWeekDaysFromHijri(dpDay, dpMonth, dpYear)
        : generateWeekDays(`${dpYear}-${String(dpMonth).padStart(2,"0")}-${String(dpDay).padStart(2,"0")}`);
      setDpPreview(gen);
    } catch(e) { alert("تاريخ غير صحيح"); }
  };

  const handleDpConfirm = () => {
    if (!dpPreview) return;
    if (setWeek) setWeek(dpPreview);
    if (saveWeek) saveWeek(dpPreview);
    setDpPreview(null);
    setShowDatePicker(false);
    setSelectedDay(0);
  };

  // تحديث حقل في سجل الحضور
  const updateField = (ti, di, field, value) => {
    setAttendance(prev => {
      const next = { ...prev, [ti]: { ...prev[ti], [di]: { ...(prev[ti]?.[di] || {}), [field]: value } } };
      // إذا تغير الحالة لـ"حاضر" امسح البيانات الأخرى
      if (field === "status" && value === "حاضر") {
        next[ti][di] = { status: "حاضر" };
      }
      // إذا تغير لـ"غائب" امسح بيانات التأخر
      if (field === "status" && value === "غائب") {
        next[ti][di] = { status: "غائب", absType: next[ti][di]?.absType || "اضطراري", notes: next[ti][di]?.notes || "" };
      }
      return next;
    });
  };

  useEffect(() => { const t = setTimeout(() => saveAttendance(attendance), 700); return () => clearTimeout(t); }, [attendance]);

  // إحصائيات
  const countStatus = (di, st) => teachers.filter((_, ti) => (attendance[ti]?.[di]?.status || "حاضر") === st).length;
  const countLate = (di) => countStatus(di, "متأخر");
  const countAbsent = (di) => countStatus(di, "غائب");
  const countPresent = (di) => teachers.length - countLate(di) - countAbsent(di);
  // تأخر صباحي = متأخر بدون حصص محددة أو lateType = "صباحي"
  const countMorningLate = (di) => teachers.filter((_, ti) => {
    const r = attendance[ti]?.[di] || {};
    return r.status === "متأخر" && (r.lateType === "صباحي" || !r.lateType);
  }).length;
  // تأخر عن حصص = متأخر وlateType = "حصص"
  const countPeriodLate = (di) => teachers.filter((_, ti) => {
    const r = attendance[ti]?.[di] || {};
    return r.status === "متأخر" && r.lateType === "حصص";
  }).length;
  // إجمالي دقائق التأخر الصباحي
  const totalMorningMins = (di) => teachers.reduce((sum, _, ti) => {
    const r = attendance[ti]?.[di] || {};
    if (r.status === "متأخر" && (r.lateType === "صباحي" || !r.lateType)) return sum + (parseInt(r.lateMinutes) || 0);
    return sum;
  }, 0);
  // إجمالي دقائق التأخر عن الحصص
  const totalPeriodMins = (di) => teachers.reduce((sum, _, ti) => {
    const r = attendance[ti]?.[di] || {};
    if (r.status === "متأخر" && r.lateType === "حصص") return sum + (parseInt(r.lateMinutes) || 0);
    return sum;
  }, 0);
  const filtered = teachers.map((t, i) => ({ name: t, idx: i })).filter(t => t.name.includes(searchQuery));

  // استيراد المعلمين من إكسل
  const handleTeacherImport = async (file) => {
    await loadXLSX();
    const buf = await file.arrayBuffer();
    const wb = window.XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (data.length < 2) { alert("الملف فارغ أو لا يحتوي على بيانات"); return; }

    const headers = data[0].map(h => String(h || "").trim());

    // تخمين أعمدة الاسم والهوية
    const nameColIdx = headers.findIndex(h =>
      h.includes("اسم") || h.includes("الاسم") || h.toLowerCase().includes("name")
    );
    const idColIdx = headers.findIndex(h =>
      h.includes("هوية") || h.includes("هويه") || h.includes("رقم") || h.includes("الرقم") || h.toLowerCase().includes("id")
    );

    const rows = data.slice(1).filter(r => r.some(c => c));
    const newAccounts = [];
    const newNames = [];

    rows.forEach(row => {
      const name = nameColIdx >= 0 ? String(row[nameColIdx] || "").trim() : "";
      const id   = idColIdx   >= 0 ? String(row[idColIdx]   || "").trim().replace(/ /g, "") : "";
      if (!name || name.length < 3) return;
      if (!newNames.includes(name)) {
        newNames.push(name);
        newAccounts.push({ id: id || name, name, role: "معلم" });
      }
    });

    if (newNames.length === 0) { alert("لم يتم العثور على أسماء صالحة"); return; }

    // حفظ الأسماء في قائمة المعلمين
    const merged = [...new Set([...teachers, ...newNames])];
    setTeachers(merged);
    saveTeachers(merged);

    // حفظ الحسابات (اسم + هوية) لبوابة المعلم
    const existingAccounts = await DB.get("school-teacher-accounts", []);
    const existingIds = existingAccounts.map(a => a.id);
    const toAdd = newAccounts.filter(a => !existingIds.includes(a.id));
    const updatedAccounts = [...existingAccounts, ...toAdd];
    await DB.set("school-teacher-accounts", updatedAccounts);

    const hasId = idColIdx >= 0;
    alert(`✅ تم استيراد ${newNames.length} معلم.${hasId ? " رقم الهوية هو كلمة مرور الدخول." : " تحذير: لم يُعثر على عمود الهوية — استخدم الاسم كلمةَ مرور مؤقتة."}`);
    setShowExcelImport(false);
  };

  // طباعة اليومي
  const handlePrint = () => {
    const day = week.days[selectedDay];
    const rows = teachers.map((t, ti) => {
      const r = attendance[ti]?.[selectedDay] || {};
      const st = r.status || "حاضر";
      let details = "—";
      if (st === "متأخر") {
        const periods = (r.latePeriods || []).join("، ");
        details = `تأخر ${r.lateMinutes || "—"} دقيقة — من الحصة: ${periods || "—"}`;
      } else if (st === "غائب") {
        details = `${r.absType || "اضطراري"} — ${r.notes || ""}`;
      }
      const color = st === "حاضر" ? "#f0fdf4" : st === "متأخر" ? "#fffbeb" : "#fef2f2";
      return `<tr style="background:${color}"><td>${ti+1}</td><td style="text-align:right;padding:6px 10px">${t}</td><td>${st === "حاضر" ? "✅ حاضر" : st === "متأخر" ? "🕐 متأخر" : "❌ غائب"}</td><td>${details}</td></tr>`;
    }).join("");

    w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
    <title>سجل الحضور — ${day.name}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Noto Sans Arabic',Arial,sans-serif;padding:24px;direction:rtl;background:#fff;color:#111}
      .header{text-align:center;margin-bottom:20px;padding-bottom:12px;border-bottom:3px solid #0d9488}
      .header h1{font-size:20px;color:#0d9488;font-weight:900}
      .header p{font-size:13px;color:#555;margin-top:4px}
      .stats{display:flex;gap:12px;margin-bottom:16px;justify-content:center}
      .stat{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 20px;text-align:center}
      .stat.late{background:#fffbeb;border-color:#fde68a}
      .stat.abs{background:#fef2f2;border-color:#fecaca}
      .stat span{display:block;font-size:22px;font-weight:900}
      .stat small{font-size:11px;color:#555}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{background:#0d9488;color:#fff;padding:8px;text-align:center}
      td{border:1px solid #e5e7eb;padding:6px;text-align:center}
      .footer{text-align:center;margin-top:20px;font-size:11px;color:#999}
      @media print{@page{size:A4;margin:1.5cm}}
    </style></head><body>
    <div class="header">
      <h1>مدرسة عبيدة بن الحارث المتوسطة</h1>
      <p>سجل الحضور والغياب — ${day.name} | ${day.dateH} هـ | ${day.dateM} م</p>
    </div>
    <div class="stats">
      <div class="stat"><span>${countPresent(selectedDay)}</span><small>✅ حاضر</small></div>
      <div class="stat late"><span>${countLate(selectedDay)}</span><small>🕐 متأخر</small></div>
      <div class="stat abs"><span>${countAbsent(selectedDay)}</span><small>❌ غائب</small></div>
    </div>
    <table>
      <thead><tr><th>م</th><th>اسم المعلم / الإداري</th><th>الحالة</th><th>التفاصيل</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">تم الإصدار بتاريخ ${new Date().toLocaleDateString('ar-SA')} — بوابة مدرسة عبيدة بن الحارث الإلكترونية</div>
    </body></html>`);
  };

  // طباعة ملخص الأسبوع
  const handlePrintSummary = () => {
    const rows = teachers.map((t, ti) => {
      const morningLate = week.days.filter((_,di)=>{ const r=attendance[ti]?.[di]||{}; return r.status==="متأخر"&&(r.lateType==="صباحي"||!r.lateType); }).length;
      const periodLate  = week.days.filter((_,di)=>{ const r=attendance[ti]?.[di]||{}; return r.status==="متأخر"&&r.lateType==="حصص"; }).length;
      const absCount    = week.days.filter((_,di)=>(attendance[ti]?.[di]?.status||"حاضر")==="غائب").length;
      const morningMins = week.days.reduce((s,_,di)=>{ const r=attendance[ti]?.[di]||{}; return r.status==="متأخر"&&(r.lateType==="صباحي"||!r.lateType)?s+(parseInt(r.lateMinutes)||0):s; },0);
      const periodMins  = week.days.reduce((s,_,di)=>{ const r=attendance[ti]?.[di]||{}; return r.status==="متأخر"&&r.lateType==="حصص"?s+(parseInt(r.lateMinutes)||0):s; },0);
      const color = absCount>0?"#fef2f2":morningLate+periodLate>0?"#fffbeb":"#fff";
      return `<tr style="background:${color}"><td>${ti+1}</td><td style="text-align:right;padding:6px 10px">${t}</td>
        ${week.days.map((_,di)=>{ const r=attendance[ti]?.[di]||{}; const st=r.status||"حاضر"; const lt=r.lateType||"صباحي"; const min=r.lateMinutes||""; return `<td>${st==="حاضر"?"✅":st==="متأخر"?(lt==="حصص"?`📚${min?min+"د":""}`:`🌅${min?min+"د":""}`):"❌"}</td>`; }).join("")}
        <td style="color:#ea580c;font-weight:bold">${morningLate||"—"}</td>
        <td style="color:#ea580c">${morningMins>0?morningMins+"د":"—"}</td>
        <td style="color:#d97706;font-weight:bold">${periodLate||"—"}</td>
        <td style="color:#d97706">${periodMins>0?periodMins+"د":"—"}</td>
        <td style="color:#dc2626;font-weight:bold">${absCount||"—"}</td></tr>`;
    }).join("");

    w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>ملخص الأسبوع</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Noto Sans Arabic',Arial,sans-serif;padding:24px;direction:rtl}
    .header{text-align:center;margin-bottom:16px;padding-bottom:10px;border-bottom:3px solid #7c3aed}
    .header h1{font-size:18px;color:#7c3aed;font-weight:900}.header p{font-size:12px;color:#555;margin-top:3px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th{background:#7c3aed;color:#fff;padding:7px;text-align:center}
    td{border:1px solid #e5e7eb;padding:5px;text-align:center}
    @media print{@page{size:A4 landscape;margin:1cm}}</style></head><body>
    <div class="header"><h1>مدرسة عبيدة بن الحارث المتوسطة</h1>
    <p>ملخص الحضور والغياب الأسبوعي — ${week.days[0]?.dateH} إلى ${week.days[week.days.length-1]?.dateH} هـ</p></div>
    <table><thead><tr><th>م</th><th>اسم المعلم</th>
    ${week.days.map(d=>`<th>${d.name}</th>`).join("")}
    <th>🌅 تأخر صباحي</th><th>دقائق صباحي</th><th>📚 تأخر حصص</th><th>دقائق حصص</th><th>❌ غياب</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div style="text-align:center;margin-top:16px;font-size:10px;color:#999">تم الإصدار بتاريخ ${new Date().toLocaleDateString('ar-SA')}</div>
    </body></html>`);
  };

  return (
    <div dir="rtl">
      {/* العنوان */}
      <div className="rounded-3xl p-6 mb-5 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #065f46 100%)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <div className="text-4xl mb-1">📋</div>
            <h2 className="text-2xl font-black">سجل الحضور والغياب</h2>
            <p className="opacity-80 text-sm mt-1">مدرسة عبيدة بن الحارث المتوسطة — ١٤٤٧هـ</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <button onClick={handlePrint}
              className="bg-white text-teal-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-50 flex items-center gap-1 shadow">
              🖨️ طباعة اليوم
            </button>
            <button onClick={() => { setShowSummary(true); }}
              className="bg-white text-purple-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 flex items-center gap-1 shadow">
              📊 ملخص الأسبوع
            </button>
            <button onClick={() => setShowExcelImport(true)}
              className="bg-white text-green-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-50 flex items-center gap-1 shadow">
              📥 إضافة من إكسل
            </button>
            <div className="bg-white bg-opacity-20 px-3 py-2 rounded-xl text-xs font-bold">💾 حفظ تلقائي</div>
          </div>
        </div>
      </div>

      {/* إحصائيات اليوم */}
      {!showSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-center">
            <div className="text-3xl font-black text-emerald-700">{countPresent(selectedDay)}</div>
            <div className="text-xs font-bold text-emerald-600 mt-1">✅ حاضر</div>
          </div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-3 text-center">
            <div className="text-3xl font-black text-orange-700">{countMorningLate(selectedDay)}</div>
            <div className="text-xs font-bold text-orange-600 mt-1">🌅 تأخر صباحي</div>
            {totalMorningMins(selectedDay) > 0 && <div className="text-xs text-orange-400 mt-0.5">{totalMorningMins(selectedDay)} دقيقة</div>}
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
            <div className="text-3xl font-black text-amber-700">{countPeriodLate(selectedDay)}</div>
            <div className="text-xs font-bold text-amber-600 mt-1">📚 تأخر عن حصة</div>
            {totalPeriodMins(selectedDay) > 0 && <div className="text-xs text-amber-400 mt-0.5">{totalPeriodMins(selectedDay)} دقيقة</div>}
          </div>
          <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-3 text-center">
            <div className="text-3xl font-black text-amber-600">{countLate(selectedDay)}</div>
            <div className="text-xs font-bold text-amber-500 mt-1">🕐 إجمالي التأخر</div>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-center">
            <div className="text-3xl font-black text-red-700">{countAbsent(selectedDay)}</div>
            <div className="text-xs font-bold text-red-600 mt-1">❌ غائب</div>
          </div>
        </div>
      )}

      {/* أيام الأسبوع + تغيير التاريخ */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1 items-start">
        {week.days.map((day, i) => (
          <button key={i} onClick={() => { setSelectedDay(i); setShowSummary(false); setShowDatePicker(false); }}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!showSummary && selectedDay === i ? "bg-teal-600 text-white shadow-md" : "bg-white text-gray-600 border-2 border-gray-100 hover:border-teal-200"}`}>
            <div className="font-black">{day.name}</div>
            <div className="text-xs font-bold opacity-80">🌙 {day.dateH}</div>
            <div className="text-xs opacity-60">☀️ {day.dateM}</div>
            {!showSummary && selectedDay !== i && (countAbsent(i) > 0 || countLate(i) > 0) && (
              <div className="text-xs mt-0.5">
                {countAbsent(i) > 0 && <span className="text-red-500 font-bold">{countAbsent(i)}غ </span>}
                {countLate(i) > 0 && <span className="text-amber-500 font-bold">{countLate(i)}ت</span>}
              </div>
            )}
          </button>
        ))}
        {/* زر تغيير الأسبوع */}
        <button onClick={() => { setShowDatePicker(p=>!p); setDpPreview(null); }}
          className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${showDatePicker ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-600 border-amber-300 hover:bg-amber-50"}`}>
          📅<br/><span className="text-xs">تغيير</span>
        </button>
      </div>

      {/* لوحة تغيير التاريخ */}
      {showDatePicker && (
        <div className="bg-gradient-to-l from-amber-50 to-teal-50 border-2 border-amber-300 rounded-2xl p-4 mb-4 shadow-lg">
          <div className="font-black text-teal-800 text-sm mb-3 flex items-center justify-between">
            <span>📅 تحديد أسبوع جديد <span className="text-xs text-gray-400 font-normal mr-1">(اختر تاريخ يوم الأحد)</span></span>
            <button onClick={() => { setShowDatePicker(false); setDpPreview(null); }} className="text-gray-400 hover:text-gray-600 text-lg font-bold">✕</button>
          </div>

          {/* نوع التقويم */}
          <div className="flex gap-2 mb-3">
            {[{v:"hijri",l:"🌙 هجري"},{v:"gregorian",l:"☀️ ميلادي"}].map(t => (
              <button key={t.v} onClick={() => { setDpCalType(t.v); setDpDay(1); setDpMonth(1); setDpYear(t.v==="hijri"?1447:2026); setDpPreview(null); }}
                className={"flex-1 py-2 rounded-xl text-sm font-black transition-all border-2 " +
                  (dpCalType===t.v ? "border-teal-500 bg-teal-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-teal-300")}>
                {t.l}
              </button>
            ))}
          </div>

          {/* القوائم المنسدلة */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">اليوم</label>
              <select value={dpDay} onChange={e => { setDpDay(Number(e.target.value)); setDpPreview(null); }}
                className="w-full px-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm font-bold bg-white text-center"
                style={{fontFamily:"inherit"}}>
                {Array.from({length: dpCalType==="hijri" ? 30 : 31}, (_,i) => i+1).map(d => (
                  <option key={d} value={d}>{String(d).padStart(2,"0")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">الشهر</label>
              <select value={dpMonth} onChange={e => { setDpMonth(Number(e.target.value)); setDpPreview(null); }}
                className="w-full px-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm font-bold bg-white"
                style={{fontFamily:"inherit"}}>
                {(dpCalType==="hijri" ? HIJRI_MONTHS : GREG_M_ATT).map((m,i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">السنة</label>
              <select value={dpYear} onChange={e => { setDpYear(Number(e.target.value)); setDpPreview(null); }}
                className="w-full px-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm font-bold bg-white text-center"
                style={{fontFamily:"inherit"}}>
                {(dpCalType==="hijri" ? Array.from({length:20},(_,i)=>1440+i) : Array.from({length:10},(_,i)=>2023+i)).map(y => (
                  <option key={y} value={y}>{y} {dpCalType==="hijri"?"هـ":"م"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* أزرار */}
          <div className="flex gap-2">
            <button onClick={handleDpGenerate}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black transition-all">
              👁️ معاينة الأسبوع
            </button>
            {dpPreview && (
              <button onClick={handleDpConfirm}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-black transition-all">
                ✅ تطبيق وحفظ
              </button>
            )}
          </div>

          {/* معاينة */}
          {dpPreview && (
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {dpPreview.days.map((d,i) => (
                <div key={i} className="bg-white rounded-xl p-2 text-center border-2 border-teal-200 shadow-sm">
                  <div className="text-xs font-black text-teal-800">{d.name}</div>
                  <div className="text-xs text-amber-700 font-bold mt-1">🌙 {d.dateH}</div>
                  <div className="text-xs text-gray-400 mt-0.5">☀️ {d.dateM}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* بحث */}
      <input type="text" placeholder="🔍 بحث عن معلم أو إداري..." value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm bg-white mb-4" />

      {/* ملخص الأسبوع */}
      {showSummary ? (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="flex items-center justify-between bg-purple-600 text-white px-4 py-3">
            <div className="font-black text-lg">📊 ملخص غياب وتأخر الأسبوع</div>
            <div className="flex gap-2">
              <button onClick={handlePrintSummary} className="bg-white text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-50">🖨️ طباعة</button>
              <button onClick={() => setShowSummary(false)} className="bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-opacity-30">✕ إغلاق</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-purple-50">
                  <th className="p-2 text-right font-bold text-gray-600 w-8">م</th>
                  <th className="p-2 text-right font-bold text-gray-600">اسم المعلم / الإداري</th>
                  {week.days.map((d, i) => <th key={i} className="p-2 text-center font-bold text-gray-600">{d.name}</th>)}
                  <th className="p-2 text-center font-bold text-orange-600">🌅 صباحي</th>
                  <th className="p-2 text-center font-bold text-orange-500">دقائق صباحي</th>
                  <th className="p-2 text-center font-bold text-amber-600">📚 حصص</th>
                  <th className="p-2 text-center font-bold text-amber-500">دقائق حصص</th>
                  <th className="p-2 text-center font-bold text-red-700">❌ غياب</th>
                </tr>
              </thead>
              <tbody>
                {teachers.filter(t => t.includes(searchQuery)).map((teacher, ti) => {
                  const morningLate = week.days.filter((_, di) => { const r = attendance[ti]?.[di]||{}; return r.status==="متأخر" && (r.lateType==="صباحي"||!r.lateType); }).length;
                  const periodLate = week.days.filter((_, di) => { const r = attendance[ti]?.[di]||{}; return r.status==="متأخر" && r.lateType==="حصص"; }).length;
                  const absCount = week.days.filter((_, di) => (attendance[ti]?.[di]?.status||"حاضر")==="غائب").length;
                  const morningMins = week.days.reduce((s,_,di)=>{ const r=attendance[ti]?.[di]||{}; return r.status==="متأخر"&&(r.lateType==="صباحي"||!r.lateType)?s+(parseInt(r.lateMinutes)||0):s; },0);
                  const periodMins = week.days.reduce((s,_,di)=>{ const r=attendance[ti]?.[di]||{}; return r.status==="متأخر"&&r.lateType==="حصص"?s+(parseInt(r.lateMinutes)||0):s; },0);
                  const anyLate = morningLate + periodLate;
                  return (
                    <tr key={ti} className={`border-t border-gray-100 ${absCount>0?"bg-red-50":anyLate>0?"bg-amber-50":"hover:bg-gray-50"}`}>
                      <td className="p-2 text-center text-gray-400 font-bold">{ti+1}</td>
                      <td className="p-2 font-medium text-gray-800">{teacher}</td>
                      {week.days.map((_, di) => {
                        const r = attendance[ti]?.[di] || {};
                        const st = r.status || "حاضر";
                        const lt = r.lateType || "صباحي";
                        const min = r.lateMinutes || "";
                        return (
                          <td key={di} className="p-2 text-center">
                            {st==="حاضر" ? <span className="text-green-500">✅</span>
                              : st==="متأخر" ? <span className={lt==="حصص"?"text-amber-600":"text-orange-600"} title={lt}>
                                  {lt==="حصص"?"📚":"🌅"}{min&&<span className="text-xs"> {min}د</span>}
                                </span>
                              : <span className="text-red-500">❌</span>}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center font-black text-orange-600">{morningLate||"—"}</td>
                      <td className="p-2 text-center font-black text-orange-500">{morningMins>0?`${morningMins}د`:"—"}</td>
                      <td className="p-2 text-center font-black text-amber-600">{periodLate||"—"}</td>
                      <td className="p-2 text-center font-black text-amber-500">{periodMins>0?`${periodMins}د`:"—"}</td>
                      <td className="p-2 text-center font-black text-red-700">{absCount||"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* جدول الحضور اليومي */
        <div className={cx.cardSm}>
          <div className="bg-teal-600 text-white px-4 py-3 text-center">
            <span className="font-black">{week.days[selectedDay].name}</span>
            <span className="mx-2 opacity-60">|</span>
            <span className="text-sm opacity-90">{week.days[selectedDay].dateH} هـ</span>
            <span className="mx-2 opacity-60">|</span>
            <span className="text-sm opacity-90">{week.days[selectedDay].dateM} م</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f0fdfa" }}>
                  <th className="p-3 text-right text-xs font-bold text-gray-500 w-8">م</th>
                  <th className="p-3 text-right text-xs font-bold text-gray-500">اسم المعلم / الإداري</th>
                  <th className="p-3 text-center text-xs font-bold text-gray-500 w-28">الحالة</th>
                  <th className="p-3 text-center text-xs font-bold text-amber-700">الحصة</th>
                  <th className="p-3 text-center text-xs font-bold text-amber-700">مدة التأخر</th>
                  <th className="p-3 text-center text-xs font-bold text-red-600">نوع الغياب</th>
                  <th className="p-3 text-center text-xs font-bold text-gray-500">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ name, idx: ti }) => {
                  const r = attendance[ti]?.[selectedDay] || {};
                  const status = r.status || "حاضر";
                  const isLate = status === "متأخر";
                  const isAbsent = status === "غائب";
                  const rowBg = isAbsent ? "#fef2f2" : isLate ? "#fffbeb" : "#fff";

                  return (
                    <tr key={ti} style={{ background: rowBg }} className="border-t border-gray-100">
                      <td className="p-2 text-center text-xs text-gray-400 font-bold">{ti + 1}</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isAbsent ? "bg-red-400" : isLate ? "bg-amber-400" : "bg-green-400"}`}></div>
                          <span className="font-medium text-gray-800 text-sm">{name}</span>
                        </div>
                      </td>

                      {/* الحالة */}
                      <td className="p-1.5 text-center">
                        <div className="flex gap-1 justify-center">
                          {ATTENDANCE_STATUS.map(st => (
                            <button key={st} onClick={() => updateField(ti, selectedDay, "status", st)}
                              className="px-2 py-1.5 rounded-lg text-xs font-bold transition-all border-2"
                              style={{
                                background: status === st ? (st === "حاضر" ? "#dcfce7" : st === "متأخر" ? "#fef3c7" : "#fee2e2") : "#f9fafb",
                                borderColor: status === st ? (st === "حاضر" ? "#16a34a" : st === "متأخر" ? "#d97706" : "#dc2626") : "#e5e7eb",
                                color: status === st ? (st === "حاضر" ? "#15803d" : st === "متأخر" ? "#92400e" : "#991b1b") : "#9ca3af",
                              }}>
                              {st === "حاضر" ? "✅" : st === "متأخر" ? "🕐" : "❌"} {st}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* الحصة المتأخر عنها */}
                      <td className="p-1.5 text-center">
                        {isLate ? (
                          <div className="space-y-1.5">
                            {/* نوع التأخر */}
                            <div className="flex gap-1 justify-center">
                              {["صباحي","حصص"].map(lt => (
                                <button key={lt} onClick={() => updateField(ti, selectedDay, "lateType", lt)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-black border-2 transition-all"
                                  style={{
                                    background: (r.lateType||"صباحي") === lt ? (lt==="صباحي"?"#fff7ed":"#fefce8") : "#f9fafb",
                                    borderColor: (r.lateType||"صباحي") === lt ? (lt==="صباحي"?"#ea580c":"#ca8a04") : "#e5e7eb",
                                    color: (r.lateType||"صباحي") === lt ? (lt==="صباحي"?"#9a3412":"#713f12") : "#9ca3af",
                                  }}>
                                  {lt === "صباحي" ? "🌅" : "📚"} {lt}
                                </button>
                              ))}
                            </div>
                            {/* أرقام الحصص — تظهر فقط عند تأخر عن حصص */}
                            {(r.lateType === "حصص") && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {PERIODS.map((p, pi) => {
                                  const sel = (r.latePeriods || []).includes(p);
                                  return (
                                    <button key={pi} onClick={() => {
                                      const cur = r.latePeriods || [];
                                      updateField(ti, selectedDay, "latePeriods", sel ? cur.filter(x => x !== p) : [...cur, p]);
                                    }}
                                      className="px-1.5 py-1 rounded-lg text-xs font-bold border-2 transition-all"
                                      style={{ background: sel?"#fef3c7":"#f9fafb", borderColor: sel?"#f59e0b":"#e5e7eb", color: sel?"#92400e":"#9ca3af" }}>
                                      {pi+1}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : <span className="text-gray-200 text-lg">—</span>}
                      </td>

                      {/* مدة التأخر */}
                      <td className="p-1.5 text-center">
                        {isLate ? (
                          <div className="flex items-center gap-1 justify-center">
                            <input type="number" min="1" max="120" placeholder="دقيقة"
                              value={r.lateMinutes || ""}
                              onChange={e => updateField(ti, selectedDay, "lateMinutes", e.target.value)}
                              className="w-16 px-2 py-1.5 rounded-lg border-2 border-amber-200 text-center text-xs font-bold focus:outline-none focus:border-amber-400 bg-amber-50"
                              style={{ fontFamily: "inherit" }} />
                            <span className="text-xs text-amber-600 font-bold">د</span>
                          </div>
                        ) : <span className="text-gray-200 text-lg">—</span>}
                      </td>

                      {/* نوع الغياب */}
                      <td className="p-1.5 text-center">
                        {isAbsent ? (
                          <select value={r.absType || "اضطراري"}
                            onChange={e => updateField(ti, selectedDay, "absType", e.target.value)}
                            className="px-2 py-1.5 rounded-lg border-2 border-red-200 text-xs font-bold focus:outline-none bg-red-50 text-red-700">
                            <option>اضطراري</option>
                            <option>مرضي</option>
                            <option>اعتيادي</option>
                            <option>إذن خروج</option>
                          </select>
                        ) : <span className="text-gray-200 text-lg">—</span>}
                      </td>

                      {/* ملاحظات */}
                      <td className="p-1.5">
                        <input type="text" placeholder="ملاحظة..."
                          value={r.notes || ""}
                          onChange={e => updateField(ti, selectedDay, "notes", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border-2 border-gray-200 text-xs focus:outline-none focus:border-teal-400 text-center"
                          style={{ fontFamily: "inherit", minWidth: "90px" }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة استيراد إكسل للمعلمين */}
      {showExcelImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-800 text-lg">📥 إضافة معلمين من إكسل</h3>
              <button onClick={() => setShowExcelImport(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 mb-4 font-medium space-y-1">
              <div className="font-black">الملف يجب أن يحتوي على عمودين:</div>
              <div>• <strong>اسم المعلم</strong> — (عمود الاسم)</div>
              <div>• <strong>رقم الهوية</strong> — 10 أرقام (يُستخدم كلمة مرور الدخول)</div>
              <div className="text-xs text-blue-500 mt-1">رأس العمود يجب أن يحتوي على كلمة "اسم" و"هوية" أو "رقم"</div>
            </div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="text-4xl mb-2">📂</div>
              <div className="font-bold text-gray-700">اضغط لاختيار ملف إكسل</div>
              <div className="text-xs text-gray-400 mt-1">يدعم .xlsx و .xls</div>
              <input type="file" accept=".xlsx,.xls" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleTeacherImport(f); }} />
            </label>
            <button onClick={() => setShowExcelImport(false)} className="w-full mt-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== صفحة تقييم الطلاب (متعددة الفصول) =====
const LEVELS = ["الصف الأول", "الصف الثاني", "الصف الثالث"];
const SECTIONS = ["أ", "ب", "ج", "د", "هـ", "و", "ز"];

function newClass(id) {
  return { id, name: "", level: "الصف الأول", section: "أ", teacher: "", semester: "الثالث", students: [] };
}
function newStudent(num) {
  return { id: Date.now() + Math.random() * 1000 | 0 + num, num, name: "", nationalId: "", parentPhone: "", grades: {} };
}

// ===== استيراد إكسل =====
function ExcelImportModal({ onImport, onClose }) {
  const [rows, setRows] = useState([]);
  const [nameCol, setNameCol] = useState("");
  const [idCol, setIdCol] = useState("");
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    await loadXLSX();
    const XLSX = window.XLSX;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (data.length < 2) return;
    const hdrs = data[0].map(h => String(h || "").trim());
    setHeaders(hdrs);
    setRows(data.slice(1).filter(r => r.some(c => c)));
    // تخمين الأعمدة
    const nameGuess = hdrs.find(h => h.includes("اسم") || h.includes("الاسم") || h.toLowerCase().includes("name")) || hdrs[0];
    const idGuess = hdrs.find(h => h.includes("هوية") || h.includes("هويه") || h.includes("هوي") || h.includes("رقم") || h.toLowerCase().includes("id")) || "";
    setNameCol(nameGuess || "");
    setIdCol(idGuess || "");
  };

  const handleImport = () => {
    if (!nameCol) return;
    const ni = headers.indexOf(nameCol);
    const ii = idCol ? headers.indexOf(idCol) : -1;
    const students = rows.map((r, i) => ({
      ...newStudent(i + 1),
      num: i + 1,
      name: String(r[ni] || "").trim(),
      nationalId: ii >= 0 ? String(r[ii] || "").trim() : "",
    })).filter(s => s.name);
    onImport(students);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800 text-lg">📊 استيراد من ملف إكسل</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {/* رفع الملف */}
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="text-4xl mb-2">📂</div>
            <div className="font-bold text-gray-700">{fileName || "اضغط لاختيار ملف إكسل"}</div>
            <div className="text-xs text-gray-400 mt-1">يدعم .xlsx و .xls</div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
          </div>

          {headers.length > 0 && (
            <>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-bold">
                ✅ تم قراءة {rows.length} سطر من الملف
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cx.labelB}>عمود اسم الطالب *</label>
                  <select value={nameCol} onChange={e => setNameCol(e.target.value)}
                    className={cx.input}>
                    <option value="">— اختر العمود —</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className={cx.labelB}>عمود رقم الهوية (اختياري)</label>
                  <select value={idCol} onChange={e => setIdCol(e.target.value)}
                    className={cx.input}>
                    <option value="">— لا يوجد —</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              {/* معاينة */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">معاينة أول 5 طلاب:</div>
                <div className="divide-y divide-gray-100">
                  {rows.slice(0, 5).map((r, i) => {
                    const ni = headers.indexOf(nameCol);
                    const ii = idCol ? headers.indexOf(idCol) : -1;
                    return (
                      <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                        <span className="font-medium text-gray-800">{ni >= 0 ? String(r[ni] || "—") : "—"}</span>
                        {ii >= 0 && <span className="text-gray-400">{String(r[ii] || "—")}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200">إلغاء</button>
          <button onClick={handleImport} disabled={!nameCol || rows.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            استيراد {rows.filter(r => r[headers.indexOf(nameCol)]).length} طالب
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== أدوات التاريخ الهجري/الميلادي =====
function gregorianToHijri(gYear, gMonth, gDay) {
  const jd = Math.floor((1461*(gYear+4800+Math.floor((gMonth-14)/12)))/4)+
             Math.floor((367*(gMonth-2-12*Math.floor((gMonth-14)/12)))/12)-
             Math.floor((3*Math.floor((gYear+4900+Math.floor((gMonth-14)/12))/100))/4)+
             gDay-32075;
  const l=jd-1948440+10632, n=Math.floor((l-1)/10631), l2=l-10631*n+354;
  const j=Math.floor((10985-l2)/5316)*Math.floor((50*l2)/17719)+Math.floor(l2/5670)*Math.floor((43*l2)/15238);
  const l3=l2-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29;
  return { d:Math.floor((24*l3)/709)===0?l3:l3-Math.floor((709*Math.floor((24*l3)/709))/24),
           m:Math.floor((24*l3)/709), y:30*n+j-30 };
}
function hijriToGregorian(hYear, hMonth, hDay) {
  const n=Math.floor((hYear-1)/30), r=hYear-30*n-1;
  const j=Math.floor((r*11+3)/30)+Math.floor(29.5*(hMonth-1))+hDay+
           n*10631-Math.floor((r+0.1)/2.97)+1948440-385;
  const l=j+68569, n2=Math.floor((4*l)/146097);
  const l2=l-Math.floor((146097*n2+3)/4), i2=Math.floor((4000*(l2+1))/1461001);
  const l3=l2-Math.floor((1461*i2)/4)+31, j2=Math.floor((80*l3)/2447);
  const gDay=l3-Math.floor((2447*j2)/80), l4=Math.floor(j2/11);
  return new Date(100*n2+i2+l4, j2+2-12*l4, gDay);
}
function padZ(n){return String(n).padStart(2,'0');}
function fmtHijri(h){return `${padZ(h.d)}/${padZ(h.m)}/${h.y}`;}
function fmtGreg(d){return `${padZ(d.getDate())}/${padZ(d.getMonth()+1)}/${d.getFullYear()}`;}
const HIJRI_MONTHS=["محرم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
const WEEK_DAYS=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس"];
function generateWeekDays(sundayIso) {
  const base = new Date(sundayIso);
  return {
    days: WEEK_DAYS.map((name,i) => {
      const d = new Date(base); d.setDate(d.getDate()+i);
      const h = gregorianToHijri(d.getFullYear(), d.getMonth()+1, d.getDate());
      return { name, dateH: fmtHijri(h), dateM: fmtGreg(d) };
    })
  };
}
function generateWeekDaysFromHijri(hDay, hMonth, hYear) {
  // تحويل الأحد الهجري لميلادي ثم توليد باقي الأيام
  const sundayGreg = hijriToGregorian(hYear, hMonth, hDay);
  return {
    days: WEEK_DAYS.map((name,i) => {
      const d = new Date(sundayGreg); d.setDate(d.getDate()+i);
      const h = gregorianToHijri(d.getFullYear(), d.getMonth()+1, d.getDate());
      return { name, dateH: fmtHijri(h), dateM: fmtGreg(d) };
    })
  };
}
function parseHijriInput(str) {
  // يقبل: DD/MM/YYYY أو DD-MM-YYYY أو DDMMYYYY
  const clean = str.replace(/[\-\.]/g,"/").trim();
  const parts = clean.split("/");
  if (parts.length === 3) {
    const [d,m,y] = parts.map(Number);
    if (d>0&&d<=30&&m>0&&m<=12&&y>1400&&y<1500) return {d,m,y,valid:true};
  }
  return {valid:false};
}
function weekLabel(week) {
  const f = week.days[0], l = week.days[4]||week.days[week.days.length-1];
  return `${f.dateH} — ${l.dateH} هـ`;
}

// ===== className مشتركة =====
const cx = {
  label:  "text-xs font-bold text-gray-500 mb-1 block",
  labelB: "text-xs font-bold text-gray-600 mb-1 block",
  labelX: "text-xs font-black text-gray-500 mb-1.5 block",
  input:  "w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400",
  inputT: "w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm",
  card:   "bg-white rounded-2xl p-5 shadow-sm border border-gray-100",
  cardXl: "bg-white rounded-2xl shadow-xl overflow-hidden",
  cardSm: "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",
  row:    "flex items-center justify-between flex-wrap gap-3",
  empty:  "bg-white rounded-2xl p-8 text-center text-gray-400",
  btn:    "px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700",
  head3:  "font-black text-gray-800 mb-4 flex items-center gap-2",
};

// ===== بوابة ولي الأمر =====
function ParentPortal({ classList, setClassList, saveClass, messages, setMessages, saveMessages, surveys, setSurveys, saveSurveys, siteFont, onBack }) {
  const [nationalId, setNationalId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [tab, setTab] = useState("notes"); // notes | grades | messages | surveys
  const [replyTexts, setReplyTexts] = useState({});
  const [replying, setReplying] = useState({});
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  const saveParentPhone = (phone) => {
    if (!result || !setClassList) return;
    const updated = classList.map(cls =>
      cls.id === result.cls.id
        ? { ...cls, students: cls.students.map(s => s.id === result.student.id ? { ...s, parentPhone: phone } : s) }
        : cls
    );
    setClassList(updated);
    if (saveClass) saveClass({ ...result.cls, students: result.cls.students.map(s => s.id === result.student.id ? { ...s, parentPhone: phone } : s) });
    setResult(prev => ({ ...prev, student: { ...prev.student, parentPhone: phone } }));
    setEditingPhone(false);
  };

  const handleSearch = () => {
    if (!nationalId.trim()) { setError("أدخل رقم الهوية"); return; }
    setSearched(true);
    setError("");
    for (const cls of classList) {
      const student = cls.students?.find(s => s.nationalId && s.nationalId.trim() === nationalId.trim());
      if (student) {
        setResult({ student, cls });
        // إذا كانت هناك ملاحظات غير مقروءة من المعلم، انتقل إليها مباشرة
        const hasUnread = messages.some(m => m.type === "teacher_note" && m.studentId === student.nationalId && !m.read);
        setTab(hasUnread ? "notes" : "grades");
        return;
      }
    }
    setResult(null);
    setError("لم يتم العثور على طالب بهذا الرقم. تأكد من صحة رقم الهوية.");
  };

  const gradeCount = result ? Object.values(result.student.grades || {}).reduce((acc, g) => { if (g) acc[g] = (acc[g] || 0) + 1; return acc; }, {}) : {};
  const totalGraded = Object.values(gradeCount).reduce((a, b) => a + b, 0);
  const excellentCount = (gradeCount.excel || 0) + (gradeCount.vgood || 0);
  const weakCount = (gradeCount.weak || 0);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col" style={{ fontFamily: siteFont, background: "linear-gradient(135deg, #1B3A6B 0%, #2E6DA4 60%, #1a8fe3 100%)" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');`}</style>
      {/* رأس الصفحة */}
      <div className="text-center text-white pt-10 pb-6 px-4">
        <div className="text-5xl mb-3">🏫</div>
        <h1 className="text-2xl font-black mb-1">مدرسة عبيدة بن الحارث المتوسطة</h1>
        <p className="opacity-80 text-sm">بوابة أولياء الأمور — متابعة مستوى الطالب</p>
      </div>

      <div className="max-w-lg mx-auto w-full px-4 pb-10 flex-1">
        {/* بطاقة البحث */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-4">
          <h2 className="font-black text-gray-800 text-center mb-4">🔍 أدخل رقم هوية الطالب</h2>
          <div className="flex gap-2">
            <input type="text" value={nationalId} onChange={e => { setNationalId(e.target.value); setError(""); setSearched(false); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="رقم الهوية الوطنية للطالب"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm text-center tracking-widest font-bold" />
            <button onClick={handleSearch}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 text-sm">بحث</button>
          </div>
          {error && (
            <div className="mt-3 bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl text-center">{error}</div>
          )}
        </div>

        {/* نتيجة البحث */}
        {result && (
          <div className="space-y-4">
            {/* بيانات الطالب */}
            <div className={cx.cardXl}>
              <div className="p-5 text-white text-center" style={{ background: "linear-gradient(135deg, #1B3A6B, #2E6DA4)" }}>
                <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl mx-auto mb-3">👨‍🎓</div>
                <h3 className="text-xl font-black">{result.student.name}</h3>
                <p className="opacity-80 text-sm mt-1">{result.cls.level} / شعبة {result.cls.section}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-gray-100">
                <div className="bg-white p-3 text-center">
                  <div className="text-xs text-gray-400 font-bold">الفصل الدراسي</div>
                  <div className="font-black text-gray-800 text-sm mt-1">الفصل {result.cls.semester || "—"}</div>
                </div>
                <div className="bg-white p-3 text-center">
                  <div className="text-xs text-gray-400 font-bold">المعلم</div>
                  <div className="font-black text-gray-800 text-sm mt-1">{result.cls.teacher || "—"}</div>
                </div>
              </div>

              {/* ===== جوال ولي الأمر ===== */}
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-500 mb-2">📱 جوال ولي الأمر (لاستقبال إشعارات واتساب)</div>
                {result.student.parentPhone && !editingPhone ? (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 bg-green-50 border border-green-200 text-green-800 text-sm font-bold px-3 py-2 rounded-xl text-center tracking-wide">
                      {result.student.parentPhone}
                    </span>
                    <button onClick={() => { setPhoneInput(result.student.parentPhone); setEditingPhone(true); }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-xl font-bold transition-all">
                      تعديل
                    </button>
                  </div>
                ) : editingPhone ? (
                  <div className="flex gap-2">
                    <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-green-300 focus:border-green-500 focus:outline-none text-sm text-center font-bold tracking-wide"
                      style={{fontFamily:"inherit"}}
                      onKeyDown={e => e.key === "Enter" && phoneInput.trim() && saveParentPhone(phoneInput.trim())}
                    />
                    <button onClick={() => phoneInput.trim() && saveParentPhone(phoneInput.trim())}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
                      حفظ
                    </button>
                    <button onClick={() => setEditingPhone(false)}
                      className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-2 rounded-xl">
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
                        placeholder="05XXXXXXXX — أدخل جوالك لاستقبال الإشعارات"
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-dashed border-green-300 focus:border-green-500 focus:outline-none text-sm text-center font-bold"
                        style={{fontFamily:"inherit"}}
                        onKeyDown={e => e.key === "Enter" && phoneInput.trim() && saveParentPhone(phoneInput.trim())}
                      />
                      <button onClick={() => phoneInput.trim() && saveParentPhone(phoneInput.trim())}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
                        💾 حفظ
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      📲 سيتمكن المعلم من إرسال إشعار واتساب مباشرة عند وجود ملاحظة
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* تبويبات ولي الأمر */}
            {(() => {
              const studentNotes = messages.filter(m => m.type === "teacher_note" && m.studentId === result.student.nationalId);
              const unreadNotes = studentNotes.filter(m => !m.read).length;
              const tabs = [
                { id: "notes",    label: "ملاحظات المعلم", icon: "🔔", badge: unreadNotes },
                { id: "grades",   label: "التقييمات",       icon: "📊" },
                { id: "messages", label: "رسالة",           icon: "✉️" },
                { id: "surveys",  label: "استبيانات",       icon: "📋" },
              ];
              return (
                <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm">
                  {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all relative ${tab === t.id ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
                      {t.icon} <span className="hidden sm:inline">{t.label}</span>
                      {t.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center leading-none animate-pulse">{t.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* ===== تبويب ملاحظات المعلم ===== */}
            {tab === "notes" && (() => {
              const studentNotes = messages.filter(m => m.type === "teacher_note" && m.studentId === result.student.nationalId);

              const markRead = (id) => {
                const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
                setMessages(updated); saveMessages(updated);
              };
              const submitReply = (id) => {
                const txt = (replyTexts[id] || "").trim();
                if (!txt) return;
                const updated = messages.map(m => m.id === id ? { ...m, reply: txt, repliedAt: new Date().toLocaleDateString("ar-SA"), read: true } : m);
                setMessages(updated); saveMessages(updated);
                setReplyTexts(p => ({ ...p, [id]: "" }));
                setReplying(p => ({ ...p, [id]: false }));
              };

              if (studentNotes.length === 0) return (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="text-4xl mb-3">🔔</div>
                  <div className="font-black text-gray-700 mb-1">لا توجد ملاحظات من المعلم</div>
                  <div className="text-sm text-gray-400">ستظهر هنا أي ملاحظات يرسلها المعلم لك</div>
                </div>
              );

              return (
                <div className="space-y-3">
                  <div className={cx.cardXl}>
                    <div className="px-4 py-3 font-black text-white text-sm flex items-center gap-2" style={{ background: "linear-gradient(135deg,#b45309,#f59e0b)" }}>
                      <span className="text-lg">📨</span>
                      <span>ملاحظات المعلم ({studentNotes.length})</span>
                      {studentNotes.filter(m => !m.read).length > 0 && (
                        <span className="mr-auto bg-white text-amber-700 text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                          {studentNotes.filter(m => !m.read).length} جديد
                        </span>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {studentNotes.map(note => {
                        if (!note.read) markRead(note.id);
                        return (
                          <div key={note.id} className={`p-4 ${!note.read ? "bg-amber-50" : ""}`}>
                            {/* رأس الملاحظة */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">👨‍🏫</div>
                                <div>
                                  <div className="font-black text-gray-800 text-sm">المعلم</div>
                                  <div className="text-xs text-gray-400">{note.date} · {note.time}</div>
                                </div>
                              </div>
                              {!note.read && <span className="shrink-0 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">جديد</span>}
                            </div>
                            {/* نص الملاحظة */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-gray-800 leading-relaxed mb-3">
                              {note.text}
                            </div>
                            {/* الرد */}
                            {note.reply ? (
                              <div className="flex gap-2 items-start">
                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-base shrink-0">👨‍👦</div>
                                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                                  <div className="text-xs font-black text-blue-700 mb-1">ردّك — {note.repliedAt}</div>
                                  <div className="text-sm text-gray-800">{note.reply}</div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {replying[note.id] ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={replyTexts[note.id] || ""}
                                      onChange={e => setReplyTexts(p => ({ ...p, [note.id]: e.target.value }))}
                                      rows={2}
                                      placeholder="اكتب ردّك هنا..."
                                      className="w-full px-3 py-2 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none text-sm resize-none"
                                      style={{ fontFamily: "inherit" }}
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={() => submitReply(note.id)}
                                        className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-all">
                                        📤 إرسال الرد
                                      </button>
                                      <button onClick={() => setReplying(p => ({ ...p, [note.id]: false }))}
                                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200">
                                        إلغاء
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => setReplying(p => ({ ...p, [note.id]: true }))}
                                    className="w-full py-2 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 text-xs font-black hover:bg-blue-50 transition-all">
                                    💬 ردّ على الملاحظة
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* التقييمات الأسبوعية */}
            {tab === "grades" && (() => {
              const evals = result.student.evals || [];
              const LMAP = GRADE_MAP;
              const CATS = [{ key:"behavior", label:"السلوك", icon:"🌿" }, { key:"homework", label:"الواجبات", icon:"📝" }, { key:"participation", label:"المشاركة", icon:"🙋" }, { key:"discipline", label:"الانضباط", icon:"⚖️" }];

              if (evals.length === 0) return (
                <div className="bg-white rounded-2xl shadow-xl p-5 text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm text-gray-400 font-bold">لا توجد تقييمات أسبوعية بعد</div>
                </div>
              );

              const lastEval = evals[evals.length - 1];
              const lastLv = LMAP[lastEval?.level];

              return (
                <>
                  {lastLv && (
                    <div className={cx.cardXl}>
                      <div className="px-4 py-3 font-black text-white text-sm" style={{ background: "#1B3A6B" }}>⭐ آخر تقييم أسبوعي</div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs text-gray-400">{lastEval.day} {lastEval.dateH}</div>
                          <span className="px-4 py-2 rounded-full font-black text-sm" style={{ background: lastLv.bg, color: lastLv.c }}>{lastLv.label}</span>
                        </div>
                        {/* ملخص المواد — آخر مستوى لكل مادة */}
                        {evals.some(e=>e.subject) && (
                          <div className="mb-3">
                            <div className="text-xs font-black text-gray-500 mb-2">📊 آخر مستوى لكل مادة</div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {SUBJECTS.map(subj => {
                                const last = [...evals].reverse().find(e=>e.subject===subj.key);
                                if (!last) return null;
                                const lv = LMAP[last.level];
                                return (
                                  <div key={subj.key} className="rounded-xl overflow-hidden border" style={{borderColor:subj.color+"44"}}>
                                    <div className="flex items-center gap-1 px-2 py-1" style={{background:subj.bg}}>
                                      <span className="text-xs">{subj.icon}</span>
                                      <span className="text-xs font-black truncate" style={{color:subj.color}}>{subj.label}</span>
                                    </div>
                                    <div className="text-center font-black text-xs py-1.5" style={{background:lv?.bg||"#f5f5f5",color:lv?.c||"#333"}}>
                                      {lv?.label||"—"}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {CATS.map(cat => {
                          const d = lastEval.categories?.[cat.key];
                          if (!d?.text && !d?.face) return null;
                          return (
                            <div key={cat.key} className="flex items-start gap-2 rounded-xl px-3 py-2 mb-2"
                              style={{ background: d.color || "#f9fafb", border: "1px solid #e5e7eb" }}>
                              <span className="text-lg flex-shrink-0">{cat.icon}</span>
                              <div className="flex-1">
                                <div className="text-xs font-black text-gray-600">{cat.label}</div>
                                <div className="text-sm text-gray-700 mt-0.5">{d.text}</div>
                              </div>
                              {d.face && <span className="text-xl">{d.face}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {evals.length > 1 && (
                    <div className={cx.cardXl}>
                      <div className="px-4 py-3 font-black text-white text-sm" style={{ background: "#1B3A6B" }}>📅 سجل التقييمات ({evals.length})</div>
                      <div className="divide-y divide-gray-100">
                        {[...evals].reverse().map(ev => {
                          const lv = LMAP[ev.level];
                          return (
                            <div key={ev.id} className="flex items-center justify-between px-4 py-3">
                              <div>
                                <div className="text-xs font-black text-gray-600">{ev.day} {ev.dateH}</div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {CATS.filter(c => ev.categories?.[c.key]?.text).map(c => c.icon + " " + c.label).join(" · ")}
                                </div>
                              </div>
                              {lv ? <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: lv.bg, color: lv.c }}>{lv.label}</span>
                                : <span className="text-xs text-gray-300">—</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* تبويب الرسائل */}
            {tab === "messages" && (
              <div className={cx.cardXl}>
                <MessagesPage
                  messages={messages}
                  setMessages={setMessages}
                  saveMessages={saveMessages}
                  isParent={true}
                  parentName={result.student.name}
                />
              </div>
            )}

            {/* تبويب الاستبيانات */}
            {tab === "surveys" && (
              <div className={cx.cardXl}>
                <SurveysPage
                  surveys={surveys}
                  setSurveys={setSurveys}
                  saveSurveys={saveSurveys}
                  isParent={true}
                />
              </div>
            )}
          </div>
        )}

        {/* زر العودة */}
        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-white opacity-70 hover:opacity-100 text-sm font-bold underline">← العودة إلى صفحة الدخول</button>
        </div>
      </div>
    </div>
  );
}

// ===== بوابة المعلم =====

// ===== صفحة الاستراتيجيات التدريسية =====
function StrategiesPage() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", category:"", description:"", pdfBase64:"", pdfName:"", bookBase64:"", bookName:"" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const fileRef = useRef(null);
  const bookRef = useRef(null);

  const CATEGORIES = ["الكل","التعلم النشط","التعلم التعاوني","التفكير الناقد","الذكاء الاصطناعي","التقنية","التقييم","التحفيز","أخرى"];

  useEffect(() => {
    DB.get("school-strategies", []).then(d => { setStrategies(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const saveToDB = async (list) => { await DB.set("school-strategies", list); };

  const toB64 = (file) => new Promise((res, rej) => {
    readFileAsync(file, "dataurl").then(res).catch(rej);
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.includes("pdf")) { alert("يُقبل ملفات PDF فقط"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("الحجم الأقصى 5 ميغابايت"); return; }
    const b64 = await toB64(file);
    if (type === "pdf") setForm(f => ({ ...f, pdfBase64: b64, pdfName: file.name }));
    else setForm(f => ({ ...f, bookBase64: b64, bookName: file.name }));
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert("أدخل عنوان الاستراتيجية"); return; }
    setSaving(true);
    const newItem = { id: Date.now(), ...form, createdAt: new Date().toLocaleDateString("ar-SA") };
    const updated = [newItem, ...strategies];
    setStrategies(updated);
    await saveToDB(updated);
    setForm({ title:"", category:"", description:"", pdfBase64:"", pdfName:"", bookBase64:"", bookName:"" });
    setShowAdd(false); setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف هذه الاستراتيجية؟")) return;
    const updated = strategies.filter(s => s.id !== id);
    setStrategies(updated); await saveToDB(updated);
  };

  const filtered = strategies.filter(s =>
    (activeCategory === "الكل" || s.category === activeCategory) &&
    (s.title.includes(search) || s.description.includes(search))
  );

  const CAT_COLORS = {
    "التعلم النشط":"bg-teal-100 text-teal-800","التعلم التعاوني":"bg-blue-100 text-blue-800",
    "التفكير الناقد":"bg-purple-100 text-purple-800","الذكاء الاصطناعي":"bg-pink-100 text-pink-800",
    "التقنية":"bg-indigo-100 text-indigo-800","التقييم":"bg-amber-100 text-amber-800",
    "التحفيز":"bg-green-100 text-green-800","أخرى":"bg-gray-100 text-gray-700"
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-spin">📚</div></div>;

  return (
    <div className="space-y-5">
      <div className="page-header-bar" style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
        <div className={cx.row}>
          <div>
            <h2 className="text-2xl font-black">📚 استراتيجيات التدريس</h2>
            <p className="opacity-80 text-sm mt-1">مكتبة الاستراتيجيات والنماذج والكتب المرجعية</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-white text-purple-700 font-black rounded-2xl hover:shadow-lg transition-all">
            + إضافة استراتيجية
          </button>
        </div>
      </div>

      {/* بحث وفلتر */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 space-y-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحث في الاستراتيجيات…"
          className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm" />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === c ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-purple-50"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* نموذج الإضافة */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-purple-200 space-y-4">
          <h3 className="font-black text-purple-800 text-lg">إضافة استراتيجية جديدة</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={cx.label}>عنوان الاستراتيجية *</label>
              <input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))}
                placeholder="مثال: التعلم بالمشروع"
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className={cx.label}>التصنيف</label>
              <select value={form.category} onChange={e => setForm(f => ({...f,category:e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm bg-white">
                <option value="">اختر التصنيف</option>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={cx.label}>الوصف والخطوات</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))}
              placeholder="اشرح خطوات الاستراتيجية وطريقة تطبيقها…"
              rows={4} className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm resize-none" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center hover:border-purple-400 transition-all">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-xs text-gray-500 font-bold mb-2">نموذج / ورقة عمل PDF</p>
              {form.pdfName ? (
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-xs text-green-600 font-bold">✅ {form.pdfName}</span>
                  <button onClick={() => setForm(f => ({...f,pdfBase64:"",pdfName:""}))} className="text-red-400 text-xs">✕</button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">
                  رفع PDF
                </button>
              )}
              <input ref={fileRef} type="file" accept=".pdf" onChange={e => handleFileUpload(e,"pdf")} className="hidden" />
            </div>
            <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center hover:border-blue-400 transition-all">
              <div className="text-3xl mb-2">📘</div>
              <p className="text-xs text-gray-500 font-bold mb-2">كتاب / مرجع PDF</p>
              {form.bookName ? (
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-xs text-green-600 font-bold">✅ {form.bookName}</span>
                  <button onClick={() => setForm(f => ({...f,bookBase64:"",bookName:""}))} className="text-red-400 text-xs">✕</button>
                </div>
              ) : (
                <button onClick={() => bookRef.current?.click()} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                  رفع كتاب PDF
                </button>
              )}
              <input ref={bookRef} type="file" accept=".pdf" onChange={e => handleFileUpload(e,"book")} className="hidden" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 disabled:opacity-50">
              {saving ? "جاري الحفظ…" : "💾 حفظ الاستراتيجية"}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* قائمة الاستراتيجيات */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-3">📚</div>
          <p className="font-black text-gray-600">لا توجد استراتيجيات بعد</p>
          <p className="text-sm text-gray-400 mt-1">ابدأ بإضافة أول استراتيجية تدريسية</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h4 className="font-black text-gray-800">{s.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{s.createdAt}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.category && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${CAT_COLORS[s.category] || "bg-gray-100 text-gray-700"}`}>{s.category}</span>}
                  <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 text-sm">🗑</button>
                </div>
              </div>
              {s.description && <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">{s.description}</p>}
              <div className="flex flex-wrap gap-2">
                {s.pdfBase64 && (
                  <a href={s.pdfBase64} download={s.pdfName || "نموذج.pdf"}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 font-bold text-xs rounded-lg hover:bg-purple-100 transition-all">
                    <span>📄</span> {s.pdfName || "نموذج PDF"}
                  </a>
                )}
                {s.bookBase64 && (
                  <a href={s.bookBase64} download={s.bookName || "كتاب.pdf"}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition-all">
                    <span>📘</span> {s.bookName || "كتاب PDF"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== صفحة التقويم المدرسي =====
function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", dateH:"", dateM:"", type:"إجازة", notes:"" });
  const [saving, setSaving] = useState(false);

  const EVENT_TYPES = ["إجازة","اختبار","نشاط","اجتماع","تدريب","فعالية","أخرى"];
  const TYPE_COLORS = {
    "إجازة":"bg-green-100 text-green-800","اختبار":"bg-red-100 text-red-800","نشاط":"bg-blue-100 text-blue-800",
    "اجتماع":"bg-amber-100 text-amber-800","تدريب":"bg-purple-100 text-purple-800","فعالية":"bg-teal-100 text-teal-800","أخرى":"bg-gray-100 text-gray-700"
  };

  useEffect(() => {
    DB.get("school-calendar", []).then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.dateH.trim()) { alert("أدخل العنوان والتاريخ"); return; }
    setSaving(true);
    const updated = [...events, { id: Date.now(), ...form }].sort((a,b) => a.dateH.localeCompare(b.dateH));
    setEvents(updated); await DB.set("school-calendar", updated);
    setForm({ title:"", dateH:"", dateM:"", type:"إجازة", notes:"" });
    setShowAdd(false); setSaving(false);
  };

  const handleDelete = async (id) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated); await DB.set("school-calendar", updated);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">📅</div></div>;

  return (
    <div className="space-y-5">
      <div className="page-header-bar" style={{background:"linear-gradient(135deg,#0891b2,#0d9488)"}}>
        <div className={cx.row}>
          <div>
            <h2 className="text-2xl font-black">📅 التقويم المدرسي</h2>
            <p className="opacity-80 text-sm mt-1">إجازات · اختبارات · فعاليات · اجتماعات</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="px-5 py-2.5 bg-white text-teal-700 font-black rounded-2xl hover:shadow-lg">
            {showAdd ? "إلغاء" : "+ إضافة حدث"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-teal-200 space-y-3">
          <h3 className="font-black text-teal-800">إضافة حدث</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={cx.label}>عنوان الحدث *</label>
              <input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))}
                placeholder="مثال: اجتماع أولياء الأمور"
                className={cx.inputT} />
            </div>
            <div>
              <label className={cx.label}>نوع الحدث</label>
              <select value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm bg-white">
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={cx.label}>التاريخ الهجري *</label>
              <input value={form.dateH} onChange={e => setForm(f => ({...f,dateH:e.target.value}))}
                placeholder="مثال: 01/09/1447 هـ"
                className={cx.inputT} />
            </div>
            <div>
              <label className={cx.label}>التاريخ الميلادي</label>
              <input value={form.dateM} onChange={e => setForm(f => ({...f,dateM:e.target.value}))}
                placeholder="مثال: 01/03/2026 م"
                className={cx.inputT} />
            </div>
          </div>
          <div>
            <label className={cx.label}>ملاحظات</label>
            <input value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))}
              placeholder="تفاصيل إضافية…"
              className={cx.inputT} />
          </div>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 disabled:opacity-50">
            {saving ? "حفظ…" : "💾 حفظ"}
          </button>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-3">📅</div>
          <p className="font-black text-gray-600">التقويم فارغ</p>
        </div>
      ) : (
        <div className={cx.cardSm}>
          {events.map((ev, i) => (
            <div key={ev.id} className={`flex items-center gap-4 px-5 py-4 ${i < events.length-1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-all`}>
              <div className="text-2xl flex-shrink-0">{ev.type === "إجازة" ? "🌴" : ev.type === "اختبار" ? "📝" : ev.type === "نشاط" ? "⚡" : ev.type === "اجتماع" ? "🤝" : ev.type === "تدريب" ? "🎓" : "📌"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-gray-800">{ev.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TYPE_COLORS[ev.type] || "bg-gray-100 text-gray-700"}`}>{ev.type}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{ev.dateH} {ev.dateM ? `— ${ev.dateM}` : ""} {ev.notes ? `· ${ev.notes}` : ""}</div>
              </div>
              <button onClick={() => handleDelete(ev.id)} className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== صفحة معرض الأنشطة =====
function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", imageBase64:"" });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    DB.get("school-gallery", []).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const handleImage = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { alert("صور فقط"); return; }
    if (file.size > 3 * 1024 * 1024) { alert("الحجم الأقصى 3 ميغابايت"); return; }
    const b64 = await readFileAsync(file, "dataurl");
    setForm(f => ({ ...f, imageBase64: b64 }));
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageBase64) { alert("أدخل العنوان والصورة"); return; }
    setSaving(true);
    const updated = [{ id: Date.now(), ...form, createdAt: new Date().toLocaleDateString("ar-SA") }, ...items];
    setItems(updated); await DB.set("school-gallery", updated);
    setForm({ title:"", description:"", imageBase64:"" });
    setShowAdd(false); setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف هذه الصورة؟")) return;
    const updated = items.filter(i => i.id !== id);
    setItems(updated); await DB.set("school-gallery", updated);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">🖼</div></div>;

  return (
    <div className="space-y-5">
      {preview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={preview.imageBase64} alt={preview.title} className="w-full max-h-96 object-contain bg-gray-100" />
            <div className="p-4">
              <h3 className="font-black text-gray-800">{preview.title}</h3>
              {preview.description && <p className="text-sm text-gray-500 mt-1">{preview.description}</p>}
              <p className="text-xs text-gray-400 mt-2">{preview.createdAt}</p>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-bar" style={{background:"linear-gradient(135deg,#db2777,#7c3aed)"}}>
        <div className={cx.row}>
          <div>
            <h2 className="text-2xl font-black">🖼 معرض الأنشطة</h2>
            <p className="opacity-80 text-sm mt-1">أبرز الفعاليات والأنشطة المدرسية</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="px-5 py-2.5 bg-white text-pink-700 font-black rounded-2xl hover:shadow-lg">
            {showAdd ? "إلغاء" : "+ إضافة صورة"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-pink-200 space-y-3">
          <h3 className="font-black text-pink-800">إضافة صورة للمعرض</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={cx.label}>العنوان *</label>
              <input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))}
                placeholder="مثال: بطولة كرة القدم الداخلية"
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className={cx.label}>الوصف</label>
              <input value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))}
                placeholder="وصف مختصر…"
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none text-sm" />
            </div>
          </div>
          <div className="border-2 border-dashed border-pink-200 rounded-xl p-6 text-center hover:border-pink-400 transition-all">
            {form.imageBase64 ? (
              <div className="relative inline-block">
                <img src={form.imageBase64} alt="preview" className="max-h-40 rounded-lg mx-auto" />
                <button onClick={() => setForm(f => ({...f,imageBase64:""}))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">✕</button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">🖼</div>
                <button onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-pink-600 text-white text-sm font-bold rounded-xl hover:bg-pink-700">
                  اختر صورة
                </button>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP — الحجم الأقصى 3 ميغابايت</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </div>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-pink-600 text-white font-black rounded-xl hover:bg-pink-700 disabled:opacity-50">
            {saving ? "حفظ…" : "💾 إضافة للمعرض"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-3">🖼</div>
          <p className="font-black text-gray-600">المعرض فارغ</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-all cursor-pointer" onClick={() => setPreview(item)}>
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img src={item.imageBase64} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                  className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  ✕
                </button>
              </div>
              <div className="p-3">
                <p className="font-black text-gray-800 text-sm line-clamp-1">{item.title}</p>
                {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>}
                <p className="text-xs text-gray-300 mt-1">{item.createdAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== صفحة الشهادات الرقمية =====
function CertificatesPage({ teachers, attendance, week, classList }) {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", type:"تقدير", reason:"", date:new Date().toLocaleDateString("ar-SA") });
  const [saving, setSaving] = useState(false);

  const CERT_TYPES = ["تقدير","إنجاز","تميّز","مشاركة","قيادة","إبداع"];
  const TYPE_COLORS = {
    "تقدير":"#0d9488","إنجاز":"#7c3aed","تميّز":"#d97706","مشاركة":"#0284c7","قيادة":"#dc2626","إبداع":"#db2777"
  };

  useEffect(() => {
    DB.get("school-certificates", []).then(d => { setCerts(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.reason.trim()) { alert("أدخل الاسم والسبب"); return; }
    setSaving(true);
    const newCert = { id: Date.now(), ...form };
    const updated = [newCert, ...certs];
    setCerts(updated); await DB.set("school-certificates", updated);
    setForm({ name:"", type:"تقدير", reason:"", date: new Date().toLocaleDateString("ar-SA") });
    setShowAdd(false); setSaving(false);
  };

  const printCert = (cert) => {
    const color = TYPE_COLORS[cert.type] || "#0d9488";
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
    <title>شهادة ${cert.type}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Amiri',serif;background:#fffbf0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
      .cert{width:700px;background:white;border:8px double ${color};border-radius:16px;padding:40px;text-align:center;position:relative;box-shadow:0 4px 40px rgba(0,0,0,.1)}
      .corner{position:absolute;width:60px;height:60px;border:3px solid ${color};opacity:.3}
      .tl{top:10px;left:10px;border-right:none;border-bottom:none;border-radius:8px 0 0 0}
      .tr{top:10px;right:10px;border-left:none;border-bottom:none;border-radius:0 8px 0 0}
      .bl{bottom:10px;left:10px;border-right:none;border-top:none;border-radius:0 0 0 8px}
      .br{bottom:10px;right:10px;border-left:none;border-top:none;border-radius:0 0 8px 0}
      .star{font-size:36px;margin-bottom:10px}
      .school{font-size:14px;color:#555;margin-bottom:8px;font-weight:bold}
      .type-title{font-size:30px;font-weight:900;color:${color};margin:10px 0;letter-spacing:2px}
      .divider{width:200px;height:3px;background:linear-gradient(to right,transparent,${color},transparent);margin:16px auto}
      .present{font-size:16px;color:#777;margin-bottom:10px}
      .name{font-size:28px;font-weight:900;color:#1a1a1a;margin:10px 0;border-bottom:2px solid ${color};display:inline-block;padding-bottom:6px}
      .reason{font-size:15px;color:#444;margin:16px auto;max-width:500px;line-height:1.8}
      .date{font-size:13px;color:#999;margin-top:24px}
      .seal{font-size:50px;margin-top:20px}
      @media print{body{background:white}@page{size:A4 landscape;margin:1cm}}
    </style></head><body>
    <div class="cert">
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>
      <div class="star">⭐</div>
      <div class="school">مدرسة عبيدة بن الحارث المتوسطة — الإدارة العامة للتعليم بجدة</div>
      <div class="type-title">شهادة ${cert.type}</div>
      <div class="divider"></div>
      <div class="present">يُشرِّف إدارة المدرسة أن تُقدِّم هذه الشهادة إلى</div>
      <div class="name">${cert.name}</div>
      <div class="reason">${cert.reason}</div>
      <div class="date">بتاريخ: ${cert.date}</div>
      <div class="seal">🏅</div>
    </div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
  };

  const handleDelete = async (id) => {
    const updated = certs.filter(c => c.id !== id);
    setCerts(updated); await DB.set("school-certificates", updated);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">🏅</div></div>;

  return (
    <div className="space-y-5">
      <div className="page-header-bar" style={{background:"linear-gradient(135deg,#d97706,#b45309)"}}>
        <div className={cx.row}>
          <div>
            <h2 className="text-2xl font-black">🏅 الشهادات الرقمية</h2>
            <p className="opacity-80 text-sm mt-1">إصدار وطباعة شهادات احترافية للمعلمين والطلاب</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="px-5 py-2.5 bg-white text-amber-700 font-black rounded-2xl hover:shadow-lg">
            {showAdd ? "إلغاء" : "🏅 إصدار شهادة"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-amber-200 space-y-3">
          <h3 className="font-black text-amber-800">إصدار شهادة جديدة</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={cx.label}>اسم المستحق *</label>
              <input value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))}
                placeholder="اسم المعلم أو الطالب"
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className={cx.label}>نوع الشهادة</label>
              <select value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm bg-white">
                {CERT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={cx.label}>سبب الشهادة *</label>
              <input value={form.reason} onChange={e => setForm(f => ({...f,reason:e.target.value}))}
                placeholder="مثال: تميّزه في التعليم عن بُعد وتطوير مهارات طلابه الرقمية"
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className={cx.label}>التاريخ</label>
              <input value={form.date} onChange={e => setForm(f => ({...f,date:e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-amber-600 text-white font-black rounded-xl hover:bg-amber-700 disabled:opacity-50">
            {saving ? "حفظ…" : "💾 إصدار وحفظ"}
          </button>
        </div>
      )}

      {certs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-3">🏅</div>
          <p className="font-black text-gray-600">لا توجد شهادات</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {certs.map(cert => (
            <div key={cert.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:`${TYPE_COLORS[cert.type] || "#0d9488"}22`}}>🏅</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-gray-800">{cert.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{background: TYPE_COLORS[cert.type] || "#0d9488"}}>{cert.type}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cert.reason}</p>
                <p className="text-xs text-gray-300 mt-0.5">{cert.date}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => printCert(cert)} className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-200">🖨 طباعة</button>
                <button onClick={() => handleDelete(cert.id)} className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== صفحة تميّز المعلم =====
function PollPage({ teachers }) {
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [myVote, setMyVote] = useState(null);
  const [week, setWeek] = useState(() => {
    const now = new Date(); const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return startOfWeek.toISOString().split("T")[0];
  });
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    const key = `school-poll-${week}`;
    DB.get(key, {}).then(d => {
      setVotes(d && typeof d === "object" ? d : {});
      setLoading(false);
    });
    DB.get("school-poll-winners", []).then(d => setWinners(Array.isArray(d) ? d : []));
    const saved = localStorage.getItem(`poll-vote-${week}`);
    if (saved) setMyVote(saved);
  }, [week]);

  const handleVote = async (name) => {
    if (myVote) return;
    const key = `school-poll-${week}`;
    const updated = { ...votes, [name]: (votes[name] || 0) + 1 };
    setVotes(updated); setMyVote(name);
    localStorage.setItem(`poll-vote-${week}`, name);
    await DB.set(key, updated);
  };

  const totalVotes = Object.values(votes).reduce((s, v) => s + v, 0);
  const sorted = [...(teachers || [])].sort((a,b) => (votes[b]||0) - (votes[a]||0));
  const topTeacher = sorted[0] && votes[sorted[0]] > 0 ? sorted[0] : null;

  const announceWinner = async () => {
    if (!topTeacher) return;
    const w = { name: topTeacher, votes: votes[topTeacher], week };
    const updated = [w, ...winners.slice(0, 9)];
    setWinners(updated); await DB.set("school-poll-winners", updated);
    alert(`✅ تم إعلان ${topTeacher} معلماً متميزاً للأسبوع!`);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">🏆</div></div>;

  return (
    <div className="space-y-5">
      <div className="page-header-bar" style={{background:"linear-gradient(135deg,#0d9488,#065f46)"}}>
        <div className={cx.row}>
          <div>
            <h2 className="text-2xl font-black">🏆 تميّز المعلم</h2>
            <p className="opacity-80 text-sm mt-1">تصويت أسبوعي لاختيار المعلم المتميز</p>
          </div>
          {topTeacher && (
            <button onClick={announceWinner} className="px-5 py-2.5 bg-white text-teal-700 font-black rounded-2xl hover:shadow-lg text-sm">
              🎖 إعلان المتميز
            </button>
          )}
        </div>
      </div>

      {myVote && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-center">
          <span className="font-black text-teal-700">✅ صوّتت لـ {myVote} — شكراً على مشاركتك</span>
        </div>
      )}

      <div className={cx.card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-800">نتائج التصويت</h3>
          <span className="text-sm text-gray-400">{totalVotes} صوت</span>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sorted.slice(0, 15).map((name, i) => {
            const v = votes[name] || 0;
            const pct = totalVotes > 0 ? Math.round(v / totalVotes * 100) : 0;
            return (
              <div key={name} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: i === 0 ? "#fbbf24" : i === 1 ? "#9ca3af" : i === 2 ? "#cd7f32" : "#f3f4f6", color: i < 3 ? "white" : "#6b7280" }}>
                  {i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-800 truncate">{name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{v} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: i === 0 ? "#fbbf24" : "#0d9488" }} />
                  </div>
                </div>
                {!myVote && (
                  <button onClick={() => handleVote(name)} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 flex-shrink-0">
                    صوّت
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {winners.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="font-black text-amber-700 mb-4">🏆 المعلمون المتميزون</h3>
          <div className="space-y-2">
            {winners.map((w, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}</span>
                <span className="font-bold text-gray-800 flex-1">{w.name}</span>
                <span className="text-xs text-gray-400">{w.votes} صوت</span>
                <span className="text-xs text-gray-300">{w.week}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== بوابة الطلاب — تسجيل السحب (عامة بدون دخول) =====
function StudentRafflePortal({ siteFont, onBack }) {
  const CARRIERS = ["STC","موبايلي","زين"];
  const [form, setForm] = useState({ name:"", class:"", carrier:"STC" });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    DB.get("school-raffle-entries", []).then(d => {
      const list = Array.isArray(d) ? d : [];
      setEntries(list);
      setTotalCount(list.length);
      setLoading(false);
    });
  }, []);

  const handleRegister = async () => {
    if (!form.name.trim()) { alert("أدخل اسمك الكامل"); return; }
    if (!form.class.trim()) { alert("أدخل فصلك الدراسي"); return; }
    const dup = entries.find(e => e.name.trim() === form.name.trim() && e.class.trim() === form.class.trim());
    if (dup) { alert("تم تسجيلك مسبقاً في هذا السحب!"); return; }
    setSaving(true);
    const newEntry = { id: Date.now(), ...form, registeredAt: new Date().toLocaleString("ar-SA") };
    const updated = [...entries, newEntry];
    setEntries(updated);
    setTotalCount(updated.length);
    await DB.set("school-raffle-entries", updated);
    setSaving(false);
    setDone(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{fontFamily:siteFont, background:"linear-gradient(135deg,#7c3aed,#db2777,#f59e0b)"}}>
      <div className="text-white text-center"><div className="text-6xl animate-bounce mb-4">🎰</div><p className="font-black">جاري التحميل…</p></div>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ fontFamily: siteFont, background: "linear-gradient(135deg,#7c3aed 0%,#db2777 50%,#f59e0b 100%)" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float-ico { animation: float 2.5s ease-in-out infinite; }
        @keyframes prize-in { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .prize-in { animation: prize-in .5s cubic-bezier(.34,1.56,.64,1) forwards; }
      `}</style>

      <div className="w-full max-w-md">
        <div className="text-center text-white mb-6">
          <div className="text-7xl float-ico mb-3">🎰</div>
          <h1 className="text-2xl font-black mb-1">سحب الجوائز</h1>
          <p className="opacity-80 text-sm">مدرسة عبيدة بن الحارث المتوسطة</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[{emoji:"🥇",val:"50 ريال"},{emoji:"🥈",val:"30 ريال"},{emoji:"🥉",val:"20 ريال"}].map((p,i) => (
            <div key={i} className="prize-in bg-white bg-opacity-20 rounded-2xl p-3 text-center text-white border border-white border-opacity-30" style={{animationDelay:`${i*0.15}s`}}>
              <div className="text-2xl">{p.emoji}</div>
              <div className="font-black text-sm mt-1">{p.val}</div>
              <div className="text-xs opacity-70">بطاقة شحن</div>
            </div>
          ))}
        </div>

        {done ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">تم تسجيلك!</h2>
            <p className="text-gray-500 mb-1">بالتوفيق يا <span className="font-black text-purple-700">{form.name}</span> 🍀</p>
            <p className="text-gray-400 text-sm mb-4">أنت المشترك رقم <span className="font-black text-pink-600 text-xl">{totalCount}</span></p>
            <div className="flex gap-2 justify-center mb-5 flex-wrap">
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${form.carrier==="STC"?"bg-purple-100 text-purple-700":form.carrier==="موبايلي"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-700"}`}>
                {form.carrier==="STC"?"🟣":form.carrier==="موبايلي"?"🟢":"🟡"} {form.carrier}
              </span>
              <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-700">📚 {form.class}</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">سيُعلَن عن الفائزين من قِبل الإدارة</p>
            <button onClick={() => { setDone(false); setForm({ name:"", class:"", carrier:"STC" }); }}
              className="w-full py-3 rounded-2xl font-black text-white mb-2" style={{background:"linear-gradient(135deg,#7c3aed,#db2777)"}}>
              🎟 تسجيل طالب آخر
            </button>
            <button onClick={onBack} className="w-full py-2.5 rounded-2xl text-gray-500 font-bold text-sm bg-gray-50 hover:bg-gray-100">
              ← العودة للرئيسية
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="text-center mb-1">
              <h2 className="text-xl font-black text-gray-800">🎟 اشترك في السحب</h2>
              <p className="text-xs text-gray-400 mt-1">{totalCount} مشترك حتى الآن</p>
            </div>
            <div>
              <label className={cx.labelX}>👤 اسمك الكامل</label>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                placeholder="أدخل اسمك الثلاثي"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm font-bold" />
            </div>
            <div>
              <label className={cx.labelX}>📚 الفصل الدراسي</label>
              <input value={form.class} onChange={e => setForm(f=>({...f,class:e.target.value}))}
                placeholder="مثال: أول أ — ثاني ب — ثالث ج"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm font-bold" />
            </div>
            <div>
              <label className={cx.labelX}>📱 نوع الشريحة</label>
              <div className="grid grid-cols-3 gap-2">
                {CARRIERS.map(c => (
                  <button key={c} onClick={() => setForm(f=>({...f,carrier:c}))}
                    className={`py-3.5 rounded-2xl font-black text-sm border-2 transition-all ${form.carrier===c
                      ? c==="STC"?"bg-purple-600 text-white border-purple-600 shadow-md"
                        : c==="موبايلي"?"bg-green-600 text-white border-green-600 shadow-md"
                        : "bg-yellow-500 text-white border-yellow-500 shadow-md"
                      : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {c==="STC"?"🟣 STC":c==="موبايلي"?"🟢 موبايلي":"🟡 زين"}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleRegister} disabled={saving}
              className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-60"
              style={{background:"linear-gradient(135deg,#7c3aed,#db2777)"}}>
              {saving ? "⏳ جاري التسجيل…" : "🎰 اشترك الآن"}
            </button>
            <button onClick={onBack} className="w-full py-2.5 rounded-2xl text-sm text-gray-400 font-bold">← العودة</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== صفحة سحب الطلاب 🎰 =====
function RafflePage() {
  const PRIZES = [
    { label: "بطاقة شحن 50 ريال",  value: 50, emoji: "🥇", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    { label: "بطاقة شحن 30 ريال",  value: 30, emoji: "🥈", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
    { label: "بطاقة شحن 20 ريال",  value: 20, emoji: "🥉", color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
  ];
  const CARRIERS = ["STC","موبايلي","زين"];

  const [tab, setTab] = useState("register"); // register | admin | draw | winners
  const [form, setForm] = useState({ name:"", class:"", carrier:"STC" });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [winners, setWinners] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [drawStep, setDrawStep] = useState(-1); // which prize is being drawn
  const [spinName, setSpinName] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [pinOk, setPinOk] = useState(false);
  const [pinErr, setPinErr] = useState(false);
  const ADMIN_PIN = import.meta.env.VITE_RAFFLE_PIN || "1234";

  useEffect(() => {
    Promise.all([
      DB.get("school-raffle-entries", []),
      DB.get("school-raffle-winners", []),
    ]).then(([e, w]) => {
      setEntries(Array.isArray(e) ? e : []);
      setWinners(Array.isArray(w) ? w : []);
      setLoading(false);
    });
  }, []);

  // تسجيل طالب
  const handleRegister = async () => {
    if (!form.name.trim()) { alert("أدخل اسمك"); return; }
    if (!form.class.trim()) { alert("أدخل فصلك"); return; }
    const dup = entries.find(e => e.name.trim() === form.name.trim() && e.class === form.class);
    if (dup) { alert("تم تسجيلك مسبقاً!"); return; }
    setSaving(true);
    const newEntry = { id: Date.now(), ...form, registeredAt: new Date().toLocaleString("ar-SA") };
    const updated = [...entries, newEntry];
    setEntries(updated);
    await DB.set("school-raffle-entries", updated);
    setRegistered(true); setSaving(false);
  };

  // السحب الآلي
  const runDraw = async () => {
    if (entries.length < PRIZES.length) { alert(`يجب أن يكون هناك على الأقل ${PRIZES.length} مشتركين`); return; }
    setDrawing(true);
    const pool = [...entries];
    const drawn = [];

    for (let i = 0; i < PRIZES.length; i++) {
      setDrawStep(i);
      // تأثير دوران الأسماء
      await new Promise(res => {
        let count = 0;
        const total = 30 + i * 10;
        const interval = setInterval(() => {
          const rand = pool[Math.floor(Math.random() * pool.length)];
          setSpinName(rand.name);
          count++;
          if (count >= total) {
            clearInterval(interval);
            // اختيار الفائز الحقيقي
            const winIdx = Math.floor(Math.random() * pool.length);
            const winner = pool.splice(winIdx, 1)[0];
            setSpinName(winner.name);
            drawn.push({ ...winner, prize: PRIZES[i] });
            setTimeout(res, 1200);
          }
        }, 80 - i * 10);
      });
      await new Promise(res => setTimeout(res, 800));
    }

    setWinners(drawn);
    await DB.set("school-raffle-winners", drawn);
    setDrawing(false);
    setDrawStep(-1);
    setTab("winners");
  };

  const resetAll = async () => {
    if (!confirm("⚠️ هل تريد إعادة ضبط السحب وحذف جميع المشتركين والفائزين؟")) return;
    setEntries([]); setWinners([]); setRegistered(false);
    await DB.set("school-raffle-entries", []);
    await DB.set("school-raffle-winners", []);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-5xl animate-bounce">🎰</div>
    </div>
  );

  return (
    <div className="space-y-5" dir="rtl">
      <style>{`
        @keyframes spin-name { 0%{transform:scale(.9);opacity:.6} 50%{transform:scale(1.05);opacity:1} 100%{transform:scale(.9);opacity:.6} }
        .spin-name { animation: spin-name .16s ease-in-out infinite; }
        @keyframes winner-pop { 0%{transform:scale(0) rotate(-10deg);opacity:0} 70%{transform:scale(1.1) rotate(2deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        .winner-pop { animation: winner-pop .6s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes confetti-fall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(60px) rotate(360deg);opacity:0} }
        .conf { animation: confetti-fall 1.5s ease-in forwards; position:absolute; pointer-events:none; }
      `}</style>

      {/* Header */}
      <div className="page-header-bar relative overflow-hidden" style={{background:"linear-gradient(135deg,#7c3aed,#db2777,#f59e0b)"}}>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">🎰 سحب الجوائز</h2>
            <p className="opacity-80 text-sm mt-1">بطاقات شحن 20 · 30 · 50 ريال</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-white bg-opacity-20 rounded-xl px-3 py-1.5 font-black">{entries.length} مشترك</span>
          </div>
        </div>
      </div>

      {/* تبويبات */}
      <div className="flex gap-2">
        {[
          { id:"register", label:"🎟 تسجيل" },
          { id:"admin",    label:"⚙️ الإدارة" },
          { id:"winners",  label:"🏆 الفائزون" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-2xl font-black text-sm transition-all ${tab === t.id ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-purple-50 border border-gray-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== تسجيل الطالب ===== */}
      {tab === "register" && (
        <div className="space-y-4">
          {/* الجوائز */}
          <div className="grid grid-cols-3 gap-3">
            {PRIZES.map(p => (
              <div key={p.value} className="rounded-2xl p-4 text-center border-2" style={{background:p.bg, borderColor:p.border}}>
                <div className="text-3xl">{p.emoji}</div>
                <div className="font-black mt-1 text-sm" style={{color:p.color}}>{p.value} ريال</div>
                <div className="text-xs text-gray-500 mt-0.5">بطاقة شحن</div>
              </div>
            ))}
          </div>

          {registered ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-8 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-xl font-black text-green-700">تم تسجيلك بنجاح!</h3>
              <p className="text-green-600 mt-2">اسمك في القرعة — بالتوفيق 🍀</p>
              <p className="text-sm text-gray-400 mt-3">{form.name} — {form.class} — {form.carrier}</p>
              <button onClick={() => { setRegistered(false); setForm({ name:"", class:"", carrier:"STC" }); }}
                className="mt-4 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-sm">
                تسجيل طالب آخر
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 space-y-4">
              <h3 className="font-black text-purple-800 text-lg text-center">🎟 سجّل الآن</h3>

              <div>
                <label className={cx.labelX}>اسمك الكامل</label>
                <input value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))}
                  placeholder="أدخل اسمك الثلاثي"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm font-bold" />
              </div>

              <div>
                <label className={cx.labelX}>الفصل الدراسي</label>
                <input value={form.class} onChange={e => setForm(f => ({...f,class:e.target.value}))}
                  placeholder="مثال: أول أ — ثاني ب"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm font-bold" />
              </div>

              <div>
                <label className={cx.labelX}>نوع الشريحة</label>
                <div className="grid grid-cols-3 gap-2">
                  {CARRIERS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({...f,carrier:c}))}
                      className={`py-3 rounded-2xl font-black text-sm border-2 transition-all ${form.carrier === c
                        ? c === "STC" ? "bg-purple-600 text-white border-purple-600"
                          : c === "موبايلي" ? "bg-green-600 text-white border-green-600"
                          : "bg-yellow-500 text-white border-yellow-500"
                        : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {c === "STC" ? "🟣 STC" : c === "موبايلي" ? "🟢 موبايلي" : "🟡 زين"}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleRegister} disabled={saving}
                className="w-full py-4 rounded-2xl font-black text-white text-base hover:shadow-lg transition-all disabled:opacity-50"
                style={{background:"linear-gradient(135deg,#7c3aed,#db2777)"}}>
                {saving ? "جاري التسجيل…" : "🎟 اشترك في السحب"}
              </button>
            </div>
          )}

          {entries.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-sm text-gray-500">عدد المشتركين: <span className="font-black text-purple-700 text-lg">{entries.length}</span></p>
            </div>
          )}
        </div>
      )}

      {/* ===== لوحة الإدارة ===== */}
      {tab === "admin" && (
        <div className="space-y-4">
          {!pinOk ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-sm mx-auto text-center">
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="font-black text-gray-800 mb-4">كود الإدارة</h3>
              <input type="password" value={adminPin} onChange={e => { setAdminPin(e.target.value); setPinErr(false); }}
                placeholder="أدخل الكود"
                className={`w-full px-4 py-3 rounded-2xl border-2 text-center text-xl font-black tracking-widest focus:outline-none ${pinErr ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-purple-400"}`} />
              {pinErr && <p className="text-red-500 text-xs font-bold mt-2">كود خاطئ</p>}
              <button onClick={() => { if (adminPin === ADMIN_PIN) { setPinOk(true); } else { setPinErr(true); } }}
                className="mt-4 w-full py-3 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700">
                دخول
              </button>

            </div>
          ) : (
            <div className="space-y-4">
              {/* زر السحب الكبير */}
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 rounded-3xl p-8 text-center text-white shadow-xl">
                <div className="text-5xl mb-3">🎰</div>
                <h3 className="text-2xl font-black mb-2">بدء السحب الآلي</h3>
                <p className="opacity-80 text-sm mb-6">{entries.length} مشترك · 3 فائزين</p>
                <button onClick={runDraw} disabled={drawing || entries.length < 3}
                  className="px-10 py-4 bg-white text-purple-700 font-black text-xl rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {drawing ? "جاري السحب…" : "🎲 ابدأ السحب"}
                </button>
                {entries.length < 3 && <p className="text-xs opacity-70 mt-3">يجب تسجيل 3 مشتركين على الأقل</p>}
              </div>

              {/* تأثير السحب */}
              {drawing && (
                <div className="bg-white rounded-3xl p-8 text-center shadow-xl border-2 border-purple-200">
                  <div className="text-4xl mb-2">{PRIZES[drawStep]?.emoji || "🎰"}</div>
                  <p className="text-sm text-gray-500 font-bold mb-3">{PRIZES[drawStep]?.label || "جاري السحب"}</p>
                  <div className="spin-name text-3xl font-black text-purple-700 min-h-12 flex items-center justify-center">
                    {spinName || "…"}
                  </div>
                  <div className="flex gap-2 justify-center mt-4">
                    {PRIZES.map((p,i) => (
                      <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === drawStep ? "scale-125" : "opacity-30"}`}
                        style={{background:p.color}} />
                    ))}
                  </div>
                </div>
              )}

              {/* قائمة المشتركين */}
              <div className={cx.cardSm}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-black text-gray-800">قائمة المشتركين ({entries.length})</span>
                  <button onClick={resetAll} className="text-xs text-red-500 font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100">
                    🗑 إعادة ضبط
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {entries.length === 0 ? (
                    <p className="p-6 text-center text-gray-400 text-sm">لا يوجد مشتركون بعد</p>
                  ) : entries.map((e, i) => (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-black flex items-center justify-center">{i+1}</span>
                      <div className="flex-1">
                        <span className="font-bold text-gray-800 text-sm">{e.name}</span>
                        <span className="text-xs text-gray-400 mr-2">— {e.class}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${e.carrier === "STC" ? "bg-purple-100 text-purple-700" : e.carrier === "موبايلي" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {e.carrier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== الفائزون ===== */}
      {tab === "winners" && (
        <div className="space-y-4">
          {winners.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
              <div className="text-5xl mb-3">🏆</div>
              <p className="font-black text-gray-600">لم يُجرَ السحب بعد</p>
              <p className="text-sm text-gray-400 mt-1">اذهب للإدارة وابدأ السحب</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-3xl p-6 text-center shadow-xl">
                <div className="text-4xl mb-2">🎊</div>
                <h3 className="text-2xl font-black text-amber-900">الفائزون بالسحب!</h3>
                <p className="text-amber-800 text-sm mt-1">مبروك للفائزين 🎉</p>
              </div>
              <div className="space-y-4">
                {winners.map((w, i) => (
                  <div key={i} className="winner-pop rounded-3xl p-6 border-2 shadow-lg text-center" style={{background:w.prize.bg, borderColor:w.prize.border, animationDelay:`${i*0.2}s`}}>
                    <div className="text-5xl mb-2">{w.prize.emoji}</div>
                    <div className="text-3xl font-black mb-1" style={{color:w.prize.color}}>{w.name}</div>
                    <div className="text-sm text-gray-500 mb-3">{w.class}</div>
                    <div className="flex items-center justify-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-black ${w.carrier === "STC" ? "bg-purple-200 text-purple-800" : w.carrier === "موبايلي" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                        {w.carrier === "STC" ? "🟣" : w.carrier === "موبايلي" ? "🟢" : "🟡"} {w.carrier}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-black text-white" style={{background:w.prize.color}}>
                        {w.prize.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => window.print()}
                className="w-full py-3 rounded-2xl bg-gray-800 text-white font-black hover:bg-gray-900">
                🖨 طباعة النتائج
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ===== سجل حضور المعلم — قراءة فقط مع الأسباب =====
function TeacherAttendanceView({ currentTeacher, teachers, attendance, week, absenceReasons, saveAbsenceReason, savingReason, savedMsg }) {
  const ti = teachers ? teachers.findIndex(t => t === currentTeacher.name) : -1;
  const weekDays = week?.days || [];

  // فرز السجلات
  const allRecords = weekDays.map((day, di) => {
    const r = (attendance && ti >= 0) ? (attendance[ti]?.[di] || {}) : {};
    return { day, di, status: r.status || "حاضر", lateType: r.lateType || "صباحي", lateMinutes: r.lateMinutes || 0, latePeriods: r.latePeriods || [], absType: r.absType || "اضطراري", notes: r.notes || "" };
  });

  const morningLateRecs = allRecords.filter(r => r.status === "متأخر" && (r.lateType === "صباحي" || !r.lateType));
  const periodLateRecs  = allRecords.filter(r => r.status === "متأخر" && r.lateType === "حصص");
  const absRecs         = allRecords.filter(r => r.status === "غائب");

  const morningMins = morningLateRecs.reduce((s, r) => s + (parseInt(r.lateMinutes) || 0), 0);
  const periodMins  = periodLateRecs.reduce((s, r) => s + (parseInt(r.lateMinutes) || 0), 0);

  // بطاقة واحدة لكل سجل
  const RecordCard = ({ rec, color, icon }) => {
    const key = `${currentTeacher.name}__${rec.di}__${rec.day.dateH}`;
    const saved = absenceReasons[key] || {};
    const [localReason, setLocalReason] = React.useState(saved.reason || "");
    const [localFaresDate, setLocalFaresDate] = React.useState(saved.faresDate || "");
    React.useEffect(() => {
      setLocalReason(saved.reason || "");
      setLocalFaresDate(saved.faresDate || "");
    }, [key, absenceReasons]);

    const borderColor = color === "red" ? "border-red-300" : color === "orange" ? "border-orange-300" : "border-amber-300";
    const tagBg      = color === "red" ? "bg-red-100 text-red-800" : color === "orange" ? "bg-orange-100 text-orange-800" : "bg-amber-100 text-amber-800";

    return (
      <div className={`bg-white rounded-2xl border-2 ${borderColor} p-4 shadow-sm`}>
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <div className="font-black text-gray-800 text-sm">{rec.day.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{rec.day.dateH} هـ — {rec.day.dateM} م</div>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-black ${tagBg}`}>
              {icon} {rec.status === "غائب"
                ? `غياب — ${rec.absType}`
                : `تأخر ${rec.lateType === "صباحي" ? "صباحي" : "عن حصص"} — ${parseInt(rec.lateMinutes) || "?"} دقيقة`}
            </span>
            {rec.status === "متأخر" && rec.lateType === "حصص" && rec.latePeriods.length > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                حصة: {rec.latePeriods.join("، ")}
              </span>
            )}
          </div>
        </div>
        {rec.notes && <div className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg px-3 py-1.5">📝 ملاحظة الإدارة: {rec.notes}</div>}
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className={cx.label}>سبب الغياب / التأخر</label>
            <input type="text" value={localReason} onChange={e => setLocalReason(e.target.value)}
              placeholder="أدخل السبب…"
              className={cx.inputT} />
          </div>
          <div>
            <label className={cx.label}>تاريخ الإدخال في فارس</label>
            <input type="text" value={localFaresDate} onChange={e => setLocalFaresDate(e.target.value)}
              placeholder="مثال: ١٠/٠٩/١٤٤٧ هـ"
              className={cx.inputT} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">{saved.savedAt ? `آخر تحديث: ${saved.savedAt}` : ""}</span>
          <button onClick={() => saveAbsenceReason(key, localReason, localFaresDate)}
            disabled={savingReason === key}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-black hover:bg-teal-700 transition-all disabled:opacity-50">
            {savingReason === key ? "جاري الحفظ…" : "💾 حفظ"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* تنبيه */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center text-xs text-blue-700 font-bold">
        📌 هذه البيانات للاطلاع فقط — لا يمكن تعديلها. يمكنك فقط إضافة السبب وتاريخ الإدخال في فارس.
      </div>

      {/* ===== ملخص الأرقام ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
          <div className="text-3xl font-black text-red-700">{absRecs.length}</div>
          <div className="text-xs text-red-500 font-bold mt-1">❌ مرات الغياب</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
          <div className="text-3xl font-black text-amber-700">{morningLateRecs.length}</div>
          <div className="text-xs text-amber-600 font-bold mt-1">🌅 تأخر صباحي</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
          <div className="text-3xl font-black text-orange-700">{morningMins}</div>
          <div className="text-xs text-orange-500 font-bold mt-1">⏱ دقائق صباحي</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
          <div className="text-3xl font-black text-yellow-700">{periodLateRecs.length}</div>
          <div className="text-xs text-yellow-600 font-bold mt-1">📚 تأخر عن حصص</div>
        </div>
        <div className="bg-lime-50 border border-lime-200 rounded-2xl p-3 text-center">
          <div className="text-3xl font-black text-lime-700">{periodMins}</div>
          <div className="text-xs text-lime-600 font-bold mt-1">⏱ دقائق حصص</div>
        </div>
      </div>

      {/* ===== قسم الغياب ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <h3 className="font-black text-red-700 text-base">سجل الغياب</h3>
          <span className="bg-red-100 text-red-700 text-xs font-black px-2 py-0.5 rounded-full">{absRecs.length}</span>
        </div>
        {absRecs.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center text-green-700 font-bold text-sm">✅ لا يوجد غياب مسجل هذا الأسبوع</div>
        ) : (
          <div className="space-y-3">
            {absRecs.map(rec => <RecordCard key={rec.di} rec={rec} color="red" icon="❌" />)}
          </div>
        )}
      </div>

      {/* ===== قسم التأخر الصباحي ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <h3 className="font-black text-amber-700 text-base">سجل التأخر الصباحي</h3>
          <span className="bg-amber-100 text-amber-700 text-xs font-black px-2 py-0.5 rounded-full">{morningLateRecs.length} مرة — {morningMins} دقيقة</span>
        </div>
        {morningLateRecs.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center text-green-700 font-bold text-sm">✅ لا يوجد تأخر صباحي مسجل</div>
        ) : (
          <div className="space-y-3">
            {morningLateRecs.map(rec => <RecordCard key={rec.di} rec={rec} color="amber" icon="🌅" />)}
          </div>
        )}
      </div>

      {/* ===== قسم التأخر عن الحصص ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <h3 className="font-black text-orange-700 text-base">سجل التأخر عن الحصص</h3>
          <span className="bg-orange-100 text-orange-700 text-xs font-black px-2 py-0.5 rounded-full">{periodLateRecs.length} مرة — {periodMins} دقيقة</span>
        </div>
        {periodLateRecs.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center text-green-700 font-bold text-sm">✅ لا يوجد تأخر عن حصص مسجل</div>
        ) : (
          <div className="space-y-3">
            {periodLateRecs.map(rec => <RecordCard key={rec.di} rec={rec} color="orange" icon="📚" />)}
          </div>
        )}
      </div>

      {savedMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl z-50 text-sm">{savedMsg}</div>
      )}
    </div>
  );
}

function TeacherPortal({ classList, setClassList, saveClass, siteFont, onBack,
  attendance, teachers, week, onSendNote, messages, setMessages, saveMessages,
  announcements, activities, surveys, weekArchive }) {

  const [step,           setStep]           = useState("login");
  const [teacherId,      setTeacherId]       = useState("");
  const [teacherAccounts,setTeacherAccounts] = useState([]);
  const [currentTeacher, setCurrentTeacher]  = useState(null);
  const [error,          setError]           = useState("");
  const [loading,        setLoading]         = useState(true);
  const [activePage,     setActivePage]      = useState("student-absence");
  const [menuOpen,       setMenuOpen]        = useState(false);

  // بيانات غياب وتأخر الطلاب
  const [studentAbsences, setStudentAbsences] = useState({});

  useEffect(() => {
    DB.get("school-teacher-accounts", []).then(data => {
      setTeacherAccounts(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (currentTeacher) {
      DB.get("school-student-absences", {}).then(data => {
        setStudentAbsences(data && typeof data === "object" ? data : {});
      });
    }
  }, [currentTeacher]);

  const saveStudentAbsences = async (updated) => {
    setStudentAbsences(updated);
    await DB.set("school-student-absences", updated);
  };

  const handleLogin = () => {
    if (!teacherId.trim()) { setError("أدخل رقم الهوية"); return; }
    const found = teacherAccounts.find(t => t.id === teacherId.trim());
    if (found) { setCurrentTeacher(found); setStep("dashboard"); setError(""); }
    else setError("رقم الهوية غير مسجل. تواصل مع الإدارة.");
  };

  const myClasses = classList.filter(c =>
    !currentTeacher || !c.teacher || c.teacher === "" || c.teacher === currentTeacher.name
  );

  // صفحات المعلم المسموح بها
  const teacherPages = [
    { id:"student-absence", icon:"📋", label:"غياب وتأخر الطلاب",    grad:"linear-gradient(135deg,#ef4444,#b91c1c)", glow:"rgba(239,68,68,.35)" },
    { id:"announcements",   icon:"📢", label:"الإعلانات",             grad:"linear-gradient(135deg,#f59e0b,#d97706)", glow:"rgba(245,158,11,.35)" },
    { id:"certificates",    icon:"🏅", label:"الشهادات الرقمية",      grad:"linear-gradient(135deg,#eab308,#ca8a04)", glow:"rgba(234,179,8,.35)"  },
    { id:"broadcast",       icon:"🎙", label:"الإذاعة المدرسية",      grad:"linear-gradient(135deg,#8b5cf6,#6d28d9)", glow:"rgba(139,92,246,.35)" },
    { id:"classtimer",      icon:"⏱", label:"مؤقت الحصة",            grad:"linear-gradient(135deg,#06b6d4,#0891b2)", glow:"rgba(6,182,212,.35)"  },
    { id:"quiz",            icon:"❓", label:"اختبارات الطلاب",       grad:"linear-gradient(135deg,#3b82f6,#2563eb)", glow:"rgba(59,130,246,.35)" },
    { id:"groupdivider",    icon:"👥", label:"تقسيم المجموعات",       grad:"linear-gradient(135deg,#10b981,#059669)", glow:"rgba(16,185,129,.35)" },
    { id:"gradeanalysis",   icon:"📊", label:"تحليل الدرجات",         grad:"linear-gradient(135deg,#6366f1,#4f46e5)", glow:"rgba(99,102,241,.35)" },
    { id:"teacherprofile",  icon:"👤", label:"ملفي الشخصي",           grad:"linear-gradient(135deg,#0d9488,#0f766e)", glow:"rgba(13,148,136,.35)" },
    { id:"report",          icon:"📄", label:"تقرير برنامج",          grad:"linear-gradient(135deg,#64748b,#475569)", glow:"rgba(100,116,139,.35)"},
    { id:"my-attendance",   icon:"🗂", label:"سجل حضوري",            grad:"linear-gradient(135deg,#f97316,#ea580c)", glow:"rgba(249,115,22,.35)" },
    { id:"messages",        icon:"✉️", label:"المساءلات والرسائل",    grad:"linear-gradient(135deg,#ec4899,#db2777)", glow:"rgba(236,72,153,.35)" },
    { id:"meetings",        icon:"📅", label:"الاجتماعات والمواعيد",  grad:"linear-gradient(135deg,#14b8a6,#0d9488)", glow:"rgba(20,184,166,.35)" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ fontFamily: siteFont, background: "linear-gradient(135deg,#1e3a5f,#2563eb)" }}>
      <div className="text-white text-center"><div className="text-5xl mb-4">👨‍🏫</div><p>جاري التحميل…</p></div>
    </div>
  );

  // - شاشة الدخول -
  if (step === "login") return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4"
      style={{ fontFamily: siteFont, background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)" }}>
      <div className="w-full max-w-sm">
        {/* ترويسة جميلة */}
        <div className="text-center text-white mb-6">
          <div style={{
            width:90, height:90, borderRadius:"50%", margin:"0 auto 16px",
            background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:46,
            boxShadow:"0 0 0 6px rgba(255,255,255,.08), 0 0 0 12px rgba(255,255,255,.05)"
          }}>👨‍🏫</div>
          <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6, fontFamily:"Cairo,sans-serif",
            textShadow:"0 2px 12px rgba(0,0,0,.3)" }}>
            مدرسة عبيدة بن الحارث المتوسطة
          </h1>
          <div style={{ display:"inline-block", background:"rgba(255,255,255,.15)", borderRadius:20,
            padding:"4px 18px", fontSize:13, fontWeight:700, letterSpacing:1, backdropFilter:"blur(4px)" }}>
            ✦ بوابة المعلم ✦
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-4" style={{
          boxShadow:"0 24px 60px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.1)"
        }}>
          <div className="text-center mb-2">
            <div style={{ fontSize:13, fontWeight:900, color:"#1e3a5f", letterSpacing:.5,
              fontFamily:"Cairo,sans-serif", marginBottom:2 }}>أهلاً بك في بوابة المعلم</div>
            <div style={{ fontSize:11, color:"#94a3b8" }}>أدخل رقم هويتك للمتابعة</div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">رقم الهوية الوطنية</label>
            <input type="text" value={teacherId}
              onChange={e => { setTeacherId(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="أدخل رقم هويتك"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm text-center tracking-widest font-bold" />
          </div>
          {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl text-center">{error}</div>}
          <button onClick={handleLogin}
            className="w-full py-3 rounded-xl font-black text-white hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg,#1e3a5f,#2563eb)" }}>
            دخول 👨‍🏫
          </button>
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">كلمة المرور هي رقم هويتك الوطنية</p>
            <button onClick={onBack} className="text-xs text-blue-500 font-bold hover:underline">← العودة للرئيسية</button>
          </div>
        </div>
      </div>
    </div>
  );

  // - لوحة المعلم -
  return (
    <div dir="rtl" className="min-h-screen" style={{ fontFamily: siteFont, background: "#f8fafc" }}>

      {/* شريط علوي */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-black text-lg">
              ☰
            </button>
            <div>
              <div className="font-black text-blue-900 text-sm">بوابة المعلم</div>
              <div className="text-xs text-gray-400">{teacherPages.find(p=>p.id===activePage)?.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                {currentTeacher.name.charAt(0)}
              </div>
              <div className="text-xs hidden sm:block">
                <div className="font-black text-blue-900">{currentTeacher.name}</div>
              </div>
            </div>
            <button onClick={() => { setStep("login"); setCurrentTeacher(null); setTeacherId(""); }}
              className="text-xs text-red-500 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50">خروج</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-4 flex gap-4">

        {/* شريط جانبي — desktop */}
        <aside className="hidden sm:block w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
            {teacherPages.map(p => {
              const active = activePage === p.id;
              return (
                <button key={p.id} onClick={() => setActivePage(p.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-right transition-all border-b border-gray-50 last:border-0 relative overflow-hidden"
                  style={{ background: active ? p.grad : "transparent", boxShadow: active ? `0 4px 16px ${p.glow}` : "none" }}>
                  {active && <div style={{ position:"absolute",inset:0,background:"linear-gradient(120deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%)",pointerEvents:"none" }} />}
                  <div style={{ width:32,height:32,borderRadius:10,flexShrink:0,background:active?"rgba(255,255,255,.22)":p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:active?"none":`0 3px 10px ${p.glow}`,transition:"all .3s" }}>{p.icon}</div>
                  <span style={{ flex:1,fontSize:12,fontWeight:800,color:active?"#fff":"#374151",fontFamily:"Cairo,sans-serif" }}>{p.label}</span>
                  {active && <div style={{ width:3,height:20,borderRadius:2,background:"rgba(255,255,255,.6)",flexShrink:0 }} />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* قائمة موبايل */}
        {menuOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMenuOpen(false)}>
            <div className="bg-white w-64 h-full shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b font-black text-blue-900">القائمة</div>
              {teacherPages.map(p => {
                const active = activePage === p.id;
                return (
                  <button key={p.id} onClick={() => { setActivePage(p.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right border-b border-gray-50 relative overflow-hidden transition-all"
                    style={{ background: active ? p.grad : "transparent", boxShadow: active ? `0 4px 16px ${p.glow}` : "none" }}>
                    <div style={{ width:36,height:36,borderRadius:12,flexShrink:0,background:active?"rgba(255,255,255,.22)":p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:active?"none":`0 3px 10px ${p.glow}` }}>{p.icon}</div>
                    <span style={{ fontSize:13,fontWeight:800,color:active?"#fff":"#374151",fontFamily:"Cairo,sans-serif" }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <main className="flex-1 min-w-0">

          {/* رسالة ترحيب جميلة */}
          <div className="rounded-3xl mb-4 text-white shadow-2xl relative overflow-hidden" style={{background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%)",padding:"20px 22px 16px"}}>
            <div style={{position:"absolute",top:-40,left:-40,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,.04)"}} />
            <div style={{position:"absolute",inset:0,background:"linear-gradient(120deg,transparent 35%,rgba(255,255,255,.07) 55%,transparent 75%)",pointerEvents:"none"}} />
            <div className="relative flex items-center gap-4">
              <div style={{width:56,height:56,borderRadius:18,background:"rgba(255,255,255,.13)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0,boxShadow:"0 0 0 2px rgba(255,255,255,.2)"}}>
                <span role="img">&#128104;&#8205;&#127979;</span>
              </div>
              <div>
                <div style={{fontSize:11,opacity:.65,fontFamily:"Cairo,sans-serif",marginBottom:2}}>&#x645;&#x631;&#x62d;&#x628;&#x627;&#x64b; &#x628;&#x643; &#x641;&#x64a; &#x628;&#x648;&#x627;&#x628;&#x62a;&#x643; &#x627;&#x644;&#x645;&#x62f;&#x631;&#x633;&#x64a;&#x629;</div>
                <div style={{fontSize:19,fontWeight:900,fontFamily:"Cairo,sans-serif",textShadow:"0 2px 8px rgba(0,0,0,.3)"}}>{currentTeacher.name}</div>
                <div style={{fontSize:11,opacity:.55,marginTop:2,fontFamily:"Cairo,sans-serif"}}>{new Date().toLocaleDateString("ar-SA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,marginTop:14,flexWrap:"wrap"}}>
              {teacherPages.slice(0,6).map(p => (
                <button key={p.id} onClick={() => setActivePage(p.id)}
                  style={{background:activePage===p.id?"rgba(255,255,255,.28)":"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:12,padding:"5px 11px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",transition:"all .2s"}}>
                  <span style={{fontSize:13}}>{p.icon}</span>
                  <span style={{fontSize:10,fontWeight:800,color:"#fff",fontFamily:"Cairo,sans-serif"}}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* غياب وتأخر الطلاب */}
          {activePage === "student-absence" && (
            <TeacherStudentAbsencePage
              classList={myClasses}
              studentAbsences={studentAbsences}
              saveStudentAbsences={saveStudentAbsences}
              currentTeacher={currentTeacher}
              isAdmin={false}
            />
          )}

          {/* سجل حضوري وانصرافي — عرض فقط */}
          {activePage === "my-attendance" && (
            <TeacherAttendanceView
              currentTeacher={currentTeacher}
              teachers={teachers}
              attendance={attendance}
              week={week}
              absenceReasons={{}}
              saveAbsenceReason={() => {}}
              savingReason={null}
              savedMsg=""
            />
          )}

          {/* الإعلانات — عرض فقط */}
          {activePage === "announcements" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">📢 الإعلانات</h2>
                {announcements.length === 0
                  ? <div className="text-center text-gray-400 py-8">لا توجد إعلانات</div>
                  : announcements.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                      <span className="text-2xl">{a.emoji || "📌"}</span>
                      <div>
                        <div className="font-black text-sm text-gray-800">{a.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{a.body}</div>
                        <div className="text-xs text-gray-400 mt-1">{a.date}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* أدوات الفصل */}
          {activePage === "classtimer"   && <ClassTimerPage />}
          {activePage === "quiz"         && <QuizPage classList={myClasses} />}
          {activePage === "groupdivider" && <GroupDividerPage teachers={teachers} classList={myClasses} />}

          {/* تقرير برنامج */}
          {activePage === "report" && <ProgramReportPage />}

          {/* تحليل الدرجات — فصوله فقط */}
          {activePage === "gradeanalysis" && (
            <GradeAnalysisPage classList={myClasses} teacherMode={true} />
          )}

          {/* ملف المعلم */}
          {activePage === "teacherprofile" && (
            <TeacherProfilePage
              teachers={teachers}
              attendance={attendance}
              week={week}
              weekArchive={weekArchive}
              classList={myClasses}
              teacherMode={true}
              lockedTeacher={currentTeacher.name}
            />
          )}

          {/* الشهادات الرقمية */}
          {activePage === "certificates" && (
            <CertificatesPage classList={myClasses} teacherMode={true} />
          )}

          {/* الإذاعة */}
          {activePage === "broadcast" && (
            <BroadcastPage teacherMode={true} />
          )}

          {/* الرسائل والمساءلات — عرض ورد */}
          {activePage === "messages" && (
            <MessagesPage
              messages={messages}
              saveMessages={saveMessages}
              surveys={surveys}
              setSurveys={() => {}}
              saveSurveys={() => {}}
              siteFont={siteFont}
              onBack={() => {}}
              teacherMode={true}
              teacherName={currentTeacher.name}
            />
          )}

          {/* الاجتماعات — عرض وتعليق */}
          {activePage === "meetings" && (
            <TeacherMeetingsView
              currentTeacher={currentTeacher}
            />
          )}

        </main>
      </div>
    </div>
  );
}

// - صفحة غياب وتأخر الطلاب (مشتركة بين الإدارة والمعلم) -
function TeacherStudentAbsencePage({ classList, studentAbsences, saveStudentAbsences, currentTeacher, isAdmin }) {
  const [selClass, setSelClass]     = useState(classList[0]?.id || "");
  const [tab, setTab]               = useState("fullday"); // fullday | morning | period
  const [saving, setSaving]         = useState(false);
  const [savedMsg, setSavedMsg]     = useState("");

  const today = new Date().toLocaleDateString("ar-SA", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const todayKey = new Date().toISOString().split("T")[0];

  const cls = classList.find(c => c.id === selClass);
  const students = cls ? cls.students.filter(s => s.name) : [];

  // بيانات اليوم لهذا الفصل
  const dayData = studentAbsences[selClass]?.[todayKey] || {};

  const updateRecord = async (studentName, type, data) => {
    setSaving(true);
    const key = `${selClass}`;
    const updated = {
      ...studentAbsences,
      [key]: {
        ...(studentAbsences[key] || {}),
        [todayKey]: {
          ...(studentAbsences[key]?.[todayKey] || {}),
          [studentName]: {
            ...(studentAbsences[key]?.[todayKey]?.[studentName] || {}),
            [type]: data,
            recordedBy: currentTeacher?.name || "الإدارة",
            recordedAt: new Date().toLocaleTimeString("ar-SA")
          }
        }
      }
    };
    await saveStudentAbsences(updated);
    setSavedMsg("✅ تم الحفظ");
    setTimeout(() => setSavedMsg(""), 2000);
    setSaving(false);
  };

  const getRecord = (studentName, type) => dayData[studentName]?.[type];

  const PERIODS_LIST = ["الأولى","الثانية","الثالثة","الرابعة","الخامسة","السادسة","السابعة"];
  const ABSENCE_REASONS = ["مرض","ظروف عائلية","إجراءات رسمية","غير معلوم","أخرى"];
  const LATE_REASONS    = ["ازدحام","ظروف منزلية","مواصلات","غير معلوم","أخرى"];

  return (
    <div className="space-y-4">
      {/* رأس الصفحة */}
      <div className="rounded-2xl p-5 text-white shadow-lg" style={{background:"linear-gradient(135deg,#1e3a5f,#0d9488)"}}>
        <h2 className="text-lg font-black mb-0.5">📋 غياب وتأخر الطلاب</h2>
        <p className="text-sm opacity-80">{today}</p>
      </div>

      {savedMsg && <div className="bg-green-50 text-green-700 font-black text-sm text-center py-2 rounded-xl border border-green-200">{savedMsg}</div>}

      {/* اختيار الفصل */}
      {classList.length > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="text-xs font-bold text-gray-500 block mb-2">اختر الفصل</label>
          <div className="flex flex-wrap gap-2">
            {classList.map(c => (
              <button key={c.id} onClick={() => setSelClass(c.id)}
                className={"px-4 py-2 rounded-xl font-bold text-sm transition-all " +
                  (selClass === c.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-teal-50")}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* تبويبات نوع الغياب/التأخر */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id:"fullday", label:"غياب يوم كامل", icon:"❌" },
            { id:"morning", label:"تأخر صباحي",    icon:"⏰" },
            { id:"period",  label:"تأخر عن حصة",   icon:"📚" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={"flex-1 py-3 text-xs font-black transition-all " +
                (tab === t.id ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50")}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {students.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-3xl mb-2">👤</div>
              <div>لا يوجد طلاب في هذا الفصل</div>
            </div>
          ) : (
            <div className="space-y-2">

              {/* غياب يوم كامل */}
              {tab === "fullday" && students.map(st => {
                const rec = getRecord(st.name, "fullday") || {};
                return (
                  <div key={st.name} className={"flex items-center gap-3 p-3 rounded-xl border transition-all " +
                    (rec.absent ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100")}>
                    <div className="flex-1">
                      <div className="font-black text-sm text-gray-800">{st.name}</div>
                      {rec.absent && <div className="text-xs text-red-600 mt-0.5">غائب — {rec.reason || ""} {rec.recordedBy ? "· سجّله: "+rec.recordedBy : ""}</div>}
                    </div>
                    <select
                      value={rec.reason || ""}
                      onChange={e => updateRecord(st.name, "fullday", { ...rec, reason: e.target.value })}
                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 focus:outline-none"
                      style={{fontFamily:"inherit"}}>
                      <option value="">السبب</option>
                      {ABSENCE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button
                      onClick={() => updateRecord(st.name, "fullday", { absent: !rec.absent, reason: rec.reason || "" })}
                      className={"px-4 py-2 rounded-xl font-black text-xs transition-all " +
                        (rec.absent ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
                      {rec.absent ? "✓ إلغاء" : "غائب"}
                    </button>
                  </div>
                );
              })}

              {/* تأخر صباحي */}
              {tab === "morning" && students.map(st => {
                const rec = getRecord(st.name, "morning") || {};
                return (
                  <div key={st.name} className={"flex items-center gap-3 p-3 rounded-xl border transition-all " +
                    (rec.late ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100")}>
                    <div className="flex-1">
                      <div className="font-black text-sm text-gray-800">{st.name}</div>
                      {rec.late && <div className="text-xs text-amber-700 mt-0.5">{rec.minutes || 0} دقيقة — {rec.reason || ""} {rec.recordedBy ? "· "+rec.recordedBy : ""}</div>}
                    </div>
                    {rec.late && (
                      <>
                        <input type="number" min="1" max="120" placeholder="دقائق"
                          value={rec.minutes || ""}
                          onChange={e => updateRecord(st.name, "morning", { ...rec, minutes: e.target.value })}
                          className="w-20 px-2 py-1 text-xs rounded-lg border border-gray-200 text-center focus:outline-none" />
                        <select value={rec.reason || ""}
                          onChange={e => updateRecord(st.name, "morning", { ...rec, reason: e.target.value })}
                          className="text-xs px-2 py-1 rounded-lg border border-gray-200 focus:outline-none"
                          style={{fontFamily:"inherit"}}>
                          <option value="">السبب</option>
                          {LATE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </>
                    )}
                    <button
                      onClick={() => updateRecord(st.name, "morning", { late: !rec.late, minutes: rec.minutes || "", reason: rec.reason || "" })}
                      className={"px-4 py-2 rounded-xl font-black text-xs transition-all " +
                        (rec.late ? "bg-green-500 text-white" : "bg-amber-500 text-white")}>
                      {rec.late ? "✓ إلغاء" : "متأخر"}
                    </button>
                  </div>
                );
              })}

              {/* تأخر عن حصة */}
              {tab === "period" && students.map(st => {
                const recs = getRecord(st.name, "periods") || [];
                return (
                  <div key={st.name} className="p-3 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-black text-sm text-gray-800">{st.name}</div>
                      <button
                        onClick={() => {
                          const newRec = [...recs, { period:"الأولى", minutes:"", reason:"" }];
                          updateRecord(st.name, "periods", newRec);
                        }}
                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg font-bold">
                        + إضافة تأخر
                      </button>
                    </div>
                    {recs.map((r, ri) => (
                      <div key={ri} className="flex items-center gap-2 bg-blue-50 rounded-xl p-2">
                        <select value={r.period}
                          onChange={e => { const u=[...recs]; u[ri]={...u[ri],period:e.target.value}; updateRecord(st.name,"periods",u); }}
                          className="text-xs px-2 py-1 rounded-lg border border-blue-200 focus:outline-none"
                          style={{fontFamily:"inherit"}}>
                          {PERIODS_LIST.map(p => <option key={p} value={p}>الحصة {p}</option>)}
                        </select>
                        <input type="number" min="1" max="60" placeholder="دقائق"
                          value={r.minutes}
                          onChange={e => { const u=[...recs]; u[ri]={...u[ri],minutes:e.target.value}; updateRecord(st.name,"periods",u); }}
                          className="w-20 px-2 py-1 text-xs rounded-lg border border-blue-200 text-center focus:outline-none" />
                        <select value={r.reason}
                          onChange={e => { const u=[...recs]; u[ri]={...u[ri],reason:e.target.value}; updateRecord(st.name,"periods",u); }}
                          className="flex-1 text-xs px-2 py-1 rounded-lg border border-blue-200 focus:outline-none"
                          style={{fontFamily:"inherit"}}>
                          <option value="">السبب</option>
                          {LATE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => { const u=recs.filter((_,i)=>i!==ri); updateRecord(st.name,"periods",u); }}
                          className="text-red-400 text-xs px-1 hover:text-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                );
              })}

            </div>
          )}
        </div>
      </div>

      {/* سجل اليوم — ملخص */}
      {Object.keys(dayData).length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-sm text-gray-700 mb-3">📊 ملخص اليوم — {cls?.name}</h3>
          <div className="space-y-1.5">
            {Object.entries(dayData).map(([stName, data]) => (
              <div key={stName} className="flex items-center gap-2 text-xs">
                <span className="font-bold text-gray-700 flex-1">{stName}</span>
                {data.fullday?.absent && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-lg font-bold">غائب</span>}
                {data.morning?.late  && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg font-bold">متأخر {data.morning.minutes} د</span>}
                {data.periods?.length > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg font-bold">تأخر {data.periods.length} حصة</span>}
                {data.recordedBy && <span className="text-gray-400">· {data.recordedBy}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// - عرض الاجتماعات للمعلم مع إضافة تعليق -
function TeacherMeetingsView({ currentTeacher }) {
  const [meetings, setMeetings] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    DB.get("school-meetings", []).then(d => setMeetings(Array.isArray(d) ? d : []));
    DB.get("school-meeting-comments", {}).then(d => setComments(d && typeof d === "object" ? d : {}));
  }, []);

  const addComment = async (meetingId) => {
    const txt = (commentText[meetingId] || "").trim();
    if (!txt) return;
    setSaving(meetingId);
    const updated = {
      ...comments,
      [meetingId]: [
        ...(comments[meetingId] || []),
        { text: txt, by: currentTeacher.name, at: new Date().toLocaleDateString("ar-SA") }
      ]
    };
    setComments(updated);
    await DB.set("school-meeting-comments", updated);
    setCommentText(p => ({ ...p, [meetingId]: "" }));
    setSaving(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 text-white shadow-lg" style={{background:"linear-gradient(135deg,#0f2d55,#0891b2)"}}>
        <h2 className="text-lg font-black">📅 الاجتماعات والمواعيد</h2>
        <p className="text-sm opacity-80">عرض الاجتماعات وإضافة تعليقاتك</p>
      </div>
      {meetings.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border">
          <div className="text-4xl mb-2">📅</div>لا توجد اجتماعات مجدولة
        </div>
      ) : meetings.map(m => (
        <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-black text-gray-800">{m.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{m.date} — {m.time} — {m.location}</div>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{m.type}</span>
          </div>
          {m.agenda && <div className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-3">{m.agenda}</div>}
          {/* تعليقات */}
          {(comments[m.id] || []).length > 0 && (
            <div className="space-y-1.5 mb-3">
              {(comments[m.id] || []).map((c,i) => (
                <div key={i} className="flex items-start gap-2 bg-blue-50 rounded-xl p-2">
                  <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-black text-blue-700 flex-shrink-0">{c.by.charAt(0)}</div>
                  <div><div className="text-xs font-bold text-blue-900">{c.by}</div><div className="text-xs text-gray-600">{c.text}</div></div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={commentText[m.id] || ""} onChange={e => setCommentText(p => ({...p,[m.id]:e.target.value}))}
              placeholder="أضف تعليقك..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400"
              style={{fontFamily:"inherit"}} />
            <button onClick={() => addComment(m.id)} disabled={saving===m.id}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {saving===m.id ? "..." : "إرسال"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


// ===== ثوابت التقييم الأسبوعي =====
const EVAL_LEVELS = [
  { value: "", label: "— المستوى —", bg: "#f5f5f5", color: "#aaa" },
  { value: "weak",  label: "ضعيف",    bg: "#FF6B6B", color: "#fff" },
  { value: "accept",label: "مقبول",   bg: "#FFD93D", color: "#5a4200" },
  { value: "good",  label: "جيد",     bg: "#A8E6CF", color: "#1a4a30" },
  { value: "vgood", label: "جيد جداً",bg: "#4ECDC4", color: "#fff" },
  { value: "excel", label: "ممتاز",   bg: "#2ECC71", color: "#fff" },
];
// مشترك — خريطة مستويات التقييم
const GRADE_MAP = {
  weak:  { label:"ضعيف",    bg:"#FF6B6B", color:"#fff",    c:"#fff" },
  accept:{ label:"مقبول",   bg:"#FFD93D", color:"#5a4200", c:"#5a4200" },
  good:  { label:"جيد",     bg:"#A8E6CF", color:"#1a4a30", c:"#1a4a30" },
  vgood: { label:"جيد جداً",bg:"#4ECDC4", color:"#fff",    c:"#fff" },
  excel: { label:"ممتاز",   bg:"#2ECC71", color:"#fff",    c:"#fff" },
};

const EVAL_FACES = ["","😊","😁","😐","😟","😞","⭐","👍","👎","💪","📚","⚠️","🌟","🔥","💯"];
const EVAL_COLORS = [
  { label: "بدون", value: "" },
  { label: "أخضر", value: "#d1fae5" },
  { label: "أصفر", value: "#fef9c3" },
  { label: "أحمر", value: "#fee2e2" },
  { label: "أزرق", value: "#dbeafe" },
  { label: "بنفسجي", value: "#ede9fe" },
  { label: "برتقالي", value: "#ffedd5" },
];
const EVAL_CATEGORIES = [
  { key: "behavior",      label: "السلوك",      icon: "🌿" },
  { key: "homework",      label: "الواجبات",    icon: "📝" },
  { key: "participation", label: "المشاركة",    icon: "🙋" },
  { key: "discipline",    label: "الانضباط",    icon: "⚖️" },
];
const HIJRI_DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس"];

// نموذج تقييم أسبوعي جديد
function newEval() {
  return {
    id: Date.now() + Math.random() * 1000 | 0,
    dateH: "",
    day: "الأحد",
    subject: "",
    level: "",
    categories: {},
  };
}

// مكوّن التقييم الأسبوعي للطالب
function StudentEvalCard({ student, onUpdate, onDelete, onSendNote, messages }) {
  const [expanded, setExpanded] = useState(false);
  const [addingEval, setAddingEval] = useState(false);
  const [draft, setDraft] = useState(newEval());
  const [openCats, setOpenCats] = useState({});
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSent, setNoteSent] = useState(false);

  const handleSendNote = async () => {
    if (!noteText.trim()) { alert("اكتب الملاحظة أولاً"); return; }
    if (onSendNote) await onSendNote(student, noteText.trim());
    setNoteText(""); setShowNoteForm(false);
    setNoteSent(true); setTimeout(() => setNoteSent(false), 4000);
    // فتح واتساب إذا يوجد رقم جوال
    if (student.parentPhone && student.parentPhone.trim()) {
      const phone = student.parentPhone.trim().replace(/^0/, "966");
      const siteUrl = "https://school-website1.vercel.app";
      const msg = encodeURIComponent(
        `السلام عليكم ورحمة الله وبركاته
ولي أمر الطالب / ${student.name}

نُفيدكم بوجود ملاحظة من معلم ابنكم.
يرجى الاطلاع عليها والرد من خلال بوابة أولياء الأمور:
${siteUrl}

📌 أدخل رقم هوية الطالب: ${student.nationalId || "—"}
ثم اختر تبويب 🔔 ملاحظات المعلم

مع تحيات إدارة مدرسة عبيدة بن الحارث المتوسطة`
      );
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    }
  };

  const openWhatsApp = () => {
    if (!student.parentPhone || !student.parentPhone.trim()) {
      alert("أضف رقم جوال ولي الأمر أولاً في بيانات الطالب");
      return;
    }
    const phone = student.parentPhone.trim().replace(/^0/, "966");
    const siteUrl = "https://school-website1.vercel.app";
    const msg = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته
ولي أمر الطالب / ${student.name}

نُفيدكم بوجود ملاحظة من معلم ابنكم.
يرجى الاطلاع عليها والرد من خلال بوابة أولياء الأمور:
${siteUrl}

📌 أدخل رقم هوية الطالب: ${student.nationalId || "—"}
ثم اختر تبويب 🔔 ملاحظات المعلم

مع تحيات إدارة مدرسة عبيدة بن الحارث المتوسطة`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const evals = student.evals || [];
  const lastEval = evals[evals.length - 1];
  const lastLevel = lastEval ? EVAL_LEVELS.find(l => l.value === lastEval.level) : null;

  const toggleCat = (key) => setOpenCats(p => ({ ...p, [key]: !p[key] }));

  const updateDraftCat = (key, field, val) => {
    setDraft(p => ({ ...p, categories: { ...p.categories, [key]: { ...(p.categories[key] || {}), [field]: val } } }));
  };

  const saveEval = () => {
    if (!draft.subject) { alert("اختر المادة الدراسية أولاً"); return; }
    if (!draft.level) { alert("اختر المستوى أولاً"); return; }
    const updated = { ...student, evals: [...evals, { ...draft, id: Date.now() }] };
    onUpdate(updated);
    setAddingEval(false);
    setDraft(newEval());
    setOpenCats({});
  };

  const deleteEval = (eid) => {
    if (!confirm("حذف هذا التقييم؟")) return;
    onUpdate({ ...student, evals: evals.filter(e => e.id !== eid) });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3">
      {/* رأس الطالب */}
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all"
        style={{ borderRight: `4px solid ${lastLevel ? lastLevel.bg : "#e5e7eb"}` }}
        onClick={() => setExpanded(p => !p)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
            style={{ background: "#1B3A6B", color: "#fff" }}>{student.num}</div>
          <div>
            <div className="font-black text-gray-800">{student.name || <span className="text-gray-300 font-normal">اسم الطالب</span>}</div>
            {student.nationalId && <div className="text-xs text-gray-400">{student.nationalId}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastLevel && lastLevel.value && (
            <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: lastLevel.bg, color: lastLevel.color }}>
              {lastLevel.label}
            </span>
          )}
          {/* مؤشر المواد — عدد المواد المقيّمة */}
          {(() => {
            const subjSet = new Set(evals.filter(e=>e.subject).map(e=>e.subject));
            if (subjSet.size === 0) return null;
            return (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                📚 {subjSet.size} مادة
              </span>
            );
          })()}
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-bold">{evals.length} تقييم</span>
          {/* أيقونة جوال ولي الأمر */}
          <span
            onClick={e => { e.stopPropagation(); onUpdate({ ...student, _showPhone: !student._showPhone }); }}
            title={student.parentPhone ? "جوال ولي الأمر: " + student.parentPhone : "أضف جوال ولي الأمر"}
            className="cursor-pointer text-base select-none"
            style={{ filter: student.parentPhone ? "none" : "grayscale(1) opacity(0.4)" }}>
            📱
          </span>
          <button onClick={e => { e.stopPropagation(); onDelete(student.id); }}
            className="text-red-300 hover:text-red-500 text-sm px-1 font-bold">✕</button>
          <span className="text-gray-400 text-lg">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* تفاصيل الطالب */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* تعديل الاسم والهوية */}
          <div className="flex gap-2 px-4 pt-3">
            <input type="text" value={student.name} placeholder="اسم الطالب"
              onChange={e => onUpdate({ ...student, name: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium focus:border-blue-400 focus:outline-none"
              style={{ fontFamily: "inherit", color: "#1B3A6B" }} />
            <input type="text" value={student.nationalId || ""} placeholder="رقم الهوية"
              onChange={e => onUpdate({ ...student, nationalId: e.target.value })}
              className="w-36 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm text-center focus:border-blue-400 focus:outline-none"
              style={{ fontFamily: "inherit" }} />
          </div>
          {/* جوال ولي الأمر — يظهر دائماً */}
          <div className="flex items-center gap-2 px-4 pt-2 pb-1">
            <span className="text-base">📱</span>
            <input type="tel" value={student.parentPhone || ""}
              placeholder="جوال ولي الأمر (05xxxxxxxx)"
              onChange={e => onUpdate({ ...student, parentPhone: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl border-2 text-sm text-center focus:outline-none"
              style={{ fontFamily: "inherit",
                borderColor: student.parentPhone ? "#22c55e" : "#e5e7eb",
                background: student.parentPhone ? "#f0fdf4" : "#fff",
                color: student.parentPhone ? "#166534" : "#374151",
                fontWeight: student.parentPhone ? "700" : "400"
              }} />
            {student.parentPhone && (
              <button onClick={() => openWhatsApp()}
                className="shrink-0 bg-green-500 hover:bg-green-600 text-white text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1 transition-all">
                📲 واتساب
              </button>
            )}
          </div>
          {/* ملخص مستوى كل مادة */}
          {evals.some(e=>e.subject) && (
            <div className="px-4 pt-3 pb-2">
              <div className="text-xs font-black text-gray-500 mb-2">📊 آخر مستوى لكل مادة</div>
              <div className="grid grid-cols-3 gap-1.5">
                {SUBJECTS.map(subj => {
                  const subjEvals = [...evals].reverse().filter(e=>e.subject===subj.key);
                  const last = subjEvals[0];
                  if (!last) return null;
                  const lv = EVAL_LEVELS.find(l=>l.value===last.level) || EVAL_LEVELS[0];
                  return (
                    <div key={subj.key} className="rounded-xl overflow-hidden border"
                      style={{borderColor:subj.color+"44"}}>
                      <div className="flex items-center gap-1 px-2 py-1" style={{background:subj.bg}}>
                        <span className="text-xs">{subj.icon}</span>
                        <span className="text-xs font-black truncate" style={{color:subj.color}}>{subj.label}</span>
                      </div>
                      <div className="px-2 py-1 text-center font-black text-xs" style={{background:lv.bg||"#f5f5f5",color:lv.color||"#333"}}>
                        {lv.label || "—"}
                      </div>
                      <div className="text-center text-xs text-gray-400 pb-1">{subjEvals.length} تقييم</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* قائمة التقييمات السابقة */}
          {evals.length > 0 && (
            <div className="px-4 pt-3 space-y-3">
              {evals.map(ev => {
                const lv = EVAL_LEVELS.find(l => l.value === ev.level) || EVAL_LEVELS[0];
                return (
                  <div key={ev.id} className="rounded-xl border border-gray-100 overflow-hidden">
                    {/* رأس التقييم */}
                    <div className="flex items-center justify-between px-3 py-2" style={{ background: lv.bg || "#f5f5f5" }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        {ev.subject && (() => {
                          const subj = SUBJECTS.find(s=>s.key===ev.subject);
                          return subj ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black"
                              style={{background:subj.bg, color:subj.color, border:`1px solid ${subj.color}44`}}>
                              {subj.icon} {subj.label}
                            </span>
                          ) : null;
                        })()}
                        <span className="font-black text-sm" style={{ color: lv.color }}>{lv.label}</span>
                        {ev.dateH && <span className="text-xs opacity-70" style={{ color: lv.color }}>📅 {ev.day} {ev.dateH}</span>}
                      </div>
                      <button onClick={() => deleteEval(ev.id)} className="text-xs opacity-50 hover:opacity-100 px-2 py-0.5 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all">🗑️</button>
                    </div>
                    {/* ملاحظات الفئات */}
                    {EVAL_CATEGORIES.map(cat => {
                      const catData = ev.categories?.[cat.key];
                      if (!catData?.text && !catData?.face) return null;
                      return (
                        <div key={cat.key} className="flex items-start gap-2 px-3 py-2 border-t border-gray-50"
                          style={{ background: catData.color || "#fff" }}>
                          <span className="text-base flex-shrink-0">{cat.icon}</span>
                          <div className="flex-1">
                            <span className="text-xs font-black text-gray-600">{cat.label}:</span>
                            <span className="text-xs text-gray-700 mr-1">{catData.text}</span>
                          </div>
                          {catData.face && <span className="text-base">{catData.face}</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* نموذج تقييم جديد */}
          {addingEval ? (
            <div className="m-4 bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
              <div className="font-black text-blue-800 mb-3 text-sm">➕ تقييم أسبوعي جديد</div>

              {/* اختيار المادة */}
              <div className="mb-3">
                <label className={cx.label}>📚 المادة الدراسية *</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {SUBJECTS.map(subj => (
                    <button key={subj.key} onClick={() => setDraft(p => ({ ...p, subject: subj.key }))}
                      className={"flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border-2 transition-all " +
                        (draft.subject === subj.key ? "border-current shadow-sm" : "border-gray-200 bg-white hover:border-gray-300")}
                      style={draft.subject === subj.key ? {background:subj.bg, color:subj.color, borderColor:subj.color} : {color:"#6b7280"}}>
                      <span className="text-sm">{subj.icon}</span>
                      <span className="truncate">{subj.label}</span>
                    </button>
                  ))}
                </div>
                {!draft.subject && <div className="text-xs text-red-500 font-bold mt-1">اختر المادة أولاً</div>}
              </div>

              {/* التاريخ واليوم والمستوى */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className={cx.label}>اليوم</label>
                  <select value={draft.day} onChange={e => setDraft(p => ({ ...p, day: e.target.value }))}
                    className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400">
                    {HIJRI_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={cx.label}>التاريخ الهجري</label>
                  <input type="text" placeholder="مثال: 15/09/1447" value={draft.dateH}
                    onChange={e => setDraft(p => ({ ...p, dateH: e.target.value }))}
                    className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 text-sm text-center focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className={cx.label}>المستوى *</label>
                  <select value={draft.level} onChange={e => setDraft(p => ({ ...p, level: e.target.value }))}
                    className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none focus:border-blue-400"
                    style={draft.level ? { background: EVAL_LEVELS.find(l=>l.value===draft.level)?.bg, color: EVAL_LEVELS.find(l=>l.value===draft.level)?.color } : {}}>
                    {EVAL_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              {/* فئات الملاحظات */}
              <div className="space-y-2 mb-3">
                {EVAL_CATEGORIES.map(cat => {
                  const catData = draft.categories[cat.key] || {};
                  const isOpen = openCats[cat.key];
                  return (
                    <div key={cat.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-all"
                        onClick={() => toggleCat(cat.key)}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="font-black text-gray-700 text-sm">{cat.label}</span>
                          {catData.face && <span className="text-base">{catData.face}</span>}
                          {catData.text && <span className="text-xs text-gray-400 truncate max-w-32">{catData.text}</span>}
                        </div>
                        <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 space-y-2 border-t border-gray-100"
                          style={{ background: catData.color || "#fff" }}>
                          {/* الوجه التعبيري */}
                          <div className="pt-2">
                            <div className="text-xs font-bold text-gray-500 mb-1.5">الوجه التعبيري:</div>
                            <div className="flex gap-1.5 flex-wrap">
                              {EVAL_FACES.map(f => (
                                <button key={f} onClick={() => updateDraftCat(cat.key, "face", f === catData.face ? "" : f)}
                                  className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all"
                                  style={{ background: catData.face === f ? "#dbeafe" : "#f3f4f6", border: catData.face === f ? "2px solid #3b82f6" : "2px solid transparent" }}>
                                  {f || "✕"}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* لون الخلفية */}
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-1.5">لون الخلفية:</div>
                            <div className="flex gap-1.5 flex-wrap">
                              {EVAL_COLORS.map(c => (
                                <button key={c.value} onClick={() => updateDraftCat(cat.key, "color", c.value)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold border-2 transition-all"
                                  style={{ background: c.value || "#f3f4f6", borderColor: catData.color === c.value ? "#3b82f6" : "transparent" }}>
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* الملاحظة */}
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-1.5">الملاحظة:</div>
                            <textarea value={catData.text || ""} rows={2}
                              onChange={e => updateDraftCat(cat.key, "text", e.target.value)}
                              placeholder={`اكتب ملاحظة عن ${cat.label}...`}
                              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                              style={{ fontFamily: "inherit" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button onClick={saveEval} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700">💾 حفظ التقييم</button>
                <button onClick={() => { setAddingEval(false); setDraft(newEval()); setOpenCats({}); }}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200">إلغاء</button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3">
              <button onClick={() => setAddingEval(true)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 text-sm font-black hover:border-blue-500 hover:bg-blue-50 transition-all">
                ➕ إضافة تقييم أسبوعي
              </button>
            </div>
          )}

          {/* ===== ملاحظات ولي الأمر ===== */}
          {onSendNote && (() => {
            const sentNotes = (messages || []).filter(m => m.type === "teacher_note" && m.studentId === student.nationalId);
            const unread = sentNotes.filter(m => !m.reply).length;
            return (
              <div className="px-4 pb-4 space-y-2">
                {/* سجل الملاحظات السابقة */}
                {sentNotes.length > 0 && (
                  <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden mb-2">
                    <div className="flex items-center justify-between px-3 py-2 bg-amber-50 border-b border-amber-100">
                      <span className="text-xs font-black text-amber-800">📨 ملاحظات مُرسلة ({sentNotes.length})</span>
                      {unread > 0 && (
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                          {unread} بدون رد
                        </span>
                      )}
                    </div>
                    <div className="divide-y divide-amber-50 max-h-56 overflow-y-auto">
                      {[...sentNotes].reverse().map(note => (
                        <div key={note.id} className="px-3 py-2">
                          {/* نص الملاحظة */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs text-gray-700 flex-1">{note.text}</p>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{note.date}</span>
                          </div>
                          {/* حالة القراءة والرد */}
                          {note.reply ? (
                            <div className="mt-1 bg-blue-50 border border-blue-200 rounded-xl px-2 py-1.5">
                              <div className="text-xs font-black text-blue-600 mb-0.5">💬 رد ولي الأمر — {note.repliedAt}</div>
                              <p className="text-xs text-blue-800">{note.reply}</p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">⏳ لم يرد بعد</span>
                              {student.parentPhone && (
                                <button onClick={openWhatsApp}
                                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition-all">
                                  <span>📲</span> تذكير واتساب
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* تنبيه إرسال */}
                {noteSent && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-2 rounded-xl animate-pulse">
                    ✅ تم إرسال الملاحظة لولي الأمر بنجاح
                  </div>
                )}
                {/* نموذج إرسال */}
                {!showNoteForm ? (
                  <div className="flex gap-2">
                    <button onClick={() => setShowNoteForm(true)}
                      className="flex-1 py-2.5 rounded-xl border-2 border-dashed border-amber-400 text-amber-700 text-sm font-black hover:border-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
                      📨 إرسال ملاحظة جديدة
                    </button>
                    <button onClick={openWhatsApp} title="إشعار واتساب مباشر"
                      className="py-2.5 px-3 rounded-xl border-2 border-dashed border-green-400 text-green-700 text-sm font-black hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center gap-1">
                      📲 واتساب
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📨</span>
                      <span className="font-black text-amber-800 text-sm">ملاحظة لولي أمر: {student.name}</span>
                    </div>
                    {lastLevel && lastLevel.value && (
                      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-amber-200">
                        <span className="text-xs text-gray-500">آخر مستوى:</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-black" style={{background:lastLevel.bg,color:lastLevel.color}}>{lastLevel.label}</span>
                      </div>
                    )}
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      rows={3}
                      placeholder="اكتب ملاحظتك لولي الأمر..."
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none text-sm resize-none bg-white"
                      style={{fontFamily:"inherit"}}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSendNote}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black transition-all">
                        📤 إرسال
                      </button>
                      <button onClick={() => { setShowNoteForm(false); setNoteText(""); }}
                        className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200">
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function ClassTable({ cls, onUpdateClass, onSave, onSendNote, messages }) {
  const [search, setSearch] = useState("");
  const [editInfo, setEditInfo] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [info, setInfo] = useState({ level: cls.level, section: cls.section, teacher: cls.teacher, semester: cls.semester });

  useEffect(() => {
    const t = setTimeout(() => onSave(cls), 800);
    return () => clearTimeout(t);
  }, [cls.students]);

  const updateName = (sid, name) => onUpdateClass({ ...cls, students: cls.students.map(s => s.id === sid ? { ...s, name } : s) });
  const updateNationalId = (sid, nationalId) => onUpdateClass({ ...cls, students: cls.students.map(s => s.id === sid ? { ...s, nationalId } : s) });
  const updateStudent = (updated) => onUpdateClass({ ...cls, students: cls.students.map(s => s.id === updated.id ? updated : s) });
  const removeStudent = (sid) => {
    if (!confirm("حذف الطالب وجميع تقييماته؟")) return;
    onUpdateClass({ ...cls, students: cls.students.filter(s => s.id !== sid).map((s, i) => ({ ...s, num: i + 1 })) });
  };
  const handleExcelImport = (importedStudents) => {
    const start = cls.students.length;
    onUpdateClass({ ...cls, students: [...cls.students, ...importedStudents.map((s, i) => ({ ...s, num: start + i + 1 }))] });
  };
  const addStudent = () => onUpdateClass({ ...cls, students: [...cls.students, newStudent(cls.students.length + 1)] });
  const addMany = (count) => {
    const start = cls.students.length;
    onUpdateClass({ ...cls, students: [...cls.students, ...Array.from({ length: count }, (_, i) => newStudent(start + i + 1))] });
  };
  const saveInfo = () => {
    const updated = { ...cls, ...info, name: `${info.level} / ${info.section}` };
    onUpdateClass(updated); onSave(updated); setEditInfo(false);
  };

  const filtered = search ? cls.students.filter(s => s.name.includes(search)) : cls.students;

  const handlePrint = () => {
    const rows = cls.students.map(s => {
      const evals = s.evals || [];
      const last = evals[evals.length - 1];
      const lv = EVAL_LEVELS.find(l => l.value === last?.level) || EVAL_LEVELS[0];
      const cats = EVAL_CATEGORIES.map(cat => {
        const d = last?.categories?.[cat.key];
        return d?.text ? `${cat.icon} ${cat.label}: ${d.text}` : null;
      }).filter(Boolean).join(" | ");
      return `<tr>
        <td>${s.num}</td>
        <td style="text-align:right;padding-right:8px">${s.name||"—"}</td>
        <td style="background:${lv.bg||'#fff'};color:${lv.color||'#333'};font-weight:700">${lv.label==="— المستوى —"?"—":lv.label}</td>
        <td style="font-size:10px;text-align:right;padding:4px 8px">${last?.dateH||""} ${last?.day||""}</td>
        <td style="font-size:9px;text-align:right;padding:4px 8px">${cats}</td>
      </tr>`;
    }).join("");
    w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
    <title>سجل التقييم الأسبوعي — ${cls.name}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Tajawal',Arial,sans-serif;padding:20px;direction:rtl;font-size:12px}
    h1{text-align:center;color:#1B3A6B;font-size:16px;margin-bottom:4px}.sub{text-align:center;color:#666;font-size:10px;margin-bottom:12px}
    table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px;text-align:center}
    th{background:#1B3A6B;color:#fff}tr:nth-child(odd){background:#f4f7fb}
    .footer{text-align:center;margin-top:20px;font-size:9px;color:#999}
    @page{size:A4;margin:1.5cm}</style></head><body>
    <h1>🏫 سجل التقييم الأسبوعي — ${cls.name||cls.level+" / "+cls.section}</h1>
    <div class="sub">مدرسة عبيدة بن الحارث المتوسطة — الفصل ${cls.semester||"—"} — ${cls.teacher||""}</div>
    <table><thead><tr><th>م</th><th>اسم الطالب</th><th>آخر مستوى</th><th>التاريخ</th><th>الملاحظات</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div style="display:flex;gap:40px;margin-top:20px;font-size:10px">
      <div>توقيع المعلم: __________________</div>
      <div>توقيع مدير المدرسة: __________________</div>
      <div>التاريخ: __________________</div>
    </div>
    <div class="footer">بوابة مدرسة عبيدة بن الحارث الإلكترونية © ١٤٤٧هـ</div>
    </body></html>`);
  };

  return (
    <div>
      {/* بيانات الفصل */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "#1B3A6B" }}>
          <span className="font-bold text-white text-sm">📋 بيانات الفصل والمعلم</span>
          <button onClick={() => setEditInfo(!editInfo)} className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-lg font-bold">
            {editInfo ? "✕ إلغاء" : "✏️ تعديل"}
          </button>
        </div>
        {editInfo ? (
          <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div><label className={cx.label}>المستوى</label>
              <select value={info.level} onChange={e => setInfo(p => ({ ...p, level: e.target.value }))} className={cx.input}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select></div>
            <div><label className={cx.label}>الشعبة</label>
              <select value={info.section} onChange={e => setInfo(p => ({ ...p, section: e.target.value }))} className={cx.input}>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label className={cx.label}>اسم المعلم</label>
              <input type="text" value={info.teacher} placeholder="اكتب الاسم" onChange={e => setInfo(p => ({ ...p, teacher: e.target.value }))} className={cx.input} /></div>
            <div><label className={cx.label}>الفصل الدراسي</label>
              <select value={info.semester} onChange={e => setInfo(p => ({ ...p, semester: e.target.value }))} className={cx.input}>
                <option>الأول</option><option>الثاني</option><option>الثالث</option>
              </select></div>
            <div className="col-span-2 sm:col-span-4">
              <button onClick={saveInfo} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700">💾 حفظ</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 px-4 py-3 text-sm">
            <span className="text-gray-600">🎓 <b>{cls.level} / {cls.section}</b></span>
            <span className="text-gray-600">👨‍🏫 <b>{cls.teacher || "—"}</b></span>
            <span className="text-gray-600">📅 الفصل <b>{cls.semester || "—"}</b></span>
            <span className="text-gray-600">👨‍🎓 <b>{cls.students.filter(s => s.name).length}</b> طالب</span>
          </div>
        )}
      </div>

      {/* أدوات */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input type="text" placeholder="🔍 بحث عن طالب..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-40 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm bg-white" />
        <button onClick={addStudent} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700">+ طالب</button>
        <button onClick={() => addMany(5)} className="bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold">+ 5</button>
        <button onClick={() => addMany(43)} className="bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold">+ كامل</button>
        <button onClick={() => setShowImport(true)} className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700">📊 إكسل</button>
        <button onClick={handlePrint} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold">🖨️ طباعة</button>
      </div>
      {showImport && <ExcelImportModal onImport={handleExcelImport} onClose={() => setShowImport(false)} />}

      {/* قائمة الطلاب */}
      {cls.students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-blue-200">
          <div className="text-5xl mb-3">👨‍🎓</div>
          <div className="font-bold text-gray-500 mb-3">لا يوجد طلاب في هذا الفصل بعد</div>
          <div className="flex gap-2 justify-center flex-wrap">
            <button onClick={addStudent} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold">+ إضافة طالب</button>
            <button onClick={() => addMany(43)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold">+ إضافة فصل كامل</button>
          </div>
        </div>
      ) : (
        <div>
          {/* بطاقات التقييم الأسبوعي */}
          <div className="mb-2 flex items-center justify-between">
            <div className="font-black text-gray-700 text-sm">📊 التقييمات الأسبوعية ({filtered.length} طالب)</div>
            <div className="flex gap-1.5 flex-wrap">
              {EVAL_LEVELS.slice(1).map(l => (
                <span key={l.value} className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: l.bg, color: l.color }}>{l.label}</span>
              ))}
            </div>
          </div>
          {filtered.map(s => (
            <StudentEvalCard key={s.id} student={s} onUpdate={updateStudent} onDelete={removeStudent} onSendNote={onSendNote} messages={messages} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentsPage({ classList, setClassList, saveClass, deleteClass, teacherMode, teacherName, onSendNote, messages }) {
  const [activeId, setActiveId] = useState(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newLevel, setNewLevel] = useState("الصف الأول");
  const [newSection, setNewSection] = useState("أ");
  const [searchQuery, setSearchQuery] = useState("");

  const activeClass = classList.find(c => c.id === activeId) || null;

  // تحميل الفصل الجاهز من ملف الإكسل
  const loadPreloadedClass = async () => {
    const already = classList.find(c => c.id === PRELOADED_CLASS.id);
    if (already) { setActiveId(PRELOADED_CLASS.id); return; }
    const updated = [...classList, PRELOADED_CLASS];
    setClassList(updated);
    await saveClass(PRELOADED_CLASS);
    await DB.set("school-class-list", updated.map(c => ({ id: c.id, name: c.name, level: c.level, section: c.section, teacher: c.teacher, semester: c.semester })));
    setActiveId(PRELOADED_CLASS.id);
  };

  const addNewClass = () => {
    const exists = classList.find(c => c.level === newLevel && c.section === newSection);
    if (exists) { alert("هذا الفصل موجود بالفعل!"); return; }
    const id = `cls-${Date.now()}`;
    const cls = { ...newClass(id), level: newLevel, section: newSection, name: `${newLevel} / ${newSection}` };
    const updated = [...classList, cls];
    setClassList(updated);
    saveClass(cls);
    DB.set("school-class-list", updated.map(c => ({ id: c.id, name: c.name, level: c.level, section: c.section, teacher: c.teacher, semester: c.semester })));
    setActiveId(id);
    setShowAddClass(false);
  };

  const handleUpdateClass = (updated) => {
    setClassList(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleSaveClass = (cls) => {
    saveClass(cls);
    DB.set("school-class-list", classList.map(c =>
      c.id === cls.id
        ? { id: cls.id, name: cls.name, level: cls.level, section: cls.section, teacher: cls.teacher, semester: cls.semester }
        : { id: c.id, name: c.name, level: c.level, section: c.section, teacher: c.teacher, semester: c.semester }
    ));
  };

  const handleDeleteClass = (id) => {
    if (!confirm("هل تريد حذف هذا الفصل وجميع بياناته؟")) return;
    const updated = classList.filter(c => c.id !== id);
    setClassList(updated);
    deleteClass(id);
    DB.set("school-class-list", updated.map(c => ({ id: c.id, name: c.name, level: c.level, section: c.section, teacher: c.teacher, semester: c.semester })));
    if (activeId === id) setActiveId(updated[0]?.id || null);
  };

  // إحصائيات إجمالية
  const totalStudents = classList.reduce((acc, c) => acc + c.students.filter(s => s.name).length, 0);
  const levelGroups = LEVELS.map(l => ({
    label: l, count: classList.filter(c => c.level === l).reduce((a, c) => a + c.students.filter(s => s.name).length, 0)
  }));

  const filteredClasses = searchQuery ? classList.filter(c =>
    c.level.includes(searchQuery) || c.section.includes(searchQuery) || c.teacher?.includes(searchQuery)
  ) : classList;

  return (
    <div>
      {/* العنوان */}
      <div className="rounded-3xl p-6 mb-5 text-white text-center shadow-xl"
        style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2E6DA4 60%, #1a8fe3 100%)" }}>
        <div className="text-4xl mb-2">👨‍🎓</div>
        <h2 className="text-2xl font-black mb-1">سجل تقييم الطلاب</h2>
        <p className="opacity-80 text-sm">للعام الدراسي ١٤٤٧هـ — مدرسة عبيدة بن الحارث المتوسطة</p>
        <div className="flex justify-center gap-4 mt-3 text-sm opacity-90">
          <span>📚 {classList.length} فصل</span>
          <span>👨‍🎓 {totalStudents} طالب</span>
        </div>
      </div>

      {/* زر تحميل الفصل الجاهز */}
      {!classList.find(c => c.id === PRELOADED_CLASS.id) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-5 text-center">
          <div className="text-3xl mb-2">📥</div>
          <div className="font-black text-amber-800 text-lg mb-1">لديك فصل جاهز من ملف الإكسل!</div>
          <div className="text-amber-700 text-sm mb-4">الصف الأول / أ — 25 طالباً بأسمائهم وأرقام هوياتهم</div>
          <button onClick={loadPreloadedClass}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-black text-base shadow-md hover:shadow-lg transition-all">
            📥 تحميل الفصل الأول / أ (25 طالب)
          </button>
        </div>
      )}

      {/* إحصائيات المستويات */}
      {classList.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {levelGroups.map((l, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-blue-100">
              <div className="text-lg font-black text-blue-800">{l.count}</div>
              <div className="text-xs text-gray-500 font-bold">{l.label}</div>
              <div className="text-xs text-gray-400">{classList.filter(c => c.level === l.label).length} فصول</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {/* القائمة الجانبية للفصول */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
            <div className="px-3 py-3 font-bold text-white text-sm flex items-center justify-between" style={{ background: "#1B3A6B" }}>
              <span>📚 الفصول ({classList.length})</span>
            </div>
            {/* بحث */}
            <div className="p-2 border-b border-gray-100">
              <input type="text" placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-blue-400" />
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredClasses.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-6">لا توجد فصول</div>
              )}
              {LEVELS.map(level => {
                const levelCls = filteredClasses.filter(c => c.level === level);
                if (levelCls.length === 0) return null;
                return (
                  <div key={level}>
                    <div className="px-3 py-1.5 text-xs font-black text-blue-700 bg-blue-50 border-b border-blue-100">{level}</div>
                    {levelCls.map(cls => (
                      <div key={cls.id}
                        className={`flex items-center justify-between px-3 py-2.5 cursor-pointer border-b border-gray-50 group transition-colors ${activeId === cls.id ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}
                        onClick={() => setActiveId(cls.id)}>
                        <div>
                          <div className={`text-xs font-bold ${activeId === cls.id ? "text-white" : "text-gray-800"}`}>
                            شعبة {cls.section}
                          </div>
                          <div className={`text-xs ${activeId === cls.id ? "text-blue-200" : "text-gray-400"}`}>
                            {cls.students.filter(s => s.name).length} طالب
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                          className={`text-xs w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${activeId === cls.id ? "bg-blue-500 text-white hover:bg-red-400" : "bg-red-50 text-red-400 hover:bg-red-100"}`}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            {/* إضافة فصل */}
            <div className="p-2 border-t border-gray-100">
              {!showAddClass ? (
                <button onClick={() => setShowAddClass(true)}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700">
                  + إضافة فصل
                </button>
              ) : (
                <div className="space-y-2">
                  <select value={newLevel} onChange={e => setNewLevel(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select value={newSection} onChange={e => setNewSection(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none">
                    {SECTIONS.map(s => <option key={s} value={s}>شعبة {s}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <button onClick={addNewClass} className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-xs font-bold">إضافة</button>
                    <button onClick={() => setShowAddClass(false)} className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-bold">إلغاء</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* محتوى الفصل المختار */}
        <div className="flex-1 min-w-0">
          {!activeClass ? (
            <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-blue-200">
              <div className="text-6xl mb-4">📚</div>
              <div className="font-black text-gray-500 text-lg mb-2">اختر فصلاً أو أضف فصلاً جديداً</div>
              <p className="text-gray-400 text-sm mb-5">يمكنك إضافة فصول لكل مستوى بشكل منفصل وحفظ بيانات كل فصل مستقلاً</p>
              <button onClick={() => setShowAddClass(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">
                + إضافة أول فصل
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl font-black text-blue-900">{activeClass.level} / {activeClass.section}</div>
                {activeClass.teacher && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">👨‍🏫 {activeClass.teacher}</span>}
                {activeClass.semester && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">📅 الفصل {activeClass.semester}</span>}
              </div>
              <ClassTable
                cls={activeClass}
                onUpdateClass={handleUpdateClass}
                onSave={handleSaveClass}
                onSendNote={onSendNote}
                messages={messages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== صفحة رسائل وآراء أولياء الأمور =====
const MSG_RECIPIENTS = ["مدير المدرسة", "المعلم المسؤول", "الموجه الطلابي", "الجميع"];
const MSG_TYPES = [
  { value: "suggestion", label: "اقتراح", icon: "💡", color: "#dbeafe" },
  { value: "complaint",  label: "شكوى",  icon: "📣", color: "#fee2e2" },
  { value: "inquiry",    label: "استفسار",icon: "❓", color: "#fef9c3" },
  { value: "praise",     label: "إشادة", icon: "🌟", color: "#d1fae5" },
  { value: "message",    label: "رسالة",  icon: "✉️", color: "#ede9fe" },
];

function MessagesPage({ messages, setMessages, saveMessages, isParent, parentName }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ recipient: "مدير المدرسة", type: "suggestion", name: parentName || "", phone: "", text: "" });
  const [saved, setSaved] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterRecipient, setFilterRecipient] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const sendMsg = () => {
    if (!form.text.trim()) { alert("الرجاء كتابة نص الرسالة"); return; }
    const msg = { id: Date.now(), ...form, date: new Date().toLocaleDateString("ar-SA"), time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }), read: false, reply: "" };
    const updated = [msg, ...messages];
    setMessages(updated);
    saveMessages(updated);
    setForm({ recipient: "مدير المدرسة", type: "suggestion", name: parentName || "", phone: "", text: "" });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const markRead = (id) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    setMessages(updated); saveMessages(updated);
  };

  const sendReply = (id) => {
    if (!replyText.trim()) return;
    const updated = messages.map(m => m.id === id ? { ...m, reply: replyText, repliedAt: new Date().toLocaleDateString("ar-SA"), read: true } : m);
    setMessages(updated); saveMessages(updated);
    setReplyId(null); setReplyText("");
  };

  const deleteMsg = (id) => {
    if (!confirm("حذف هذه الرسالة؟")) return;
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated); saveMessages(updated);
  };

  const filtered = messages.filter(m => {
    if (filterType !== "all" && m.type !== filterType) return false;
    if (filterRecipient !== "all" && m.recipient !== filterRecipient) return false;
    if (searchQ && !m.text.includes(searchQ) && !m.name.includes(searchQ)) return false;
    return true;
  });

  const unread = messages.filter(m => !m.read).length;

  return (
    <div dir="rtl">
      {/* بانر الشراكة */}
      <div className="rounded-3xl overflow-hidden mb-6 shadow-xl" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #0ea5e9 100%)" }}>
        <div className="p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-7xl flex-shrink-0">🤝</div>
            <div className="text-center md:text-right flex-1">
              <h2 className="text-2xl font-black mb-2">شراكة الأسرة والمدرسة</h2>
              <p className="text-blue-100 leading-relaxed text-sm">
                تؤمن مدرسة عبيدة بن الحارث المتوسطة بأن نجاح الطالب يبدأ من شراكة حقيقية بين الأسرة والمدرسة.
                هذه المنصة جسر تواصل مفتوح بين أولياء الأمور والمدرسة — شاركونا آراءكم ومقترحاتكم واستفساراتكم،
                فأنتم شركاؤنا في بناء جيل واعٍ ومتميز.
              </p>
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                {["🎯 نستمع لكم", "💬 نردّ على رسائلكم", "🌱 نبني معاً", "🏆 أبناؤكم أولويتنا"].map(t => (
                  <span key={t} className="bg-white bg-opacity-20 px-3 py-1.5 rounded-full text-xs font-bold">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white bg-opacity-10 px-6 py-3 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {/* زر دعوة أولياء الأمور */}
            {!isParent && (
              <button onClick={() => {
                const link = "https://school-website1.vercel.app";
                const msg = encodeURIComponent(
                  `🏫 *مدرسة عبيدة بن الحارث المتوسطة*\n\n` +
                  `✉️ *بوابة التواصل مع الأسرة*\n\n` +
                  `أعزاءنا أولياء الأمور،\n` +
                  `يسعدنا إطلاق بوابة التواصل المدرسي حيث يمكنكم إرسال آرائكم ومقترحاتكم واستفساراتكم مباشرةً لإدارة المدرسة.\n\n` +
                  `👈 اضغط الرابط وأدخل رقم هوية الطالب:\n${link}\n\n` +
                  `_ثم اختر تبويب "رسالة" ✉️_`
                );
                window.open(`https://wa.me/?text=${msg}`, "_blank");
              }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow">
                <span className="text-base">📲</span> دعوة أولياء الأمور عبر واتساب
              </button>
            )}
            {saved && <span className="bg-green-400 text-white px-4 py-1.5 rounded-full text-sm font-black">✅ تم إرسال رسالتك بنجاح!</span>}
          </div>
        </div>
      </div>

      {/* زر إرسال رسالة */}
      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full mb-5 py-4 rounded-2xl text-white font-black text-base shadow-lg hover:shadow-xl transition-all"
          style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}>
          ✉️ إرسال رسالة / رأي / مقترح جديد
        </button>
      )}

      {/* نموذج الإرسال */}
      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-gray-800 text-lg">✉️ رسالة جديدة</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
          </div>
          <div className="space-y-4">
            {/* نوع الرسالة */}
            <div>
              <label className="text-xs font-black text-gray-600 mb-2 block">نوع الرسالة</label>
              <div className="flex gap-2 flex-wrap">
                {MSG_TYPES.map(t => (
                  <button key={t.value} onClick={() => setForm(p => ({ ...p, type: t.value }))}
                    className="px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                    style={{ background: form.type === t.value ? t.color : "#f9fafb", borderColor: form.type === t.value ? "#2563eb" : "#e5e7eb", color: form.type === t.value ? "#1e3a5f" : "#9ca3af" }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            {/* الجهة المرسل إليها */}
            <div>
              <label className="text-xs font-black text-gray-600 mb-2 block">الرسالة موجهة إلى</label>
              <select value={form.recipient} onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400 focus:outline-none font-bold"
                style={{ fontFamily: "inherit" }}>
                {MSG_RECIPIENTS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {/* الاسم والجوال */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-gray-600 mb-1 block">الاسم (اختياري)</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="اسم ولي الأمر"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                  style={{ fontFamily: "inherit" }} />
              </div>
              <div>
                <label className="text-xs font-black text-gray-600 mb-1 block">رقم التواصل (اختياري)</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="05xxxxxxxx" dir="ltr"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400 focus:outline-none text-right"
                  style={{ fontFamily: "inherit" }} />
              </div>
            </div>
            {/* نص الرسالة */}
            <div>
              <label className="text-xs font-black text-gray-600 mb-1 block">نص الرسالة / الرأي / الاقتراح *</label>
              <textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                rows={5} placeholder="اكتب رسالتك هنا..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400 focus:outline-none resize-none"
                style={{ fontFamily: "inherit" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={sendMsg}
                className="flex-1 py-3 rounded-xl text-white font-black hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}>
                📤 إرسال الرسالة
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* فلاتر وبحث — للإدارة فقط */}
      {!isParent && messages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 بحث..."
              className="flex-1 min-w-32 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" style={{ fontFamily: "inherit" }}>
              <option value="all">جميع الأنواع</option>
              {MSG_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
            <select value={filterRecipient} onChange={e => setFilterRecipient(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" style={{ fontFamily: "inherit" }}>
              <option value="all">جميع الجهات</option>
              {MSG_RECIPIENTS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* قائمة الرسائل */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-blue-100">
          <div className="text-5xl mb-3">📬</div>
          <div className="font-bold text-gray-400">لا توجد رسائل بعد — كن أول من يشارك!</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(msg => {
            // ملاحظات المعلم — عرض خاص
            if (msg.type === "teacher_note") return (
              <div key={msg.id} className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all"
                style={{ borderColor: msg.read ? "#fcd34d" : "#f59e0b" }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📨</span>
                    <span className="font-black text-amber-800 text-sm">ملاحظة معلم</span>
                    <span className="text-xs text-amber-700 bg-white bg-opacity-70 px-2 py-0.5 rounded-full font-bold">→ {msg.studentName || "طالب"}</span>
                    {!msg.read && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">جديد</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-700">
                    <span>{msg.time} | {msg.date}</span>
                    {!isParent && (
                      <>
                        {!msg.read && <button onClick={() => markRead(msg.id)} className="text-amber-700 hover:text-amber-900 font-bold px-2 py-0.5 rounded-lg hover:bg-amber-100">✓ قراءة</button>}
                        <button onClick={() => deleteMsg(msg.id)} className="text-red-400 hover:text-red-600 px-1">🗑️</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs font-bold text-gray-500 mb-2">👨‍🏫 المعلم → طالب: {msg.studentName}{msg.studentId && ` (${msg.studentId})`}</div>
                  <p className="text-sm text-gray-800 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{msg.text}</p>
                  {msg.reply && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <div className="text-xs font-black text-blue-700 mb-1">💬 رد ولي الأمر — {msg.repliedAt}</div>
                      <p className="text-sm text-blue-800">{msg.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            );

            const t = MSG_TYPES.find(x => x.value === msg.type) || MSG_TYPES[4];
            return (
              <div key={msg.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all"
                style={{ borderColor: msg.read ? "#e5e7eb" : "#bfdbfe", borderWidth: msg.read ? 1 : 2 }}>
                {/* رأس الرسالة */}
                <div className="flex items-center justify-between px-4 py-3" style={{ background: t.color }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.icon}</span>
                    <span className="font-black text-gray-800 text-sm">{t.label}</span>
                    <span className="text-xs text-gray-500 bg-white bg-opacity-60 px-2 py-0.5 rounded-full">→ {msg.recipient}</span>
                    {!msg.read && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">جديد</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{msg.time} | {msg.date}</span>
                    {!isParent && (
                      <>
                        {!msg.read && <button onClick={() => markRead(msg.id)} className="text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 rounded-lg hover:bg-blue-50">✓ قراءة</button>}
                        <button onClick={() => deleteMsg(msg.id)} className="text-red-400 hover:text-red-600 px-1">🗑️</button>
                      </>
                    )}
                  </div>
                </div>
                {/* محتوى الرسالة */}
                <div className="px-4 py-3">
                  {msg.name && <div className="text-xs font-bold text-gray-500 mb-1">👤 {msg.name}{msg.phone && ` | 📞 ${msg.phone}`}</div>}
                  <p className="text-sm text-gray-800 leading-relaxed">{msg.text}</p>
                  {/* الرد */}
                  {msg.reply && (
                    <div className="mt-3 bg-teal-50 border border-teal-200 rounded-xl p-3">
                      <div className="text-xs font-black text-teal-700 mb-1">↩️ رد الإدارة — {msg.repliedAt}</div>
                      <p className="text-sm text-teal-800">{msg.reply}</p>
                    </div>
                  )}
                  {/* نموذج الرد للإدارة */}
                  {!isParent && !msg.reply && replyId === msg.id && (
                    <div className="mt-3 flex gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)}
                        placeholder="اكتب الرد هنا..."
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-teal-300 text-sm focus:outline-none focus:border-teal-500"
                        style={{ fontFamily: "inherit" }} />
                      <button onClick={() => sendReply(msg.id)} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700">إرسال</button>
                      <button onClick={() => setReplyId(null)} className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm font-bold">✕</button>
                    </div>
                  )}
                  {!isParent && !msg.reply && replyId !== msg.id && (
                    <button onClick={() => { setReplyId(msg.id); setReplyText(""); }}
                      className="mt-2 text-xs text-teal-600 font-bold hover:underline">↩️ ردّ على هذه الرسالة</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== صفحة الاستبيانات =====
const SURVEY_FIELD_TYPES = [
  { value: "text",     label: "نص حر",       icon: "✍️" },
  { value: "radio",    label: "اختيار واحد", icon: "🔘" },
  { value: "checkbox", label: "اختيار متعدد",icon: "☑️" },
  { value: "scale",    label: "تقييم 1-5",   icon: "⭐" },
  { value: "yesno",    label: "نعم / لا",    icon: "✅" },
];
const SURVEY_THEMES = [
  { name: "أزرق",     header: "#1e3a5f", accent: "#2563eb", bg: "#eff6ff" },
  { name: "أخضر",    header: "#064e3b", accent: "#059669", bg: "#ecfdf5" },
  { name: "بنفسجي",  header: "#4c1d95", accent: "#7c3aed", bg: "#f5f3ff" },
  { name: "برتقالي", header: "#7c2d12", accent: "#ea580c", bg: "#fff7ed" },
  { name: "وردي",    header: "#831843", accent: "#db2777", bg: "#fdf2f8" },
  { name: "رمادي",   header: "#1f2937", accent: "#374151", bg: "#f9fafb" },
];
const SURVEY_FONTS = ["Tajawal","Cairo","Noto Naskh Arabic","Noto Kufi Arabic","Amiri","Reem Kufi"];
const SURVEY_TARGETS = ["أولياء الأمور","المعلمون","الطلاب","الجميع"];
const SURVEY_FACES = ["","😊","😁","🙂","😐","😕","😞","⭐","👍","👎","💪","🔥","💯","🌟"];

function newField() {
  return { id: Date.now() + Math.random() * 1000 | 0, type: "radio", label: "", options: ["خيار 1","خيار 2"], required: true, emoji: "", fontSize: "text-sm" };
}
function newSurvey() {
  return { id: Date.now(), title: "", description: "", target: "أولياء الأمور", theme: 0, font: "Tajawal", fields: [], active: true, responses: [], createdAt: new Date().toLocaleDateString("ar-SA") };
}

function SurveyBuilder({ survey, onSave, onCancel }) {
  const [s, setS] = useState({ ...survey });
  const [editingField, setEditingField] = useState(null);

  const theme = SURVEY_THEMES[s.theme];

  const addField = () => {
    const f = newField();
    setS(p => ({ ...p, fields: [...p.fields, f] }));
    setEditingField(f.id);
  };

  const updateField = (id, changes) => setS(p => ({ ...p, fields: p.fields.map(f => f.id === id ? { ...f, ...changes } : f) }));
  const removeField = (id) => setS(p => ({ ...p, fields: p.fields.filter(f => f.id !== id) }));
  const moveField = (id, dir) => {
    const idx = s.fields.findIndex(f => f.id === id);
    if (idx + dir < 0 || idx + dir >= s.fields.length) return;
    const arr = [...s.fields];
    [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
    setS(p => ({ ...p, fields: arr }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* رأس البناء */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: theme.header }}>
        <span className="font-black text-white text-lg">🛠️ {survey.id ? "تعديل الاستبيان" : "استبيان جديد"}</span>
        <div className="flex gap-2">
          <button onClick={() => onSave(s)} className="bg-green-400 text-white px-4 py-2 rounded-xl text-sm font-black hover:bg-green-500">💾 حفظ</button>
          <button onClick={onCancel} className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-opacity-30">✕ إلغاء</button>
        </div>
      </div>

      <div className="p-5 space-y-5" style={{ background: theme.bg, fontFamily: s.font }}>
        {/* معلومات الاستبيان */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <h4 className="font-black text-gray-700 text-sm mb-3">📋 معلومات الاستبيان</h4>
          <input value={s.title} onChange={e => setS(p => ({ ...p, title: e.target.value }))}
            placeholder="عنوان الاستبيان *" style={{ fontFamily: s.font }}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-base font-black focus:outline-none focus:border-blue-400" />
          <textarea value={s.description} onChange={e => setS(p => ({ ...p, description: e.target.value }))}
            rows={2} placeholder="وصف أو مقدمة الاستبيان (اختياري)" style={{ fontFamily: s.font }}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className={cx.label}>الفئة المستهدفة</label>
              <select value={s.target} onChange={e => setS(p => ({ ...p, target: e.target.value }))} style={{ fontFamily: s.font }}
                className={cx.input}>
                {SURVEY_TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={cx.label}>الخط</label>
              <select value={s.font} onChange={e => setS(p => ({ ...p, font: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none">
                {SURVEY_FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={cx.label}>لون الاستبيان</label>
              <div className="flex gap-1.5">
                {SURVEY_THEMES.map((t, i) => (
                  <button key={i} onClick={() => setS(p => ({ ...p, theme: i }))}
                    className="w-8 h-8 rounded-full border-4 transition-all"
                    title={t.name}
                    style={{ background: t.accent, borderColor: s.theme === i ? "#fff" : "transparent", outline: s.theme === i ? `2px solid ${t.accent}` : "none" }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* الحقول */}
        <div className="space-y-3">
          {s.fields.map((field, fi) => (
            <div key={field.id} className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden"
              style={{ borderColor: editingField === field.id ? theme.accent : "#e5e7eb" }}>
              {/* رأس الحقل */}
              <div className="flex items-center justify-between px-4 py-2.5" style={{ background: editingField === field.id ? theme.accent : "#f9fafb" }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{SURVEY_FIELD_TYPES.find(t => t.value === field.type)?.icon}</span>
                  <span className={`font-bold text-sm ${editingField === field.id ? "text-white" : "text-gray-700"}`}>
                    {field.label || `سؤال ${fi + 1}`}
                  </span>
                  {field.emoji && <span className="text-base">{field.emoji}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => moveField(field.id, -1)} className="text-gray-400 hover:text-gray-600 px-1 text-sm">↑</button>
                  <button onClick={() => moveField(field.id,  1)} className="text-gray-400 hover:text-gray-600 px-1 text-sm">↓</button>
                  <button onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${editingField === field.id ? "bg-white text-gray-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
                    {editingField === field.id ? "✕ إغلاق" : "✏️ تعديل"}
                  </button>
                  <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-600 px-1 text-sm">🗑️</button>
                </div>
              </div>

              {/* تعديل الحقل */}
              {editingField === field.id && (
                <div className="p-4 space-y-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <label className={cx.label}>نص السؤال</label>
                      <input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })}
                        placeholder="اكتب السؤال..." style={{ fontFamily: s.font }}
                        className={cx.input} />
                    </div>
                    <div>
                      <label className={cx.label}>نوع الإجابة</label>
                      <select value={field.type} onChange={e => updateField(field.id, { type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none">
                        {SURVEY_FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={cx.label}>حجم الخط</label>
                      <select value={field.fontSize || "text-sm"} onChange={e => updateField(field.id, { fontSize: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none">
                        <option value="text-xs">صغير</option>
                        <option value="text-sm">متوسط</option>
                        <option value="text-base">كبير</option>
                        <option value="text-lg">كبير جداً</option>
                      </select>
                    </div>
                  </div>
                  {/* إيموجي */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">رمز تعبيري</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {SURVEY_FACES.map(f => (
                        <button key={f} onClick={() => updateField(field.id, { emoji: f === field.emoji ? "" : f })}
                          className="w-8 h-8 rounded-lg text-base flex items-center justify-center border-2 transition-all"
                          style={{ background: field.emoji === f ? "#dbeafe" : "#f3f4f6", borderColor: field.emoji === f ? "#3b82f6" : "transparent" }}>
                          {f || "✕"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* خيارات radio/checkbox */}
                  {(field.type === "radio" || field.type === "checkbox") && (
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-2 block">الخيارات</label>
                      <div className="space-y-2">
                        {(field.options || []).map((opt, oi) => (
                          <div key={oi} className="flex gap-2 items-center">
                            <span className="text-gray-400 text-xs w-4">{oi + 1}</span>
                            <input value={opt} onChange={e => { const opts = [...field.options]; opts[oi] = e.target.value; updateField(field.id, { options: opts }); }}
                              style={{ fontFamily: s.font }}
                              className="flex-1 px-3 py-1.5 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                            <button onClick={() => updateField(field.id, { options: field.options.filter((_, i) => i !== oi) })}
                              className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
                          </div>
                        ))}
                        <button onClick={() => updateField(field.id, { options: [...(field.options || []), `خيار ${(field.options?.length || 0) + 1}`] })}
                          className="text-blue-600 text-xs font-bold hover:underline">+ إضافة خيار</button>
                      </div>
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} />
                    <span className="font-bold text-gray-600">إجباري</span>
                  </label>
                </div>
              )}

              {/* معاينة الحقل */}
              {editingField !== field.id && field.label && (
                <div className="px-4 py-3">
                  <div className={`font-bold text-gray-700 mb-2 flex items-center gap-2 ${field.fontSize || "text-sm"}`} style={{ fontFamily: s.font }}>
                    {field.emoji && <span>{field.emoji}</span>}
                    {field.label}
                    {field.required && <span className="text-red-500 text-xs">*</span>}
                  </div>
                  {field.type === "text" && <div className="h-9 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50" />}
                  {(field.type === "radio" || field.type === "checkbox") && (
                    <div className="flex flex-wrap gap-2">
                      {(field.options || []).map((o, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full text-xs border-2 border-gray-200 text-gray-500" style={{ fontFamily: s.font }}>{o}</span>
                      ))}
                    </div>
                  )}
                  {field.type === "scale" && (
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => <span key={n} className="w-9 h-9 rounded-xl border-2 border-gray-200 text-gray-400 text-sm flex items-center justify-center font-bold">{"⭐".repeat(n).slice(-1)}{n}</span>)}
                    </div>
                  )}
                  {field.type === "yesno" && (
                    <div className="flex gap-2">
                      <span className="px-5 py-2 rounded-xl border-2 border-green-200 text-green-600 text-sm font-bold">✅ نعم</span>
                      <span className="px-5 py-2 rounded-xl border-2 border-red-200 text-red-500 text-sm font-bold">❌ لا</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* زر إضافة سؤال */}
        <button onClick={addField}
          className="w-full py-3 rounded-2xl border-2 border-dashed font-black text-sm hover:opacity-90 transition-all"
          style={{ borderColor: theme.accent, color: theme.accent, background: theme.bg }}>
          ➕ إضافة سؤال جديد
        </button>
      </div>
    </div>
  );
}

function SurveyRespond({ survey, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const theme = SURVEY_THEMES[survey.theme ?? 0];

  const setAns = (fid, val) => setAnswers(p => ({ ...p, [fid]: val }));
  const toggleCheck = (fid, opt) => {
    const cur = answers[fid] || [];
    setAns(fid, cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt]);
  };

  const submit = () => {
    const missing = survey.fields.filter(f => f.required && !answers[f.id]);
    if (missing.length > 0) { alert(`يرجى الإجابة على: ${missing.map(f => f.label).join("، ")}`); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="font-black text-gray-800 text-xl mb-2">شكراً لمشاركتك!</h3>
      <p className="text-gray-500 text-sm mb-5">تم استلام إجابتك بنجاح وسيتم مراجعتها من قِبل الإدارة</p>
      <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ background: theme.accent }}>العودة</button>
    </div>
  );

  return (
    <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100" style={{ background: theme.bg, fontFamily: survey.font || "Tajawal" }}>
      <div className="px-6 py-5 text-white" style={{ background: `linear-gradient(135deg, ${theme.header}, ${theme.accent})` }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black text-xl mb-1">{survey.title}</h3>
            {survey.description && <p className="opacity-80 text-sm">{survey.description}</p>}
          </div>
          <button onClick={onClose} className="text-white opacity-60 hover:opacity-100 text-xl font-bold flex-shrink-0">✕</button>
        </div>
        <div className="mt-3 flex gap-3 text-xs opacity-80">
          <span>👥 {survey.target}</span>
          <span>📅 {survey.createdAt}</span>
          <span>❓ {survey.fields.length} سؤال</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {survey.fields.map((field, fi) => (
          <div key={field.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`font-bold text-gray-800 mb-3 flex items-center gap-2 ${field.fontSize || "text-sm"}`}>
              {field.emoji && <span className="text-lg">{field.emoji}</span>}
              <span>{fi + 1}. {field.label}</span>
              {field.required && <span className="text-red-500 text-xs mr-1">*</span>}
            </div>
            {field.type === "text" && (
              <textarea rows={3} value={answers[field.id] || ""} onChange={e => setAns(field.id, e.target.value)}
                placeholder="اكتب إجابتك هنا..."
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none resize-none"
                style={{ borderColor: answers[field.id] ? theme.accent : undefined, fontFamily: survey.font }} />
            )}
            {(field.type === "radio") && (
              <div className="space-y-2">
                {(field.options || []).map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl border-2 transition-all hover:border-blue-200"
                    style={{ borderColor: answers[field.id] === opt ? theme.accent : "#e5e7eb", background: answers[field.id] === opt ? theme.bg : "white" }}>
                    <input type="radio" name={`f${field.id}`} value={opt} checked={answers[field.id] === opt} onChange={() => setAns(field.id, opt)} className="sr-only" />
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: answers[field.id] === opt ? theme.accent : "#d1d5db", background: answers[field.id] === opt ? theme.accent : "white" }}>
                      {answers[field.id] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: survey.font }}>{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {(field.type === "checkbox") && (
              <div className="space-y-2">
                {(field.options || []).map(opt => {
                  const checked = (answers[field.id] || []).includes(opt);
                  return (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl border-2 transition-all hover:border-blue-200"
                      style={{ borderColor: checked ? theme.accent : "#e5e7eb", background: checked ? theme.bg : "white" }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleCheck(field.id, opt)} className="sr-only" />
                      <div className="w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: checked ? theme.accent : "#d1d5db", background: checked ? theme.accent : "white" }}>
                        {checked && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <span className="text-sm font-medium text-gray-700" style={{ fontFamily: survey.font }}>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {field.type === "scale" && (
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setAns(field.id, n)}
                    className="flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all"
                    style={{ borderColor: answers[field.id] === n ? theme.accent : "#e5e7eb", background: answers[field.id] === n ? theme.accent : "white", color: answers[field.id] === n ? "white" : "#374151" }}>
                    {"⭐".repeat(n)}
                  </button>
                ))}
              </div>
            )}
            {field.type === "yesno" && (
              <div className="flex gap-3">
                {[["نعم","✅","#dcfce7","#16a34a"], ["لا","❌","#fee2e2","#dc2626"]].map(([opt, icon, bg, col]) => (
                  <button key={opt} onClick={() => setAns(field.id, opt)}
                    className="flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all"
                    style={{ borderColor: answers[field.id] === opt ? col : "#e5e7eb", background: answers[field.id] === opt ? bg : "white", color: answers[field.id] === opt ? col : "#9ca3af" }}>
                    {icon} {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <button onClick={submit}
          className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg hover:shadow-xl transition-all"
          style={{ background: `linear-gradient(135deg, ${theme.header}, ${theme.accent})` }}>
          📤 إرسال الإجابات
        </button>
      </div>
    </div>
  );
}

function SurveysPage({ surveys, setSurveys, saveSurveys, isParent }) {
  const [mode, setMode] = useState("list");
  const [editing, setEditing] = useState(null);
  const [responding, setResponding] = useState(null);
  const [filterTarget, setFilterTarget] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [shareMsg, setShareMsg] = useState("");

  const BASE_URL = "https://school-website1.vercel.app";

  const getSurveyLink = (s) => `${BASE_URL}/?survey=${s.id}`;

  const copyLink = (s) => {
    const link = getSurveyLink(s);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const shareWhatsApp = (s) => {
    const link = getSurveyLink(s);
    const msg = encodeURIComponent(
      `🏫 *مدرسة عبيدة بن الحارث المتوسطة*\n\n` +
      `📊 *${s.title}*\n` +
      (s.description ? `${s.description}\n\n` : `\n`) +
      `👥 موجّه إلى: ${s.target}\n\n` +
      `📝 للمشاركة في الاستبيان اضغط الرابط:\n${link}\n\n` +
      `_أدخل رقم هوية الطالب للوصول_`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const shareMsgPage = () => {
    const link = BASE_URL;
    const msg = encodeURIComponent(
      `🏫 *مدرسة عبيدة بن الحارث المتوسطة*\n\n` +
      `✉️ *بوابة التواصل مع المدرسة*\n\n` +
      `يمكنكم الآن إرسال آرائكم ومقترحاتكم واستفساراتكم مباشرةً إلى إدارة المدرسة\n\n` +
      `👈 اضغط الرابط وأدخل رقم هوية الطالب:\n${link}\n\n` +
      `_ثم اختر تبويب "رسالة" 📩_`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const saveSurvey = (s) => {
    const exists = surveys.find(x => x.id === s.id);
    const updated = exists ? surveys.map(x => x.id === s.id ? s : x) : [s, ...surveys];
    setSurveys(updated); saveSurveys(updated); setMode("list"); setEditing(null);
  };
  const deleteSurvey = (id) => {
    if (!confirm("حذف هذا الاستبيان نهائياً؟")) return;
    const updated = surveys.filter(s => s.id !== id);
    setSurveys(updated); saveSurveys(updated);
  };
  const toggleActive = (id) => {
    const updated = surveys.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSurveys(updated); saveSurveys(updated);
  };

  const filtered = surveys.filter(s => {
    if (isParent && !s.active) return false;
    if (filterTarget !== "all" && s.target !== filterTarget && s.target !== "الجميع") return false;
    return true;
  });

  const newSurveyCount = surveys.filter(s => s.active).length;

  if (mode === "build") return (
    <SurveyBuilder survey={editing || newSurvey()} onSave={saveSurvey} onCancel={() => { setMode("list"); setEditing(null); }} />
  );
  if (mode === "respond" && responding) return (
    <SurveyRespond survey={responding} onClose={() => { setMode("list"); setResponding(null); }} />
  );

  return (
    <div dir="rtl">
      {/* رأس الصفحة */}
      <div className="rounded-3xl overflow-hidden mb-6 shadow-xl" style={{ background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a78bfa 100%)" }}>
        <div className="p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-7xl flex-shrink-0">📊</div>
            <div className="text-center md:text-right flex-1">
              <h2 className="text-2xl font-black mb-2">الاستبيانات والاستطلاعات</h2>
              <p className="text-purple-100 text-sm leading-relaxed">
                منصة متكاملة لإنشاء استبيانات احترافية وجمع آراء أولياء الأمور والمعلمين والطلاب
                — شاركونا في تطوير بيئتنا التعليمية
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white bg-opacity-10 px-6 py-3 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-4 text-white text-sm">
            <span>📋 إجمالي الاستبيانات: <b>{surveys.length}</b></span>
            <span>✅ نشط: <b>{surveys.filter(s => s.active).length}</b></span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* زر مشاركة بوابة الرسائل عبر واتساب */}
            {!isParent && (
              <button onClick={shareMsgPage}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow">
                <span className="text-base">📲</span> دعوة أولياء الأمور للتواصل
              </button>
            )}
            {!isParent && (
              <button onClick={() => { setEditing(null); setMode("build"); }}
                className="bg-white text-purple-700 px-5 py-2 rounded-xl font-black text-sm hover:bg-purple-50 shadow">
                ➕ استبيان جديد
              </button>
            )}
          </div>
        </div>
      </div>

      {/* إشعار لولي الأمر عند وجود استبيانات نشطة */}
      {isParent && newSurveyCount > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-sm">
          <span className="text-2xl flex-shrink-0">🔔</span>
          <div>
            <div className="font-black text-amber-800 text-sm">يوجد {newSurveyCount} استبيان بانتظار مشاركتك!</div>
            <div className="text-amber-600 text-xs mt-0.5">رأيك يهمنا — شاركنا في تطوير بيئة أبنائنا التعليمية</div>
          </div>
        </div>
      )}

      {/* فلتر */}
      {!isParent && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", ...SURVEY_TARGETS].map(t => (
            <button key={t} onClick={() => setFilterTarget(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${filterTarget === t ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-500 border-gray-200"}`}>
              {t === "all" ? "الكل" : t}
            </button>
          ))}
        </div>
      )}

      {/* قائمة الاستبيانات */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-purple-100">
          <div className="text-5xl mb-3">📋</div>
          <div className="font-bold text-gray-400 mb-3">لا توجد استبيانات {isParent ? "متاحة" : "بعد"}</div>
          {!isParent && (
            <button onClick={() => setMode("build")} className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700">
              ➕ إنشاء أول استبيان
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(s => {
            const theme = SURVEY_THEMES[s.theme ?? 0];
            const link = getSurveyLink(s);
            return (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="px-5 py-4 text-white" style={{ background: `linear-gradient(135deg, ${theme.header}, ${theme.accent})` }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-black text-base leading-tight">{s.title || "استبيان بدون عنوان"}</h3>
                      {s.description && <p className="opacity-80 text-xs mt-1 line-clamp-2">{s.description}</p>}
                    </div>
                    {!s.active && <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0">متوقف</span>}
                  </div>
                  <div className="flex gap-3 mt-3 text-xs opacity-80">
                    <span>👥 {s.target}</span>
                    <span>❓ {s.fields.length} سؤال</span>
                    <span>📅 {s.createdAt}</span>
                  </div>
                </div>

                {/* رابط الاستبيان — للإدارة فقط */}
                {!isParent && (
                  <div className="px-4 pt-3 pb-1">
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                      <span className="text-xs text-gray-400 flex-1 truncate" dir="ltr">{link}</span>
                      <button onClick={() => copyLink(s)}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${copiedId === s.id ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
                        {copiedId === s.id ? "✓ تم" : "📋 نسخ"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="px-4 py-3 flex gap-2 flex-wrap">
                  <button onClick={() => { setResponding(s); setMode("respond"); }}
                    className="flex-1 py-2 rounded-xl text-white text-xs font-black hover:opacity-90 transition-all"
                    style={{ background: theme.accent }}>
                    📝 {isParent ? "ملء الاستبيان" : "معاينة"}
                  </button>
                  {!isParent && (
                    <>
                      {/* زر مشاركة واتساب */}
                      <button onClick={() => shareWhatsApp(s)}
                        className="px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-black hover:bg-green-100 flex items-center gap-1">
                        <span>📲</span> واتساب
                      </button>
                      <button onClick={() => { setEditing(s); setMode("build"); }}
                        className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200">✏️ تعديل</button>
                      <button onClick={() => toggleActive(s.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold ${s.active ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                        {s.active ? "⏸ إيقاف" : "▶ تفعيل"}
                      </button>
                      <button onClick={() => deleteSurvey(s.id)} className="px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnnouncementsPage({ announcements, setAnnouncements, saveAnnouncements }) {
  const [showForm, setShowForm] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", content: "", category: "إعلانات", priority: "عادي", bgColor: "", titleColor: "#1f2937", titleSize: "text-xl" });
  const [filter, setFilter] = useState("الكل");
  const [editId, setEditId] = useState(null);
  const [editAnn, setEditAnn] = useState(null);
  const categories = ["الكل", "تعاميم", "إعلانات", "تدريب", "اجتماعات"];
  const pColors = { "عاجل": "red", "مهم": "amber", "عادي": "teal" };
  const cIcons = { "تعاميم": "📜", "إعلانات": "📢", "تدريب": "🎓", "اجتماعات": "🤝" };
  const annBgColors = [
    { label: "بدون", value: "" }, { label: "أخضر", value: "#DCFCE7" },
    { label: "أزرق", value: "#DBEAFE" }, { label: "بنفسجي", value: "#F3E8FF" },
    { label: "وردي", value: "#FFE4E6" }, { label: "أصفر", value: "#FEF3C7" },
    { label: "تركوازي", value: "#CCFBF1" }, { label: "برتقالي", value: "#FFEDD5" },
    { label: "رمادي", value: "#F3F4F6" },
  ];
  const filtered = filter === "الكل" ? announcements : announcements.filter(a => a.category === filter);

  const add = () => {
    if (!newAnn.title || !newAnn.content) return;
    const u = [{ ...newAnn, id: Date.now(), date: new Date().toLocaleDateString("ar-SA-u-nu-arab", { year: "numeric", month: "2-digit", day: "2-digit" }), pinned: false }, ...announcements];
    setAnnouncements(u); saveAnnouncements(u);
    setNewAnn({ title: "", content: "", category: "إعلانات", priority: "عادي", bgColor: "", titleColor: "#1f2937", titleSize: "text-xl" }); setShowForm(false);
  };
  const del = (id) => { const u = announcements.filter(a => a.id !== id); setAnnouncements(u); saveAnnouncements(u); };
  const pin = (id) => { const u = announcements.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a); setAnnouncements(u); saveAnnouncements(u); };
  const startEdit = (ann) => { setEditId(ann.id); setEditAnn({ ...ann }); };
  const saveEdit = () => {
    const u = announcements.map(a => a.id === editId ? { ...editAnn } : a);
    setAnnouncements(u); saveAnnouncements(u); setEditId(null); setEditAnn(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-black text-teal-900">الإعلانات والتعاميم</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700">
          {showForm ? "✕ إلغاء" : "+ إعلان جديد"}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-teal-200 mb-6">
          <h3 className="font-bold text-teal-800 mb-4">إضافة إعلان جديد</h3>
          <div className="space-y-3">
            <input type="text" placeholder="عنوان الإعلان" value={newAnn.title} onChange={e => setNewAnn(p => ({...p, title: e.target.value}))}
              className={"w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none font-black " + (newAnn.titleSize||"text-xl")}
              style={{ color: newAnn.titleColor || "#1f2937" }} />
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-bold text-gray-500">🎨 لون العنوان:</span>
              {["#1f2937","#0d9488","#dc2626","#7c3aed","#d97706","#2563eb","#059669","#db2777"].map(c => (
                <button key={c} onClick={() => setNewAnn(p=>({...p,titleColor:c}))}
                  className={"w-7 h-7 rounded-full border-4 transition-transform hover:scale-110 " + (newAnn.titleColor===c?"border-gray-800 scale-110":"border-transparent")}
                  style={{backgroundColor:c}} />
              ))}
              <span className="text-xs font-bold text-gray-500 mr-2">📏 حجم العنوان:</span>
              {[{l:"صغير",v:"text-base"},{l:"متوسط",v:"text-xl"},{l:"كبير",v:"text-2xl"},{l:"كبير جداً",v:"text-3xl"}].map(s=>(
                <button key={s.v} onClick={()=>setNewAnn(p=>({...p,titleSize:s.v}))}
                  className={"px-2 py-1 rounded-lg text-xs font-bold border " + (newAnn.titleSize===s.v?"bg-teal-600 text-white border-teal-600":"bg-white text-gray-600 border-gray-200")}>
                  {s.l}
                </button>
              ))}
            </div>
            <RichEditor value={newAnn.content} onChange={v => setNewAnn(p => ({...p, content: v}))} />
            <div className="flex gap-3 flex-wrap items-center">
              <select value={newAnn.category} onChange={e => setNewAnn(p => ({...p, category: e.target.value}))}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none">
                {categories.filter(c => c !== "الكل").map(c => <option key={c} value={c}>{c}</option>)}</select>
              <select value={newAnn.priority} onChange={e => setNewAnn(p => ({...p, priority: e.target.value}))}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none">
                <option value="عادي">عادي</option><option value="مهم">مهم</option><option value="عاجل">عاجل</option></select>
              <select value={newAnn.bgColor || ""} onChange={e => setNewAnn(p => ({...p, bgColor: e.target.value}))}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none">
                {annBgColors.map(c => <option key={c.value} value={c.value}>🎨 {c.label}</option>)}</select>
              <button onClick={add} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700">نشر الإعلان</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${filter === cat ? "bg-teal-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
            {cat === "الكل" ? "📋 الكل" : `${cIcons[cat]} ${cat}`}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.sort((a,b) => (b.pinned?1:0)-(a.pinned?1:0)).map(ann => (
          <div key={ann.id} className={`rounded-2xl shadow-sm border-r-4 hover:shadow-md transition-all ${ann.priority === "عاجل" ? "border-red-500" : ann.priority === "مهم" ? "border-amber-500" : "border-teal-500"}`}
            style={{ backgroundColor: ann.bgColor || "#ffffff" }}>

            {/* وضع التعديل */}
            {editId === ann.id ? (
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-black text-teal-700">✏️ تعديل الإعلان</span>
                </div>
                {/* تعديل العنوان */}
                <input value={editAnn.title} onChange={e => setEditAnn(p => ({...p, title: e.target.value}))}
                  className={"w-full px-4 py-2.5 rounded-xl border-2 border-teal-300 focus:outline-none font-black " + (editAnn.titleSize||"text-xl")}
                  style={{color: editAnn.titleColor||"#1f2937"}} placeholder="العنوان" />
                <div className="flex gap-2 flex-wrap items-center">
                  <span className="text-xs font-bold text-gray-500">🎨 لون العنوان:</span>
                  {["#1f2937","#0d9488","#dc2626","#7c3aed","#d97706","#2563eb","#059669","#db2777"].map(c => (
                    <button key={c} onClick={() => setEditAnn(p=>({...p,titleColor:c}))}
                      className={"w-7 h-7 rounded-full border-4 transition-transform hover:scale-110 " + (editAnn.titleColor===c?"border-gray-800 scale-110":"border-transparent")}
                      style={{backgroundColor:c}} />
                  ))}
                  <span className="text-xs font-bold text-gray-500 mr-2">📏 حجم:</span>
                  {[{l:"صغير",v:"text-base"},{l:"متوسط",v:"text-xl"},{l:"كبير",v:"text-2xl"},{l:"كبير جداً",v:"text-3xl"}].map(s=>(
                    <button key={s.v} onClick={()=>setEditAnn(p=>({...p,titleSize:s.v}))}
                      className={"px-2 py-1 rounded-lg text-xs font-bold border " + (editAnn.titleSize===s.v?"bg-teal-600 text-white border-teal-600":"bg-white text-gray-600 border-gray-200")}>
                      {s.l}
                    </button>
                  ))}
                </div>
                {/* تعديل المحتوى */}
                <RichEditor value={editAnn.content} onChange={v => setEditAnn(p => ({...p, content: v}))} />
                {/* تعديل الخيارات */}
                <div className="flex gap-2 flex-wrap items-center">
                  <select value={editAnn.category} onChange={e => setEditAnn(p => ({...p, category: e.target.value}))}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white">
                    {categories.filter(c => c !== "الكل").map(c => <option key={c}>{c}</option>)}</select>
                  <select value={editAnn.priority} onChange={e => setEditAnn(p => ({...p, priority: e.target.value}))}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white">
                    <option>عادي</option><option>مهم</option><option>عاجل</option></select>
                  {/* لون خلفية البطاقة */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-gray-500 font-bold">🎨 خلفية البطاقة:</span>
                    {annBgColors.map(c => (
                      <button key={c.value} onClick={() => setEditAnn(p => ({...p, bgColor: c.value}))}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${editAnn.bgColor === c.value ? "border-teal-500 scale-110" : "border-gray-300"}`}
                        style={{ backgroundColor: c.value || "#fff" }} title={c.label}>
                        {!c.value && <span className="text-xs text-gray-400 leading-none">✕</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="bg-teal-600 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-teal-700">💾 حفظ التعديلات</button>
                  <button onClick={() => { setEditId(null); setEditAnn(null); }} className="border border-gray-200 text-gray-500 font-bold px-4 py-2 rounded-xl text-sm">إلغاء</button>
                </div>
              </div>
            ) : (
              /* وضع العرض */
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{cIcons[ann.category] || "📌"}</span>
                    <h3 className={"font-bold " + (ann.titleSize||"text-lg")} style={{color: ann.titleColor||"#1f2937"}}>{ann.title}</h3>
                    {ann.pinned && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">📌 مثبّت</span>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                    <button onClick={() => { const url = window.location.origin + window.location.pathname + "#ann-" + ann.id; navigator.clipboard.writeText(url).then(() => alert("✅ تم نسخ الرابط!\n" + url)); }} className="text-xs px-2 py-1.5 rounded-lg hover:bg-green-50 text-green-600 font-bold border border-green-100">🔗 رابط</button>
                    <button onClick={() => startEdit(ann)} className="text-xs px-2 py-1.5 rounded-lg hover:bg-blue-50 text-blue-500 font-bold border border-blue-100">✏️ تعديل</button>
                    <button onClick={() => pin(ann.id)} className="text-xs px-2 py-1.5 rounded-lg hover:bg-yellow-50 font-bold border border-gray-100">{ann.pinned ? "📌 إلغاء" : "📌"}</button>
                    <button onClick={() => del(ann.id)} className="text-xs px-2 py-1.5 rounded-lg hover:bg-red-50 text-red-500 font-bold border border-red-100">🗑️</button>
                  </div>
                </div>
                <div className="text-gray-700 text-sm leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: ann.content }}></div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{ann.date}</span>
                  <div className="flex gap-2"><Badge color="gray">{ann.category}</Badge><Badge color={pColors[ann.priority]}>{ann.priority}</Badge></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitiesPage({ activities, setActivities, saveActivities }) {
  const [f, setF] = useState("الكل");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editAct, setEditAct] = useState(null);
  const emptyAct = { title:"", description:"", type:"ثقافي", status:"قادم", date:"", responsible:"", image:"🎯" };
  const [newAct, setNewAct] = useState(emptyAct);

  const types = ["الكل", "ديني", "رياضي", "علمي", "ثقافي", "ترفيهي"];
  const tc = { "ديني":"green", "رياضي":"blue", "علمي":"purple", "ثقافي":"amber", "ترفيهي":"teal" };
  const sc = { "قادم":"bg-blue-100 text-blue-700", "جاري":"bg-green-100 text-green-700", "مكتمل":"bg-gray-100 text-gray-600" };
  const icons = ["🎯","📚","⚽","🔬","🎨","🎵","🏆","🌍","💡","🤝","🎉","🏫","🌱","🦁","🎭","🖥️","📖","🏅","🌟","🎤"];
  const filtered = f === "الكل" ? activities : activities.filter(a => a.type === f);

  const add = () => {
    if (!newAct.title) return;
    const u = [{ ...newAct, id: Date.now() }, ...activities];
    setActivities(u); saveActivities(u); setNewAct(emptyAct); setShowForm(false);
  };
  const del = (id) => { const u = activities.filter(a => a.id !== id); setActivities(u); saveActivities(u); };
  const startEdit = (act) => { setEditId(act.id); setEditAct({ ...act }); };
  const saveEdit = () => {
    const u = activities.map(a => a.id === editId ? { ...editAct } : a);
    setActivities(u); saveActivities(u); setEditId(null); setEditAct(null);
  };

  const ActForm = ({ data, setData, onSave, onCancel, saveLabel }) => (
    <div className="bg-white rounded-2xl p-5 border border-teal-200 shadow-sm space-y-4">
      {/* الأيقونة */}
      <div>
        <label className="text-xs font-bold text-gray-500 mb-2 block">اختر أيقونة النشاط</label>
        <div className="flex gap-2 flex-wrap">
          {icons.map(ic => (
            <button key={ic} onClick={() => setData(p=>({...p, image:ic}))}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${data.image===ic?"border-teal-500 bg-teal-50":"border-gray-200 hover:border-teal-300"}`}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      {/* العنوان */}
      <div>
        <label className={cx.label}>عنوان النشاط *</label>
        <input value={data.title} onChange={e => setData(p=>({...p, title:e.target.value}))}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm" placeholder="اسم النشاط" />
      </div>
      {/* الوصف — محرر غني */}
      <div>
        <label className={cx.label}>الوصف (يدعم الألوان وأحجام الخط)</label>
        <RichEditor value={data.description} onChange={v => setData(p=>({...p, description:v}))} />
      </div>
      {/* الحقول الأخرى */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={cx.label}>النوع</label>
          <select value={data.type} onChange={e => setData(p=>({...p, type:e.target.value}))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            {types.filter(t=>t!=="الكل").map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={cx.label}>الحالة</label>
          <select value={data.status} onChange={e => setData(p=>({...p, status:e.target.value}))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
            <option>قادم</option><option>جاري</option><option>مكتمل</option>
          </select>
        </div>
        <div>
          <label className={cx.label}>التاريخ</label>
          <input value={data.date} onChange={e => setData(p=>({...p, date:e.target.value}))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="مثال: ١٤٤٧/٨/١" />
        </div>
        <div>
          <label className={cx.label}>المسؤول</label>
          <input value={data.responsible} onChange={e => setData(p=>({...p, responsible:e.target.value}))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="اسم المسؤول" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={!data.title}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          {saveLabel}
        </button>
        <button onClick={onCancel} className="border border-gray-200 text-gray-500 font-bold px-4 py-2.5 rounded-xl text-sm">إلغاء</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-black text-teal-900">الأنشطة المدرسية</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); }}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700">
          {showForm ? "✕ إلغاء" : "+ نشاط جديد"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <h3 className="font-bold text-teal-800 mb-3">إضافة نشاط جديد</h3>
          <ActForm data={newAct} setData={setNewAct} onSave={add} onCancel={() => setShowForm(false)} saveLabel="✅ إضافة النشاط" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard icon="📅" label="قادمة" value={activities.filter(a=>a.status==="قادم").length} color="bg-blue-50" />
        <StatCard icon="🔄" label="جارية" value={activities.filter(a=>a.status==="جاري").length} color="bg-green-50" />
        <StatCard icon="✅" label="مكتملة" value={activities.filter(a=>a.status==="مكتمل").length} color="bg-gray-50" />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {types.map(type => (
          <button key={type} onClick={() => setF(type)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${f===type?"bg-teal-600 text-white":"bg-white text-gray-600 border border-gray-200"}`}>{type}</button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map(act => (
          <div key={act.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
            {editId === act.id ? (
              <div className="p-4">
                <div className="text-sm font-black text-teal-700 mb-3">✏️ تعديل النشاط</div>
                <ActForm data={editAct} setData={setEditAct} onSave={saveEdit} onCancel={() => { setEditId(null); setEditAct(null); }} saveLabel="💾 حفظ التعديلات" />
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-l from-teal-500 to-emerald-600 p-6 text-center relative">
                  <span className="text-5xl">{act.image}</span>
                  <div className="absolute top-2 left-2 flex gap-1">
                    <button onClick={() => startEdit(act)} className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white text-xs px-2 py-1 rounded-lg font-bold">✏️</button>
                    <button onClick={() => del(act.id)} className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white text-xs px-2 py-1 rounded-lg font-bold">🗑️</button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{act.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sc[act.status]}`}>{act.status}</span>
                  </div>
                  <div className="text-gray-500 text-sm mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: act.description }}></div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>📅 {act.date}</span><span>👤 {act.responsible}</span>
                  </div>
                  <div className="mt-2"><Badge color={tc[act.type]}>{act.type}</Badge></div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== SMS PAGE ====================
function SMSPage({ teachers, attendance, week, classList }) {
  const [tab, setTab] = useState("contacts");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("sms_apikey") || "");
  const [sender, setSender] = useState(() => localStorage.getItem("sms_sender") || "School1");
  const [showConfig, setShowConfig] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // ===== CONTACTS STATE =====
  // Each contact: { id, name, phone, type: "student"|"teacher", class: "" }
  const [contacts, setContacts] = useState([]);
  const [contactsTab, setContactsTab] = useState("students"); // students | teachers
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newClass, setNewClass] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editClass, setEditClass] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [importMsg, setImportMsg] = useState("");

  // Save contacts to localStorage
  useEffect(() => {
    try { localStorage.setItem("sms_contacts", JSON.stringify(contacts)); } catch {}
  }, [contacts]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sms_contacts");
      if (saved) setContacts(JSON.parse(saved));
    } catch {}
  }, []);

  const addContact = (type) => {
    if (!newName.trim() || !newPhone.trim()) return;
    const phone = newPhone.trim().replace(/ /g, "");
    setContacts(prev => [...prev, { id: Date.now(), name: newName.trim(), phone, type, class: newClass.trim() }]);
    setNewName(""); setNewPhone(""); setNewClass("");
  };

  const deleteContact = (id) => setContacts(prev => prev.filter(c => c.id !== id));

  const startEdit = (c) => { setEditId(c.id); setEditName(c.name); setEditPhone(c.phone); setEditClass(c.class || ""); };
  const saveEdit = () => {
    setContacts(prev => prev.map(c => c.id === editId ? { ...c, name: editName, phone: editPhone.replace(/\s/g,""), class: editClass } : c));
    setEditId(null);
  };

  const importExcel = async (file, type) => {
    try {
      const XLSX = await loadXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      let added = 0;
      const newContacts = [];
      rows.forEach(row => {
        // Try to find name and phone in the row
        const cells = row.map(c => String(c || "").trim()).filter(Boolean);
        if (cells.length < 1) return;
        // Phone: cell containing 10+ digits starting with 05 or 9665
        const phoneCell = cells.find(c => /^(05|9665|966)\d{7,}/.test(c.replace(/\s/g,"")));
        // Name: longest non-numeric cell
        const nameCell = cells.filter(c => !/^\d+$/.test(c) && c !== phoneCell).sort((a,b) => b.length - a.length)[0];
        const classCell = cells.find(c => /فصل|صف|شعب|class/i.test(c) && c !== nameCell);
        if (nameCell && phoneCell) {
          newContacts.push({ id: Date.now() + Math.random(), name: nameCell, phone: phoneCell.replace(/\s/g,""), type, class: classCell || "" });
          added++;
        }
      });
      if (added > 0) {
        setContacts(prev => {
          const existingPhones = new Set(prev.map(c => c.phone));
          const unique = newContacts.filter(c => !existingPhones.has(c.phone));
          return [...prev, ...unique];
        });
        setImportMsg(`✅ تم استيراد ${added} جهة اتصال`);
      } else {
        setImportMsg("⚠️ لم يُعثر على أرقام بالصيغة المطلوبة. تأكد أن الملف يحتوي اسم ورقم في كل صف.");
      }
      setTimeout(() => setImportMsg(""), 4000);
    } catch (e) { setImportMsg("❌ خطأ في قراءة الملف: " + e.message); }
  };

  const toggleSelect = (id) => setSelectedContacts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = (type) => {
    const ids = filteredContacts(type).map(c => c.id);
    const allSelected = ids.every(id => selectedContacts.includes(id));
    if (allSelected) setSelectedContacts(prev => prev.filter(id => !ids.includes(id)));
    else setSelectedContacts(prev => [...new Set([...prev, ...ids])]);
  };
  const filteredContacts = (type) => contacts.filter(c => c.type === type && (
    c.name.includes(searchContact) || c.phone.includes(searchContact) || (c.class||"").includes(searchContact)
  ));
  const selectedPhones = () => contacts.filter(c => selectedContacts.includes(c.id)).map(c => c.phone).join(",");

  // Send tabs state
  const [manualNums, setManualNums] = useState("");
  const [manualMsg, setManualMsg] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);
  const [supervisorNum, setSupervisorNum] = useState("");
  const [absentMsg, setAbsentMsg] = useState("");
  const [bulkNums, setBulkNums] = useState("");
  const [bulkMsg, setBulkMsg] = useState("");

  // Auto-build attendance message
  useEffect(() => {
    const di = selectedDay;
    const dayLabel = week?.[di]?.day || `اليوم ${di + 1}`;
    const dateLabel = week?.[di]?.dateH || "";
    const absents = teachers.filter((_, ti) => (attendance?.[ti]?.[di]?.status || "حاضر") === "غائب").map((t, i) => `${i + 1}. ${t}`);
    const lates = teachers.filter((_, ti) => (attendance?.[ti]?.[di]?.status || "حاضر") === "متأخر").map((t, i) => {
      const r = attendance?.[teachers.indexOf(t)]?.[di] || {};
      return `${i + 1}. ${t} (${r.lateType || "صباحي"} - ${r.lateMinutes || 0} دقيقة)`;
    });
    let msg = `📋 تقرير حضور ${dayLabel} ${dateLabel}\nمدرسة عبيدة بن الحارث المتوسطة\n\n`;
    if (absents.length) msg += `❌ الغائبون (${absents.length}):\n${absents.join("\n")}\n\n`;
    if (lates.length) msg += `🕐 المتأخرون (${lates.length}):\n${lates.join("\n")}\n`;
    if (!absents.length && !lates.length) msg += `✅ جميع المعلمين حاضرون`;
    setAbsentMsg(msg);
  }, [selectedDay, teachers, attendance, week]);

  const TABS = [
    { id: "contacts",   label: "جهات الاتصال",   icon: "👥" },
    { id: "manual",     label: "رسالة يدوية",    icon: "✍️" },
    { id: "attendance", label: "إشعار الغياب",   icon: "📋" },
    { id: "bulk",       label: "رسالة للأهالي",  icon: "👨‍👦" },
    { id: "absence",    label: "غياب الطلاب",    icon: "🏫" },
  ];

  // ===== SEND FUNCTION — عبر Vercel API =====
  const sendSMS = async (numbers, message) => {
    if (!numbers?.trim()) { setResult({ ok:false, topMsg:"📞 أدخل رقماً واحداً على الأقل" }); return; }
    if (!message.trim())  { setResult({ ok:false, topMsg:"✏️ اكتب نص الرسالة" }); return; }
    setSending(true); setResult(null);

    const cleanNums = numbers.split(/[
,]+/)
      .map(n => {
        n = n.trim().replace(/ /g, "");
        if (n.startsWith("00966")) return n.substring(2);
        if (n.startsWith("0"))    return "966" + n.substring(1);
        if (n.startsWith("+"))    return n.substring(1);
        if (n.startsWith("5"))    return "966" + n;
        return n;
      })
      .filter(n => n.length >= 9)
      .join(",");

    if (!cleanNums) { setResult({ ok:false, topMsg:"❌ أرقام غير صحيحة" }); setSending(false); return; }

    try {
      const res = await fetch("/api/send-sms", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ numbers: cleanNums, message, sender: sender || "" }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ ok:true, msg:"✅ تم الإرسال بنجاح!" });
      } else {
        setResult({ ok:false, topMsg:"❌ " + (data.message || "فشل الإرسال"), msg:"تحقق من الرصيد وصحة الأرقام واسم المرسل" });
      }
    } catch(e) {
      setResult({ ok:false, topMsg:"❌ خطأ في الاتصال بالسيرفر", msg:e.message });
    }
    setSending(false);
  };
  // Send to selected contacts
  const [sendMsg, setSendMsg] = useState("");
  const sendToSelected = () => {
    const phones = selectedPhones();
    sendSMS(phones, sendMsg);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-l from-green-600 to-teal-700 rounded-2xl p-5 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black">📱 مركز الرسائل النصية SMS</h2>
          <p className="text-sm opacity-75 mt-1">إرسال مباشر عبر المدار التقني — mobile.net.sa</p>
        </div>
        <button onClick={() => setShowConfig(!showConfig)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl text-sm font-bold border border-white border-opacity-30">
          ⚙️ إعدادات الحساب
        </button>
      </div>

      {/* Config */}
      {showConfig && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-black text-gray-800 mb-1">⚙️ إعدادات CORBIT المدار</h3>
          <p className="text-xs text-gray-400 mb-4">أدخل API Key من صفحة رموز API في حسابك</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="text-xs font-black text-gray-600 mb-1 block">🔑 API Key</label>
              <input value={apiKey} onChange={e => { setApiKey(e.target.value); localStorage.setItem("sms_apikey", e.target.value); }}
                className="w-full border-2 border-gray-200 focus:border-teal-400 focus:outline-none rounded-xl px-3 py-2.5 text-sm font-mono"
                placeholder="أدخل API Key من لوحة التحكم" dir="ltr" />
              <p className="text-xs text-gray-400 mt-1">📍 من حسابك: الإعدادات ← رموز API</p>
            </div>
            <div>
              <label className="text-xs font-black text-gray-600 mb-1 block">📛 اسم المرسل (Sender ID)</label>
              <input value={sender} onChange={e => { setSender(e.target.value); localStorage.setItem("sms_sender", e.target.value); }}
                className="w-full border-2 border-gray-200 focus:border-teal-400 focus:outline-none rounded-xl px-3 py-2.5 text-sm"
                placeholder="School1" />
            </div>
          </div>
          <div className="bg-teal-50 rounded-xl px-4 py-3 text-xs text-teal-700 space-y-1">
            <p className="font-black">💡 كيف يعمل الإرسال؟</p>
            <p>✅ الإرسال يتم عبر خادم Vercel مباشرةً بدون مشكلة CORS</p>
            <p>✅ API Key يُحفظ تلقائياً في المتصفح</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null); }}
            className={`flex-1 whitespace-nowrap py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${tab === t.id ? "bg-white shadow text-teal-700" : "text-gray-500 hover:text-gray-700"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {result && (
        <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${result.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {result.ok ? (
            <span>{result.msg}</span>
          ) : (
            <div className="space-y-2">
              <div className="font-black text-base">{result.topMsg || "❌ لم يُرسَل"}</div>
              {result.attempts && result.attempts.length > 0 ? (
                <div className="bg-white rounded-xl p-3 space-y-1 max-h-60 overflow-y-auto text-xs font-mono border border-red-100">
                  {result.attempts.map((a,i) => (
                    <div key={i} className={a.error ? "text-gray-400" : a.http===200?"text-blue-700":"text-red-600"}>
                      <strong>#{a.n}</strong> HTTP:{a.http||"—"} | {(a.raw||a.error||"").substring(0,120)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs">{result.msg}</div>
              )}
              <div className="text-xs text-red-500 bg-red-50 rounded-lg p-2 mt-2">
                📋 انسخ هذا التقرير وأرسله للمطور على واتساب: 0548454776
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: CONTACTS ===== */}
      {tab === "contacts" && (
        <div className="space-y-4">
          {/* Sub-tabs: students / teachers */}
          <div className="flex gap-2">
            {[{ id:"students", label:"👨‍🎓 أولياء أمور الطلاب" }, { id:"teachers", label:"👨‍🏫 المعلمون" }].map(t => (
              <button key={t.id} onClick={() => setContactsTab(t.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${contactsTab === t.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-500 border-gray-200 hover:border-teal-300"}`}>
                {t.label} <span className="mr-1 text-xs opacity-70">({contacts.filter(c=>c.type===t.id).length})</span>
              </button>
            ))}
          </div>

          {/* Import + Add */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div className={cx.row}>
              <h3 className="font-black text-gray-800">
                {contactsTab === "students" ? "📥 استيراد / إضافة أولياء الأمور" : "📥 استيراد / إضافة المعلمين"}
              </h3>
              {/* Excel import */}
              <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2">
                📊 استيراد من Excel
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { if(e.target.files[0]) importExcel(e.target.files[0], contactsTab); e.target.value=""; }} />
              </label>
            </div>
            {importMsg && <div className="text-sm font-bold text-center py-2 rounded-xl bg-gray-50 border">{importMsg}</div>}

            {/* Excel format hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
              💡 <strong>صيغة ملف Excel:</strong> عمود للاسم وعمود للرقم (05XXXXXXXXX) — يمكن إضافة عمود للفصل/الصف اختيارياً. الملف يُضيف الجديد فقط دون حذف الموجود.
            </div>

            {/* Manual add form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
              <div className="sm:col-span-2">
                <label className={cx.label}>الاسم</label>
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="اسم الشخص" />
              </div>
              <div>
                <label className={cx.label}>رقم الجوال</label>
                <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="05XXXXXXXX" dir="ltr" />
              </div>
              <div>
                <label className={cx.label}>{contactsTab === "students" ? "الفصل (اختياري)" : "التخصص (اختياري)"}</label>
                <input value={newClass} onChange={e => setNewClass(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder={contactsTab === "students" ? "1أ، 2ب..." : "رياضيات..."} />
              </div>
              <div className="sm:col-span-4">
                <button onClick={() => addContact(contactsTab)}
                  disabled={!newName.trim() || !newPhone.trim()}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl text-sm">
                  ➕ إضافة {contactsTab === "students" ? "ولي أمر" : "معلم"}
                </button>
              </div>
            </div>
          </div>

          {/* Contacts list */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Search + select all + send to selected */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
              <input value={searchContact} onChange={e => setSearchContact(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="🔍 بحث بالاسم أو الرقم أو الفصل..." />
              <button onClick={() => selectAll(contactsTab)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                {filteredContacts(contactsTab).every(c => selectedContacts.includes(c.id)) ? "✗ إلغاء الكل" : "✓ تحديد الكل"}
              </button>
              {selectedContacts.length > 0 && (
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-2 rounded-xl border border-teal-200">
                  {selectedContacts.length} محدد
                </span>
              )}
            </div>

            {filteredContacts(contactsTab).length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">{contactsTab === "students" ? "👨‍🎓" : "👨‍🏫"}</div>
                <p className="font-bold">لا توجد جهات اتصال بعد</p>
                <p className="text-xs mt-1">أضف يدوياً أو استورد من ملف Excel</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {filteredContacts(contactsTab).map(c => (
                  <div key={c.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all ${selectedContacts.includes(c.id) ? "bg-teal-50" : ""}`}>
                    {/* Checkbox */}
                    <input type="checkbox" checked={selectedContacts.includes(c.id)} onChange={() => toggleSelect(c.id)}
                      className="w-4 h-4 accent-teal-600 cursor-pointer flex-shrink-0" />
                    {editId === c.id ? (
                      // Edit mode
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          className="border border-teal-300 rounded-lg px-2 py-1 text-xs" placeholder="الاسم" />
                        <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                          className="border border-teal-300 rounded-lg px-2 py-1 text-xs" placeholder="الرقم" dir="ltr" />
                        <input value={editClass} onChange={e => setEditClass(e.target.value)}
                          className="border border-teal-300 rounded-lg px-2 py-1 text-xs" placeholder="الفصل" />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-800 truncate">{c.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span dir="ltr">{c.phone}</span>
                          {c.class && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{c.class}</span>}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-1 flex-shrink-0">
                      {editId === c.id ? (
                        <>
                          <button onClick={saveEdit} className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-bold">حفظ</button>
                          <button onClick={() => setEditId(null)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg font-bold">إلغاء</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(c)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg">✏️</button>
                          <button onClick={() => deleteContact(c.id)} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg">🗑️</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Send to selected footer */}
            {selectedContacts.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-teal-50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-teal-700">📤 إرسال لـ {selectedContacts.length} شخص محدد</span>
                </div>
                <textarea value={sendMsg} onChange={e => setSendMsg(e.target.value)}
                  rows={3} className="w-full border border-teal-200 rounded-xl px-3 py-2 text-sm resize-none bg-white"
                  placeholder="اكتب نص الرسالة..." />
                <div className="flex gap-2">
                  <button onClick={sendToSelected} disabled={sending || !sendMsg.trim()}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl text-sm">
                    {sending ? "⏳ جاري الإرسال..." : `📤 إرسال الآن`}
                  </button>
                  <button onClick={() => setSelectedContacts([])}
                    className="border border-gray-200 bg-white text-gray-500 font-bold px-4 py-2 rounded-xl text-sm">
                    إلغاء التحديد
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: MANUAL ===== */}
      {tab === "manual" && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-800">✍️ رسالة يدوية بأرقام مباشرة</h3>
          <div>
            <label className={cx.label}>أرقام الهاتف (مفصولة بفاصلة)</label>
            <textarea value={manualNums} onChange={e => setManualNums(e.target.value)}
              rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
              placeholder="0512345678,0598765432" dir="ltr" />
            {selectedContacts.length > 0 && (
              <button onClick={() => setManualNums(selectedPhones())}
                className="mt-2 text-xs text-teal-600 font-bold hover:underline">
                ← تعبئة من {selectedContacts.length} جهة محددة في قسم جهات الاتصال
              </button>
            )}
          </div>
          <div>
            <label className={cx.label}>نص الرسالة <span className="text-gray-400 font-normal mr-1">({manualMsg.length} حرف)</span></label>
            <textarea value={manualMsg} onChange={e => setManualMsg(e.target.value)}
              rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" placeholder="اكتب نص رسالتك هنا..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => sendSMS(manualNums, manualMsg)} disabled={sending}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
              {sending ? "⏳ جاري الإرسال..." : "📤 إرسال الآن"}
            </button>
            <button onClick={() => { setManualNums(""); setManualMsg(""); }}
              className="border border-gray-200 text-gray-500 font-bold px-4 py-2.5 rounded-xl text-sm">مسح</button>
          </div>
        </div>
      )}

      {/* ===== TAB: ATTENDANCE ===== */}
      {tab === "attendance" && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-800">📋 إشعار غياب وتأخر المعلمين</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cx.label}>اليوم</label>
              <select value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                {(week || []).map((d, i) => <option key={i} value={i}>{d.day} — {d.dateH}</option>)}
              </select>
            </div>
            <div>
              <label className={cx.label}>رقم المشرف</label>
              <input value={supervisorNum} onChange={e => setSupervisorNum(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="05XXXXXXXX" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"حاضر", color:"green", count: teachers.filter((_,ti)=>(attendance?.[ti]?.[selectedDay]?.status||"حاضر")==="حاضر").length },
              { label:"متأخر", color:"amber", count: teachers.filter((_,ti)=>(attendance?.[ti]?.[selectedDay]?.status||"حاضر")==="متأخر").length },
              { label:"غائب", color:"red", count: teachers.filter((_,ti)=>(attendance?.[ti]?.[selectedDay]?.status||"حاضر")==="غائب").length },
            ].map(s => (
              <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-200 rounded-xl p-3 text-center`}>
                <div className={`text-2xl font-black text-${s.color}-600`}>{s.count}</div>
                <div className={`text-xs font-bold text-${s.color}-500`}>{s.label}</div>
              </div>
            ))}
          </div>
          <div>
            <label className={cx.label}>نص الرسالة (مُولَّد تلقائياً — قابل للتعديل)</label>
            <textarea value={absentMsg} onChange={e => setAbsentMsg(e.target.value)}
              rows={8} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono resize-none" />
          </div>
          <button onClick={() => sendSMS(supervisorNum, absentMsg)} disabled={sending}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
            {sending ? "⏳ جاري الإرسال..." : "📤 أرسل للمشرف"}
          </button>
        </div>
      )}

      {/* ===== TAB: BULK ===== */}
      {tab === "bulk" && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-black text-gray-800">👨‍👦 رسالة جماعية لأولياء الأمور</h3>
          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-700 flex items-center justify-between gap-3 flex-wrap">
            <span>💡 يمكنك تحديد الأرقام من قسم <strong>جهات الاتصال</strong> ثم العودة هنا</span>
            {selectedContacts.length > 0 && (
              <button onClick={() => setBulkNums(selectedPhones())}
                className="bg-teal-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg">
                ← تعبئة {selectedContacts.length} رقم محدد
              </button>
            )}
          </div>
          <div>
            <label className={cx.label}>أرقام أولياء الأمور <span className="text-gray-400 font-normal mr-1">({bulkNums.split(",").filter(n=>n.trim().length>5).length} رقم)</span></label>
            <textarea value={bulkNums} onChange={e => setBulkNums(e.target.value)}
              rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
              placeholder="0512345678,0598765432,0566778899" dir="ltr" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">قوالب جاهزة</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label:"دعوة اجتماع", msg:"أولياء الأمور الكرام\nيُعقد اجتماعاً بالمدرسة يوم ............\nالرجاء الحضور في الموعد المحدد\nمدرسة عبيدة بن الحارث المتوسطة" },
                { label:"موعد الاختبارات", msg:"أولياء الأمور الكرام\nتبدأ الاختبارات يوم ............\nنتمنى لأبنائكم التوفيق\nمدرسة عبيدة بن الحارث المتوسطة" },
                { label:"إجازة عارضة", msg:"أولياء الأمور الكرام\nتُعلم المدرسة بعدم الدراسة يوم ............\nمع التقدير\nمدرسة عبيدة بن الحارث المتوسطة" },
                { label:"نشاط مدرسي", msg:"أولياء الأمور الكرام\nتقيم المدرسة نشاطاً بتاريخ ............\nنتشرف بحضوركم\nمدرسة عبيدة بن الحارث المتوسطة" },
              ].map(t => (
                <button key={t.label} onClick={() => setBulkMsg(t.msg)}
                  className="bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 transition-all">
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={cx.label}>نص الرسالة <span className="text-gray-400 font-normal mr-1">({bulkMsg.length} حرف)</span></label>
            <textarea value={bulkMsg} onChange={e => setBulkMsg(e.target.value)}
              rows={5} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
              placeholder="اكتب رسالتك لأولياء الأمور..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => sendSMS(bulkNums, bulkMsg)} disabled={sending}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
              {sending ? "⏳ جاري الإرسال..." : `📤 إرسال لـ ${bulkNums.split(",").filter(n=>n.trim().length>5).length} رقم`}
            </button>
            <button onClick={() => { setBulkNums(""); setBulkMsg(""); }}
              className="border border-gray-200 text-gray-500 font-bold px-4 py-2.5 rounded-xl text-sm">مسح</button>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200">
        <p className="text-xs text-gray-500 font-bold mb-1">📌 ملاحظات:</p>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>الأرقام السعودية: 05XXXXXXXX أو 9665XXXXXXXX</li>
          <li>جهات الاتصال تُحفظ في المتصفح تلقائياً</li>
          <li>الرسائل العربية: 70 حرف = رسالة واحدة</li>
          <li>يمكن الإرسال لأكثر من 500 رقم في طلب واحد</li>
        </ul>
      </div>
    </div>
  );
}

// ==================== STUDENT ABSENCE PAGE ====================
function StudentAbsencePage() {
  const MADAR_URL = "https://app.mobile.net.sa";
  const FB_KEY    = "student-absence";
  const PERIODS_T   = ["الأولى","الثانية","الثالثة","الرابعة","الخامسة","السادسة","السابعة"];
  const STATUSES  = [
    { key:"حاضر",       label:"حاضر",        icon:"✅", color:"emerald" },
    { key:"غائب",       label:"غائب",         icon:"❌", color:"red"    },
    { key:"تأخر صباحي", label:"تأخر صباحي",  icon:"🌅", color:"amber"  },
    { key:"تأخر حصص",  label:"تأخر حصص",    icon:"⏰", color:"orange" },
  ];

  const [students,    setStudents]    = useState([]);
  const [attendance,  setAttendance]  = useState({});
  const [date,        setDate]        = useState(() => new Date().toISOString().split("T")[0]);
  const [search,      setSearch]      = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [showAdd,     setShowAdd]     = useState(false);
  const [newName,     setNewName]     = useState("");
  const [newPhone,    setNewPhone]    = useState("");
  const [newId,       setNewId]       = useState("");
  const [modal,       setModal]       = useState(null);   // { stu, msg }
  const [copied,      setCopied]      = useState(false);
  const [className,   setClassName]   = useState("الصف الأول / أ");
  const [editId,      setEditId]      = useState(null);
  const [editData,    setEditData]    = useState({});
  const xlsRef = useRef();

  /* - load - */
  useEffect(() => {
    DB.get(FB_KEY + "-students", []).then(d => d?.length && setStudents(d));
    DB.get(FB_KEY + "-class", "الصف الأول / أ").then(d => d && setClassName(d));
  }, []);

  useEffect(() => {
    DB.get(FB_KEY + "-" + date, {}).then(d => setAttendance(d || {}));
  }, [date]);

  /* - save - */
  const persist = async (sts, att, cn) => {
    setSaving(true);
    await DB.set(FB_KEY + "-students", sts);
    await DB.set(FB_KEY + "-" + date,  att);
    if (cn !== undefined) await DB.set(FB_KEY + "-class", cn);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  /* - helpers - */
  const getAtt = sid => attendance[sid] || { status: "حاضر", periods: [] };

  const setStatus = (sid, status) => {
    const cur = getAtt(sid);
    const upd = { ...attendance, [sid]: { ...cur, status, periods: status === "تأخر حصص" ? (cur.periods || []) : [] }};
    setAttendance(upd);
    persist(students, upd);
  };

  const togglePeriod = (sid, pi) => {
    const cur = getAtt(sid);
    const ps  = cur.periods || [];
    const upd = { ...attendance, [sid]: { ...cur, status:"تأخر حصص", periods: ps.includes(pi) ? ps.filter(x=>x!==pi) : [...ps,pi] }};
    setAttendance(upd);
    persist(students, upd);
  };

  /* - add student - */
  const addStudent = () => {
    if (!newName.trim()) return;
    const stu = { id: Date.now().toString(), name: newName.trim(), phone: newPhone.trim(), nationalId: newId.trim() };
    const upd = [...students, stu];
    setStudents(upd); persist(upd, attendance);
    setNewName(""); setNewPhone(""); setNewId(""); setShowAdd(false);
  };

  /* - remove - */
  const removeStudent = sid => {
    if (!window.confirm("حذف الطالب؟")) return;
    const upd = students.filter(s => s.id !== sid);
    const att = { ...attendance }; delete att[sid];
    setStudents(upd); setAttendance(att); persist(upd, att);
  };

  /* - edit - */
  const startEdit = stu => { setEditId(stu.id); setEditData({ name: stu.name, phone: stu.phone||"", nationalId: stu.nationalId||"" }); };
  const saveEdit  = () => {
    const upd = students.map(s => s.id === editId ? { ...s, ...editData } : s);
    setStudents(upd); persist(upd, attendance); setEditId(null);
  };

  /* - excel - */
  const handleExcel = e => {
    const file = e.target.files[0]; if (!file) return;
    file.arrayBuffer().then(async ev => {
      try {
        await loadXLSX();
        const XLSX = window.XLSX;
        const wb   = XLSX.read(ev, { type:"array" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header:1 });
        const incoming = [];
        rows.forEach((row, i) => {
          if (i === 0) return;
          const name = String(row[0] || "").trim();
          const phone = String(row[1] || "").trim();
          const nationalId = String(row[2] || "").trim();
          if (name) incoming.push({ id: Date.now().toString() + i, name, phone, nationalId });
        });
        if (incoming.length) {
          const merged = [...students];
          incoming.forEach(ns => { if (!merged.find(s => s.name === ns.name)) merged.push(ns); });
          setStudents(merged); persist(merged, attendance);
          window.alert("✅ تم استيراد " + incoming.length + " طالب");
        }
      } catch { window.alert("خطأ في قراءة الملف"); }
    });
    e.target.value = "";
  };

  /* - madar modal - */
  const openModal = stu => {
    const att    = getAtt(stu.id);
    const dateAr = new Date(date).toLocaleDateString("ar-SA", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
    let msg = "";
    if (att.status === "غائب")
      msg = `السلام عليكم ورحمة الله وبركاته\nنُفيدكم بأن ابنكم الطالب / ${stu.name}\nغاب عن المدرسة بتاريخ ${dateAr}\nنرجو التواصل مع الإدارة لمعرفة السبب.\nمع تحيات إدارة مدرسة عبيدة بن الحارث المتوسطة`;
    else if (att.status === "تأخر صباحي")
      msg = `السلام عليكم ورحمة الله وبركاته\nنُفيدكم بأن ابنكم الطالب / ${stu.name}\nتأخّر عن الحضور الصباحي بتاريخ ${dateAr}\nنرجو الحرص على الالتزام بالحضور في وقته.\nمع تحيات إدارة مدرسة عبيدة بن الحارث المتوسطة`;
    else if (att.status === "تأخر حصص") {
      const perNames = (att.periods||[]).sort((a,b)=>a-b).map(p => "الحصة " + PERIODS_T[p]).join("، ");
      msg = `السلام عليكم ورحمة الله وبركاته\nنُفيدكم بأن ابنكم الطالب / ${stu.name}\nتأخّر عن ${perNames} بتاريخ ${dateAr}\nنرجو متابعة الأمر.\nمع تحيات إدارة مدرسة عبيدة بن الحارث المتوسطة`;
    }
    setModal({ stu, msg }); setCopied(false);
  };

  const copyMsg = () => {
    if (!modal?.msg) return;
    navigator.clipboard.writeText(modal.msg).catch(()=>{});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  /* - print - */
  const printReport = () => {
    const dateAr = new Date(date).toLocaleDateString("ar-SA", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
    const rows = students.map((s,i) => {
      const att = getAtt(s.id);
      const perTxt = att.status === "تأخر حصص" && att.periods?.length
        ? (att.periods||[]).sort((a,b)=>a-b).map(p=>PERIODS_T[p]).join("، ") : "—";
      const statusColor = { حاضر:"#059669", غائب:"#dc2626", "تأخر صباحي":"#d97706", "تأخر حصص":"#ea580c" }[att.status]||"#374151";
      return `<tr style="border-bottom:1px solid #e5e7eb; background:${i%2?"#f9fafb":"#fff"}">
        <td style="padding:8px 12px; text-align:center; color:#6b7280; font-size:12px">${i+1}</td>
        <td style="padding:8px 12px; font-weight:bold; font-size:13px">${s.name}</td>
        <td style="padding:8px 12px; color:#6b7280; font-size:12px">${s.nationalId||"—"}</td>
        <td style="padding:8px 12px; text-align:center; font-weight:bold; color:${statusColor}; font-size:12px">${att.status}</td>
        <td style="padding:8px 12px; text-align:center; color:#6b7280; font-size:12px">${perTxt}</td>
      </tr>`;
    }).join("");
    const stats = STATUSES.map(s => `<span style="background:${{"emerald":"#d1fae5","red":"#fee2e2","amber":"#fef3c7","orange":"#ffedd5"}[s.color]||"#f3f4f6"}; padding:6px 14px; border-radius:20px; font-weight:bold; font-size:13px; color:${{"emerald":"#065f46","red":"#991b1b","amber":"#92400e","orange":"#9a3412"}[s.color]||"#374151"}; margin:3px">${s.icon} ${s.label}: ${students.filter(st=>getAtt(st.id).status===s.key).length}</span>`).join("");
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>كشف الغياب</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Cairo',sans-serif;direction:rtl;color:#1e293b;background:#fff;padding:20px}
    @media print{button{display:none!important}.no-print{display:none!important}}</style></head><body>
    <div style="max-width:800px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#7f1d1d,#991b1b);color:white;padding:20px 24px;border-radius:12px 12px 0 0">
        <div style="font-size:18px;font-weight:900">📋 كشف الغياب والتأخر اليومي</div>
        <div style="font-size:13px;opacity:.85;margin-top:6px">${className} &nbsp;|&nbsp; ${dateAr}</div>
        <div style="font-size:12px;opacity:.75;margin-top:3px">مدرسة عبيدة بن الحارث المتوسطة — جدة</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;padding:14px 20px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">${stats}</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-top:none">
        <thead><tr style="background:#1e293b;color:white;font-size:12px">
          <th style="padding:10px 12px;text-align:center">#</th>
          <th style="padding:10px 12px;text-align:right">اسم الطالب</th>
          <th style="padding:10px 12px;text-align:center">رقم الهوية</th>
          <th style="padding:10px 12px;text-align:center">الحالة</th>
          <th style="padding:10px 12px;text-align:center">الحصص</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;text-align:center">
        ${["مشرف الدور","الوكيل","مدير المدرسة"].map(t=>`<div><div style="font-weight:bold;font-size:13px;margin-bottom:30px">${t}:</div><div style="border-top:1px solid #374151;padding-top:6px;color:#6b7280;font-size:11px">التوقيع</div></div>`).join("")}
      </div>
      <div class="no-print" style="margin-top:20px;text-align:center">
        <button onclick="window.print()" style="background:#991b1b;color:white;border:none;padding:10px 30px;border-radius:8px;font-family:'Cairo';font-size:14px;font-weight:bold;cursor:pointer">🖨 طباعة</button>
      </div>
    </div></body></html>`);
  };

  /* - derived - */
  const filtered = students.filter(s => !search || s.name.includes(search) || (s.nationalId||"").includes(search));
  const counts   = STATUSES.reduce((acc,s) => { acc[s.key] = students.filter(st => getAtt(st.id).status === s.key).length; return acc; }, {});

  const statusBadge = s => ({
    حاضر:       "bg-emerald-100 text-emerald-700 border-emerald-300",
    غائب:       "bg-red-100 text-red-700 border-red-300",
    "تأخر صباحي":"bg-amber-100 text-amber-700 border-amber-300",
    "تأخر حصص": "bg-orange-100 text-orange-700 border-orange-300",
  }[s] || "bg-gray-100 text-gray-500 border-gray-200");

  /* - JSX - */
  return (
    <div className="space-y-4">

      {/* - Header - */}
      <div className="bg-gradient-to-l from-rose-900 to-red-800 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="text-2xl">📋</span> غياب وتأخر الطلاب
            </h2>
            <p className="text-xs opacity-70 mt-1">رصد الغياب والتأخر الصباحي والتأخر عن الحصص</p>
            <div className="flex items-center gap-2 mt-2">
              <input value={className} onChange={e => { setClassName(e.target.value); persist(students, attendance, e.target.value); }}
                className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none text-white w-36"
                placeholder="اسم الفصل" />
              <span className="text-xs opacity-60">الفصل الدراسي</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none text-white" />
            <button onClick={() => xlsRef.current?.click()}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 border border-white border-opacity-30 rounded-xl px-3 py-2 text-sm font-bold flex items-center gap-1">
              📥 Excel
            </button>
            <input ref={xlsRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcel} />
            <button onClick={printReport}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 border border-white border-opacity-30 rounded-xl px-3 py-2 text-sm font-bold">
              🖨 طباعة
            </button>
            <button onClick={() => setShowAdd(v => !v)}
              className="bg-white text-rose-800 hover:bg-rose-50 rounded-xl px-4 py-2 text-sm font-bold shadow-sm">
              ➕ إضافة طالب
            </button>
          </div>
        </div>
        {(saving || saved) && (
          <div className={`mt-2 text-xs font-bold ${saved ? "text-emerald-300" : "text-white opacity-60"}`}>
            {saving ? "⏳ جاري الحفظ…" : "✅ تم الحفظ"}
          </div>
        )}
      </div>

      {/* - Stats - */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUSES.map(s => (
          <div key={s.key} className={`bg-white rounded-2xl p-4 text-center shadow-sm border-b-4 ${
            { emerald:"border-emerald-400", red:"border-red-400", amber:"border-amber-400", orange:"border-orange-400" }[s.color]
          }`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-3xl font-black ${{ emerald:"text-emerald-600", red:"text-red-600", amber:"text-amber-600", orange:"text-orange-600" }[s.color]}`}>
              {counts[s.key] || 0}
            </div>
            <div className="text-xs font-bold text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* - Excel Hint - */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-700 flex items-start gap-2">
        <span className="text-base mt-0.5">📌</span>
        <div><span className="font-bold">تنسيق Excel:</span> عمود أ: اسم الطالب | عمود ب: جوال ولي الأمر | عمود ج: رقم الهوية — السطر الأول يُتجاهل تلقائياً</div>
      </div>

      {/* - Add Form - */}
      {showAdd && (
        <div className="bg-white rounded-2xl shadow-md border border-rose-100 p-5">
          <h3 className="font-bold text-gray-700 mb-4 text-sm">➕ إضافة طالب جديد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="اسم الطالب *"
              className="border-2 border-gray-200 focus:border-rose-400 rounded-xl px-3 py-2 text-sm focus:outline-none" />
            <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="رقم الهوية"
              className="border-2 border-gray-200 focus:border-rose-400 rounded-xl px-3 py-2 text-sm focus:outline-none" />
            <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="جوال ولي الأمر (05xxxxxxxx)"
              className="border-2 border-gray-200 focus:border-rose-400 rounded-xl px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={addStudent} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 py-2 text-sm font-bold">حفظ</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-600 rounded-xl px-5 py-2 text-sm font-bold">إلغاء</button>
          </div>
        </div>
      )}

      {/* - Search - */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 بحث باسم الطالب أو رقم الهوية…"
        className="w-full border-2 border-gray-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-sm focus:outline-none" />

      {/* - Table - */}
      {students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-5xl mb-3">👨‍🎓</div>
          <p className="font-bold text-gray-400 text-sm">لا يوجد طلاب — أضف طالباً أو استورد ملف Excel</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-l from-rose-900 to-red-800 text-white text-xs">
                  <th className="px-3 py-3 text-center w-10">#</th>
                  <th className="px-3 py-3 text-right min-w-48">الطالب</th>
                  <th className="px-3 py-3 text-center min-w-64">الحالة</th>
                  <th className="px-3 py-3 text-center min-w-64">الحصص المتأخر عنها</th>
                  <th className="px-3 py-3 text-center w-24">المدار / إبلاغ</th>
                  <th className="px-3 py-3 text-center w-20">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((stu, idx) => {
                  const att = getAtt(stu.id);
                  const isEdit = editId === stu.id;
                  return (
                    <tr key={stu.id} className={`border-b border-gray-50 hover:bg-rose-50/30 transition-colors ${idx%2===0?"bg-white":"bg-gray-50/20"}`}>

                      {/* رقم */}
                      <td className="px-3 py-3 text-center text-gray-400 text-xs font-bold">{idx+1}</td>

                      {/* اسم */}
                      <td className="px-3 py-3">
                        {isEdit ? (
                          <div className="space-y-1">
                            <input value={editData.name} onChange={e=>setEditData(p=>({...p,name:e.target.value}))}
                              className="border border-gray-300 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:border-rose-400" placeholder="الاسم" />
                            <input value={editData.nationalId} onChange={e=>setEditData(p=>({...p,nationalId:e.target.value}))}
                              className="border border-gray-300 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:border-rose-400" placeholder="رقم الهوية" />
                            <input value={editData.phone} onChange={e=>setEditData(p=>({...p,phone:e.target.value}))}
                              className="border border-gray-300 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:border-rose-400" placeholder="الجوال" />
                            <div className="flex gap-1 pt-1">
                              <button onClick={saveEdit} className="bg-rose-600 text-white rounded-lg px-3 py-1 text-xs font-bold">حفظ</button>
                              <button onClick={()=>setEditId(null)} className="bg-gray-100 text-gray-600 rounded-lg px-3 py-1 text-xs">إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="font-bold text-gray-800">{stu.name}</div>
                            {stu.nationalId && <div className="text-xs text-gray-400 mt-0.5">🪪 {stu.nationalId}</div>}
                            {stu.phone      && <div className="text-xs text-gray-400">📞 {stu.phone}</div>}
                          </>
                        )}
                      </td>

                      {/* حالة */}
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap justify-center gap-1">
                          {STATUSES.map(s => (
                            <button key={s.key} onClick={() => setStatus(stu.id, s.key)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${att.status===s.key ? statusBadge(s.key) + " shadow-sm" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600"}`}>
                              {s.icon} {s.label}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* حصص */}
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-1 flex-wrap">
                          {PERIODS_T.map((p, pi) => {
                            const active   = att.status === "تأخر حصص";
                            const selected = active && (att.periods||[]).includes(pi);
                            return (
                              <button key={pi}
                                onClick={() => active && togglePeriod(stu.id, pi)}
                                title={`الحصة ${p}`}
                                className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all
                                  ${selected  ? "bg-orange-500 text-white border-orange-500 shadow-md scale-110"
                                  : active    ? "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50"
                                              : "bg-gray-100 text-gray-300 border-gray-100 cursor-default"}`}>
                                {pi+1}
                              </button>
                            );
                          })}
                        </div>
                        {att.status === "تأخر حصص" && (att.periods||[]).length > 0 && (
                          <div className="text-center text-xs text-orange-600 font-bold mt-1.5">
                            {(att.periods||[]).sort((a,b)=>a-b).map(p=>PERIODS_T[p]).join(" ، ")}
                          </div>
                        )}
                      </td>

                      {/* إبلاغ */}
                      <td className="px-3 py-3 text-center">
                        {att.status !== "حاضر" ? (
                          <button onClick={() => openModal(stu)}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm mx-auto flex items-center gap-1 whitespace-nowrap">
                            📲 إبلاغ
                          </button>
                        ) : (
                          <span className="text-gray-200 text-lg">—</span>
                        )}
                      </td>

                      {/* حذف/تعديل */}
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => startEdit(stu)}
                            className="text-blue-300 hover:text-blue-500 text-sm p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="تعديل">✏️</button>
                          <button onClick={() => removeStudent(stu.id)}
                            className="text-red-300 hover:text-red-500 text-sm p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="حذف">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filtered.map((stu, idx) => {
              const att = getAtt(stu.id);
              return (
                <div key={stu.id} className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-gray-400 ml-1">{idx+1}.</span>
                      <span className="font-bold text-gray-800 text-sm">{stu.name}</span>
                      {stu.nationalId && <div className="text-xs text-gray-400 mt-0.5">🪪 {stu.nationalId}</div>}
                      {stu.phone      && <div className="text-xs text-gray-400">📞 {stu.phone}</div>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {att.status !== "حاضر" && (
                        <button onClick={() => openModal(stu)}
                          className="bg-teal-600 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold">📲</button>
                      )}
                      <button onClick={() => startEdit(stu)} className="bg-blue-50 text-blue-500 rounded-xl px-2 py-1.5 text-xs">✏️</button>
                      <button onClick={() => removeStudent(stu.id)} className="bg-red-50 text-red-400 rounded-xl px-2 py-1.5 text-xs">🗑️</button>
                    </div>
                  </div>
                  {/* Edit */}
                  {editId === stu.id && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <input value={editData.name} onChange={e=>setEditData(p=>({...p,name:e.target.value}))}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none" placeholder="الاسم" />
                      <input value={editData.nationalId} onChange={e=>setEditData(p=>({...p,nationalId:e.target.value}))}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none" placeholder="رقم الهوية" />
                      <input value={editData.phone} onChange={e=>setEditData(p=>({...p,phone:e.target.value}))}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none" placeholder="الجوال" />
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="bg-rose-600 text-white rounded-lg px-4 py-1.5 text-xs font-bold">حفظ</button>
                        <button onClick={()=>setEditId(null)} className="bg-gray-200 text-gray-600 rounded-lg px-4 py-1.5 text-xs">إلغاء</button>
                      </div>
                    </div>
                  )}
                  {/* Status */}
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map(s => (
                      <button key={s.key} onClick={() => setStatus(stu.id, s.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${att.status===s.key ? statusBadge(s.key) : "bg-white text-gray-400 border-gray-200"}`}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                  {/* Periods */}
                  {att.status === "تأخر حصص" && (
                    <div>
                      <div className="text-xs text-gray-500 font-bold mb-1.5">اختر الحصص المتأخر عنها:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {PERIODS_T.map((p, pi) => (
                          <button key={pi} onClick={() => togglePeriod(stu.id, pi)}
                            className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all ${(att.periods||[]).includes(pi) ? "bg-orange-500 text-white border-orange-500 shadow-md" : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"}`}>
                            {pi+1}
                          </button>
                        ))}
                      </div>
                      {(att.periods||[]).length > 0 && (
                        <div className="text-xs text-orange-600 font-bold mt-1.5">
                          {(att.periods||[]).sort((a,b)=>a-b).map(p=>PERIODS_T[p]).join(" ، ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* - Madar Modal - */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-l from-teal-800 to-teal-600 rounded-t-2xl p-5 text-white">
              <h3 className="font-black text-lg flex items-center gap-2">📲 إبلاغ ولي الأمر</h3>
              <p className="text-sm opacity-80 mt-1 font-bold">{modal.stu.name}</p>
              {modal.stu.phone && <p className="text-xs opacity-60 mt-0.5">{modal.stu.phone}</p>}
            </div>
            <div className="p-5 space-y-4">
              {/* رسالة */}
              <div>
                <div className="text-xs font-bold text-gray-500 mb-2">✉️ نص الرسالة المقترح:</div>
                <div dir="rtl" className="bg-gray-50 border-2 border-gray-100 rounded-xl p-3.5 text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                  {modal.msg}
                </div>
              </div>
              {/* أزرار */}
              <div className="space-y-2">
                <button onClick={copyMsg}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${copied ? "bg-emerald-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                  {copied ? "✅ تم نسخ الرسالة!" : "📋 نسخ الرسالة"}
                </button>
                <a href={MADAR_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white text-center block shadow-md transition-colors">
                  🌐 فتح المدار التقني وإرسال الرسالة
                </a>
                {modal.stu.phone && (
                  <a href={`https://wa.me/966${modal.stu.phone.replace(/^0/,"")}?text=${encodeURIComponent(modal.msg)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl text-sm font-bold bg-green-500 hover:bg-green-600 text-white text-center block shadow-md transition-colors">
                    💬 إرسال عبر واتساب
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center">انسخ الرسالة أولاً ثم افتح المدار وأرسلها</p>
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setModal(null)} className="w-full py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">إغلاق</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==================== PROGRAM REPORT PAGE ====================
// ===== محرر نصوص غني =====
const COLORS_RF = ['#111827','#1d4ed8','#047857','#b91c1c','#92400e','#6d28d9'];
const applySize = (px) => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed) return;
  const span = document.createElement('span');
  span.style.fontSize = px;
  try { range.surroundContents(span); } catch(e) {}
};

const RichField = ({ label, value, onChange, placeholder, rows }) => {
  const elRef = useRef(null);
  const [show, setShow] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (elRef.current && value && !initialized.current) {
      elRef.current.innerHTML = value;
      initialized.current = true;
    }
  }, []);
  const cmd = (c, v) => { document.execCommand(c, false, v || null); elRef.current && elRef.current.focus(); };
  const save = () => { if (elRef.current && onChange) onChange(elRef.current.innerHTML); };
  const minH = ((rows || 5) * 24) + 'px';
  return (
    <div>
      {label && <label className="text-xs font-bold text-teal-700 mb-1 block">{label}</label>}
      <div className={`flex flex-wrap items-center gap-1 mb-1.5 p-1.5 bg-gray-50 rounded-xl border border-gray-200 ${show ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
        <button type="button" onMouseDown={e => { e.preventDefault(); cmd('bold'); }} className="px-2 py-0.5 rounded text-xs font-black border border-gray-300 hover:bg-gray-200"><b>B</b></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); cmd('underline'); }} className="px-2 py-0.5 rounded text-xs border border-gray-300 hover:bg-gray-200 underline">U</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); cmd('italic'); }} className="px-2 py-0.5 rounded text-xs border border-gray-300 hover:bg-gray-200 italic">I</button>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        {['13px','16px','20px','24px'].map((sz, idx) => (
          <button type="button" key={sz} onMouseDown={e => { e.preventDefault(); applySize(sz); }} className="px-2 py-0.5 rounded text-xs border border-gray-300 hover:bg-blue-100">
            {['صغير','متوسط','كبير','أكبر'][idx]}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        {COLORS_RF.map(c => (
          <button type="button" key={c} onMouseDown={e => { e.preventDefault(); cmd('foreColor', c); }} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />
        ))}
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <button type="button" onMouseDown={e => { e.preventDefault(); cmd('removeFormat'); }} className="px-2 py-0.5 rounded text-xs border border-gray-300 hover:bg-red-100 text-red-500">✕</button>
      </div>
      <div
        ref={elRef}
        contentEditable
        suppressContentEditableWarning
        dir="rtl"
        onFocus={() => setShow(true)}
        onBlur={() => { setShow(false); save(); }}
        onInput={save}
        className="w-full border-2 border-gray-200 focus:border-teal-400 rounded-xl px-3 py-2 text-sm focus:outline-none"
        style={{ minHeight: minH }}
        data-ph={placeholder}
      />

    </div>
  );
};

function ProgramReportPage() {
  const [region,      setRegion]      = useState("");
  const [office,      setOffice]      = useState("مكتب التعليم");
  const [progName,    setProgName]    = useState("");
  const [executor,    setExecutor]    = useState("");
  const [location,    setLocation]    = useState("");
  const [targetGroup, setTargetGroup] = useState("");
  const [objectives,  setObjectives]  = useState(["","","","",""]);
  const [benefCount,  setBenefCount]  = useState("");
  const [dateDay,     setDateDay]     = useState("");
  const [dateMonth,   setDateMonth]   = useState("");
  const [dateYear,    setDateYear]    = useState("1447");
  const [witnesses,   setWitnesses]   = useState([null,null,null,null,null]);
  const [saved,       setSaved]       = useState(false);

  React.useEffect(() => {
    try {
      const s = localStorage.getItem("prog_report_v2");
      if (s) {
        const d = JSON.parse(s);
        if (d.region !== undefined)      setRegion(d.region);
        if (d.office !== undefined)      setOffice(d.office);
        if (d.progName !== undefined)    setProgName(d.progName);
        if (d.executor !== undefined)    setExecutor(d.executor);
        if (d.location !== undefined)    setLocation(d.location);
        if (d.targetGroup !== undefined) setTargetGroup(d.targetGroup);
        if (d.objectives !== undefined)  setObjectives(d.objectives);
        if (d.benefCount !== undefined)  setBenefCount(d.benefCount);
        if (d.dateDay !== undefined)     setDateDay(d.dateDay);
        if (d.dateMonth !== undefined)   setDateMonth(d.dateMonth);
        if (d.dateYear !== undefined)    setDateYear(d.dateYear);
        if (d.witnesses !== undefined)   setWitnesses(d.witnesses);
      }
    } catch(e) {}
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem("prog_report_v2", JSON.stringify({
          region, office, progName, executor, location, targetGroup,
          objectives, benefCount, dateDay, dateMonth, dateYear, witnesses
        }));
      } catch(e) {}
    }, 800);
    return () => clearTimeout(t);
  }, [region, office, progName, executor, location, targetGroup, objectives, benefCount, dateDay, dateMonth, dateYear, witnesses]);

  const dateStr = dateDay && dateMonth
    ? String(dateDay).padStart(2,"0") + " / " + dateMonth + " / " + dateYear + " هـ"
    : "_____ / _____ / " + dateYear + " هـ";

  const handlePaste = (idx, e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = ev => { setWitnesses(ws => ws.map((w,j) => j===idx ? ev.target.result : w)); };
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  };

  const handleFile = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setWitnesses(ws => ws.map((w,j) => j===idx ? ev.target.result : w));
    reader.readAsDataURL(file);
  };

  const removeWitness = idx => setWitnesses(ws => ws.map((w,j) => j===idx ? null : w));

  const printReport = () => {
    const activeWit = witnesses.filter(w => w);
    const witGrid = activeWit.map((w,i) =>
      "<div class=\"wb\"><img src=\"" + w + "\" /><div class=\"wn\">شاهد " + (i+1) + "</div></div>"
    ).join("");
    printWindow("<!DOCTYPE html><html dir=\"rtl\" lang=\"ar\">\n<head><meta charset=\"UTF-8\">\n<link href=\"https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap\" rel=\"stylesheet\">\n<style>\n*{margin:0;padding:0;box-sizing:border-box}\nbody{font-family:'Cairo',sans-serif;direction:rtl;background:#fff;color:#111;font-size:12px}\n.page{width:210mm;margin:0 auto;padding:8mm 10mm}\n.hdr{display:flex;align-items:center;justify-content:space-between;border-bottom:2.5px solid #1a5276;padding-bottom:6px;margin-bottom:6px}\n.hdr-r{text-align:right;font-size:12px;font-weight:700;color:#1a5276;line-height:1.8}\n.hdr-l{text-align:left;font-size:11px;font-weight:700;color:#555}\n.logo{width:52px}\n.school-bar{background:#1a5276;color:#fff;text-align:center;padding:5px 10px;font-size:15px;font-weight:900;margin:5px 0}\n.prog-bar{text-align:center;padding:4px;font-size:12px;font-weight:700;color:#1a5276;border-bottom:1.5px solid #1a5276;margin-bottom:4px}\n.prog-val{text-align:center;padding:6px;font-size:14px;font-weight:900;min-height:28px;margin-bottom:8px;background:#eaf4fb;border-radius:4px}\n.g2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:7px}\n.fb{border:1.5px solid #1a5276;border-radius:4px;overflow:hidden}\n.fl{background:#1a5276;color:#fff;font-size:10px;font-weight:700;padding:3px 8px;text-align:center}\n.fv{padding:5px 8px;min-height:24px;font-size:11px;white-space:pre-wrap}\n.obj .fv{min-height:70px}\n.ws-title{background:#1a5276;color:#fff;text-align:center;padding:4px;font-size:12px;font-weight:900;margin:8px 0 5px}\n.wg{display:grid;grid-template-columns:1fr 1fr;gap:7px}\n.wb{border:1.5px solid #1a5276;border-radius:3px;overflow:hidden;text-align:center}\n.wb img{width:100%;max-height:150px;object-fit:contain;display:block}\n.wn{font-size:9px;color:#1a5276;font-weight:700;padding:1px}\n.ft{margin-top:10px;display:flex;justify-content:flex-end;font-size:11px;font-weight:700;border-top:1.5px solid #1a5276;padding-top:6px}\n@media print{@page{size:A4;margin:8mm 10mm}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}\n</style></head><body><div class=\"page\">\n<div class=\"hdr\">\n  <div class=\"hdr-r\">الإدارة العامة للتعليم" + (region ? "<br>بمحافظة " + region : "") + "<br>" + office + "</div>\n  <img src=\"" + LOGO_URL + "\" class=\"logo\" alt=\"شعار\" />\n  <div class=\"hdr-l\">وزارة التعليم<br>Ministry of Education</div>\n</div>\n<div class=\"school-bar\">مدرسة عبيدة بن الحارث المتوسطة</div>\n<div class=\"prog-bar\">اسم البرنامج</div>\n<div class=\"prog-val\">" + (progName || "&nbsp;") + "</div>\n<div class=\"g2\">\n  <div class=\"fb\"><div class=\"fl\">المنفذ</div><div class=\"fv\">" + (executor || "&nbsp;") + "</div></div>\n  <div class=\"fb\"><div class=\"fl\">مكان التنفيذ</div><div class=\"fv\">" + (location || "&nbsp;") + "</div></div>\n</div>\n<div class=\"g2\">\n  <div class=\"fb obj\"><div class=\"fl\">الأهداف</div><div class=\"fv\">" + (objectives.filter(o=>o.trim()).map((o,i)=>(i+1)+". "+o).join("\n") || "&nbsp;") + "</div></div>\n  <div>\n    <div class=\"fb\" style=\"margin-bottom:6px\"><div class=\"fl\">المستهدفون</div><div class=\"fv\">" + (targetGroup || "&nbsp;") + "</div></div>\n    <div class=\"fb\" style=\"margin-bottom:6px\"><div class=\"fl\">عدد المستفيدين</div><div class=\"fv\">" + (benefCount || "&nbsp;") + "</div></div>\n    <div class=\"fb\"><div class=\"fl\">تاريخ التنفيذ</div><div class=\"fv\">" + dateStr + "</div></div>\n  </div>\n</div>\n" + (activeWit.length > 0 ? "<div class=\"ws-title\">الشواهد</div><div class=\"wg\">" + witGrid + "</div>" : "") + "\n<div class=\"ft\">توقيع المعلم: ____________________</div>\n</div><script>window.onload=()=>window.print()<\/script></body></html>");
  };

  const ic = "w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm";
  const st = { fontFamily: "inherit" };

  return (
    <div dir="rtl" className="space-y-4 max-w-3xl mx-auto">
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#0f2d55,#1a6696)"}}>
        <div className="p-5 text-white flex items-center gap-4">
          <img src={LOGO_URL} alt="وزارة التعليم" className="h-14 w-auto" style={{filter:"brightness(0) invert(1) opacity(.85)"}} />
          <div>
            <h2 className="text-xl font-black">تقرير تنفيذ برنامج</h2>
            <p className="text-blue-200 text-sm">النموذج الرسمي — وزارة التعليم</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-black text-blue-800 text-sm mb-1">بيانات الجهة</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">الإدارة العامة للتعليم — بمحافظة / منطقة (اختياري)</label>
            <input value={region} onChange={e=>setRegion(e.target.value)} placeholder="اختياري: جدة، الرياض..." className={ic} style={st} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">مكتب / إدارة التعليم</label>
            <input value={office} onChange={e=>setOffice(e.target.value)} className={ic} style={st} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-black text-blue-800 text-sm mb-1">بيانات البرنامج</h3>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">اسم البرنامج</label>
          <input value={progName} onChange={e=>setProgName(e.target.value)} placeholder="اسم البرنامج..." className={ic} style={st} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-gray-500 block mb-1">المنفذ</label><input value={executor} onChange={e=>setExecutor(e.target.value)} placeholder="المعلم / ..." className={ic} style={st} /></div>
          <div><label className="text-xs font-bold text-gray-500 block mb-1">مكان التنفيذ</label><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="الفصول الدراسية / ..." className={ic} style={st} /></div>
          <div><label className="text-xs font-bold text-gray-500 block mb-1">المستهدفون</label><input value={targetGroup} onChange={e=>setTargetGroup(e.target.value)} placeholder="الطلاب / ..." className={ic} style={st} /></div>
          <div><label className="text-xs font-bold text-gray-500 block mb-1">عدد المستفيدين</label><input value={benefCount} onChange={e=>setBenefCount(e.target.value)} placeholder="أكثر من 70 طالب / ..." className={ic} style={st} /></div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">تاريخ التنفيذ (هجري)</label>
          <div className="flex gap-2 items-center">
            <select value={dateDay} onChange={e=>setDateDay(e.target.value)} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none" style={st}>
              <option value="">يوم</option>
              {Array.from({length:30},(_,i)=>i+1).map(d=><option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
            </select>
            <span className="font-bold text-gray-400">/</span>
            <select value={dateMonth} onChange={e=>setDateMonth(e.target.value)} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={st}>
              <option value="">الشهر</option>
              {HIJRI_M.map((m,i)=><option key={i} value={m}>{m}</option>)}
            </select>
            <span className="font-bold text-gray-400">/</span>
            <select value={dateYear} onChange={e=>setDateYear(e.target.value)} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none" style={st}>
              {[1445,1446,1447,1448,1449].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-sm font-bold text-gray-500">هـ</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-black text-blue-800 text-sm mb-3">الأهداف</h3>
        <div className="space-y-2">
          {objectives.map((obj,i)=>(
            <div key={i} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{background:"#1a6696"}}>{i+1}</div>
              <input value={obj} onChange={e=>setObjectives(ob=>ob.map((x,j)=>j===i?e.target.value:x))} placeholder={"الهدف "+(i+1)+"..."} className={ic} style={st} />
              {objectives.length > 3 && <button onClick={()=>setObjectives(ob=>ob.filter((_,j)=>j!==i))} className="text-red-400 px-1 text-sm">x</button>}
            </div>
          ))}
          <button onClick={()=>setObjectives(ob=>[...ob,""])} className="text-xs font-black text-blue-700 hover:underline mt-1">+ إضافة هدف</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-black text-blue-800 text-sm mb-1">الشواهد</h3>
        <p className="text-xs text-blue-400 mb-3 bg-blue-50 rounded-xl px-3 py-2">انقر على أي مربع ثم اضغط Ctrl+V للصق الصورة مباشرة، أو اضغط لاختيار ملف</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {witnesses.map((w, idx) => (
            <div key={idx}>
              {w ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-blue-400 group">
                  <img src={w} alt={"شاهد "+(idx+1)} className="w-full object-cover" style={{maxHeight:160}} />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <button onClick={()=>removeWitness(idx)} className="opacity-0 group-hover:opacity-100 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-xl">حذف</button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-black text-white py-0.5" style={{background:"rgba(26,102,150,0.85)"}}>شاهد {idx+1}</div>
                </div>
              ) : (
                <label tabIndex={0} onPaste={e=>handlePaste(idx,e)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 cursor-pointer hover:bg-blue-100 hover:border-blue-500 transition-all focus:border-blue-500 focus:outline-none"
                  style={{minHeight:130,padding:"16px 8px"}}>
                  <span className="text-3xl">📷</span>
                  <span className="text-xs font-black text-blue-700">شاهد {idx+1}</span>
                  <span className="text-xs text-blue-400 text-center leading-relaxed">Ctrl+V للصق<br/>أو اضغط لملف</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e=>{ if(e.target.files[0]) handleFile(idx,e.target.files[0]); e.target.value=""; }} />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} className="flex-1 py-4 rounded-2xl text-white font-black text-sm shadow-lg" style={{background:"linear-gradient(135deg,#1a6696,#0f2d55)"}}>
          {saved ? "تم الحفظ" : "حفظ التقرير"}
        </button>
        <button onClick={printReport} className="flex-1 py-4 rounded-2xl text-white font-black text-sm shadow-lg" style={{background:"linear-gradient(135deg,#155724,#28a745)"}}>
          طباعة / PDF
        </button>
        <button onClick={()=>{ if(window.confirm("تصفير جميع البيانات؟")) { setRegion(""); setOffice("مكتب التعليم"); setProgName(""); setExecutor(""); setLocation(""); setTargetGroup(""); setObjectives(["","","","",""]); setBenefCount(""); setDateDay(""); setDateMonth(""); setDateYear("1447"); setWitnesses([null,null,null,null,null]); try { localStorage.removeItem("prog_report_v2"); } catch(e) {} }}} className="px-5 py-4 rounded-2xl text-gray-400 font-black text-sm border-2 border-gray-200 hover:border-red-300 hover:text-red-500 transition-all">
          🗑
        </button>
      </div>
    </div>
  );
}


function MonthlyReportPage({ teachers, attendance, week, weekArchive, classList, announcements, activities }) {
  const [reportType, setReportType] = useState("monthly"); // monthly | semester
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(1447);
  const [semester, setSemester] = useState("الثالث");

  // دمج كل الأسابيع
  const allWeeks = [
    { id:"current", week, attendance, label: weekLabel(week) },
    ...(weekArchive||[]).map(w=>({ id:w.id, week:w.week, attendance:w.attendance, label:weekLabel(w.week) }))
  ];

  // تصفية الأسابيع حسب الشهر الهجري المختار
  const filteredWeeks = reportType === "monthly"
    ? allWeeks.filter(w => {
        const h = w.week.days[0]?.dateH || "";
        const parts = h.split("/");
        if (parts.length < 3) return false;
        return parseInt(parts[1]) === selectedMonth && parseInt(parts[2]) === selectedYear;
      })
    : allWeeks;

  const displayWeeks = filteredWeeks.length > 0 ? filteredWeeks : allWeeks.slice(0,1);

  // إحصائيات المعلمين
  const teacherStats = teachers.map((name, ti) => {
    let totalDays=0, absent=0, lateMorn=0, latePeriod=0, lateMins=0;
    displayWeeks.forEach(({attendance:att, week:w}) => {
      w.days.forEach((_,di) => {
        const r = att[ti]?.[di] || {};
        const st = r.status || "حاضر";
        totalDays++;
        if (st==="غائب") absent++;
        else if (st==="متأخر") {
          lateMins += parseInt(r.lateMinutes)||0;
          if (r.lateType==="حصص") latePeriod++;
          else lateMorn++;
        }
      });
    });
    const present = totalDays - absent - lateMorn - latePeriod;
    const rate = totalDays>0 ? Math.round((present/totalDays)*100) : 100;
    return { name, totalDays, absent, lateMorn, latePeriod, lateMins, present, rate };
  });

  const totalAbsent = teacherStats.reduce((s,t)=>s+t.absent,0);
  const totalLate   = teacherStats.reduce((s,t)=>s+t.lateMorn+t.latePeriod,0);
  const avgRate     = teacherStats.length>0 ? Math.round(teacherStats.reduce((s,t)=>s+t.rate,0)/teacherStats.length) : 100;
  const totalStudents = classList.reduce((s,c)=>s+c.students.filter(st=>st.name).length,0);

  const printReport = () => {
    const period = reportType==="monthly"
      ? HIJRI_MONTHS[selectedMonth-1]+" "+selectedYear+" هـ"
      : "الفصل "+semester+" "+selectedYear+" هـ";

    const rows = teacherStats.map((t,i) => {
      const rateColor = t.rate>=95?"#dcfce7":t.rate>=80?"#fef3c7":"#fee2e2";
      const rateText  = t.rate>=95?"#166534":t.rate>=80?"#92400e":"#991b1b";
      return `<tr style="background:${i%2===0?"#fff":"#f9fafb"}">
        <td style="padding:8px 12px;font-weight:600">${t.name}</td>
        <td style="text-align:center;color:#dc2626;font-weight:700">${t.absent||"—"}</td>
        <td style="text-align:center;color:#d97706;font-weight:700">${t.lateMorn||"—"}</td>
        <td style="text-align:center;color:#ea580c;font-weight:700">${t.latePeriod||"—"}</td>
        <td style="text-align:center;color:#64748b">${t.lateMins>0?t.lateMins+"د":"—"}</td>
        <td style="text-align:center;font-weight:700;color:#16a34a">${t.present}</td>
        <td style="text-align:center"><span style="background:${rateColor};color:${rateText};padding:3px 10px;border-radius:20px;font-weight:700;font-size:12px">${t.rate}%</span></td>
      </tr>`;
    }).join("");

    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
    <title>التقرير الشهري — ${period}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Cairo',sans-serif;direction:rtl;color:#1e293b;background:#fff;padding:20px}
      .header{background:linear-gradient(135deg,#0f4c75,#0d9488);color:white;padding:20px 24px;border-radius:12px;margin-bottom:20px}
      .header h1{font-size:20px;font-weight:900}
      .header p{font-size:13px;opacity:.8;margin-top:4px}
      .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
      .kpi{background:#f8fafc;border-radius:10px;padding:12px;text-align:center;border:1px solid #e2e8f0}
      .kpi-num{font-size:24px;font-weight:900;margin-bottom:4px}
      .kpi-lbl{font-size:11px;color:#64748b;font-weight:600}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#1e3a5f;color:white;padding:10px 12px;text-align:right;font-weight:700}
      tr:hover{background:#f0f9ff}
      .footer{text-align:center;margin-top:20px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px}
      @media print{@page{size:A4;margin:1.5cm}body{padding:0}}
    </style></head><body>
    <div class="header">
      <h1>🏫 مدرسة عبيدة بن الحارث المتوسطة</h1>
      <p>تقرير الحضور والغياب — ${period} | ${displayWeeks.length} أسبوع | إجمالي الأيام: ${teacherStats[0]?.totalDays||0} يوم لكل معلم</p>
    </div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-num" style="color:#22c55e">${avgRate}%</div><div class="kpi-lbl">معدل الحضور</div></div>
      <div class="kpi"><div class="kpi-num" style="color:#ef4444">${totalAbsent}</div><div class="kpi-lbl">إجمالي الغياب</div></div>
      <div class="kpi"><div class="kpi-num" style="color:#f59e0b">${totalLate}</div><div class="kpi-lbl">إجمالي التأخر</div></div>
      <div class="kpi"><div class="kpi-num" style="color:#3b82f6">${teachers.length}</div><div class="kpi-lbl">عدد المعلمين</div></div>
    </div>
    <table>
      <thead><tr>
        <th>اسم المعلم / الإداري</th>
        <th style="text-align:center">غياب</th>
        <th style="text-align:center">تأخر صباحي</th>
        <th style="text-align:center">تأخر حصص</th>
        <th style="text-align:center">الدقائق</th>
        <th style="text-align:center">حضور</th>
        <th style="text-align:center">نسبة الحضور</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">
      مدرسة عبيدة بن الحارث المتوسطة — بوابة الإدارة الإلكترونية © ١٤٤٧ هـ |
      تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")}
    </div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
  };

  return (
    <div dir="rtl">
      {/* رأس الصفحة */}
      <div className="rounded-3xl overflow-hidden mb-6 shadow-xl" style={{background:"linear-gradient(135deg,#0f4c75,#1B6CA8)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">📋 التقرير الشهري والفصلي</h2>
          <p className="opacity-80 text-sm">تقارير متكاملة جاهزة للطباعة للمشرف والإدارة</p>
        </div>
      </div>

      {/* إعدادات التقرير */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
        <h3 className="font-black text-gray-800 mb-4 text-sm">⚙️ إعدادات التقرير</h3>

        {/* نوع التقرير */}
        <div className="flex gap-3 mb-4">
          {[{v:"monthly",l:"📅 شهري"},{v:"semester",l:"📚 فصلي"}].map(t=>(
            <button key={t.v} onClick={()=>setReportType(t.v)}
              className={"flex-1 py-2.5 rounded-xl text-sm font-black border-2 transition-all " +
                (reportType===t.v?"bg-blue-600 text-white border-blue-600":"bg-white text-gray-600 border-gray-200 hover:border-blue-300")}>
              {t.l}
            </button>
          ))}
        </div>

        {reportType==="monthly" ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={cx.label}>الشهر الهجري</label>
              <select value={selectedMonth} onChange={e=>setSelectedMonth(Number(e.target.value))}
                className={cx.input} style={{fontFamily:"inherit"}}>
                {HIJRI_MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={cx.label}>السنة الهجرية</label>
              <select value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))}
                className={cx.input} style={{fontFamily:"inherit"}}>
                {Array.from({length:10},(_,i)=>1444+i).map(y=><option key={y} value={y}>{y} هـ</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 font-bold text-center">
                {filteredWeeks.length} أسبوع مطابق
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cx.label}>الفصل الدراسي</label>
              <select value={semester} onChange={e=>setSemester(e.target.value)}
                className={cx.input} style={{fontFamily:"inherit"}}>
                <option>الأول</option><option>الثاني</option><option>الثالث</option>
              </select>
            </div>
            <div>
              <label className={cx.label}>السنة الهجرية</label>
              <select value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))}
                className={cx.input} style={{fontFamily:"inherit"}}>
                {Array.from({length:5},(_,i)=>1445+i).map(y=><option key={y} value={y}>{y} هـ</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* معاينة الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {icon:"📅",label:"أسابيع في التقرير",value:displayWeeks.length,color:"#3b82f6",bg:"#eff6ff"},
          {icon:"✅",label:"معدل الحضور",value:avgRate+"%",color:avgRate>=90?"#22c55e":avgRate>=80?"#f59e0b":"#ef4444",bg:avgRate>=90?"#dcfce7":avgRate>=80?"#fef3c7":"#fee2e2"},
          {icon:"❌",label:"إجمالي الغياب",value:totalAbsent,color:"#dc2626",bg:"#fee2e2"},
          {icon:"⚠️",label:"إجمالي التأخر",value:totalLate,color:"#d97706",bg:"#fef3c7"},
        ].map(s=>(
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{background:s.bg}}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black" style={{color:s.color}}>{s.value}</div>
            <div className="text-xs font-bold opacity-70" style={{color:s.color}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* جدول المعلمين */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-5">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{background:"#1e3a5f"}}>
          <h3 className="font-black text-white text-sm">📊 تفاصيل الحضور</h3>
          <span className="text-xs text-blue-200">{displayWeeks.length} أسبوع — {teacherStats[0]?.totalDays||0} يوم لكل معلم</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-black text-gray-500">المعلم</th>
                <th className="px-3 py-3 text-center text-xs font-black text-red-600">غياب</th>
                <th className="px-3 py-3 text-center text-xs font-black text-amber-600">تأخر ص</th>
                <th className="px-3 py-3 text-center text-xs font-black text-orange-600">تأخر ح</th>
                <th className="px-3 py-3 text-center text-xs font-black text-gray-500">دقائق</th>
                <th className="px-3 py-3 text-center text-xs font-black text-green-600">حضور</th>
                <th className="px-3 py-3 text-center text-xs font-black text-blue-600">النسبة</th>
              </tr>
            </thead>
            <tbody>
              {teacherStats.sort((a,b)=>b.absent-a.absent).map((t,i)=>{
                const rc=t.rate>=95?"bg-green-100 text-green-700":t.rate>=80?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700";
                return (
                  <tr key={t.name} className={i%2===0?"":"bg-gray-50"}>
                    <td className="px-4 py-3 font-bold text-gray-800 text-sm">{t.name}</td>
                    <td className="px-3 py-3 text-center font-black text-red-600">{t.absent||"—"}</td>
                    <td className="px-3 py-3 text-center font-black text-amber-600">{t.lateMorn||"—"}</td>
                    <td className="px-3 py-3 text-center font-black text-orange-600">{t.latePeriod||"—"}</td>
                    <td className="px-3 py-3 text-center text-gray-400 text-xs">{t.lateMins>0?t.lateMins+"د":"—"}</td>
                    <td className="px-3 py-3 text-center font-black text-green-600">{t.present}</td>
                    <td className="px-3 py-3 text-center"><span className={"text-xs font-black px-2 py-1 rounded-full "+rc}>{t.rate}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* زر الطباعة */}
      <button onClick={printReport}
        className="w-full py-4 rounded-2xl text-white font-black text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
        style={{background:"linear-gradient(135deg,#0f4c75,#0d9488)"}}>
        🖨️ طباعة التقرير / حفظ PDF
        <span className="text-sm opacity-70 font-normal">جاهز للمشرف والإدارة</span>
      </button>
    </div>
  );
}


// ===== ملف المعلم وإدارة الإجازات =====
function TeacherProfilePage({ teachers, attendance, week, weekArchive, classList }) {
  const [selectedTeacher, setSelectedTeacher] = useState(teachers[0] || "");
  const [tab, setTab] = useState("profile"); // profile | leaves | performance
  const [leaves, setLeaves] = useState({});
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type:"اضطراري", dateH:"", dateM:"", reason:"", days:1, status:"بانتظار الموافقة" });

  React.useEffect(() => {
    DB.get("school-teacher-leaves", {}).then(data => {
      if (data && typeof data === "object") setLeaves(data);
    });
  }, []);

  const saveLeaves = (v) => { setLeaves(v); DB.set("school-teacher-leaves", v); };

  const addLeave = () => {
    if (!leaveForm.dateH.trim()) { alert("أدخل التاريخ"); return; }
    const tLeaves = [...(leaves[selectedTeacher]||[]), { id:Date.now(), ...leaveForm }];
    saveLeaves({ ...leaves, [selectedTeacher]: tLeaves });
    setLeaveForm({ type:"اضطراري", dateH:"", dateM:"", reason:"", days:1, status:"بانتظار الموافقة" });
    setShowLeaveForm(false);
  };

  const updateLeaveStatus = (id, status) => {
    const tLeaves = (leaves[selectedTeacher]||[]).map(l => l.id===id ? {...l,status} : l);
    saveLeaves({ ...leaves, [selectedTeacher]: tLeaves });
  };

  const ti = teachers.indexOf(selectedTeacher);

  // إحصائيات المعلم المختار
  const allWeeks = [
    { week, attendance },
    ...(weekArchive||[]).map(w=>({ week:w.week, attendance:w.attendance }))
  ];

  const stats = (() => {
    let totalDays=0, absent=0, lateMorn=0, latePeriod=0, lateMins=0;
    allWeeks.forEach(({week:w, attendance:att}) => {
      if (ti < 0) return;
      w.days.forEach((_,di) => {
        const r = att[ti]?.[di] || {};
        const st = r.status || "حاضر";
        totalDays++;
        if (st==="غائب") absent++;
        else if (st==="متأخر") {
          lateMins += parseInt(r.lateMinutes)||0;
          if (r.lateType==="حصص") latePeriod++; else lateMorn++;
        }
      });
    });
    const present = totalDays - absent - lateMorn - latePeriod;
    const rate = totalDays>0 ? Math.round((present/totalDays)*100) : 100;
    return { totalDays, absent, lateMorn, latePeriod, lateMins, present, rate };
  })();

  // إجازات المعلم
  const tLeaves = leaves[selectedTeacher] || [];
  const leaveBalance = { اضطراري: { total:10, used: tLeaves.filter(l=>l.type==="اضطراري"&&l.status==="موافق").reduce((s,l)=>s+l.days,0) }, مرضي: { total:30, used: tLeaves.filter(l=>l.type==="مرضي"&&l.status==="موافق").reduce((s,l)=>s+l.days,0) }, اعتيادي: { total:30, used: tLeaves.filter(l=>l.type==="اعتيادي"&&l.status==="موافق").reduce((s,l)=>s+l.days,0) } };

  // فصول المعلم
  const teacherClasses = classList.filter(c => c.teacher === selectedTeacher);
  const totalStudents = teacherClasses.reduce((s,c)=>s+c.students.filter(st=>st.name).length,0);

  return (
    <div dir="rtl">
      {/* رأس الصفحة */}
      <div className="rounded-3xl overflow-hidden mb-5 shadow-xl" style={{background:"linear-gradient(135deg,#1e3a5f,#7c3aed)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">👨‍🏫 ملف المعلم</h2>
          <p className="opacity-80 text-sm">بيانات شاملة لكل معلم — الأداء والإجازات والفصول</p>
        </div>
      </div>

      {/* اختيار المعلم */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <label className={cx.label}>اختر المعلم</label>
        <select value={selectedTeacher} onChange={e=>{ setSelectedTeacher(e.target.value); setTab("profile"); }}
          className={cx.input} style={{fontFamily:"inherit"}}>
          {teachers.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {selectedTeacher && (
        <>
          {/* بطاقة المعلم */}
          <div className="rounded-2xl overflow-hidden shadow-xl mb-4" style={{background:"linear-gradient(135deg,#1e3a5f,#2563eb)"}}>
            <div className="p-5 text-white flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-black flex-shrink-0">
                {selectedTeacher.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black">{selectedTeacher}</h3>
                <p className="opacity-70 text-sm mt-0.5">معلم — {teacherClasses.length} فصل — {totalStudents} طالب</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black" style={{color:stats.rate>=95?"#86efac":stats.rate>=80?"#fde68a":"#fca5a5"}}>{stats.rate}%</div>
                <div className="text-xs opacity-70">الحضور</div>
              </div>
            </div>
            <div className="h-2 flex">
              <div style={{width:stats.totalDays>0?(stats.present/stats.totalDays*100)+"%":"100%",background:"#22c55e"}}/>
              <div style={{width:stats.totalDays>0?((stats.lateMorn+stats.latePeriod)/stats.totalDays*100)+"%":"0%",background:"#f59e0b"}}/>
              <div style={{width:stats.totalDays>0?(stats.absent/stats.totalDays*100)+"%":"0%",background:"#ef4444"}}/>
            </div>
          </div>

          {/* تبويبات */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm mb-4">
            {[{id:"profile",l:"الملف",i:"👤"},{id:"leaves",l:"الإجازات",i:"🗓️"},{id:"performance",l:"الأداء",i:"📊"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={"flex-1 py-2.5 rounded-xl text-xs font-black transition-all "+(tab===t.id?"bg-blue-600 text-white shadow":"text-gray-500 hover:bg-gray-50")}>
                {t.i} {t.l}
              </button>
            ))}
          </div>

          {/* تبويب الملف */}
          {tab==="profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {label:"أيام الحضور",value:stats.present,color:"#22c55e",bg:"#dcfce7"},
                  {label:"أيام الغياب",value:stats.absent,color:"#ef4444",bg:"#fee2e2"},
                  {label:"تأخر صباحي",value:stats.lateMorn,color:"#d97706",bg:"#fef3c7"},
                  {label:"دقائق التأخر",value:stats.lateMins+"د",color:"#ea580c",bg:"#fff7ed"},
                ].map(s=>(
                  <div key={s.label} className="rounded-2xl p-4 text-center" style={{background:s.bg}}>
                    <div className="text-2xl font-black" style={{color:s.color}}>{s.value}</div>
                    <div className="text-xs font-bold mt-1" style={{color:s.color,opacity:.7}}>{s.label}</div>
                  </div>
                ))}
              </div>
              {teacherClasses.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-800 mb-3 text-sm">📚 فصوله الدراسية</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {teacherClasses.map(c=>(
                      <div key={c.id} className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3">
                        <span className="font-bold text-gray-800 text-sm">{c.level} / {c.section}</span>
                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold">{c.students.filter(s=>s.name).length} طالب</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تبويب الإجازات */}
          {tab==="leaves" && (
            <div className="space-y-4">
              {/* رصيد الإجازات */}
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(leaveBalance).map(([type,bal])=>{
                  const rem = bal.total - bal.used;
                  const pct = Math.round((bal.used/bal.total)*100);
                  return (
                    <div key={type} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                      <div className="text-xs font-black text-gray-500 mb-2">{type}</div>
                      <div className="text-2xl font-black text-blue-700">{rem}</div>
                      <div className="text-xs text-gray-400">متبقي من {bal.total}</div>
                      <div className="h-2 bg-gray-100 rounded-full mt-2">
                        <div className="h-full rounded-full transition-all" style={{width:pct+"%",background:rem>5?"#22c55e":rem>0?"#f59e0b":"#ef4444"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* زر إضافة إجازة */}
              {!showLeaveForm ? (
                <button onClick={()=>setShowLeaveForm(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-blue-300 text-blue-600 font-black hover:bg-blue-50 transition-all">
                  + طلب إجازة جديدة
                </button>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={cx.label}>نوع الإجازة</label>
                      <select value={leaveForm.type} onChange={e=>setLeaveForm(p=>({...p,type:e.target.value}))}
                        className={cx.input} style={{fontFamily:"inherit"}}>
                        <option>اضطراري</option><option>مرضي</option><option>اعتيادي</option>
                      </select>
                    </div>
                    <div>
                      <label className={cx.label}>عدد الأيام</label>
                      <input type="number" min="1" max="30" value={leaveForm.days}
                        onChange={e=>setLeaveForm(p=>({...p,days:Number(e.target.value)}))}
                        className={cx.input} style={{fontFamily:"inherit"}} />
                    </div>
                    <div>
                      <label className={cx.label}>التاريخ الهجري</label>
                      <input type="text" placeholder="01/10/1447" value={leaveForm.dateH}
                        onChange={e=>setLeaveForm(p=>({...p,dateH:e.target.value}))}
                        className={cx.input} style={{fontFamily:"inherit"}} />
                    </div>
                    <div>
                      <label className={cx.label}>التاريخ الميلادي</label>
                      <input type="text" placeholder="01/04/2026" value={leaveForm.dateM}
                        onChange={e=>setLeaveForm(p=>({...p,dateM:e.target.value}))}
                        className={cx.input} style={{fontFamily:"inherit"}} />
                    </div>
                  </div>
                  <div>
                    <label className={cx.label}>سبب الإجازة</label>
                    <textarea value={leaveForm.reason} onChange={e=>setLeaveForm(p=>({...p,reason:e.target.value}))} rows={2}
                      placeholder="اذكر سبب الإجازة..." className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none resize-none" style={{fontFamily:"inherit"}} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addLeave} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700">✓ حفظ الطلب</button>
                    <button onClick={()=>setShowLeaveForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold">إلغاء</button>
                  </div>
                </div>
              )}

              {/* سجل الإجازات */}
              {tLeaves.length > 0 && (
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-black text-gray-800 text-sm">
                    سجل الإجازات ({tLeaves.length})
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[...tLeaves].reverse().map(l=>(
                      <div key={l.id} className="px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{l.type} — {l.days} يوم</div>
                          <div className="text-xs text-gray-400 mt-0.5">{l.dateH} هـ {l.dateM && `| ${l.dateM}`}</div>
                          {l.reason && <div className="text-xs text-gray-500 mt-0.5">{l.reason}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={"text-xs font-black px-2 py-1 rounded-full " +
                            (l.status==="موافق"?"bg-green-100 text-green-700":l.status==="مرفوض"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700")}>
                            {l.status}
                          </span>
                          {l.status==="بانتظار الموافقة" && (
                            <div className="flex gap-1">
                              <button onClick={()=>updateLeaveStatus(l.id,"موافق")} className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-green-600">✓</button>
                              <button onClick={()=>updateLeaveStatus(l.id,"مرفوض")} className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-red-600">✗</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تبويب الأداء */}
          {tab==="performance" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-4 text-sm">📈 الأداء الأسبوعي</h3>
                <div className="space-y-2">
                  {allWeeks.map((w,i)=>{
                    if (ti < 0) return null;
                    let present=0, total=0;
                    w.week.days.forEach((_,di)=>{
                      const st = w.attendance[ti]?.[di]?.status || "حاضر";
                      total++;
                      if (st==="حاضر") present++;
                    });
                    const rate = total>0 ? Math.round((present/total)*100) : 100;
                    const col = rate>=100?"#22c55e":rate>=80?"#f59e0b":"#ef4444";
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 truncate max-w-[65%]">{weekLabel(w.week)}{i===0?" (الحالي)":""}</span>
                          <span className="text-xs font-black" style={{color:col}}>{rate}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{width:rate+"%",background:col}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


// ===== صفحة تحليل درجات الطلاب — وزارة التعليم 2025 =====
const GA_MODELS = {
  "1":{ name:"نموذج 1", type:"تكويني",  cw:100, fe:0,  round2:"يحتفظ بـ40 ويختبر من 60 (15 شفهي + 45 تحريري)", parts:{"المهام الأدائية والمشاركة":40,"تقويمات شفهية وتحريرية":60} },
  "2":{ name:"نموذج 2", type:"ختامي",   cw:60,  fe:40, round2:"يحتفظ بـ40 ويختبر من 60 اختبار تحريري",        parts:{"المهام الأدائية والمشاركة":40,"تقويمات تحريرية":20,"اختبار نهاية الفترة":40} },
  "3":{ name:"نموذج 3", type:"ختامي",   cw:60,  fe:40, round2:"يحتفظ بـ40 ويختبر من 60 (30 شفهي + 30 تحريري)",parts:{"المهام الأدائية والمشاركة":40,"تقويمات شفهية وتحريرية":20,"اختبار نهاية الفترة":40} },
  "4":{ name:"نموذج 4", type:"تكويني",  cw:100, fe:0,  round2:"يحتفظ بـ40 ويختبر من 60 درجة",                parts:{"المهام الأدائية والمشاركة":40,"تقويمات تحريرية":60} },
  "5":{ name:"نموذج 5", type:"تكويني",  cw:100, fe:0,  round2:"يحتفظ بـ40 ويختبر من 60 (شفهي وتطبيقات عملية)",parts:{"المهام الأدائية والمشاركة":40,"تقويمات وأدوات متنوعة":60} },
  "6":{ name:"نموذج 6", type:"تكويني",  cw:100, fe:0,  round2:"يحتفظ بـ40 ويختبر من 60 (35 تطبيقات + 25 تحريري)",parts:{"المهام الأدائية والمشاركة":40,"تقويمات وتطبيقات عملية":60} },
  "7":{ name:"نموذج 7", type:"ختامي",   cw:60,  fe:40, round2:"يحتفظ بـ40 ويختبر من 60 (20 تطبيقات + 40 تحريري)",parts:{"المهام الأدائية والمشاركة":40,"تقويمات وتطبيقات عملية":20,"اختبار نهاية الفترة":40} },
};
const GA_SUBJECTS = {
  "ابتدائي":{"القرآن الكريم والدراسات الإسلامية":"1","اللغة العربية":"3","الرياضيات":"2","العلوم":"2","اللغة الإنجليزية":"3","الدراسات الاجتماعية":"4","المهارات الرقمية":"6","التربية الفنية":"5","التربية البدنية والدفاع عن النفس":"5","المهارات الحياتية والأسرية":"5"},
  "متوسط":{"القرآن الكريم والدراسات الإسلامية":"1","اللغة العربية":"3","الرياضيات":"2","العلوم":"2","اللغة الإنجليزية":"3","الدراسات الاجتماعية":"4","المهارات الرقمية":"6","التفكير الناقد":"4","التربية الفنية":"5","التربية البدنية والدفاع عن النفس":"5","المهارات الحياتية والأسرية":"5"},
  "ثانوي":{"القرآن الكريم وتفسيره":"1","الكفايات اللغوية":"3","اللغة الإنجليزية":"3","الرياضيات":"2","الفيزياء":"7","الكيمياء":"7","الأحياء":"7","الدراسات الاجتماعية":"4","التقنية الرقمية":"6","التفكير الناقد":"4","التربية الصحية والبدنية":"5","المهارات الحياتية":"4"},
};
const GA_RULES = [
  "يُنفذ التقويم التكويني باستمرار بعد كل وحدة دراسية في جميع المواد",
  "يتم إجراء اختبارات تحريرية قصيرة من (20) درجة مرتين على الأقل خلال الفترة الدراسية",
  "المواد المُقوَّمة ختامياً: الرياضيات والعربية + الإنجليزية والعلوم (باقي الصفوف)",
  "تُطبق النسبة الشرطية (20%) من درجة الاختبار التحريري في المواد المُقوَّمة ختامياً",
  "عند إخفاق الطالب يحتفظ بـ (40) درجة ويُختبر الدور الثاني من (60) درجة",
  "لا يُمنح الطالب درجة كاملة في المشاركة في المقرر الذي غاب فيه بدون عذر",
  "لا يُعاد للطالب المتغيب بدون عذر عن الاختبارات القصيرة",
];
const GA_CC = ["#2dd4bf","#f472b6","#818cf8","#fb923c","#34d399","#f87171","#a78bfa","#fbbf24","#38bdf8","#e879f9","#84cc16","#06b6d4"];
function gaGradeLabel(p){ 
  if(p>=90) return{l:"ممتاز",    c:"#10b981",bg:"#dcfce7"};
  if(p>=80) return{l:"جيد جداً", c:"#3b82f6",bg:"#dbeafe"};
  if(p>=70) return{l:"جيد",      c:"#f59e0b",bg:"#fef3c7"};
  if(p>=60) return{l:"مقبول",    c:"#f97316",bg:"#ffedd5"};
  if(p>=50) return{l:"ضعيف",     c:"#ef4444",bg:"#fee2e2"};
  return          {l:"دون المستوى",c:"#991b1b",bg:"#fce7f3"};
}
function gaGradeLabelFromStr(str){
  const map={"ممتاز":{l:"ممتاز",c:"#10b981",bg:"#dcfce7"},"جيد جداً":{l:"جيد جداً",c:"#3b82f6",bg:"#dbeafe"},"جيد":{l:"جيد",c:"#f59e0b",bg:"#fef3c7"},"مقبول":{l:"مقبول",c:"#f97316",bg:"#ffedd5"},"ضعيف":{l:"ضعيف",c:"#ef4444",bg:"#fee2e2"}};
  return map[str] || {l:str||"—",c:"#6b7280",bg:"#f3f4f6"};
}

function GradeAnalysisPage() {
  const [stage,   setStage]   = useState("متوسط");
  const [sem,     setSem]     = useState("الكل");
  const [tab,     setTab]     = useState("excel"); // default
  const [students,setStudents]= useState([]);
  const [showForm,setShowForm]= useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState({name:"",sem:"الفصل الأول",grades:{}});

  const subjMap  = GA_SUBJECTS[stage] || {};
  const subjNames= Object.keys(subjMap);

  const [xlsxMsg, setXlsxMsg] = useState("");
  const [xlsxLoading, setXlsxLoading] = useState(false);
  const [gaLoaded,    setGaLoaded]   = useState(false);

  React.useEffect(() => {
    DB.get("school-grade-analysis", {}).then(data => {
      if (data && typeof data === "object") {
        const key = stage + "-" + sem;
        if (data[key] && Array.isArray(data[key])) setStudents(data[key]);
      }
      setGaLoaded(true);
    });
  }, [stage, sem]);

  React.useEffect(() => {
    if (!gaLoaded || students.length === 0) return;
    const t = setTimeout(async () => {
      const existing = await DB.get("school-grade-analysis", {});
      const key = stage + "-" + sem;
      DB.set("school-grade-analysis", { ...existing, [key]: students });
    }, 1500);
    return () => clearTimeout(t);
  }, [students, gaLoaded, stage, sem]);
  const xlsxRef = useRef(null);

  const handleXlsxImport = async (file) => {
    if (!file) return;
    setXlsxLoading(true); setXlsxMsg("");
    try {
      const XLSX = await loadXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {type:"array"});
      const newStudents = [];

      // خريطة المواد الإنجليزية → العربية (نموذج وزارة التعليم)
      const EN_TO_AR = {
        "math": "الرياضيات",
        "science": "العلوم",
        "english": "اللغة الإنجليزية",
        "arabic": "اللغة العربية",
        "quran": "القرآن الكريم والدراسات الإسلامية",
        "islamic": "القرآن الكريم والدراسات الإسلامية",
        "social": "الدراسات الاجتماعية",
        "digital": "المهارات الرقمية",
        "art": "التربية الفنية",
        "physical": "التربية البدنية والدفاع عن النفس",
        "1mh": "المهارات الحياتية والأسرية",
        "life": "المهارات الحياتية والأسرية",
        "critical": "التفكير الناقد",
      };

      // كل ورقة = طالب واحد (نموذج وزارة التعليم السعودية)
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        // قراءة الخلايا بالمؤشر (row, col) مباشرة لتجاوز مشكلة الدمج
        const ref = ws["!ref"];
        if (!ref) continue;
        const range = XLSX.utils.decode_range(ref);
        const getCell = (r, c) => {
          const addr = XLSX.utils.encode_cell({r, c});
          const cell = ws[addr];
          return cell ? cell.v : null;
        };

        // اسم الطالب: صف 28 (index 27)، عمود 35 (index 34)
        let studentName = "";
        for (let c = 0; c <= 44; c++) {
          const v = String(getCell(27, c) || "");
          if (v.includes("اسم الطالب:")) {
            studentName = v.replace("اسم الطالب:","").replace(/[:‏]/g,"").trim();
            break;
          }
        }
        if (!studentName || studentName.length < 2) continue;

        // رقم الهوية: صف 29 (index 28)
        let nationalId = "";
        for (let c = 0; c <= 44; c++) {
          const prev = String(getCell(28, c) || "");
          if (prev.includes("Identity") || prev.includes("رقم")) {
            nationalId = String(getCell(28, c+1) || getCell(28, c+2) || "");
            break;
          }
        }

        // الفصل الدراسي: صف 15 (index 14)
        let sem = "الفصل الأول";
        for (let c = 0; c <= 44; c++) {
          const v = String(getCell(14, c) || "");
          if (v.includes("الثاني") && v.includes("فصل")) { sem = "الفصل الثاني"; break; }
          if (v.includes("الأول") && v.includes("فصل")) { sem = "الفصل الأول"; break; }
        }

        // المعدل العام والتقدير: صفوف 49-50 (index 48-49)
        let gpa = "";
        let generalGrade = "";
        for (let c = 0; c <= 44; c++) {
          const r49 = getCell(48, c);
          if (r49 && String(r49).includes("%")) { gpa = String(r49).replace("%","").trim(); }
          const r50 = getCell(49, c);
          if (r50 && ["ممتاز","جيد جداً","جيد","مقبول","ضعيف"].includes(String(r50).trim())) {
            generalGrade = String(r50).trim();
          }
        }

        // درجات المواد: صفوف 35-47 (index 34-46)
        // الأعمدة الفعلية: 18=اسم إنجليزي، 24=تقدير، 28=موزونة، 34=مجموع/100، 38=نهائي، 40=أدوات
        const grades = {};
        const m_subj = GA_SUBJECTS[stage] || {};
        const subjectRows = [];

        for (let r = 34; r <= 47; r++) {
          const engName = String(getCell(r, 17) || "").toLowerCase().trim();
          const gradeAr = String(getCell(r, 23) || "").trim();
          const weighted = Number(getCell(r, 27)) || 0;
          const total100 = Number(getCell(r, 33)) || 0;
          const finalExam = Number(getCell(r, 37)) || 0;
          const evalTools = Number(getCell(r, 39)) || 0;
          const shortTests = Number(getCell(r, 41)) || 0;

          if (!engName || total100 === 0) continue;

          // تطابق الاسم الإنجليزي مع المواد
          let matchedSubj = null;
          const engLower = engName.toLowerCase();

          // أولاً: مطابقة مباشرة
          for (const [key, arSubj] of Object.entries(EN_TO_AR)) {
            if (engLower.includes(key)) {
              // تحقق أنها في قائمة مواد المرحلة المختارة
              for (const subj of Object.keys(m_subj)) {
                if (subj === arSubj || subj.includes(arSubj.substring(0,4))) {
                  matchedSubj = subj; break;
                }
              }
              if (matchedSubj) break;
            }
          }

          if (!matchedSubj) continue;

          const m = GA_MODELS[m_subj[matchedSubj]] || GA_MODELS["4"];
          const cw = Math.min(Math.max(0, total100 - finalExam), m.cw);
          const feScore = Math.min(Math.max(0, finalExam), m.fe);

          grades[matchedSubj] = {
            cw: m.fe > 0 ? cw : Math.min(total100, m.cw),
            fe: m.fe > 0 ? feScore : 0,
            total: total100,
            finalExam,
            evalTools,
            shortTests,
            weighted,
            gradeAr,
          };

          subjectRows.push({
            subj: matchedSubj,
            engName,
            gradeAr,
            total: total100,
            finalExam,
            evalTools,
            shortTests,
            weighted,
          });
        }

        if (Object.keys(grades).length === 0) continue;

        newStudents.push({
          id: Date.now() + Math.random()*1e5,
          name: studentName,
          nationalId,
          sem,
          stage,
          grades,
          gpa,
          generalGrade,
          subjectRows,
        });
      }

      if (newStudents.length === 0) {
        setXlsxMsg("⚠️ لم يُعثر على بيانات. تأكد أن الملف بنموذج وزارة التعليم (كل ورقة = طالب)");
        setXlsxLoading(false); return;
      }

      setStudents(p=>[...p.filter(s=>s.stage!==stage), ...newStudents]);
      setXlsxMsg(`✅ تم استيراد ${newStudents.length} طالب بكامل بياناتهم!`);
      setTimeout(()=>setTab("general"),1500);
    } catch(e) { setXlsxMsg("❌ خطأ: "+e.message); }
    setXlsxLoading(false);
  };

  const getModel = (sub) => GA_MODELS[subjMap[sub]] || GA_MODELS["4"];
  const subTotal = (sc) => { if (!sc) return 0; if (sc.total !== undefined && sc.total > 0) return Math.round(sc.total*100)/100; return Math.min((sc.cw||0)+(sc.fe||0),100); };
  const stuAvg   = (s)  => { if (s.gpa && parseFloat(s.gpa)>0) return Math.round(parseFloat(s.gpa)*100)/100; const sc=subjNames.filter(n=>subTotal(s.grades?.[n])>0).map(n=>subTotal(s.grades?.[n])); return sc.length ? Math.round(sc.reduce((a,b)=>a+b,0)/sc.length*100)/100 : 0; };
  const filtered = students.filter(s=>s.stage===stage&&(sem==="الكل"||s.sem===sem));

  // ألوان التقديرات الاحترافية
  const GRADE_PALETTE = {
    "ممتاز":     {bg:"#16a34a",light:"#dcfce7",text:"#14532d",border:"#22c55e"},
    "جيد جداً":  {bg:"#2563eb",light:"#dbeafe",text:"#1e3a8a",border:"#3b82f6"},
    "جيد":       {bg:"#d97706",light:"#fef3c7",text:"#78350f",border:"#f59e0b"},
    "مقبول":     {bg:"#ea580c",light:"#ffedd5",text:"#7c2d12",border:"#f97316"},
    "ضعيف":      {bg:"#dc2626",light:"#fee2e2",text:"#7f1d1d",border:"#ef4444"},
    "دون المستوى":{bg:"#7c3aed",light:"#ede9fe",text:"#3b0764",border:"#8b5cf6"},
  };
  const GRADE_ORDER = ["ممتاز","جيد جداً","جيد","مقبول","ضعيف","دون المستوى"];

  // رسم أعمدة احترافي
  const GradeBarChart = ({data, height=160, showLabels=true}) => {
    const max = Math.max(...data.map(d=>d.value), 1);
    return (
      <div style={{display:"flex",alignItems:"flex-end",gap:6,height,padding:"0 4px"}}>
        {data.map((d,i)=>{
          const p = GRADE_PALETTE[d.label]||{bg:"#6b7280",light:"#f3f4f6",text:"#374151"};
          const h = Math.max(d.value/max*100, d.value>0?8:2);
          return (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              {showLabels && d.value>0 && <div style={{fontSize:10,fontWeight:700,color:p.bg}}>{d.value}</div>}
              <div style={{width:"100%",borderRadius:"6px 6px 0 0",background:p.bg,height:h+"%",minHeight:d.value>0?4:1,transition:"height .5s ease",opacity:d.value>0?1:.25}}/>
              <div style={{fontSize:9,color:p.text,textAlign:"center",fontWeight:600,maxWidth:40,lineHeight:1.1}}>
                {d.label.substring(0,4)}
              </div>
              {d.pct!==undefined && <div style={{fontSize:9,color:"#6b7280"}}>{d.pct}%</div>}
            </div>
          );
        })}
      </div>
    );
  };

  // رسم دائري تقدمي
  const CircleProgress = ({value,max=100,color,size=80,label,sublabel}) => {
    const r = (size/2)-8;
    const circ = 2*Math.PI*r;
    const dash = Math.min(value/max,1)*circ;
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <div style={{position:"relative",width:size,height:size}}>
          <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={size/12}/>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size/12}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:size/5,fontWeight:900,color,lineHeight:1}}>{value}</span>
            {sublabel && <span style={{fontSize:8,color:"#6b7280",lineHeight:1}}>{sublabel}</span>}
          </div>
        </div>
        {label && <div style={{fontSize:11,fontWeight:600,color:"#374151",textAlign:"center"}}>{label}</div>}
      </div>
    );
  };

  const analytics = React.useMemo(()=>{
    if (!filtered.length) return null;
    const ss = {};
    subjNames.forEach(sub=>{ ss[sub]={scores:[],gradeCount:{"ممتاز":0,"جيد جداً":0,"جيد":0,"مقبول":0,"ضعيف":0,"دون المستوى":0},pass:0,fail:0}; });
    
    const ranked = filtered.map(s=>{
      // استخدام GPA من الإكسل مباشرة
      const avg = stuAvg(s);
      let total=0; let cnt=0;
      subjNames.forEach(sub=>{
        const sc = s.grades?.[sub];
        const v  = subTotal(sc);
        if(v>0){
          ss[sub].scores.push(v);
          total+=v; cnt++;
          // استخدام تقدير الإكسل مباشرة
          const grKey = sc?.gradeAr || gaGradeLabel(v).l;
          if(grKey in ss[sub].gradeCount) ss[sub].gradeCount[grKey]++;
          v>=60?ss[sub].pass++:ss[sub].fail++;
        }
      });
      return{...s,avg,total:Math.round(total*100)/100};
    }).sort((a,b)=>b.avg-a.avg);

    subjNames.forEach(sub=>{
      const sc=ss[sub].scores;
      if(!sc.length) return;
      const m=sc.reduce((a,b)=>a+b,0)/sc.length;
      ss[sub].avg=Math.round(m*100)/100;
      ss[sub].max=Math.max(...sc);
      ss[sub].min=Math.min(...sc);
      ss[sub].sd =Math.round(Math.sqrt(sc.reduce((a,b)=>a+Math.pow(b-m,2),0)/sc.length)*100)/100;
      ss[sub].pr =Math.round(ss[sub].pass/sc.length*100);
    });
    
    const avgs=ranked.map(s=>s.avg);
    const oa=Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length*100)/100;
    const passed=avgs.filter(a=>a>=60).length;
    const grades={};
    ranked.forEach(s=>{ const g=(s.generalGrade||gaGradeLabel(s.avg).l); grades[g]=(grades[g]||0)+1; });
    const best=subjNames.length?subjNames.reduce((a,b)=>(ss[a]?.avg||0)>(ss[b]?.avg||0)?a:b,""):"-";
    const worst=subjNames.length?subjNames.reduce((a,b)=>(ss[a]?.avg||100)<(ss[b]?.avg||100)?a:b,""):"-";
    return{ranked,ss,oa,mx:Math.max(...avgs),mn:Math.min(...avgs),passed,failed:avgs.length-passed,passRate:Math.round(passed/avgs.length*100),total:avgs.length,grades,best,worst};
  },[filtered.length, stage, sem, JSON.stringify(students)]);

  // رسم الأعمدة المبسط بدون Chart.js
  const BarChart = ({data,max=100,colors})=>(
    <div className="flex items-end gap-1 h-40 overflow-x-auto pb-1">
      {data.map((d,i)=>{
        const h=max>0?Math.round(d.value/max*100):0;
        return(
          <div key={i} className="flex flex-col items-center flex-shrink-0" style={{minWidth:28}}>
            <div className="text-xs font-black mb-1" style={{color:colors?colors[i%colors.length]:GA_CC[i%GA_CC.length],fontSize:9}}>{d.value}</div>
            <div className="rounded-t-lg w-full transition-all" style={{height:h+"%",minHeight:2,background:colors?colors[i%colors.length]:GA_CC[i%GA_CC.length],width:24}}/>
            <div className="text-center mt-1 text-gray-400" style={{fontSize:8,maxWidth:28,lineHeight:1.1,wordBreak:"break-word"}}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );

  const RadarChart = ({data})=>{
    const n=data.length; if(n<3) return null;
    const cx=100,cy=100,r=75;
    const pts=data.map((d,i)=>{
      const a=(i/n)*2*Math.PI-Math.PI/2;
      const v=d.value/100*r;
      return{x:cx+Math.cos(a)*v,y:cy+Math.sin(a)*v,lx:cx+Math.cos(a)*(r+18),ly:cy+Math.sin(a)*(r+18),label:d.label,value:d.value};
    });
    const axes=data.map((_,i)=>{ const a=(i/n)*2*Math.PI-Math.PI/2; return{x1:cx,y1:cy,x2:cx+Math.cos(a)*r,y2:cy+Math.sin(a)*r}; });
    const poly=pts.map(p=>`${p.x},${p.y}`).join(" ");
    const rings=[25,50,75,100].map(pct=>data.map((_,i)=>{ const a=(i/n)*2*Math.PI-Math.PI/2,rv=pct/100*r; return`${cx+Math.cos(a)*rv},${cy+Math.sin(a)*rv}`; }).join(" "));
    return(
      <svg viewBox="0 0 200 200" className="w-full" style={{maxHeight:220}}>
        {rings.map((p,i)=><polygon key={i} points={p} fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>)}
        {axes.map((a,i)=><line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#e5e7eb" strokeWidth="0.5"/>)}
        <polygon points={poly} fill="#6366f125" stroke="#6366f1" strokeWidth="1.5"/>
        {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill="#6366f1"/>)}
        {pts.map((p,i)=><text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#64748b">{p.label.substring(0,6)}</text>)}
      </svg>
    );
  };

  const loadDemo = ()=>{
    const names=["أحمد محمد","فاطمة علي","خالد سعد","نورة أحمد","عبدالله يوسف","مريم خالد","سلطان فهد","ريم سعود","يزيد عمر","ليلى حسن","عمر إبراهيم","سارة ناصر","فيصل عبدالرحمن","هند سالم","راكان ماجد"];
    const news=[];
    ["الفصل الأول","الفصل الثاني"].forEach(s=>{
      names.forEach(nm=>{
        const grades={};
        subjNames.forEach(sub=>{ const m=getModel(sub); grades[sub]={cw:Math.round(m.cw*(0.4+Math.random()*0.6)),fe:m.fe>0?Math.round(m.fe*(0.3+Math.random()*0.7)):0}; });
        news.push({id:Date.now()+Math.random()*1e5,name:nm,sem:s,stage,grades});
      });
    });
    setStudents(p=>[...p.filter(s=>s.stage!==stage),...news]);
    setTab("dashboard");
  };

  const saveStudent = ()=>{
    if(!form.name.trim()){alert("أدخل اسم الطالب");return;}
    if(editId){ setStudents(p=>p.map(s=>s.id===editId?{...s,...form,stage}:s)); setEditId(null); }
    else { setStudents(p=>[...p,{id:Date.now(),stage,...form}]); }
    setForm({name:"",sem:"الفصل الأول",grades:{}}); setShowForm(false);
  };

  const printReport = ()=>{
    if(!analytics) return;
    const r=analytics;
    const COLORS={"ممتاز":"#16a34a","جيد جداً":"#2563eb","جيد":"#d97706","مقبول":"#ea580c","ضعيف":"#dc2626","دون المستوى":"#7c3aed"};
    const BG={"ممتاز":"#dcfce7","جيد جداً":"#dbeafe","جيد":"#fef3c7","مقبول":"#ffedd5","ضعيف":"#fee2e2","دون المستوى":"#ede9fe"};
    const rows=r.ranked.map((s,i)=>{
      const g=gaGradeLabel(s.avg);
      return `<tr style="background:${i%2===0?"#fff":"#f9fafb"}"><td style="font-weight:700;color:#64748b">${i+1}</td><td style="font-weight:700">${s.name}</td><td>${s.sem}</td>${subjNames.map(sub=>`<td style="text-align:center;font-weight:600">${subTotal(s.grades?.[sub])}</td>`).join("")}<td style="font-weight:800;color:#6366f1">${s.avg}%</td><td><span style="background:${g.bg};color:${g.c};padding:2px 8px;border-radius:12px;font-weight:700;font-size:11px">${g.l}</span></td></tr>`;
    }).join("");
    const subRows=subjNames.map((sub,i)=>{ const s=r.ss[sub]; const m=getModel(sub); const g=gaGradeLabel(s.avg); return `<tr style="background:${i%2===0?"#fff":"#f9fafb"}"><td style="font-weight:700">${sub}</td><td><span style="background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">${m.name}</span></td><td style="text-align:center;color:${m.type==="ختامي"?"#f59e0b":"#10b981"};font-weight:700">${m.type}</td><td style="text-align:center;font-weight:700;color:#3b82f6">${s.avg}%</td><td style="text-align:center;color:#10b981;font-weight:600">${s.max}</td><td style="text-align:center;color:#ef4444;font-weight:600">${s.min}</td><td style="text-align:center">${s.pr}%</td><td><span style="background:${g.bg};color:${g.c};padding:2px 8px;border-radius:12px;font-weight:700;font-size:11px">${g.l}</span></td></tr>`; }).join("");
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
    <title>تقرير تحليل الدرجات — ${stage} — ${sem}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Cairo',sans-serif;direction:rtl;color:#1e293b;background:#fff;padding:20px;font-size:12px}
      .hd{background:linear-gradient(135deg,#0f172a,#1e3a5f);color:white;padding:20px 24px;border-radius:14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}
      .hd h1{font-size:18px;font-weight:900;margin-bottom:4px}.hd p{opacity:.7;font-size:12px}
      .kpi{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
      .kc{border-radius:12px;padding:12px;text-align:center;border:1px solid #e2e8f0}
      .kv{font-size:20px;font-weight:900;margin-bottom:2px}.kl{font-size:10px;color:#64748b;font-weight:600}
      h3{font-size:13px;font-weight:900;margin:16px 0 8px;color:#1e3a5f;border-right:4px solid #6366f1;padding-right:10px}
      table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:11px}
      th{background:#1e3a5f;color:#e2e8f0;padding:8px 6px;text-align:right;font-weight:700;font-size:10px}
      td{padding:6px;border-bottom:1px solid #f0f4f8}
      tr:nth-child(even){background:#f9fafb}
      .badge{padding:2px 8px;border-radius:20px;font-weight:700;font-size:10px}
      .medal-row-0{background:#fef9c3!important}.medal-row-1{background:#f0fdf4!important}.medal-row-2{background:#fff7ed!important}
      .footer{text-align:center;margin-top:16px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px}
      .rec-box{background:#eff6ff;border-radius:10px;padding:14px;margin-bottom:14px;border:1px solid #bfdbfe}
      .rec-box h4{color:#1e40af;font-size:12px;font-weight:900;margin-bottom:8px}
      .rec-box p{font-size:11px;line-height:2;color:#1e3a8a}
      @media print{
        @page{size:A4 landscape;margin:1cm}
        body{padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      }
    </style></head><body>
    <div class="hd">
      <div>
        <h1>📊 تقرير تحليل نتائج الطلاب</h1>
        <p>مدرسة عبيدة بن الحارث المتوسطة — المرحلة: ${stage} | الفصل: ${sem} | ${r.total} طالب</p>
        <p>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} — دليل وزارة التعليم ١٤٤٧/١٤٤٨ هـ</p>
      </div>
    </div>
    <div class="kpi">
      <div class="kc" style="background:#ede9fe"><div class="kv" style="color:#6366f1">${r.oa}%</div><div class="kl">المعدل العام</div></div>
      <div class="kc" style="background:#dcfce7"><div class="kv" style="color:#16a34a">${r.passRate}%</div><div class="kl">نسبة النجاح</div></div>
      <div class="kc" style="background:#dcfce7"><div class="kv" style="color:#16a34a">${r.passed}</div><div class="kl">ناجح</div></div>
      <div class="kc" style="background:#fee2e2"><div class="kv" style="color:#dc2626">${r.failed}</div><div class="kl">دور ثانٍ</div></div>
      <div class="kc" style="background:#e0f2fe"><div class="kv" style="color:#0369a1">${r.total}</div><div class="kl">إجمالي الطلاب</div></div>
    </div>
    <h3>📚 تحليل المواد الدراسية</h3>
    <table>
      <thead><tr><th>المادة</th><th>النموذج</th><th>العدد</th>
        <th style="color:#fca5a5">ضعيف</th><th style="color:#fca5a5">%</th>
        <th style="color:#fdba74">مقبول</th><th style="color:#fdba74">%</th>
        <th style="color:#fde047">جيد</th><th style="color:#fde047">%</th>
        <th style="color:#93c5fd">جيد جداً</th><th style="color:#93c5fd">%</th>
        <th style="color:#86efac">ممتاز</th><th style="color:#86efac">%</th>
        <th style="color:#a5b4fc">المتوسط</th>
      </tr></thead>
      <tbody>${subRows}</tbody>
    </table>
    <h3>👨‍🎓 ترتيب الطلاب</h3>
    <table>
      <thead><tr><th>الترتيب</th><th>الاسم</th>
        ${subjNames.map(s=>`<th style="font-size:9px">${s.substring(0,6)}</th>`).join("")}
        <th style="color:#a5b4fc">المعدل</th><th>التقدير</th>
        <th style="color:#86efac">ممتاز</th><th style="color:#93c5fd">جيد جداً</th>
        <th style="color:#fde047">جيد</th><th style="color:#fdba74">مقبول</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="rec-box">
      <h4>💡 التوصيات التربوية</h4>
      <p>• المادة الأضعف: <strong>${r.worst}</strong> (${r.ss[r.worst]?.avg}%) — تحتاج خطة دعم وتقوية</p>
      <p>${r.failed>0?`• يوجد <strong>${r.failed}</strong> طالب يحتاج اختبار الدور الثاني — يحتفظ بـ40 ويُختبر من 60`:"• جميع الطلاب ناجحون — نتيجة مشرفة 🎉"}</p>
      <p>• نسبة النجاح ${r.passRate}% — ${r.passRate>=90?"ممتازة وتستحق التكريم 🎉":r.passRate>=70?"جيدة وتستحق التعزيز":"تحتاج خطة تحسين عاجلة"}</p>
      <p>• أقوى مادة: <strong>${r.best}</strong> (${r.ss[r.best]?.avg}%) — نموذج يُحتذى به</p>
    </div>
    <div class="footer">مدرسة عبيدة بن الحارث المتوسطة — نظام تحليل الدرجات الإلكتروني © ١٤٤٧ هـ</div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
  };

  const TABS=[
    {id:"excel",      l:"📤 استيراد"},
    {id:"general",    l:"📊 الإحصائي العام"},
    {id:"subjects",   l:"📚 تحليل المواد"},
    {id:"classes",    l:"🏫 تحليل الفصول"},
    {id:"studata",    l:"📋 بيانات الطلاب"},
    {id:"ranking",    l:"🏆 ترتيب الأوائل"},
    {id:"exam",       l:"📝 تحليل الاختبار"},
    {id:"comparison", l:"🔄 مقارنة الفترات"},
    {id:"report",     l:"📄 التقرير الكامل"},
  ];

  return (
    <div dir="rtl" className="space-y-4">
      {/* رأس الصفحة */}
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#6366f1 100%)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">📊 تحليل درجات الطلاب</h2>
          <p className="opacity-80 text-sm">دليل توزيع الدرجات — وزارة التعليم السعودية ١٤٤٧ هـ</p>
        </div>
      </div>

      {/* فلاتر */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-end">
        <div><label className={cx.label}>المرحلة</label>
          <select value={stage} onChange={e=>{setStage(e.target.value);setTab("dashboard");setStudents(p=>p.filter(s=>s.stage!==e.target.value));}} className={cx.input} style={{fontFamily:"inherit"}}>
            {["ابتدائي","متوسط","ثانوي"].map(s=><option key={s} value={s}>{s}</option>)}
          </select></div>
        <div><label className={cx.label}>الفصل</label>
          <select value={sem} onChange={e=>setSem(e.target.value)} className={cx.input} style={{fontFamily:"inherit"}}>
            {["الفصل الأول","الفصل الثاني","الكل"].map(s=><option key={s} value={s}>{s}</option>)}
          </select></div>
        <div className="flex gap-2 mr-auto">
          <button onClick={loadDemo} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black">🔄 بيانات تجريبية</button>
          <button onClick={printReport} disabled={!analytics} className="px-4 py-2 rounded-xl text-white text-xs font-black disabled:opacity-40" style={{background:"linear-gradient(135deg,#0f172a,#6366f1)"}}>🖨️ طباعة التقرير</button>
        </div>
      </div>

      {/* تبويبات */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={"flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all "+
              (tab===t.id?"bg-indigo-600 text-white shadow":"text-gray-500 hover:bg-gray-50")}>
            {t.l}
          </button>
        ))}
      </div>

      {/* - لوحة القيادة - */}
      {/* - استيراد إكسل - */}
      {tab==="excel" && (
        <div className="space-y-4">
          {/* إرشادات */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-black text-gray-800 text-sm">📤 استيراد درجات الفصل من ملف Excel</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2 text-xs text-blue-800 leading-relaxed">
              <div className="font-black mb-2">📋 كيف يجب أن يكون ملف الإكسل:</div>
              <div>• <strong>الصف الأول:</strong> رؤوس الأعمدة (اسم الطالب، الفصل، درجات المواد)</div>
              <div>• عمود <strong>اسم الطالب</strong> أو <strong>Name</strong> — يحتوي أسماء الطلاب</div>
              <div>• أعمدة المواد — يمكن أن تكون درجة إجمالية أو (أعمال سنة + اختبار نهائي)</div>
              <div>• النظام يتعرف على المواد تلقائياً إذا ذُكر اسمها في رأس العمود</div>
            </div>
            
            {/* نموذج الملف */}
            <div className="overflow-x-auto">
              <div className="text-xs font-black text-gray-500 mb-2">مثال لشكل الملف المطلوب:</div>
              <table className="text-xs border-collapse min-w-full">
                <thead><tr className="bg-teal-600 text-white">
                  <th className="border border-teal-500 px-3 py-2">اسم الطالب</th>
                  <th className="border border-teal-500 px-3 py-2">الفصل</th>
                  {Object.keys(GA_SUBJECTS[stage]||{}).slice(0,4).map(s=>(
                    <th key={s} className="border border-teal-500 px-3 py-2">{s.substring(0,6)} إجمالي</th>
                  ))}
                </tr></thead>
                <tbody>
                  {["أحمد محمد","فاطمة علي","خالد سعد"].map((n,i)=>(
                    <tr key={i} className={i%2===0?"bg-white":"bg-gray-50"}>
                      <td className="border border-gray-200 px-3 py-1.5">{n}</td>
                      <td className="border border-gray-200 px-3 py-1.5">الفصل الأول</td>
                      {Object.keys(GA_SUBJECTS[stage]||{}).slice(0,4).map(s=>(
                        <td key={s} className="border border-gray-200 px-3 py-1.5 text-center">{70+Math.floor(Math.random()*30)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* رفع الملف */}
            <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-8 text-center bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer"
              onClick={()=>xlsxRef.current?.click()}>
              <div className="text-4xl mb-2">📁</div>
              <div className="font-black text-indigo-700 mb-1">اضغط لرفع ملف Excel</div>
              <div className="text-xs text-indigo-500">.xlsx أو .xls</div>
              <input ref={xlsxRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={e=>handleXlsxImport(e.target.files?.[0])}/>
            </div>

            {xlsxLoading && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="animate-spin text-2xl">⏳</div>
                <span className="font-bold text-gray-600">جاري معالجة الملف...</span>
              </div>
            )}
            {xlsxMsg && (
              <div className={"rounded-2xl p-4 text-sm font-bold text-center "+(xlsxMsg.startsWith("✅")?"bg-green-50 text-green-700 border border-green-200":"bg-red-50 text-red-700 border border-red-200")}>
                {xlsxMsg}
              </div>
            )}
          </div>

          {/* مواد المرحلة */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-800 mb-3 text-sm">📚 مواد {stage} التي سيتم تحليلها ({Object.keys(GA_SUBJECTS[stage]||{}).length} مادة)</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(GA_SUBJECTS[stage]||{}).map(([subj,mid])=>{
                const m = GA_MODELS[mid];
                return (
                  <div key={subj} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-gray-700">{subj}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:m.type==="ختامي"?"#fef3c7":"#dcfce7",color:m.type==="ختامي"?"#b45309":"#166534"}}>{m.name}</span>
                      <span className="text-xs text-gray-400">{m.cw}+{m.fe}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* أو بيانات تجريبية */}
          <div className="flex gap-3">
            <button onClick={loadDemo} className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm">
              🔄 تحميل بيانات تجريبية كاملة
            </button>
            {students.filter(s=>s.stage===stage).length>0 && (
              <button onClick={()=>setTab("dashboard")} className="flex-1 py-3 rounded-2xl font-black text-sm text-white" style={{background:"linear-gradient(135deg,#0f172a,#6366f1)"}}>
                📊 عرض التحليل ({students.filter(s=>s.stage===stage).length} طالب)
              </button>
            )}
          </div>
        </div>
      )}

      {tab==="dashboard" && (
        <div className="space-y-5">
          {!analytics ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border">
              <div className="text-5xl mb-3">📊</div>
              <div className="font-black text-gray-600 mb-2">لا توجد بيانات</div>
              <div className="text-sm text-gray-400 mb-4">ارفع ملف Excel أو اضغط "بيانات تجريبية"</div>
              <button onClick={()=>setTab("excel")} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm">📤 استيراد بيانات</button>
            </div>
          ) : (
            <>
              {/* KPI */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {l:"عدد الطلاب",v:analytics.total,c:"#6366f1",bg:"#ede9fe"},
                  {l:"المعدل العام",v:analytics.oa+"%",c:gaGradeLabel(analytics.oa).c,bg:gaGradeLabel(analytics.oa).bg,sub:gaGradeLabel(analytics.oa).l},
                  {l:"نسبة النجاح",v:analytics.passRate+"%",c:"#10b981",bg:"#dcfce7",sub:analytics.passed+" ناجح"},
                  {l:"دور ثانٍ",v:analytics.failed,c:analytics.failed>0?"#ef4444":"#10b981",bg:analytics.failed>0?"#fee2e2":"#dcfce7",sub:analytics.failed>0?"يحتاج متابعة":"ممتاز"},
                ].map(k=>(
                  <div key={k.l} className="rounded-2xl p-4 text-center" style={{background:k.bg}}>
                    <div className="text-3xl font-black" style={{color:k.c}}>{k.v}</div>
                    <div className="text-xs font-bold mt-1" style={{color:k.c,opacity:.8}}>{k.l}</div>
                    {k.sub && <div className="text-xs mt-0.5" style={{color:k.c,opacity:.6}}>{k.sub}</div>}
                  </div>
                ))}
              </div>

              {/* رسم الأعمدة — متوسط درجة كل مادة */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-4 text-sm">📊 متوسط الدرجة لكل مادة</h3>
                <div className="space-y-2">
                  {subjNames.map((sub,i)=>{
                    const avg=analytics.ss[sub]?.avg||0;
                    const g=gaGradeLabel(avg);
                    const m=getModel(sub);
                    const pct=avg;
                    return (
                      <div key={sub} className="flex items-center gap-3">
                        <div className="text-xs font-bold text-gray-600 text-right flex-shrink-0" style={{width:130,fontSize:11}}>{sub.substring(0,14)}</div>
                        <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{background:"#f3f4f6"}}>
                          <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                            style={{width:pct+"%", background:g.bg, border:`1px solid ${g.c}44`}}>
                            <span className="text-xs font-black" style={{color:g.c}}>{avg}%</span>
                          </div>
                        </div>
                        <div className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                          style={{background:m.type==="ختامي"?"#fef3c7":"#dcfce7",color:m.type==="ختامي"?"#b45309":"#166534",fontSize:10}}>
                          {m.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* توزيع التقديرات — رسم دائري */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-4 text-sm">🎯 توزيع التقديرات</h3>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {[{l:"ممتاز",min:90},{l:"جيد جداً",min:80,max:90},{l:"جيد",min:70,max:80},{l:"مقبول",min:60,max:70},{l:"ضعيف",min:50,max:60},{l:"دون المستوى",max:50}].map(gr=>{
                    const count=analytics.ranked.filter(s=>gr.max?(s.avg>=(gr.min||0)&&s.avg<gr.max):(s.avg>=gr.min)).length;
                    const pct=Math.round(count/analytics.total*100);
                    const g=gaGradeLabel(gr.min||0);
                    const w=Math.max(pct,2);
                    return count>0?(
                      <div key={gr.l} className="text-center">
                        <div className="rounded-2xl px-3 py-2 mb-1" style={{background:g.bg,minWidth:60}}>
                          <div className="text-xl font-black" style={{color:g.c}}>{count}</div>
                          <div className="text-xs font-bold" style={{color:g.c,opacity:.8}}>{gr.l}</div>
                          <div className="text-xs" style={{color:g.c,opacity:.6}}>{pct}%</div>
                        </div>
                      </div>
                    ):null;
                  })}
                </div>
                {/* شريط تراكمي */}
                <div className="h-8 rounded-xl overflow-hidden flex" style={{direction:"ltr"}}>
                  {[
                    {l:"ممتاز",min:90,c:"#10b981"},{l:"جيد جداً",min:80,max:90,c:"#3b82f6"},
                    {l:"جيد",min:70,max:80,c:"#84cc16"},{l:"مقبول",min:60,max:70,c:"#f59e0b"},
                    {l:"ضعيف",min:50,max:60,c:"#f97316"},{l:"دون المستوى",max:50,c:"#ef4444"},
                  ].map(gr=>{
                    const count=analytics.ranked.filter(s=>gr.max?(s.avg>=(gr.min||0)&&s.avg<gr.max):(s.avg>=gr.min)).length;
                    const pct=count/analytics.total*100;
                    return pct>0?<div key={gr.l} title={`${gr.l}: ${count} طالب`} style={{width:pct+"%",background:gr.c,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {pct>8&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>{Math.round(pct)}%</span>}
                    </div>:null;
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {[{l:"ممتاز",c:"#10b981"},{l:"جيد جداً",c:"#3b82f6"},{l:"جيد",c:"#84cc16"},{l:"مقبول",c:"#f59e0b"},{l:"دون المستوى",c:"#ef4444"}].map(x=>(
                    <span key={x.l} className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="inline-block w-3 h-3 rounded" style={{background:x.c}}/>
                      {x.l}
                    </span>
                  ))}
                </div>
              </div>

              {/* مخطط الرادار */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-3 text-sm">🌐 مخطط الرادار — نقاط القوة والضعف</h3>
                <RadarChart data={subjNames.map(s=>({label:s,value:analytics.ss[s]?.avg||0}))}/>
              </div>
            </>
          )}
        </div>
      )}
      {tab==="students" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>{setForm({name:"",sem:"الفصل الأول",grades:{}});setEditId(null);setShowForm(true);}} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700">➕ إضافة طالب</button>
            <button onClick={loadDemo} className="px-4 py-2 rounded-xl bg-amber-500 text-white font-black text-sm hover:bg-amber-600">🔄 بيانات تجريبية</button>
            {filtered.length>0 && <button onClick={()=>{if(confirm("حذف جميع الطلاب؟")) setStudents(p=>p.filter(s=>!(s.stage===stage&&(sem==="الكل"||s.sem===sem))));}} className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-black text-sm hover:bg-red-200">🗑️ مسح</button>}
          </div>

          {showForm && (
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 space-y-4">
              <div className="font-black text-indigo-800 text-sm">{editId?"✏️ تعديل":"➕ إضافة طالب"}</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={cx.label}>اسم الطالب *</label>
                  <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="أدخل الاسم" className={cx.input} style={{fontFamily:"inherit"}}/></div>
                <div><label className={cx.label}>الفصل</label>
                  <select value={form.sem} onChange={e=>setForm(p=>({...p,sem:e.target.value}))} className={cx.input} style={{fontFamily:"inherit"}}>
                    <option>الفصل الأول</option><option>الفصل الثاني</option></select></div>
              </div>
              <div>
                <div className="text-xs font-black text-gray-600 mb-2">📚 درجات المواد</div>
                <div className="grid gap-2" style={{gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))"}}>
                  {subjNames.map(sub=>{
                    const m=getModel(sub);
                    const total=Math.min((form.grades[sub]?.cw||0)+(form.grades[sub]?.fe||0),100);
                    const tg=total>0?gaGradeLabel(total):null;
                    return(
                      <div key={sub} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100" style={{background:"#f8fafc"}}>
                          <span className="text-xs font-black text-gray-800">{sub}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{background:m.type==="ختامي"?"#fef3c7":"#dcfce7",color:m.type==="ختامي"?"#b45309":"#166534"}}>{m.name}</span>
                            {tg && <span className="text-xs px-1.5 py-0.5 rounded-full font-black" style={{background:tg.bg,color:tg.c}}>{total}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 p-2">
                          <div className="flex-1">
                            <label className="text-xs text-gray-400 block mb-0.5">أعمال السنة (/{m.cw})</label>
                            <input type="number" min="0" max={m.cw} value={form.grades[sub]?.cw??""} onChange={e=>setForm(p=>({...p,grades:{...p.grades,[sub]:{...(p.grades[sub]||{}),cw:Math.min(Number(e.target.value),m.cw)}}}))}
                              className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-indigo-400" style={{fontFamily:"inherit"}}/>
                          </div>
                          {m.fe>0 && (
                            <div className="flex-1">
                              <label className="text-xs text-gray-400 block mb-0.5">اختبار نهائي (/{m.fe})</label>
                              <input type="number" min="0" max={m.fe} value={form.grades[sub]?.fe??""} onChange={e=>setForm(p=>({...p,grades:{...p.grades,[sub]:{...(p.grades[sub]||{}),fe:Math.min(Number(e.target.value),m.fe)}}}))}
                                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-indigo-400" style={{fontFamily:"inherit"}}/>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveStudent} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700">{editId?"💾 حفظ":"✅ إضافة"}</button>
                <button onClick={()=>{setShowForm(false);setEditId(null);}} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold">إلغاء</button>
              </div>
            </div>
          )}

          {filtered.length>0 ? (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{background:"#0f172a"}}>
                    <tr>
                      <th className="px-3 py-3 text-right text-gray-300 font-bold">#</th>
                      <th className="px-3 py-3 text-right text-gray-300 font-bold whitespace-nowrap">الاسم</th>
                      <th className="px-2 py-3 text-center text-gray-300 font-bold">الفصل</th>
                      {subjNames.map(s=><th key={s} className="px-2 py-3 text-center text-gray-300 font-bold whitespace-nowrap">{s.substring(0,6)}</th>)}
                      <th className="px-3 py-3 text-center text-gray-300 font-bold">المعدل</th>
                      <th className="px-3 py-3 text-center text-gray-300 font-bold">التقدير</th>
                      <th className="px-2 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s,i)=>{
                      const avg=stuAvg(s); const g=gaGradeLabel(avg);
                      return(
                        <tr key={s.id} className={i%2===0?"":"bg-gray-50"}>
                          <td className="px-3 py-2.5 text-gray-400 font-bold">{i+1}</td>
                          <td className="px-3 py-2.5 font-bold text-gray-800 whitespace-nowrap">{s.name}</td>
                          <td className="px-2 py-2.5 text-center text-gray-400">{s.sem.replace("الفصل","ف")}</td>
                          {subjNames.map(sub=>{ const t=subTotal(s.grades?.[sub]); const sg=t>0?gaGradeLabel(t):null;
                            return <td key={sub} className="px-2 py-2.5 text-center font-bold" style={{color:sg?sg.c:"#9ca3af"}}>{t||"—"}</td>; })}
                          <td className="px-3 py-2.5 text-center font-black" style={{color:"#6366f1"}}>{avg}%</td>
                          <td className="px-3 py-2.5 text-center"><span className="px-2 py-0.5 rounded-full font-black" style={{background:g.bg,color:g.c,fontSize:10}}>{g.l}</span></td>
                          <td className="px-2 py-2.5">
                            <div className="flex gap-1">
                              <button onClick={()=>{setForm({name:s.name,sem:s.sem,grades:{...s.grades}});setEditId(s.id);setShowForm(true);}} className="bg-blue-50 text-blue-600 px-1.5 py-1 rounded-lg hover:bg-blue-100 text-xs">✏️</button>
                              <button onClick={()=>{if(confirm("حذف؟")) setStudents(p=>p.filter(x=>x.id!==s.id));}} className="bg-red-50 text-red-500 px-1.5 py-1 rounded-lg hover:bg-red-100 text-xs">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">👨‍🎓</div><div className="font-black text-gray-400">لا توجد بيانات — أضف طلاباً أو اضغط "بيانات تجريبية"</div></div>
          )}
        </div>
      )}

      {/* - نماذج التقويم - */}
      {tab==="models" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-5 py-3 border-b font-black text-gray-800 text-sm">⚖️ المواد ونماذجها — {stage}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-black text-gray-500">المادة</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-indigo-600">النموذج</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-gray-500">النوع</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-blue-600">أعمال السنة</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-amber-600">اختبار نهائي</th>
                    <th className="px-4 py-3 text-right text-xs font-black text-gray-500">الدور الثاني</th>
                  </tr>
                </thead>
                <tbody>
                  {subjNames.map((sub,i)=>{
                    const m=getModel(sub);
                    return(
                      <tr key={sub} className={i%2===0?"":"bg-gray-50"}>
                        <td className="px-4 py-3 font-bold text-gray-800 text-sm">{sub}</td>
                        <td className="px-3 py-3 text-center"><span className="text-xs px-2 py-1 rounded-full font-bold bg-indigo-100 text-indigo-700">{m.name}</span></td>
                        <td className="px-3 py-3 text-center"><span className="text-xs px-2 py-1 rounded-full font-bold" style={{background:m.type==="ختامي"?"#fef3c7":"#dcfce7",color:m.type==="ختامي"?"#b45309":"#166534"}}>{m.type}</span></td>
                        <td className="px-3 py-3 text-center font-black text-blue-700">{m.cw}</td>
                        <td className="px-3 py-3 text-center font-black" style={{color:m.fe>0?"#d97706":"#9ca3af"}}>{m.fe||"—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{m.round2}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-800 mb-3 text-sm">📘 القواعد العامة</h3>
            <div className="space-y-2">
              {GA_RULES.map((r,i)=>(
                <div key={i} className="flex items-start gap-3 bg-indigo-50 rounded-xl px-4 py-3 border-r-4 border-indigo-500">
                  <span className="text-xs font-black text-indigo-600 flex-shrink-0">{i+1}.</span>
                  <span className="text-xs text-gray-700 leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-5 py-3 border-b font-black text-gray-800 text-sm">📊 جدول التقديرات</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-right text-xs font-black text-gray-500">التقدير</th><th className="px-4 py-3 text-center text-xs font-black text-gray-500">النسبة</th></tr></thead>
              <tbody>
                {[{l:"ممتاز",r:"90-100%"},{l:"جيد جداً",r:"80-89%"},{l:"جيد",r:"70-79%"},{l:"مقبول",r:"60-69%"},{l:"ضعيف",r:"50-59%"},{l:"راسب",r:"أقل من 50%"}].map((g,i)=>{
                  const gl=gaGradeLabel(g.l==="ممتاز"?90:g.l==="جيد جداً"?80:g.l==="جيد"?70:g.l==="مقبول"?60:g.l==="ضعيف"?50:0);
                  return <tr key={g.l} className={i%2===0?"":"bg-gray-50"}><td className="px-4 py-3"><span className="text-xs font-black px-3 py-1 rounded-full" style={{background:gl.bg,color:gl.c}}>{g.l}</span></td><td className="px-4 py-3 text-center font-bold text-gray-700">{g.r}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* - التحليل الشامل - */}
      {tab==="analysis" && !analytics && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">📈</div><div className="font-black text-gray-400">أضف بيانات أولاً</div></div>
      )}
      {tab==="analysis" && analytics && (
        <div className="space-y-5">
          {/* تحليل مفصّل لكل مادة */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-800 mb-4 text-sm">📚 التحليل الإحصائي لكل مادة</h3>
            <div className="space-y-4">
              {subjNames.map((sub,i)=>{
                const s=analytics.ss[sub]; if(!s) return null;
                const g=gaGradeLabel(s.avg); const m=getModel(sub);
                const avgFinal=filtered.reduce((sum,st)=>sum+(st.grades?.[sub]?.finalExam||0),0)/Math.max(filtered.length,1);
                const avgTools=filtered.reduce((sum,st)=>sum+(st.grades?.[sub]?.evalTools||0),0)/Math.max(filtered.length,1);
                const avgShort=filtered.reduce((sum,st)=>sum+(st.grades?.[sub]?.shortTests||0),0)/Math.max(filtered.length,1);
                const hasDetail=filtered.some(st=>st.grades?.[sub]?.finalExam!==undefined);
                return (
                  <div key={sub} className="border-2 rounded-2xl overflow-hidden" style={{borderColor:g.c+"33"}}>
                    {/* رأس المادة */}
                    <div className="flex items-center justify-between px-4 py-3" style={{background:g.bg}}>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm" style={{color:g.c}}>{sub}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:"#fff8",color:g.c}}>{m.name} — {m.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-black" style={{color:g.c}}>{s.avg}%</div>
                          <div className="text-xs" style={{color:g.c,opacity:.7}}>المتوسط</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-black" style={{color:g.c}}>{s.pr}%</div>
                          <div className="text-xs" style={{color:g.c,opacity:.7}}>نجاح</div>
                        </div>
                      </div>
                    </div>
                    {/* شريط المتوسط */}
                    <div className="px-4 pt-3 pb-1">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>أدنى: {s.min}%</span><span>أعلى: {s.max}%</span>
                      </div>
                      <div className="relative h-4 rounded-full overflow-hidden" style={{background:"#f3f4f6"}}>
                        <div className="absolute h-full rounded-full" style={{width:s.avg+"%",background:g.c,opacity:.7}}/>
                        <div className="absolute h-full w-0.5 bg-gray-800" style={{right:s.avg+"%"}}/>
                        <div className="absolute h-full rounded-full border-2" style={{right:s.min+"%",left:(100-s.max)+"%",borderColor:g.c+"66",background:"transparent"}}/>
                      </div>
                    </div>
                    {/* مكونات الدرجة */}
                    {hasDetail && (
                      <div className="px-4 pb-3 pt-2">
                        <div className="text-xs font-bold text-gray-500 mb-2">توزيع المكونات (متوسط الفصل)</div>
                        <div className="grid grid-cols-3 gap-2">
                          {m.fe>0 && <div className="bg-blue-50 rounded-xl p-2 text-center">
                            <div className="text-base font-black text-blue-700">{Math.round(avgFinal*10)/10}</div>
                            <div className="text-xs text-blue-500 font-bold">اختبار نهائي</div>
                            <div className="text-xs text-blue-400">من {m.fe}</div>
                          </div>}
                          <div className="bg-amber-50 rounded-xl p-2 text-center">
                            <div className="text-base font-black text-amber-700">{Math.round(avgTools*10)/10}</div>
                            <div className="text-xs text-amber-500 font-bold">أدوات تقييم</div>
                          </div>
                          {avgShort>0 && <div className="bg-purple-50 rounded-xl p-2 text-center">
                            <div className="text-base font-black text-purple-700">{Math.round(avgShort*10)/10}</div>
                            <div className="text-xs text-purple-500 font-bold">اختبارات قصيرة</div>
                          </div>}
                        </div>
                      </div>
                    )}
                    {/* توزيع الطلاب في هذه المادة */}
                    <div className="px-4 pb-3">
                      <div className="text-xs font-bold text-gray-500 mb-1">توزيع الطلاب</div>
                      <div className="h-5 rounded-lg overflow-hidden flex" style={{direction:"ltr"}}>
                        {[{min:90,c:"#10b981"},{min:80,max:90,c:"#3b82f6"},{min:70,max:80,c:"#84cc16"},{min:60,max:70,c:"#f59e0b"},{min:50,max:60,c:"#f97316"},{max:50,c:"#ef4444"}].map((gr,j)=>{
                          const cnt=filtered.filter(st=>{const v=subTotal(st.grades?.[sub]);return gr.max?(v>=(gr.min||0)&&v<gr.max):(v>=gr.min);}).length;
                          const pct=cnt/filtered.length*100;
                          return pct>0?<div key={j} title={`${cnt} طالب`} style={{width:pct+"%",background:gr.c,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {pct>8&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>{cnt}</span>}
                          </div>:null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* إحصائيات عامة */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[{l:"المعدل العام",v:analytics.oa+"%",c:"#6366f1"},{l:"أعلى معدل",v:analytics.mx+"%",c:"#10b981"},{l:"أدنى معدل",v:analytics.mn+"%",c:"#ef4444"},{l:"الانحراف المعياري",v:analytics.sd,c:"#f59e0b"},{l:"أقوى مادة",v:(analytics.best||"").substring(0,8),c:"#0ea5e9"},{l:"أضعف مادة",v:(analytics.worst||"").substring(0,8),c:"#f97316"},{l:"ناجح",v:analytics.passed,c:"#10b981"},{l:"دور ثانٍ",v:analytics.failed,c:"#ef4444"}].map(k=>(
              <div key={k.l} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                <div className="text-xs font-bold text-gray-400 mb-1">{k.l}</div>
                <div className="font-black text-lg" style={{color:k.c}}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* - التحليل الإحصائي العام - */}
      {tab==="general" && (
        <div className="space-y-5">
          {!analytics ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border">
              <div className="text-5xl mb-3">📊</div>
              <div className="font-black text-gray-600 mb-2">استورد بيانات أولاً</div>
              <button onClick={()=>setTab("excel")} className="mt-3 px-5 py-2 rounded-xl bg-indigo-600 text-white font-black text-sm">📤 استيراد</button>
            </div>
          ) : (
            <>
              {/* بطاقات دائرية رئيسية */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {label:"العدد الكلي",   value:analytics.total,   color:"#10b981", max:analytics.total, sub:"طالب"},
                  {label:"متوسط الدرجات", value:analytics.oa,      color:"#6366f1", max:100,             sub:"%"},
                  {label:"نسبة النجاح",   value:analytics.passRate,color:gaGradeLabel(analytics.oa).c, max:100, sub:"%"},
                ].map(item=>(
                  <div key={item.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center gap-3">
                    <CircleProgress value={item.value} max={item.max} color={item.color} size={100} sublabel={item.sub}/>
                    <div className="text-sm font-black text-gray-600">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* توزيع التقديرات العام بياناً */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-1 text-sm">📊 توزيع التقديرات العام</h3>
                <p className="text-xs text-gray-400 mb-4">بناءً على المعدل العام لكل طالب — {analytics.total} طالب</p>
                <GradeBarChart height={140} data={GRADE_ORDER.map(g=>{
                  const c = analytics.grades[g]||0;
                  return {label:g, value:c, pct:analytics.total?Math.round(c/analytics.total*100):0};
                })}/>
                {/* شريط تراكمي */}
                <div className="mt-4 h-7 rounded-xl overflow-hidden flex" style={{direction:"ltr"}}>
                  {GRADE_ORDER.map(g=>{
                    const c=analytics.grades[g]||0;
                    const pct=analytics.total?c/analytics.total*100:0;
                    const p=GRADE_PALETTE[g];
                    return pct>0?(
                      <div key={g} title={`${g}: ${c} طالب (${Math.round(pct)}%)`}
                        style={{width:pct+"%",background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",transition:"width .5s"}}>
                        {pct>8&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>{Math.round(pct)}%</span>}
                      </div>
                    ):null;
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  {GRADE_ORDER.map(g=>{
                    const c=analytics.grades[g]||0;
                    if(!c) return null;
                    const p=GRADE_PALETTE[g];
                    return <span key={g} className="flex items-center gap-1 text-xs font-bold" style={{color:p.text}}>
                      <span className="inline-block w-3 h-3 rounded" style={{background:p.bg}}/>
                      {g}: {c} ({analytics.total?Math.round(c/analytics.total*100):0}%)
                    </span>;
                  })}
                </div>
              </div>

              {/* تحليل تفصيلي لكل مادة */}
              {subjNames.map(sub=>{
                const s=analytics.ss[sub]; if(!s||!s.scores?.length) return null;
                const counts=s.gradeCount||{};
                const n=filtered.length;
                const passed=Object.entries(counts).filter(([g])=>["ممتاز","جيد جداً","جيد","مقبول"].includes(g)).reduce((a,[,v])=>a+v,0);
                const failed=n-passed;
                return (
                  <div key={sub} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-blue-700 text-base">{sub}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-3 py-1 rounded-full font-bold"
                          style={{background:gaGradeLabel(s.avg).bg,color:gaGradeLabel(s.avg).c}}>
                          متوسط: {s.avg}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="rounded-2xl p-3 text-center border border-gray-100 bg-gray-50">
                        <div className="text-sm text-gray-500 font-bold mb-1">العدد الكلي</div>
                        <div className="text-3xl font-black text-gray-800">{n}</div>
                      </div>
                      <div className="rounded-2xl p-3 text-center border border-green-200 bg-green-50">
                        <div className="text-sm text-green-600 font-bold mb-1">الناجحون</div>
                        <div className="text-3xl font-black text-green-700">{passed}</div>
                        <div className="text-xs text-green-500 mt-1">
                          {GRADE_ORDER.slice(0,4).map(g=>counts[g]>0?`${g}:${counts[g]}`:null).filter(Boolean).join(" | ")}
                        </div>
                      </div>
                      <div className="rounded-2xl p-3 text-center border border-red-200 bg-red-50">
                        <div className="text-sm text-red-500 font-bold mb-1">المتعثرون</div>
                        <div className="text-3xl font-black text-red-600">{failed}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="rounded-2xl p-3 text-center border border-green-100 bg-green-50">
                        <div className="text-xs text-green-500 font-bold mb-1">متوسط الدرجات</div>
                        <div className="text-2xl font-black text-green-700">{s.avg}</div>
                        <div className="text-xs text-green-400">{s.avg}%</div>
                      </div>
                      <div className="rounded-2xl p-3 text-center border border-green-100 bg-green-50">
                        <div className="text-xs text-green-500 font-bold mb-1">أعلى درجة</div>
                        <div className="text-2xl font-black text-green-700">{s.max}</div>
                      </div>
                      <div className="rounded-2xl p-3 text-center border border-red-100 bg-red-50">
                        <div className="text-xs text-red-400 font-bold mb-1">أقل درجة</div>
                        <div className="text-2xl font-black text-red-600">{s.min}</div>
                      </div>
                    </div>
                    {/* رسم أعمدة التقديرات */}
                    <div className="border border-gray-100 rounded-xl p-3">
                      <div className="text-xs font-bold text-gray-400 mb-2">توزيع التقديرات</div>
                      <GradeBarChart height={100} data={GRADE_ORDER.map(g=>({
                        label:g, value:counts[g]||0, pct:n?Math.round((counts[g]||0)/n*100):0
                      }))}/>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {tab==="subjects" && (
        <div className="space-y-4">
          {!analytics ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">📚</div><div className="font-black text-gray-400">استورد بيانات أولاً</div></div>
          ) : (
            <>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{background:"#1e3a5f"}}>
                      <tr>
                        <th className="px-3 py-3 text-right text-xs text-gray-200 font-bold sticky right-0" style={{background:"#1e3a5f"}}>م</th>
                        <th className="px-3 py-3 text-right text-xs text-gray-200 font-bold sticky" style={{minWidth:120}}>المادة</th>
                        <th className="px-3 py-3 text-center text-xs text-gray-300 font-bold">العدد</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#ef4444"}}>ضعيف</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#fed7aa"}}>%</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#fb923c"}}>مقبول</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#fde68a"}}>%</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#fef08a"}}>جيد</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#bfdbfe"}}>%</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#93c5fd"}}>جيد جداً</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#bfdbfe"}}>%</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#86efac"}}>ممتاز</th>
                        <th className="px-3 py-3 text-center text-xs font-bold" style={{color:"#bbf7d0"}}>%</th>
                        <th className="px-3 py-3 text-center text-xs text-gray-300 font-bold">متوسط</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(()=>{
                        const totals={n:0,dha:0,maq:0,jay:0,jj:0,mum:0,scores:[]};
                        const rows = subjNames.map((sub,i)=>{
                          const n=filtered.length;
                          const gc=(analytics.ss[sub]?.gradeCount)||{};
                          const dha=gc["ضعيف"]||0;
                          const maq=gc["مقبول"]||0;
                          const jay=gc["جيد"]||0;
                          const jj =gc["جيد جداً"]||0;
                          const mum=gc["ممتاز"]||0;
                          const avg=analytics.ss[sub]?.avg||0;
                          totals.n+=n; totals.dha+=dha; totals.maq+=maq; totals.jay+=jay; totals.jj+=jj; totals.mum+=mum;
                          totals.scores.push(avg);
                          const pct=v=>n>0?(v/n*100).toFixed(2)+"%":"0.00%";
                          const g=gaGradeLabel(avg);
                          return (
                            <tr key={sub} className={i%2===0?"":"bg-gray-50"} style={{borderBottom:"1px solid #f3f4f6"}}>
                              <td className="px-3 py-2.5 text-center text-gray-400 font-bold text-xs">{i+1}</td>
                              <td className="px-3 py-2.5 font-bold text-gray-800 text-xs">{sub.length>18?sub.substring(0,16)+"...":sub}</td>
                              <td className="px-3 py-2.5 text-center font-bold text-gray-700">{n}</td>
                              <td className="px-3 py-2.5 text-center font-black text-red-600">{dha}</td>
                              <td className="px-2 py-2.5 text-center text-red-400 text-xs">{pct(dha)}</td>
                              <td className="px-3 py-2.5 text-center font-black text-orange-600">{maq}</td>
                              <td className="px-2 py-2.5 text-center text-orange-400 text-xs">{pct(maq)}</td>
                              <td className="px-3 py-2.5 text-center font-black text-yellow-600">{jay}</td>
                              <td className="px-2 py-2.5 text-center text-yellow-500 text-xs">{pct(jay)}</td>
                              <td className="px-3 py-2.5 text-center font-black text-blue-600">{jj}</td>
                              <td className="px-2 py-2.5 text-center text-blue-400 text-xs">{pct(jj)}</td>
                              <td className="px-3 py-2.5 text-center font-black text-green-600">{mum}</td>
                              <td className="px-2 py-2.5 text-center text-green-500 text-xs">{pct(mum)}</td>
                              <td className="px-3 py-2.5 text-center font-black text-xs px-2 py-1 rounded-full" style={{color:g.c}}>{avg}%</td>
                            </tr>
                          );
                        });
                        const tn=totals.n; const ts=totals.scores;
                        const tavg=ts.length?Math.round(ts.reduce((a,b)=>a+b,0)/ts.length*100)/100:0;
                        const pct=v=>tn>0?(v/tn*100).toFixed(2)+"%":"0.00%";
                        rows.push(
                          <tr key="total" style={{background:"#1e3a5f",color:"#fff",borderTop:"2px solid #6366f1"}}>
                            <td colSpan={2} className="px-4 py-3 font-black text-right text-sm">الإجمالي</td>
                            <td className="px-3 py-3 text-center font-black">{tn}</td>
                            <td className="px-3 py-3 text-center font-black" style={{color:"#fca5a5"}}>{totals.dha}</td>
                            <td className="px-2 py-3 text-center text-xs" style={{color:"#fca5a5"}}>{pct(totals.dha)}</td>
                            <td className="px-3 py-3 text-center font-black" style={{color:"#fdba74"}}>{totals.maq}</td>
                            <td className="px-2 py-3 text-center text-xs" style={{color:"#fdba74"}}>{pct(totals.maq)}</td>
                            <td className="px-3 py-3 text-center font-black" style={{color:"#fde047"}}>{totals.jay}</td>
                            <td className="px-2 py-3 text-center text-xs" style={{color:"#fde047"}}>{pct(totals.jay)}</td>
                            <td className="px-3 py-3 text-center font-black" style={{color:"#93c5fd"}}>{totals.jj}</td>
                            <td className="px-2 py-3 text-center text-xs" style={{color:"#93c5fd"}}>{pct(totals.jj)}</td>
                            <td className="px-3 py-3 text-center font-black" style={{color:"#86efac"}}>{totals.mum}</td>
                            <td className="px-2 py-3 text-center text-xs" style={{color:"#86efac"}}>{pct(totals.mum)}</td>
                            <td className="px-3 py-3 text-center font-black" style={{color:"#a5b4fc"}}>{tavg}%</td>
                          </tr>
                        );
                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* رسم بياني مخرجات المعلمين */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-4 text-sm">📊 الرسم البياني — توزيع التقديرات لكل مادة</h3>
                <div className="overflow-x-auto">
                  <div style={{display:"flex",gap:16,minWidth:subjNames.length*90}}>
                    {subjNames.map((sub,i)=>{
                      const gc=(analytics.ss[sub]?.gradeCount)||{};
                      const n=filtered.length;
                      return (
                        <div key={sub} style={{flex:"0 0 80px",textAlign:"center"}}>
                          <div className="text-xs font-bold text-gray-600 mb-2 truncate" title={sub} style={{fontSize:9}}>
                            {sub.substring(0,8)}
                          </div>
                          <GradeBarChart height={120} showLabels={false} data={GRADE_ORDER.slice(0,5).map(g=>({
                            label:g, value:gc[g]||0, pct:n?Math.round((gc[g]||0)/n*100):0
                          }))}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  {GRADE_ORDER.slice(0,5).map(g=>{
                    const p=GRADE_PALETTE[g];
                    return <span key={g} className="flex items-center gap-1 text-xs font-bold" style={{color:p.text}}>
                      <span className="inline-block w-3 h-3 rounded" style={{background:p.bg}}/>{g}
                    </span>;
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab==="classes" && (
        <div className="space-y-4">
          {!analytics ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">🏫</div><div className="font-black text-gray-400">استورد بيانات أولاً</div></div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{background:"#1e3a5f"}}>
                    <tr>
                      <th className="px-4 py-3 text-right text-xs text-gray-200 font-bold">الرقم</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-200 font-bold">الصف</th>
                      <th className="px-4 py-3 text-center text-xs text-gray-200 font-bold">العدد</th>
                      <th className="px-4 py-3 text-center text-xs text-gray-300 font-bold">غائب</th>
                      <th className="px-4 py-3 text-center text-xs text-red-300 font-bold">ضعيف</th>
                      <th className="px-4 py-3 text-center text-xs text-orange-300 font-bold">مقبول</th>
                      <th className="px-4 py-3 text-center text-xs text-yellow-300 font-bold">جيد</th>
                      <th className="px-4 py-3 text-center text-xs text-blue-300 font-bold">جيد جداً</th>
                      <th className="px-4 py-3 text-center text-xs text-green-300 font-bold">ممتاز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sems=sem==="الكل"?["الفصل الأول","الفصل الثاني"]:([sem]);
                      const rows=[];
                      let tot={n:0,gh:0,dh:0,mq:0,jy:0,jj:0,mm:0};
                      sems.forEach((s,idx)=>{
                        const ss=filtered.filter(x=>x.sem===s||sem!=="الكل");
                        if(!ss.length) return;
                        const n=ss.length;
                        const gh=0;
                        const dh=ss.filter(x=>stuAvg(x)>=50&&stuAvg(x)<60).length;
                        const mq=ss.filter(x=>stuAvg(x)>=60&&stuAvg(x)<70).length;
                        const jy=ss.filter(x=>stuAvg(x)>=70&&stuAvg(x)<80).length;
                        const jj=ss.filter(x=>stuAvg(x)>=80&&stuAvg(x)<90).length;
                        const mm=ss.filter(x=>stuAvg(x)>=90).length;
                        tot.n+=n; tot.gh+=gh; tot.dh+=dh; tot.mq+=mq; tot.jy+=jy; tot.jj+=jj; tot.mm+=mm;
                        rows.push(
                          <tr key={s} className={idx%2===0?"":"bg-gray-50"}>
                            <td className="px-4 py-3 text-center text-gray-400 font-bold">{idx+1}</td>
                            <td className="px-4 py-3 font-bold text-gray-800">{stage} — {s}</td>
                            <td className="px-4 py-3 text-center font-black text-gray-700">{n}</td>
                            <td className="px-4 py-3 text-center font-black text-gray-500">{gh}</td>
                            <td className="px-4 py-3 text-center font-black text-red-600">{dh}</td>
                            <td className="px-4 py-3 text-center font-black text-orange-600">{mq}</td>
                            <td className="px-4 py-3 text-center font-black text-yellow-600">{jy}</td>
                            <td className="px-4 py-3 text-center font-black text-blue-600">{jj}</td>
                            <td className="px-4 py-3 text-center font-black text-green-600">{mm}</td>
                          </tr>
                        );
                      });
                      rows.push(
                        <tr key="total" className="bg-blue-50 border-t-2 border-blue-200">
                          <td colSpan={2} className="px-4 py-3 font-black text-blue-700 text-right">المجموع</td>
                          <td className="px-4 py-3 text-center font-black text-blue-700">{tot.n}</td>
                          <td className="px-4 py-3 text-center font-black text-gray-600">{tot.gh}</td>
                          <td className="px-4 py-3 text-center font-black text-red-600">{tot.dh}</td>
                          <td className="px-4 py-3 text-center font-black text-orange-600">{tot.mq}</td>
                          <td className="px-4 py-3 text-center font-black text-yellow-600">{tot.jy}</td>
                          <td className="px-4 py-3 text-center font-black text-blue-600">{tot.jj}</td>
                          <td className="px-4 py-3 text-center font-black text-green-600">{tot.mm}</td>
                        </tr>
                      );
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* - بيانات الطلاب الكاملة - */}
      {tab==="studata" && (
        <div className="space-y-4">
          {filtered.length===0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">👨‍🎓</div><div className="font-black text-gray-400">استورد بيانات أولاً</div></div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full" style={{fontSize:11}}>
                  <thead style={{background:"#1e3a5f",position:"sticky",top:0,zIndex:10}}>
                    <tr>
                      <th className="px-2 py-3 text-center text-gray-200 font-bold whitespace-nowrap">م</th>
                      <th className="px-3 py-3 text-right text-gray-200 font-bold whitespace-nowrap" style={{minWidth:120}}>الاسم</th>
                      <th className="px-2 py-3 text-center text-gray-300 font-bold whitespace-nowrap">الفصل</th>
                      {subjNames.map(s=><th key={s} className="px-2 py-3 text-center text-gray-200 font-bold" style={{minWidth:50,writingMode:"vertical-rl",transform:"rotate(180deg)",height:60}}>{s.substring(0,8)}</th>)}
                      <th className="px-2 py-3 text-center font-bold whitespace-nowrap" style={{color:"#86efac"}}>المعدل</th>
                      <th className="px-2 py-3 text-center font-bold whitespace-nowrap" style={{color:"#86efac"}}>ممتاز</th>
                      <th className="px-2 py-3 text-center font-bold whitespace-nowrap" style={{color:"#93c5fd"}}>جيد جداً</th>
                      <th className="px-2 py-3 text-center font-bold whitespace-nowrap" style={{color:"#fde047"}}>جيد</th>
                      <th className="px-2 py-3 text-center font-bold whitespace-nowrap" style={{color:"#fdba74"}}>مقبول</th>
                      <th className="px-2 py-3 text-center font-bold whitespace-nowrap" style={{color:"#a5b4fc"}}>التقدير</th>
                      <th className="px-2 py-3 text-center font-bold whitespace-nowrap" style={{color:"#fcd34d"}}>الترتيب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filtered].sort((a,b)=>stuAvg(b)-stuAvg(a)).map((s,i)=>{
                      const avg=stuAvg(s);
                      const g=gaGradeLabel(avg);
                      const gc={};
                      subjNames.forEach(sub=>{
                        const gr=s.grades?.[sub]?.gradeAr||gaGradeLabel(subTotal(s.grades?.[sub])).l;
                        gc[gr]=(gc[gr]||0)+1;
                      });
                      const rowBg=i===0?"#fef9c3":i===1?"#f0fdf4":i===2?"#fff7ed":i%2===0?"#fff":"#f9fafb";
                      return (
                        <tr key={s.id} style={{background:rowBg,borderBottom:"1px solid #f3f4f6"}}>
                          <td className="px-2 py-2 text-center text-gray-400 font-bold">{i+1}</td>
                          <td className="px-3 py-2 font-bold text-gray-800 whitespace-nowrap text-xs">{s.name.length>20?s.name.substring(0,18)+"...":s.name}</td>
                          <td className="px-2 py-2 text-center text-gray-400 text-xs">{s.sem.replace("الفصل","ف")}</td>
                          {subjNames.map(sub=>{
                            const v=subTotal(s.grades?.[sub]);
                            const gr=s.grades?.[sub]?.gradeAr||"";
                            const p=GRADE_PALETTE[gr]||{};
                            return <td key={sub} className="px-2 py-2 text-center font-black" style={{color:p.bg||"#9ca3af",fontSize:11}}>{v||"—"}</td>;
                          })}
                          <td className="px-2 py-2 text-center font-black text-sm" style={{color:"#6366f1"}}>{Number(avg).toFixed(2)}%</td>
                          <td className="px-2 py-2 text-center font-black text-green-600">{gc["ممتاز"]||0}</td>
                          <td className="px-2 py-2 text-center font-black text-blue-600">{gc["جيد جداً"]||0}</td>
                          <td className="px-2 py-2 text-center font-black text-yellow-600">{gc["جيد"]||0}</td>
                          <td className="px-2 py-2 text-center font-black text-orange-600">{gc["مقبول"]||0}</td>
                          <td className="px-2 py-2 text-center">
                            <span className="px-2 py-0.5 rounded-full font-black text-xs" style={{background:g.bg,color:g.c}}>{s.generalGrade||g.l}</span>
                          </td>
                          <td className="px-2 py-2 text-center font-black">
                            {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span className="text-gray-600 text-xs font-bold">{i+1}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab==="ranking" && (
        <div className="space-y-4">
          {!analytics ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">🏆</div><div className="font-black text-gray-400">أضف بيانات أولاً</div></div>
          ) : (
            <>
              {analytics.ranked.length>=3 && (
                <div className="flex justify-center items-end gap-4 py-4">
                  {[1,0,2].map(pos=>{
                    const s=analytics.ranked[pos];
                    const medals=["🥇","🥈","🥉"];
                    const colors=["#f59e0b","#6366f1","#f97316"];
                    return(
                      <div key={pos} className="text-center" style={{transform:pos===0?"scale(1.08)":"scale(1)"}}>
                        <div className="text-3xl mb-1">{medals[pos]}</div>
                        <div className="bg-white rounded-2xl shadow-lg px-4 py-3 border-2 min-w-24" style={{borderColor:colors[pos]}}>
                          <div className="font-black text-gray-800 text-sm">{s.name.split(" ")[0]}</div>
                          <div className="text-xl font-black mt-1" style={{color:colors[pos]}}>{s.avg}%</div>
                          <div className="text-xs text-gray-400">{s.sem.replace("الفصل","ف")}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{background:"#0f172a"}}><tr>
                      <th className="px-3 py-3 text-center text-xs text-gray-300 font-bold">الترتيب</th>
                      <th className="px-3 py-3 text-right text-xs text-gray-300 font-bold">الاسم</th>
                      <th className="px-3 py-3 text-center text-xs text-green-300 font-bold">المعدل %</th>
                      {subjNames.slice(0,5).map(s=><th key={s} className="px-2 py-3 text-center text-xs text-gray-300 font-bold" style={{minWidth:55}}>{s.substring(0,6)}</th>)}
                      <th className="px-3 py-3 text-center text-xs text-yellow-300 font-bold">التقدير</th>
                    </tr></thead>
                    <tbody>
                      {analytics.ranked.map((s,i)=>{
                        const g=gaGradeLabel(s.avg);
                        return(
                          <tr key={s.id} style={{background:i===0?"#fef3c7":i===1?"#ede9fe":i===2?"#ffedd5":i%2===0?"#fff":"#f8fafc"}}>
                            <td className="px-3 py-3 font-black text-lg text-center">{i<3?["🥇","🥈","🥉"][i]:i+1}</td>
                            <td className="px-3 py-3 font-bold text-gray-800">
                              {s.name}
                              {s.nationalId && <div className="text-xs text-gray-400">{s.nationalId}</div>}
                            </td>
                            <td className="px-3 py-3 text-center font-black text-lg" style={{color:"#6366f1"}}>{Number(s.avg).toFixed(2)}%</td>
                            {subjNames.slice(0,5).map(sub=>{
                              const v=subTotal(s.grades?.[sub]);
                              const gc=gaGradeLabel(v);
                              return <td key={sub} className="px-2 py-3 text-center font-black text-sm" style={{color:v>0?gc.c:"#9ca3af"}}>{v||"—"}</td>;
                            })}
                            <td className="px-3 py-3 text-center">
                              <span className="text-xs font-black px-2 py-1 rounded-full" style={{background:g.bg,color:g.c}}>
                                {s.generalGrade || g.l}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* - تحليل الاختبار - */}
      {tab==="exam" && (
        <div className="space-y-4">
          {!analytics ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">📝</div><div className="font-black text-gray-400">استورد بيانات أولاً</div></div>
          ) : (
            <>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="px-5 py-3 border-b" style={{background:"#1e3a5f"}}>
                  <h3 className="font-black text-white text-sm">📝 متوسط درجات اختبار نهاية الفصل — المواد ذات الاختبار النهائي</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{background:"#f8fafc"}}>
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-black text-gray-500">م</th>
                        <th className="px-4 py-3 text-right text-xs font-black text-gray-500">المادة</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-gray-500">الفصل</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-gray-500">عدد الطلاب</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-blue-600">مجموع الدرجات</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-green-600">متوسط الدرجات</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-gray-400">الدرجة العظمى</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-gray-400">أعلى</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-gray-400">أدنى</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(()=>{
                        const examSubjs = subjNames.filter(sub=>{
                          const m=getModel(sub);
                          return m.fe>0 && filtered.some(s=>s.grades?.[sub]?.finalExam>0);
                        });
                        let totalSum=0, totalN=0;
                        const rows = examSubjs.map((sub,i)=>{
                          const m=getModel(sub);
                          const scores=filtered.map(s=>s.grades?.[sub]?.finalExam||0).filter(v=>v>0);
                          const n=filtered.length;
                          const sum=scores.reduce((a,b)=>a+b,0);
                          const avg=scores.length?Math.round(sum/scores.length*100)/100:0;
                          const max2=scores.length?Math.max(...scores):0;
                          const min2=scores.length?Math.min(...scores):0;
                          totalSum+=sum; totalN+=n;
                          const g=gaGradeLabel(avg/m.fe*100);
                          return (
                            <tr key={sub} className={i%2===0?"":"bg-gray-50"} style={{borderBottom:"1px solid #f3f4f6"}}>
                              <td className="px-4 py-2.5 text-center text-gray-400 font-bold text-xs">{i+1}</td>
                              <td className="px-4 py-2.5 font-bold text-gray-800">{sub}</td>
                              <td className="px-4 py-2.5 text-center text-xs text-gray-500">{sem==="الكل"?"الكل":sem}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-gray-700">{n}</td>
                              <td className="px-4 py-2.5 text-center font-black text-blue-600">{Math.round(sum*100)/100}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className="font-black px-2 py-0.5 rounded-full text-xs" style={{background:g.bg,color:g.c}}>{avg}</span>
                              </td>
                              <td className="px-4 py-2.5 text-center text-gray-500 font-bold">{m.fe}</td>
                              <td className="px-4 py-2.5 text-center text-green-600 font-black">{max2}</td>
                              <td className="px-4 py-2.5 text-center text-red-500 font-black">{min2}</td>
                            </tr>
                          );
                        });
                        if(examSubjs.length>0){
                          rows.push(
                            <tr key="total" style={{background:"#1e3a5f",color:"#fff"}}>
                              <td colSpan={3} className="px-4 py-3 font-black text-right">الكل</td>
                              <td className="px-4 py-3 text-center font-black">{totalN}</td>
                              <td className="px-4 py-3 text-center font-black" style={{color:"#93c5fd"}}>{Math.round(totalSum*100)/100}</td>
                              <td className="px-4 py-3 text-center font-black" style={{color:"#86efac"}}>{totalN?Math.round(totalSum/totalN*100)/100:0}</td>
                              <td colSpan={3}/>
                            </tr>
                          );
                        }
                        return examSubjs.length===0
                          ? <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 font-bold">لا توجد مواد بها اختبار نهائي في البيانات المستوردة</td></tr>
                          : rows;
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* رسم بياني — متوسط درجات الاختبار */}
              {filtered.some(s=>subjNames.some(sub=>s.grades?.[sub]?.finalExam>0)) && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-800 mb-4 text-sm">📊 مقارنة متوسط درجات الاختبار النهائي</h3>
                  <div className="space-y-3">
                    {subjNames.filter(sub=>getModel(sub).fe>0&&filtered.some(s=>s.grades?.[sub]?.finalExam>0)).map((sub,i)=>{
                      const m=getModel(sub);
                      const scores=filtered.map(s=>s.grades?.[sub]?.finalExam||0);
                      const avg=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*100)/100;
                      const pct=avg/m.fe*100;
                      const g=gaGradeLabel(pct);
                      return (
                        <div key={sub}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-700">{sub} <span className="text-gray-400">(من {m.fe})</span></span>
                            <span className="font-black text-sm px-2 py-0.5 rounded-full" style={{background:g.bg,color:g.c}}>{avg}</span>
                          </div>
                          <div className="h-4 rounded-full overflow-hidden" style={{background:"#f3f4f6"}}>
                            <div className="h-full rounded-full" style={{width:pct+"%",background:g.c,opacity:.8}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* - مقارنة الفترات - */}

      {tab==="comparison" && (
        <div className="space-y-5">
          {(() => {
            const sems=["الفصل الأول","الفصل الثاني"];
            const semData={};
            sems.forEach(s=>{
              const ss=students.filter(x=>x.stage===stage&&x.sem===s);
              if(!ss.length) return;
              const avgs=ss.map(x=>stuAvg(x));
              const oa=Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length*100)/100;
              const passed=avgs.filter(a=>a>=60).length;
              const grades={};
              ss.forEach(x=>{ const g=x.generalGrade||gaGradeLabel(stuAvg(x)).l; grades[g]=(grades[g]||0)+1; });
              const subStats={};
              subjNames.forEach(sub=>{
                const scores=ss.map(x=>subTotal(x.grades?.[sub])).filter(v=>v>0);
                const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*100)/100:0;
                const examScores=ss.map(x=>x.grades?.[sub]?.finalExam||0);
                const examAvg=Math.round(examScores.reduce((a,b)=>a+b,0)/ss.length*100)/100;
                const gc={};
                ss.forEach(x=>{ const g=x.grades?.[sub]?.gradeAr||gaGradeLabel(subTotal(x.grades?.[sub])).l; gc[g]=(gc[g]||0)+1; });
                subStats[sub]={avg,examAvg,gc,n:ss.length};
              });
              semData[s]={overall:oa,passed,failed:avgs.length-passed,passRate:Math.round(passed/avgs.length*100),count:ss.length,grades,subStats};
            });
            const avSems=Object.keys(semData);
            if(!avSems.length) return (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border">
                <div className="text-4xl mb-2">🔄</div>
                <div className="font-black text-gray-500">أضف بيانات الفصلين للمقارنة</div>
                <div className="text-xs text-gray-300 mt-1">استورد ملف الفصل الأول ثم ملف الفصل الثاني</div>
              </div>
            );
            const colors=["#6366f1","#0d9488"];
            const lightColors=["#ede9fe","#d1fae5"];
            return (
              <>
                {/* ملخص الفصلين */}
                <div className="grid gap-4" style={{gridTemplateColumns:`repeat(${avSems.length},1fr)`}}>
                  {avSems.map((s,i)=>{
                    const d=semData[s]; const g=gaGradeLabel(d.overall);
                    return (
                      <div key={s} className="rounded-2xl p-5 border-2" style={{background:lightColors[i],borderColor:colors[i]+"44"}}>
                        <div className="text-center mb-3">
                          <div className="text-sm font-black mb-1" style={{color:colors[i]}}>{s}</div>
                          <CircleProgress value={d.overall} max={100} color={colors[i]} size={90} sublabel="%"/>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div><div className="text-lg font-black" style={{color:colors[i]}}>{d.count}</div><div className="text-xs text-gray-500">طالب</div></div>
                          <div><div className="text-lg font-black text-green-600">{d.passRate}%</div><div className="text-xs text-gray-500">نجاح</div></div>
                          <div><div className="text-lg font-black text-red-500">{d.failed}</div><div className="text-xs text-gray-500">دور ثانٍ</div></div>
                        </div>
                        {/* توزيع التقديرات */}
                        <div className="mt-3">
                          <GradeBarChart height={80} data={GRADE_ORDER.map(g=>({label:g,value:d.grades[g]||0}))}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* مقارنة مادة بمادة */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="px-5 py-3 border-b" style={{background:"#1e3a5f"}}>
                    <h3 className="font-black text-white text-sm">📊 مقارنة المواد بين الفترتين</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead style={{background:"#f8fafc"}}>
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-500">المادة</th>
                          {avSems.map((s,i)=><th key={s} className="px-3 py-3 text-center text-xs font-black" style={{color:colors[i]}}>{s.replace("الفصل","ف")}</th>)}
                          {avSems.length>=2 && <th className="px-3 py-3 text-center text-xs font-black text-gray-400">الفرق</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {subjNames.map((sub,i)=>{
                          const vals=avSems.map(s=>semData[s]?.subStats[sub]?.avg||0);
                          const diff=vals.length>=2?Math.round((vals[0]-vals[1])*100)/100:0;
                          const diffColor=diff>0?"#16a34a":diff<0?"#dc2626":"#6b7280";
                          return (
                            <tr key={sub} className={i%2===0?"":"bg-gray-50"} style={{borderBottom:"1px solid #f3f4f6"}}>
                              <td className="px-4 py-3 font-bold text-gray-800 text-xs">{sub}</td>
                              {vals.map((v,j)=>{
                                const g=gaGradeLabel(v);
                                return <td key={j} className="px-3 py-3 text-center">
                                  <span className="font-black text-sm px-2 py-0.5 rounded-full" style={{background:g.bg,color:g.c}}>{v}%</span>
                                </td>;
                              })}
                              {avSems.length>=2 && <td className="px-3 py-3 text-center font-black text-sm" style={{color:diffColor}}>
                                {diff>0?"+":""}{diff}% {diff>0?"▲":diff<0?"▼":"="}
                              </td>}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* رسم بياني المقارنة */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-800 mb-4 text-sm">📈 الرسم البياني المقارن</h3>
                  <div className="space-y-3">
                    {subjNames.map(sub=>(
                      <div key={sub}>
                        <div className="text-xs font-bold text-gray-700 mb-1">{sub}</div>
                        <div className="space-y-1">
                          {avSems.map((s,i)=>{
                            const v=semData[s]?.subStats[sub]?.avg||0;
                            const g=gaGradeLabel(v);
                            return (
                              <div key={s} className="flex items-center gap-2">
                                <span className="text-xs font-bold flex-shrink-0" style={{width:40,color:colors[i]}}>{s.replace("الفصل ","ف")}</span>
                                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{background:"#f3f4f6"}}>
                                  <div className="h-full rounded-full flex items-center justify-end pr-2"
                                    style={{width:v+"%",background:colors[i],opacity:.85}}>
                                    {v>10&&<span className="text-white text-xs font-black">{v}%</span>}
                                  </div>
                                </div>
                                <span className="text-xs font-black w-12 text-right" style={{color:g.c}}>{v}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 justify-center mt-3">
                    {avSems.map((s,i)=>(
                      <span key={s} className="flex items-center gap-1 text-xs font-bold" style={{color:colors[i]}}>
                        <span className="inline-block w-4 h-3 rounded" style={{background:colors[i]}}/>{s}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* - التقرير الكامل - */}
      {tab==="report" && (
        <div className="space-y-4">
          {!analytics ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">📄</div><div className="font-black text-gray-400">استورد بيانات أولاً</div></div>
          ) : (
            <>
              {/* ملخص إحصائي */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-gray-800 text-sm">📊 ملخص النتائج</h3>
                  <div className="text-xs text-gray-400">{stage} — {sem} — {analytics.total} طالب</div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {l:"المعدل العام",v:analytics.oa+"%",c:"#6366f1",bg:"#ede9fe"},
                    {l:"نسبة النجاح",v:analytics.passRate+"%",c:"#10b981",bg:"#dcfce7"},
                    {l:"دور ثانٍ",v:analytics.failed,c:"#ef4444",bg:"#fee2e2"},
                    {l:"أقوى مادة",v:(analytics.best||"").substring(0,8),c:"#0ea5e9",bg:"#e0f2fe"},
                    {l:"أضعف مادة",v:(analytics.worst||"").substring(0,8),c:"#f97316",bg:"#ffedd5"},
                    {l:"أعلى معدل",v:analytics.mx+"%",c:"#16a34a",bg:"#dcfce7"},
                    {l:"أدنى معدل",v:analytics.mn+"%",c:"#dc2626",bg:"#fee2e2"},
                    {l:"إجمالي الطلاب",v:analytics.total,c:"#7c3aed",bg:"#f5f3ff"},
                  ].map(k=>(
                    <div key={k.l} className="rounded-2xl p-3" style={{background:k.bg}}>
                      <div className="text-xs font-bold opacity-60" style={{color:k.c}}>{k.l}</div>
                      <div className="text-xl font-black mt-1" style={{color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* توصيات */}
              <div className="rounded-2xl p-5 border-2 border-indigo-200 bg-indigo-50">
                <h3 className="font-black text-indigo-800 mb-3 text-sm">💡 التوصيات التربوية</h3>
                <div className="space-y-2 text-sm text-indigo-800">
                  {analytics.failed>0 && <div className="flex gap-2"><span>🔄</span><span>يوجد <strong>{analytics.failed}</strong> طالب يحتاج اختبار الدور الثاني — يحتفظ بـ40 ويُختبر من 60</span></div>}
                  <div className="flex gap-2"><span>📉</span><span>المادة الأضعف: <strong>{analytics.worst}</strong> ({analytics.ss[analytics.worst]?.avg}%) — تحتاج دعماً وخطة تحسين</span></div>
                  <div className="flex gap-2"><span>📈</span><span>نسبة النجاح {analytics.passRate}% {analytics.passRate>=90?"ممتازة 🎉":analytics.passRate>=70?"جيدة وتستحق تعزيزها":"تحتاج خطة تحسين عاجلة"}</span></div>
                  <div className="flex gap-2"><span>🏆</span><span>أفضل مادة: <strong>{analytics.best}</strong> ({analytics.ss[analytics.best]?.avg}%) — نموذج يُحتذى به</span></div>
                </div>
              </div>
              {/* أزرار الطباعة */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={printReport}
                  className="py-4 rounded-2xl text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  style={{background:"linear-gradient(135deg,#1e3a5f,#6366f1)"}}>
                  🖨️ طباعة التقرير الكامل
                </button>
                <button onClick={()=>{
                  const sem1=students.filter(s=>s.stage===stage&&s.sem==="الفصل الأول");
                  const sem2=students.filter(s=>s.stage===stage&&s.sem==="الفصل الثاني");
                  if(!sem1.length||!sem2.length){alert("يلزم وجود بيانات الفصلين للمقارنة");return;}
                  setTab("comparison");
                }}
                  className="py-4 rounded-2xl text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  style={{background:"linear-gradient(135deg,#0d9488,#059669)"}}>
                  🔄 مقارنة الفترتين
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}



// ===== الاختبار الجماعي الموزع على أيام =====
function DailyQuizPage({ classList }) {
  const [tab, setTab] = useState("create");
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [form, setForm] = useState({ title:"", subject:"", days:8, questions:[] });
  const [newQ, setNewQ] = useState({ text:"", options:["","","",""], answer:0 });
  const [dayIdx, setDayIdx] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    DB.get("school-daily-quiz-plans",[]).then(d=>setPlans(Array.isArray(d)?d:[]));
    DB.get("school-daily-quiz-results",[]).then(d=>setResults(Array.isArray(d)?d:[]));
  },[]);

  const savePlans = p => { setPlans(p); DB.set("school-daily-quiz-plans",p); };
  const saveResults = r => { setResults(r); DB.set("school-daily-quiz-results",r); };

  const addQ = () => {
    if (!newQ.text.trim() || newQ.options.some(o=>!o.trim())) { alert("أكمل السؤال والخيارات الأربعة"); return; }
    setForm(f=>({...f, questions:[...f.questions,{...newQ,id:Date.now()}]}));
    setNewQ({text:"",options:["","","",""],answer:0});
  };

  const createPlan = () => {
    if (!form.title.trim()||form.questions.length<1) { alert("أدخل العنوان وسؤالاً واحداً على الأقل"); return; }
    const qPerDay = Math.ceil(form.questions.length/form.days);
    const days = Array.from({length:form.days},(_,i)=>({
      day:i+1,
      questions: form.questions.slice(i*qPerDay,(i+1)*qPerDay),
    })).filter(d=>d.questions.length>0);
    const plan = {id:Date.now(), title:form.title, subject:form.subject, days, createdAt:new Date().toLocaleDateString("ar-SA")};
    savePlans([plan,...plans]);
    setForm({title:"",subject:"",days:8,questions:[]});
    setTab("run");
    setActivePlan(plan);
  };

  const submitAnswer = () => {
    if (!studentName.trim()) { alert("أدخل اسمك"); return; }
    const todayQs = activePlan?.days[dayIdx]?.questions||[];
    const score = todayQs.filter((q,qi)=>answers[qi]===q.answer).length;
    const entry = {id:Date.now(),planId:activePlan.id,planTitle:activePlan.title,day:dayIdx+1,studentName,score,total:todayQs.length,date:new Date().toLocaleDateString("ar-SA")};
    saveResults([entry,...results]);
    setSubmitted(true);
  };

  const todayQs = activePlan?.days[dayIdx]?.questions||[];
  const dayResults = results.filter(r=>r.planId===activePlan?.id&&r.day===dayIdx+1);

  return (
    <div dir="rtl" className="space-y-4">
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#7c3aed,#2563eb)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">🎯 الاختبار الجماعي اليومي</h2>
          <p className="opacity-80 text-sm">توزيع المعايير على أيام — الإجابة مخفية حتى يجاوب الجميع</p>
        </div>
      </div>
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {[{id:"create",l:"➕ إنشاء خطة"},{id:"run",l:"▶️ تشغيل اختبار"},{id:"results",l:"📊 النتائج"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={"flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all "+(tab===t.id?"bg-purple-600 text-white shadow":"text-gray-500 hover:bg-gray-50")}>
            {t.l}
          </button>
        ))}
      </div>

      {/* إنشاء خطة */}
      {tab==="create" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-black text-gray-800 text-sm">📋 بيانات الخطة</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-gray-500 block mb-1">عنوان الخطة</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="مثال: اختبار الوحدة الأولى" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none" style={{fontFamily:"inherit"}}/></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">المادة</label>
                <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="رياضيات، علوم..." className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none" style={{fontFamily:"inherit"}}/></div>
            </div>
            <div><label className="text-xs font-bold text-gray-500 block mb-1">عدد الأيام: {form.days}</label>
              <input type="range" min="1" max="30" value={form.days} onChange={e=>setForm(f=>({...f,days:Number(e.target.value)}))} className="w-full"/></div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-black text-gray-800 text-sm">❓ إضافة أسئلة ({form.questions.length} سؤال)</h3>
            <textarea value={newQ.text} onChange={e=>setNewQ(p=>({...p,text:e.target.value}))} placeholder="نص السؤال..." rows={2}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none resize-none" style={{fontFamily:"inherit"}}/>
            <div className="grid grid-cols-2 gap-2">
              {newQ.options.map((op,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="ans" checked={newQ.answer===i} onChange={()=>setNewQ(p=>({...p,answer:i}))} className="accent-green-500"/>
                  <input value={op} onChange={e=>setNewQ(p=>({...p,options:p.options.map((o,j)=>j===i?e.target.value:o)}))}
                    placeholder={`خيار ${i+1}${i===newQ.answer?" ✓ (الصحيح)":""}`}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-green-400" style={{fontFamily:"inherit"}}/>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-400">حدد الدائرة بجانب الإجابة الصحيحة ✓</div>
            <button onClick={addQ} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm">+ إضافة السؤال</button>
            {form.questions.length>0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {form.questions.map((q,i)=>(
                  <div key={q.id} className="flex items-center justify-between bg-purple-50 rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-purple-800 truncate">{i+1}. {q.text}</span>
                    <button onClick={()=>setForm(f=>({...f,questions:f.questions.filter(x=>x.id!==q.id)}))} className="text-red-400 text-xs px-2">✕</button>
                  </div>
                ))}
              </div>
            )}
            {form.questions.length>0 && (
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-bold">
                📅 {form.questions.length} سؤال ÷ {form.days} أيام = {Math.ceil(form.questions.length/form.days)} سؤال/يوم تقريباً
              </div>
            )}
          </div>
          <button onClick={createPlan} disabled={!form.title||form.questions.length===0}
            className="w-full py-3 rounded-2xl text-white font-black text-base disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#7c3aed,#2563eb)"}}>
            ✅ إنشاء الخطة وتوزيعها
          </button>
        </div>
      )}

      {/* تشغيل الاختبار */}
      {tab==="run" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="text-xs font-bold text-gray-500 block mb-1">اختر الخطة</label>
            <select value={activePlan?.id||""} onChange={e=>{const p=plans.find(x=>x.id===Number(e.target.value));setActivePlan(p);setDayIdx(0);setSubmitted(false);setRevealed(false);setAnswers({});}}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
              <option value="">— اختر خطة —</option>
              {plans.map(p=><option key={p.id} value={p.id}>{p.title} | {p.subject}</option>)}
            </select>
          </div>
          {activePlan && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activePlan.days.map((d,i)=>(
                  <button key={i} onClick={()=>{setDayIdx(i);setSubmitted(false);setRevealed(false);setAnswers({});}}
                    className={"flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all border-2 "+
                      (dayIdx===i?"bg-purple-600 text-white border-purple-600":"bg-white text-gray-600 border-gray-200 hover:border-purple-300")}>
                    يوم {d.day}
                    <div className="text-xs opacity-70">{d.questions.length} سؤال</div>
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-gray-800">اليوم {activePlan.days[dayIdx]?.day} — {activePlan.subject}</h3>
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">{todayQs.length} سؤال</span>
                </div>
                {!submitted ? (
                  <div className="space-y-4">
                    <input value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="اسم الطالب" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none" style={{fontFamily:"inherit"}}/>
                    {todayQs.map((q,qi)=>(
                      <div key={q.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="font-bold text-gray-800 text-sm mb-3">{qi+1}. {q.text}</div>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((op,oi)=>(
                            <button key={oi} onClick={()=>setAnswers(p=>({...p,[qi]:oi}))}
                              className={"w-full text-right px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all "+
                                (answers[qi]===oi?"border-purple-500 bg-purple-50 text-purple-800":"border-gray-200 bg-white text-gray-700 hover:border-purple-300")}>
                              {["أ","ب","ج","د"][oi]}. {op}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={submitAnswer} disabled={Object.keys(answers).length<todayQs.length}
                      className="w-full py-3 rounded-2xl text-white font-black disabled:opacity-40"
                      style={{background:"linear-gradient(135deg,#7c3aed,#2563eb)"}}>
                      ✅ تسليم الإجابات
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-2">⏳</div>
                    <div className="font-black text-gray-700 mb-1">تم التسليم!</div>
                    <div className="text-sm text-gray-400 mb-4">انتظر حتى يجاوب بقية الطلاب</div>
                    <div className="text-xs text-gray-400 mb-3">{dayResults.length} طالب سلّم حتى الآن</div>
                    {!revealed ? (
                      <button onClick={()=>setRevealed(true)} className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-black text-sm hover:bg-green-700">
                        🎯 كشف الإجابات الصحيحة
                      </button>
                    ) : (
                      <div className="space-y-3 text-right">
                        {todayQs.map((q,qi)=>(
                          <div key={q.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="font-bold text-sm mb-2">{qi+1}. {q.text}</div>
                            {q.options.map((op,oi)=>(
                              <div key={oi} className={"flex items-center gap-2 px-3 py-2 rounded-xl mb-1 text-sm "+(oi===q.answer?"bg-green-100 text-green-800 font-black":answers[qi]===oi&&oi!==q.answer?"bg-red-100 text-red-700":"text-gray-500")}>
                                {oi===q.answer?"✅":answers[qi]===oi?"❌":"○"} {["أ","ب","ج","د"][oi]}. {op}
                              </div>
                            ))}
                          </div>
                        ))}
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-black text-purple-700">{todayQs.filter((q,qi)=>answers[qi]===q.answer).length}/{todayQs.length}</div>
                          <div className="text-xs text-purple-500 font-bold">نتيجتك</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          {plans.length===0 && <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">📋</div><div className="font-black text-gray-400">أنشئ خطة أولاً من تبويب "إنشاء خطة"</div></div>}
        </div>
      )}

      {/* النتائج */}
      {tab==="results" && (
        <div className="space-y-4">
          {plans.map(plan=>{
            const planRes=results.filter(r=>r.planId===plan.id);
            if(!planRes.length) return null;
            return (
              <div key={plan.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="px-5 py-3 border-b font-black text-gray-800 text-sm flex items-center justify-between">
                  <span>📊 {plan.title}</span><span className="text-xs text-gray-400">{plan.subject}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-4 py-2 text-right text-xs font-black text-gray-500">الطالب</th>
                      <th className="px-3 py-2 text-center text-xs font-black text-purple-600">اليوم</th>
                      <th className="px-3 py-2 text-center text-xs font-black text-green-600">النتيجة</th>
                      <th className="px-3 py-2 text-center text-xs font-black text-gray-400">التاريخ</th>
                    </tr></thead>
                    <tbody>
                      {planRes.map((r,i)=>{
                        const pct=Math.round(r.score/r.total*100);
                        const col=pct>=80?"text-green-600":pct>=60?"text-amber-600":"text-red-600";
                        return <tr key={r.id} className={i%2===0?"":"bg-gray-50"}>
                          <td className="px-4 py-2 font-bold text-gray-800">{r.studentName}</td>
                          <td className="px-3 py-2 text-center text-xs text-purple-600 font-bold">يوم {r.day}</td>
                          <td className={"px-3 py-2 text-center font-black "+col}>{r.score}/{r.total} ({pct}%)</td>
                          <td className="px-3 py-2 text-center text-xs text-gray-400">{r.date}</td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {results.length===0 && <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">📊</div><div className="font-black text-gray-400">لا توجد نتائج بعد</div></div>}
        </div>
      )}
    </div>
  );
}

// ===== مساعد المعلم الذكي =====
function AITeacherPage() {
  const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || "";
  const [tab, setTab] = useState("questions"); // questions | summary | essay
  const [inputText, setInputText] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [numQ, setNumQ] = useState(10);
  const [level, setLevel] = useState("متوسط");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [essayText, setEssayText] = useState("");
  const [essayLang, setEssayLang] = useState("عربي");

  const callClaude = async (prompt) => {
    if (!CLAUDE_API_KEY) {
      setError("⚠️ يجب إضافة VITE_CLAUDE_API_KEY في إعدادات Vercel");
      return null;
    }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":CLAUDE_API_KEY,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.content?.[0]?.text || "";
    } catch(e) { setError("خطأ في الاتصال: "+e.message); return null; }
  };

  const generateQuestions = async () => {
    if (!inputText.trim()) { alert("أدخل نص المنهج أو الموضوع"); return; }
    setLoading(true); setResult(""); setError("");
    const prompt = `أنت معلم خبير في التعليم السعودي. بناءً على النص التالي، أنشئ ${numQ} سؤالاً اختيارياً (MCQ) باللغة العربية لطلاب ${grade} في مادة ${subject} بمستوى ${level}.

النص:
${inputText}

الصيغة المطلوبة لكل سؤال:
س[رقم]: [نص السؤال]
أ) [خيار]
ب) [خيار]  
ج) [خيار]
د) [خيار]
✅ الإجابة: [الحرف الصحيح]

ابدأ مباشرة بالأسئلة.`;
    const text = await callClaude(prompt);
    if (text) setResult(text);
    setLoading(false);
  };

  const generateSummary = async () => {
    if (!inputText.trim()) { alert("أدخل نص المنهج"); return; }
    setLoading(true); setResult(""); setError("");
    const prompt = `لخّص النص التالي لطلاب ${grade} في مادة ${subject} بأسلوب واضح ومنظم باللغة العربية.
اجعل الملخص يشمل:
1. أهم المفاهيم والتعريفات
2. النقاط الرئيسية مرقمة
3. خلاصة في جملتين

النص:
${inputText}`;
    const text = await callClaude(prompt);
    if (text) setResult(text);
    setLoading(false);
  };

  const correctEssay = async () => {
    if (!essayText.trim()) { alert("أدخل نص المقالة"); return; }
    setLoading(true); setResult(""); setError("");
    const prompt = `أنت مصحح لغوي خبير. قيّم المقالة التالية المكتوبة باللغة ${essayLang} وقدّم:

1. **الدرجة الإجمالية** (من 100)
2. **نقاط القوة** (3-4 نقاط)
3. **الأخطاء اللغوية والنحوية** مع التصحيح
4. **ملاحظات على الأسلوب والتنظيم**
5. **توصيات للتحسين**

المقالة:
${essayText}

قدّم التقييم باللغة العربية بصيغة واضحة ومنظمة.`;
    const text = await callClaude(prompt);
    if (text) setResult(text);
    setLoading(false);
  };

  const copyResult = () => { navigator.clipboard.writeText(result); };
  const printResult = () => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><style>body{font-family:'Cairo',sans-serif;padding:20px;direction:rtl;line-height:2}h1{color:#7c3aed}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><h1>🤖 مساعد المعلم الذكي</h1><pre>${result}</pre><script>window.onload=()=>window.print()</script></body></html>`);
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#7c3aed,#ec4899)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">🤖 مساعد المعلم الذكي</h2>
          <p className="opacity-80 text-sm">مدعوم بـ Claude AI — أسئلة، ملخصات، وتصحيح مقالات</p>
        </div>
      </div>

      {!CLAUDE_API_KEY && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
          <div className="font-black text-amber-800 mb-1">⚠️ يلزم إعداد مفتاح API</div>
          <div className="text-xs text-amber-700 leading-relaxed">أضف متغير <strong>VITE_CLAUDE_API_KEY</strong> في إعدادات Vercel ← Environment Variables</div>
        </div>
      )}

      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {[{id:"questions",l:"❓ توليد أسئلة"},{id:"summary",l:"📝 ملخص تلقائي"},{id:"essay",l:"✏️ تصحيح مقالة"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setResult("");setError("");}}
            className={"flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all "+(tab===t.id?"bg-purple-600 text-white shadow":"text-gray-500 hover:bg-gray-50")}>
            {t.l}
          </button>
        ))}
      </div>

      {(tab==="questions"||tab==="summary") && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs font-bold text-gray-500 block mb-1">المادة</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="رياضيات..." className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none" style={{fontFamily:"inherit"}}/></div>
            <div><label className="text-xs font-bold text-gray-500 block mb-1">الصف</label>
              <input value={grade} onChange={e=>setGrade(e.target.value)} placeholder="الأول متوسط" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none" style={{fontFamily:"inherit"}}/></div>
            {tab==="questions" && (
              <div><label className="text-xs font-bold text-gray-500 block mb-1">عدد الأسئلة: {numQ}</label>
                <input type="range" min="3" max="30" value={numQ} onChange={e=>setNumQ(Number(e.target.value))} className="w-full mt-2"/></div>
            )}
          </div>
          {tab==="questions" && (
            <div><label className="text-xs font-bold text-gray-500 block mb-1">المستوى</label>
              <div className="flex gap-2">
                {["سهل","متوسط","صعب"].map(l=>(
                  <button key={l} onClick={()=>setLevel(l)}
                    className={"px-4 py-1.5 rounded-xl text-xs font-black border-2 transition-all "+(level===l?"border-purple-500 bg-purple-600 text-white":"border-gray-200 text-gray-600 hover:border-purple-300")}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">📄 نص المنهج أو الموضوع</label>
            <textarea value={inputText} onChange={e=>setInputText(e.target.value)} rows={6}
              placeholder="الصق نص المنهج هنا، أو اكتب الموضوع الذي تريد إنشاء أسئلة أو ملخص عنه..."
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none resize-none" style={{fontFamily:"inherit"}}/>
          </div>
          <button onClick={tab==="questions"?generateQuestions:generateSummary} disabled={loading||!inputText.trim()}
            className="w-full py-3 rounded-2xl text-white font-black disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#7c3aed,#ec4899)"}}>
            {loading?"⏳ جاري المعالجة...":tab==="questions"?"🎯 توليد الأسئلة":"📝 إنشاء الملخص"}
          </button>
        </div>
      )}

      {tab==="essay" && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div className="flex gap-2">
            {["عربي","إنجليزي"].map(l=>(
              <button key={l} onClick={()=>setEssayLang(l)}
                className={"px-4 py-2 rounded-xl text-sm font-black border-2 transition-all "+(essayLang===l?"border-purple-500 bg-purple-600 text-white":"border-gray-200 text-gray-600")}>
                {l==="عربي"?"🔤 عربي":"🔠 إنجليزي"}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">✏️ نص المقالة / الكتابة</label>
            <textarea value={essayText} onChange={e=>setEssayText(e.target.value)} rows={8}
              placeholder="الصق كتابة الطالب هنا للتصحيح والتقييم..."
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none resize-none" style={{fontFamily:"inherit"}} dir={essayLang==="إنجليزي"?"ltr":"rtl"}/>
          </div>
          <button onClick={correctEssay} disabled={loading||!essayText.trim()}
            className="w-full py-3 rounded-2xl text-white font-black disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#7c3aed,#ec4899)"}}>
            {loading?"⏳ جاري التصحيح...":"🔍 تصحيح وتقييم المقالة"}
          </button>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-bold">{error}</div>}

      {result && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-black text-gray-800 text-sm">✨ النتيجة</h3>
            <div className="flex gap-2">
              <button onClick={copyResult} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200">📋 نسخ</button>
              <button onClick={printResult} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200">🖨️ طباعة</button>
            </div>
          </div>
          <div className="p-5">
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap" style={{fontFamily:"inherit"}}>{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== نظام التوصية بالدروس =====
function LessonRecommendPage({ classList }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const SUBJECT_RESOURCES = {
    "رياضيات": [{title:"خان أكاديمي — رياضيات",url:"https://ar.khanacademy.org/math",icon:"📐"},{title:"يوتيوب — شرح رياضيات",url:"https://www.youtube.com/results?search_query=شرح+رياضيات+متوسط",icon:"▶️"}],
    "علوم":    [{title:"خان أكاديمي — علوم",url:"https://ar.khanacademy.org/science",icon:"🔬"},{title:"يوتيوب — شرح علوم",url:"https://www.youtube.com/results?search_query=شرح+علوم+متوسط",icon:"▶️"}],
    "إنجليزي": [{title:"Duolingo — إنجليزي",url:"https://www.duolingo.com",icon:"🔠"},{title:"BBC Learning English",url:"https://www.bbc.co.uk/learningenglish",icon:"🌐"}],
    "لغتي":   [{title:"يوتيوب — لغة عربية",url:"https://www.youtube.com/results?search_query=شرح+لغة+عربية+متوسط",icon:"📖"},{title:"مدرسة.كوم",url:"https://madrasa.com",icon:"🏫"}],
    "دراسات إسلامية": [{title:"يوتيوب — تربية إسلامية",url:"https://www.youtube.com/results?search_query=شرح+تربية+إسلامية",icon:"🌙"},{title:"إسلام ويب",url:"https://islamweb.net",icon:"📿"}],
  };

  const cls = classList.find(c=>c.id===selectedClass);
  const student = cls?.students?.find(s=>s.id===selectedStudent);
  const evals = student?.evals||[];

  const weakSubjects = (() => {
    const subjScores = {};
    evals.forEach(ev => {
      if (!ev.subject) return;
      if (!subjScores[ev.subject]) subjScores[ev.subject]=[];
      const lvMap={excel:5,vgood:4,good:3,accept:2,weak:1};
      subjScores[ev.subject].push(lvMap[ev.level]||0);
    });
    return Object.entries(subjScores).map(([subj,scores])=>({
      subj, avg:scores.reduce((a,b)=>a+b,0)/scores.length, count:scores.length
    })).filter(x=>x.avg<3).sort((a,b)=>a.avg-b.avg);
  })();

  const levelLabel = avg => avg>=4?"ممتاز":avg>=3?"جيد":avg>=2?"مقبول":"يحتاج دعم";
  const levelColor = avg => avg>=4?"#22c55e":avg>=3?"#f59e0b":avg>=2?"#fb923c":"#ef4444";

  return (
    <div dir="rtl" className="space-y-4">
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#0891b2,#7c3aed)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">💡 التوصية بالدروس</h2>
          <p className="opacity-80 text-sm">تحليل نقاط ضعف الطالب واقتراح مصادر تعليمية مناسبة</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">الفصل</label>
          <select value={selectedClass} onChange={e=>{setSelectedClass(e.target.value);setSelectedStudent(null);}}
            className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
            <option value="">— اختر الفصل —</option>
            {classList.map(c=><option key={c.id} value={c.id}>{c.name||`${c.level}/${c.section}`}</option>)}
          </select>
        </div>
        {cls && (
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">الطالب</label>
            <select value={selectedStudent||""} onChange={e=>setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
              <option value="">— اختر الطالب —</option>
              {(cls.students||[]).filter(s=>s.name).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {student && (
        <div className="space-y-4">
          {weakSubjects.length===0 ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">🌟</div>
              <div className="font-black text-green-700">أداء الطالب ممتاز في جميع المواد</div>
              <div className="text-xs text-green-600 mt-1">لا توجد مواد تحتاج دعماً إضافياً</div>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="font-black text-amber-800 mb-3 text-sm">⚠️ مواد تحتاج متابعة — {student.name}</div>
                <div className="space-y-2">
                  {weakSubjects.map(w=>(
                    <div key={w.subj} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                      <span className="font-bold text-gray-800 text-sm">{w.subj}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{w.count} تقييم</span>
                        <span className="text-xs font-black px-2 py-1 rounded-full text-white" style={{background:levelColor(w.avg)}}>
                          {levelLabel(w.avg)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {weakSubjects.map(w=>{
                  const resources = SUBJECT_RESOURCES[w.subj]||[{title:"بحث في يوتيوب",url:`https://www.youtube.com/results?search_query=شرح+${w.subj}`,icon:"▶️"}];
                  return (
                    <div key={w.subj} className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
                      <div className="font-black text-blue-800 mb-3 text-sm">📚 توصيات لمادة {w.subj}</div>
                      <div className="space-y-2">
                        {resources.map((r,i)=>(
                          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 rounded-xl px-4 py-3 transition-all group">
                            <span className="text-xl">{r.icon}</span>
                            <div className="flex-1">
                              <div className="font-bold text-blue-800 text-sm group-hover:underline">{r.title}</div>
                              <div className="text-xs text-blue-500">{r.url.substring(0,40)}...</div>
                            </div>
                            <span className="text-blue-400 group-hover:text-blue-600">←</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {evals.length===0 && (
            <div className="bg-gray-50 rounded-2xl p-6 text-center border">
              <div className="text-3xl mb-2">📋</div>
              <div className="font-black text-gray-500">لا توجد تقييمات لهذا الطالب بعد</div>
              <div className="text-xs text-gray-400 mt-1">أضف تقييمات بالمواد من صفحة تقييم الطلاب</div>
            </div>
          )}
        </div>
      )}
      {!student && !cls && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border">
          <div className="text-4xl mb-3">💡</div>
          <div className="font-black text-gray-600">اختر فصلاً وطالباً لعرض التوصيات</div>
        </div>
      )}
    </div>
  );
}


// ===== النماذج الرسمية — الدليل الإجرائي =====
const SCHOOL_NAME = "مدرسة عبيدة بن الحارث المتوسطة";
const FORM_GREEN = "#2d6a4f";
const FORM_LIGHT = "#d8f3dc";

function OfficialFormsPage({ teachers, attendance, week }) {
  const [accounts,         setAccounts]        = useState([]);
  const [selectedTeacher,  setSelectedTeacher]  = useState("");
  const [formType,         setFormType]         = useState("warning");
  const [formData,         setFormData]         = useState({
    date:"", dateH:"", timeFrom:"", timeTo:"", absFrom:"", absTo:"",
    type:"تأخر", days:"", spec:"", rank:"", jobNo:"", jobTitle:"",
    nationalId:"", reason:"", lateHours:"",
    calType:"hijri", dateDay:"", dateMonth:"", dateYear:"1447",
    timeFromH:"", timeFromM:"00", timeFromP:"ص",
    timeToH:"",   timeToM:"00", timeToP:"ص",
  });
  const [lateRecords,  setLateRecords]  = useState({}); // { teacherName: [{date, mins, type, saved}] }
  const [alertShown,   setAlertShown]   = useState(false);
  const [savedBanner,  setSavedBanner]  = useState("");

  useEffect(() => {
    DB.get("school-teacher-accounts", []).then(d => setAccounts(Array.isArray(d)?d:[]));
    DB.get("school-late-records", {}).then(d => setLateRecords(typeof d==="object"&&d?d:{}));
  }, []);

  const saveLateRecords = (rec) => { setLateRecords(rec); DB.set("school-late-records", rec); };

  // احتساب مدة التأخير من القوائم المنسدلة
  const calcLateMins = () => {
    const toMins = (h,m,p) => {
      if (!h||!m) return null;
      let hh = parseInt(h);
      if (p==="م" && hh!==12) hh+=12;
      if (p==="ص" && hh===12) hh=0;
      return hh*60 + parseInt(m);
    };
    const from = toMins(formData.timeFromH, formData.timeFromM, formData.timeFromP);
    const to   = toMins(formData.timeToH,   formData.timeToM,   formData.timeToP);
    if (from===null || to===null) return null;
    const diff = to - from;
    return diff > 0 ? diff : null;
  };

  // إجمالي دقائق التأخر المتراكمة للمعلم
  const totalLateMins = (name) => {
    const recs = lateRecords[name] || [];
    return recs.reduce((s,r) => s + (r.mins||0), 0);
  };

  // تنسيق الدقائق → ساعات ودقائق
  const fmtMins = (mins) => {
    if (!mins) return "٠ دقيقة";
    const h = Math.floor(mins/60);
    const m = mins%60;
    return h>0 ? `${h} ساعة${m>0?" و "+m+" دقيقة":""}` : `${m} دقيقة`;
  };

  // حفظ التنبيه وإضافة التأخر للسجل
  const saveWarningRecord = () => {
    if (!selectedTeacher) return;
    const mins = calcLateMins();
    if (!mins) { alert("حدد وقت البداية والنهاية أولاً"); return; }
    const dateLabel = `${formData.dateDay||"?"}/${formData.dateMonth||"?"}/${formData.dateYear||"1447"} ${(formData.calType||"hijri")==="greg"?"م":"هـ"}`;
    const newRec = { id:Date.now(), date:dateLabel, mins, type:formData.type, savedAt:new Date().toLocaleDateString("ar-SA") };
    const updated = { ...lateRecords, [selectedTeacher]: [...(lateRecords[selectedTeacher]||[]), newRec] };
    saveLateRecords(updated);
    const total = totalLateMins(selectedTeacher) + mins;
    setSavedBanner(`✅ تم حفظ التنبيه — مجموع التأخر: ${fmtMins(total)}`);
    setTimeout(()=>setSavedBanner(""),4000);
    if (total >= 7*60 && !alertShown) {
      setAlertShown(true);
      setTimeout(()=>alert(`⚠️ تنبيه هام!

المعلم ${selectedTeacher} تجاوز ٧ ساعات تأخر متراكمة (${fmtMins(total)}).

يستوجب إصدار قرار الحسم وفق النظام.`), 300);
    }
  };

  // اختيار معلم — يملأ بياناته تلقائياً
  const handleSelectTeacher = (name) => {
    setSelectedTeacher(name);
    setAlertShown(false);
    const acc = accounts.find(a => a.name === name) || {};
    const ti = teachers.indexOf(name);
    const absDays = ti >= 0 ? week.days.filter((_,di) => (attendance[ti]?.[di]?.status||"حاضر")==="غائب").length : 0;
    setFormData(p => ({ ...p, nationalId: acc.id || "", days: absDays > 0 ? String(absDays) : "" }));
    // تنبيه تلقائي إذا تجاوز ٧ ساعات
    const total = totalLateMins(name);
    if (total >= 7*60) {
      setTimeout(()=>alert(`⚠️ انتبه!

مجموع تأخرات ${name} = ${fmtMins(total)}
يستوجب إصدار قرار الحسم فوراً.`), 200);
    }
  };

  const FORM_TYPES = [
    { id:"warning",           label:"تنبيه على تأخر / انصراف", code:"و.م.ع.ن.-٠٢-٠٢" },
    { id:"deduct_late",       label:"قرار حسم ساعات تأخر وخروج مبكر", code:"و.م.ع.ن.-٠٣-٠٢" },
    { id:"absence_investigate",label:"مساءلة غياب", code:"و.م.ع.ن.-٠٤-٠٢" },
    { id:"absence_deduct",    label:"قرار حسم غياب", code:"و.م.ع.ن.-٠٥-٠٢" },
  ];

  const currentForm = FORM_TYPES.find(f => f.id === formType);

  const printForm = () => {
    const t = selectedTeacher || "___________";
    const nid = formData.nationalId || "___________";
    // بناء التاريخ من القوائم المنسدلة
    const _day   = formData.dateDay   ? String(formData.dateDay).padStart(2,"0") : "  ";
    const _month = formData.dateMonth ? String(formData.dateMonth).padStart(2,"0") : "  ";
    const _year  = formData.dateYear  || "١٤";
    const _suf   = (formData.calType||"hijri")==="greg" ? "م" : "هـ";
    const dateH  = `${_day} / ${_month} / ${_year} ${_suf}`;
    // بناء الوقت من القوائم المنسدلة
    const fmtTime = (h,m,p) => h&&m ? `${String(h).padStart(2,"0")}:${m} ${p||"ص"}` : "  :  ";
    const timeFromStr = fmtTime(formData.timeFromH, formData.timeFromM, formData.timeFromP);
    const timeToStr   = fmtTime(formData.timeToH,   formData.timeToM,   formData.timeToP);
    // مجموع التأخر المتراكم
    const totalMins = totalLateMins(selectedTeacher);
    const totalLateStr = totalMins > 0 ? fmtMins(totalMins) : (formData.lateHours||"  ");
    const spec = formData.spec || "___________";
    const rank = formData.rank || "___________";
    const jobNo = formData.jobNo || "___________";
    const jobTitle = formData.jobTitle || "___________";

    const headerStyle = `background:${FORM_GREEN};color:#fff;padding:6px 10px;font-weight:bold;font-size:13px`;
    const cellStyle = `border:1px solid #aaa;padding:6px 10px;font-size:12px`;
    const tableHdr = `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:12px;margin-bottom:12px">
      <tr style="${headerStyle}">
        <th>الاسم</th><th>التخصص</th><th>المستوى / المرتبة</th><th>رقم الوظيفة</th><th>العمل الحالي</th>
      </tr>
      <tr>
        <td style="${cellStyle}">${t}</td>
        <td style="${cellStyle}">${spec}</td>
        <td style="${cellStyle}">${rank}</td>
        <td style="${cellStyle}">${jobNo}</td>
        <td style="${cellStyle}">${jobTitle}</td>
      </tr>
    </table>`;

    let body = "";

    if (formType === "warning") {
      const currentMins = calcLateMins();
      const lateDurStr = currentMins ? `بمقدار ( ${fmtMins(currentMins)} )` : "";
      const warnType = formData.type === "تأخر" ?
        `تأخركم من بداية العمل ، وحضوركم الساعة ( ${timeFromStr} ) ${lateDurStr}` :
        formData.type === "مغادرة" ?
        `عدم تواجدكم أثناء العمل من الساعة ( ${timeFromStr} ) إلى الساعة ( ${timeToStr} ) ${lateDurStr}` :
        `انصرافكم مبكراً قبل نهاية العمل من الساعة ( ${timeFromStr} ) ${lateDurStr}`;

      body = `
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <div><b>اسم النموذج : تنبيه على تأخر / انصراف</b></div>
          <div><b>رمز النموذج : (و.م.ع.ن.-٠٢-٠٢)</b></div>
        </div>
        <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;margin-bottom:12px">
          <tr><td style="${headerStyle};text-align:right" colspan="2">المدرسة</td><td colspan="3">${SCHOOL_NAME}</td></tr>
          <tr><td style="${headerStyle};text-align:right" colspan="2">السجل المدني</td><td colspan="3">${nid}</td></tr>
        </table>
        ${tableHdr}
        <p>المكرم المعلم / <u>${t}</u> وفقه الله</p>
        <p>السلام عليكم ورحمة الله وبركاته &nbsp;&nbsp;&nbsp;&nbsp; وبعد :</p>
        <p>إنه في يوم ............... الموافق ${dateH} اتضح ما يلي :</p>
        <p style="margin-right:20px">- ${warnType}</p>
        <p>عليه نأمل توضيح أسباب ذلك مع إرفاق ما يؤيد عذركم ،،، ولكم تحياتي</p>
        <div style="display:flex;justify-content:space-between;margin-top:15px">
          <div>التاريخ : ${dateH}</div>
          <div>التوقيع : ___________</div>
          <div>قائد المدرسة : ___________</div>
        </div>
        <div style="border-top:2px dashed #aaa;margin:20px 0"></div>
        <p><b>المكرم / مدير مدرسة ___________</b></p>
        <p>السلام عليكم ورحمة الله وبركاته<br>أفيدكم بأن أسباب ذلك ما يلي :</p>
        <div style="border-bottom:1px solid #aaa;height:25px;margin:8px 0"></div>
        <div style="border-bottom:1px solid #aaa;height:25px;margin:8px 0"></div>
        <div style="display:flex;justify-content:space-between;margin-top:15px">
          <div>التاريخ : ${dateH}</div>
          <div>التوقيع : ___________</div>
          <div>الاسم : ${t}</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:20px;border:1px solid #aaa;padding:10px;border-radius:8px">
          <div><b>رأي قائد المدرسة :</b></div>
          <div>□ عذره مقبول</div>
          <div>□ عذره غير مقبول ويحسم عليه</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:10px">
          <div>التاريخ : ${dateH}</div>
          <div>التوقيع : ___________</div>
          <div>قائد المدرسة : ___________</div>
        </div>
        <p style="font-size:11px;margin-top:15px;color:#555"><b>ملاحظة :</b> ترفق بطاقة المساءلة مع أصل القرار في حالة عدم قبول العذر ، أصله للملفه بالإدارة.</p>
      `;
    } else if (formType === "deduct_late") {
      body = `
        <div style="text-align:center;margin-bottom:15px"><h3>نموذج رقم (١٩)</h3></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <div><b>اسم النموذج : قرار حسم مجموع ساعات تأخر وخروج مبكر</b></div>
          <div><b>رمز النموذج : (و.م.ع.ن.-٠٣-٠٢)</b></div>
        </div>
        <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;margin-bottom:12px">
          <tr><td style="${headerStyle};text-align:right" colspan="2">المدرسة</td><td colspan="3">${SCHOOL_NAME}</td></tr>
          <tr><td style="${headerStyle};text-align:right" colspan="2">السجل المدني</td><td colspan="3">${nid}</td></tr>
        </table>
        ${tableHdr}
        <p>إن مدير المدرسة ، وبناءً على صلاحياته ، وبناءً على المادة (٢١) من نظام الخدمة المدنية وبناءً على موافقة معالي الوزير على إعطاء بعض الصلاحيات لمديري المدارس بالقرار رقم ١/١١٣٩ وتاريخ ١٤٣١/٣/١٧هـ ، ولبلوغ ساعات التأخر عن العمل والخروج المبكر من العمل ( <u>${totalLateStr}</u> ) ساعة ، وحيث إن عذره غير مقبول ، وبمقتضى النظام .</p>
        <p><b>يقرر ما يلي :</b></p>
        <p>(١) حسم مدة الغياب الموضحة بعاليه وعددها ( <u>${formData.days||"    "}</u> ) يوماً من راتبه .</p>
        <p>(٢) على إدارة شؤون الموظفين ( تنفيذ الأنظمة ) تنفيذ إجراء الحسم واستبعادها من خدماته وإرسال القرار للملف بالإدارة .</p>
        <p style="text-align:center"><b>والله الموفق</b></p>
        <div style="margin-top:20px">
          <p>الرئيس المباشر</p>
          <p>الاسم : ___________</p>
          <p>الختم</p>
          <p>التوقيع : ___________</p>
          <p>التاريخ : ${dateH}</p>
        </div>
        <div style="font-size:11px;margin-top:15px;color:#555">
          <p>صورة / للموظفين لمتابعة تنفيذ الحسم ( تنفيذ الأنظمة )</p>
          <p>صورة / لمكتب التعليم</p>
          <p>صورة/ للملف بالمدرسة</p>
        </div>
      `;
    } else if (formType === "absence_investigate") {
      body = `
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <div><b>اسم النموذج : مساءلة غياب</b></div>
          <div><b>رمز النموذج : (و.م.ع.ن.-٠٤-٠٢)</b></div>
        </div>
        <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;margin-bottom:12px">
          <tr><td style="${headerStyle};text-align:right" colspan="2">المدرسة</td><td colspan="5">${SCHOOL_NAME}</td></tr>
          <tr><td style="${headerStyle};text-align:right" colspan="2">السجل المدني</td><td colspan="5">${nid}</td></tr>
        </table>
        <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:12px;margin-bottom:12px">
          <tr style="${headerStyle}"><th>الاسم</th><th>التخصص</th><th>المستوى/المرتبة</th><th>رقم الوظيفة</th><th>العمل الحالي</th><th>عدد أيام الغياب</th></tr>
          <tr><td>${t}</td><td>${spec}</td><td>${rank}</td><td>${jobNo}</td><td>${jobTitle}</td><td style="text-align:center;font-weight:bold;color:red">${formData.days||"    "}</td></tr>
        </table>
        <div style="display:flex;justify-content:space-between;border:1px solid #aaa;padding:8px;margin-bottom:15px">
          <span>إنه في يوم .......... الموافق ${dateH} تغيبت عن العمل إلى يوم</span>
          <span>الموافق ${dateH}</span>
        </div>
        <p><b>(١) طلب الإفادة</b></p>
        <p>المكرم / <u>${t}</u> وفقه الله</p>
        <p>السلام عليكم ورحمة الله وبركاته ،،،</p>
        <p>من خلال متابعة سجل العمل تبين تغيابكم خلال الفترة الموضحة بعاليه ، أمل الإفادة عن أسباب ذلك وعليكم تقديم ما يؤيد عذركم خلال أسبوع من تاريخه ، علماً بأنه في حالة عدم الالتزام سيتم اتخاذ اللازم حسب التعليمات .</p>
        <div style="display:flex;justify-content:space-between;margin-top:10px">
          <div>التاريخ : ${dateH}</div>
          <div>التوقيع : ___________</div>
          <div>اسم الرئيس المباشر : ___________</div>
        </div>
        <div style="border-top:2px dashed #aaa;margin:20px 0"></div>
        <p><b>(٢) الإفادة</b></p>
        <p>المكرم / قائد المدرسة وفقه الله</p>
        <p>السلام عليكم ورحمة الله وبركاته وبعد:</p>
        <p>أفيدكم أن غيابي كان للأسباب التالية :</p>
        <div style="border-bottom:1px solid #aaa;height:25px;margin:8px 0"></div>
        <div style="border-bottom:1px solid #aaa;height:25px;margin:8px 0"></div>
        <p>وسأقوم بتقديم ما يثبت ذلك خلال أسبوع من تاريخه</p>
        <div style="display:flex;justify-content:space-between;margin-top:10px">
          <div>التاريخ : ${dateH}</div><div>التوقيع : ___________</div><div>اسم المعلم : ${t}</div>
        </div>
        <div style="border-top:2px dashed #aaa;margin:20px 0"></div>
        <p><b>(٣) مدير المدرسة :</b></p>
        <p style="margin-right:15px">أ. تحتسب له إجازة مرضية بعد التأكد من نظامية التقرير</p>
        <p style="margin-right:15px">ب. يحتسب من رصيده للإجازات الاضطرارية لقبول عذره إذا كان له رصيد وإلا يحسم عليه</p>
        <p style="margin-right:15px">ج. يعتمد الحسم لعدم قبول عذره</p>
        <div style="display:flex;justify-content:space-between;margin-top:10px">
          <div>التاريخ : ${dateH}</div><div>التوقيع : ___________</div><div>اسم الرئيس المباشر : ___________</div>
        </div>
        <div style="border:1px solid #aaa;padding:10px;margin-top:15px;border-radius:6px;font-size:11px">
          <p><b>ملحوظات هامة :</b></p>
          <p>١ - تستكمل الاستمارة من المدير المباشر وإصدار القرار بموجبه.</p>
          <p>٢ - إذا سبق إجازة الأسبوع غياب وألحقها غياب تحتسب مدة الغياب كاملة.</p>
          <p>٣ - يجب أن يوضح المتغيب أسباب غيابه فور تسلمه الاستمارة ويعيدها لمديره المباشر.</p>
          <p>٤ - يعطي المتغيب مدة أسبوع لتقديم ما يؤيد عذره فإذا انقضت المدة الزمنية واستمر عذره يتم الاستمارة تستكمل لإصدار قرار الحسم.</p>
        </div>
      `;
    } else if (formType === "absence_deduct") {
      body = `
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <div><b>النموذج : قرار حسم غياب</b></div>
          <div><b>رمز النموذج : (و.م.ع.ن.-٠٥-٠٢)</b></div>
        </div>
        <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;margin-bottom:12px">
          <tr><td style="${headerStyle};text-align:right" colspan="2">المدرسة</td><td colspan="5">${SCHOOL_NAME}</td></tr>
          <tr><td style="${headerStyle};text-align:right" colspan="2">السجل المدني</td><td colspan="5">${nid}</td></tr>
        </table>
        <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:12px;margin-bottom:15px">
          <tr style="${headerStyle}"><th>الاسم</th><th>التخصص</th><th>المستوى/المرتبة</th><th>الدرجة</th><th>رقم الوظيفة</th><th>العمل الحالي</th><th>عدد أيام الغياب</th></tr>
          <tr><td>${t}</td><td>${spec}</td><td>${rank}</td><td></td><td>${jobNo}</td><td>${jobTitle}</td><td style="text-align:center;font-weight:bold;color:red">${formData.days||"    "}</td></tr>
        </table>
        <div style="border:1px solid #aaa;padding:6px;margin-bottom:10px">الأيام الواجب حسمها ليحدد التاريخ</div>
        <p>إن قائد المدرسة ...............</p>
        <p>بناءً على صلاحياته ، وبناءً على المادة (٢١) من نظام الخدمة المدنية ، وبناءً على موافقة معالي الوزير على إعطاء بعض الصلاحيات لمديري المدارس بالقرار رقم ١/١١٣٩ وتاريخ ١٤٢١/٣/١٧هـ ، ولغياب المعلم الموضح أسمه أعلاه ، حيث إن عذره غير مقبول ، وبمقتضى النظام .</p>
        <p><b>يقرر ما يلي :</b></p>
        <p>(١) حسم مدة الغياب الموضحة بعاليه وعددها ( <u>${formData.days||"    "}</u> ) يوماً من راتبه .</p>
        <p>(٢) على إدارة شؤون الموظفين ( تنفيذ الأنظمة ) تنفيذ إجراء الحسم واستبعادها من خدماته وأصل القرار للملف بالإدارة مع الأساس .</p>
        <p style="text-align:center"><b>والله الموفق ......</b></p>
        <div style="margin-top:20px">
          <p>الرئيس المباشر</p>
          <p>الختم</p>
          <p>الاسم : ___________</p>
          <p>التوقيع : ___________</p>
          <p>التاريخ : ${dateH}</p>
        </div>
        <div style="font-size:11px;margin-top:20px;color:#555">
          <p><b>ملاحظة / لن يتم استلام قرار الحسم بدون المساءلة</b></p>
          <p>صورة/ لشؤون الموظفين لمتابعة تنفيذ الحسم ( تنفيذ الأنظمة ) .</p>
          <p>صورة / لمكتب التعليم .</p>
          <p>صورة / للملف بالمدرسة .</p>
        </div>
      `;
    }

    printWindow(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
    <title>${currentForm?.label}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Cairo',sans-serif;direction:rtl;padding:25px 30px;color:#1a1a1a;font-size:13px;line-height:1.8}
      p{margin:6px 0}
      u{border-bottom:1px solid #333;text-decoration:none;display:inline-block;min-width:80px}
      h3{font-size:16px;font-weight:900;text-align:center}
      @media print{@page{size:A4;margin:1.5cm}body{padding:0}}
    </style></head>
    <body>${body}<script>window.onload=()=>window.print()</script></body></html>`);
  };

  return (
    <div dir="rtl" className="space-y-4">
      {/* رأس الصفحة */}
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:`linear-gradient(135deg,${FORM_GREEN},#40916c)`}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">📋 النماذج الرسمية</h2>
          <p className="opacity-80 text-sm">نماذج الدليل الإجرائي — وزارة التعليم السعودية</p>
        </div>
      </div>

      {/* اختيار النموذج */}
      <div className="grid grid-cols-2 gap-3">
        {FORM_TYPES.map(ft=>(
          <button key={ft.id} onClick={()=>setFormType(ft.id)}
            className="p-4 rounded-2xl border-2 text-right transition-all"
            style={{
              borderColor: formType===ft.id ? FORM_GREEN : "#e5e7eb",
              background: formType===ft.id ? FORM_LIGHT : "#fff",
            }}>
            <div className="font-black text-sm" style={{color:formType===ft.id?FORM_GREEN:"#374151"}}>{ft.label}</div>
            <div className="text-xs mt-1 font-bold" style={{color:"#6b7280"}}>{ft.code}</div>
          </button>
        ))}
      </div>

      {/* بيانات النموذج */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-black text-sm" style={{color:FORM_GREEN}}>📝 {currentForm?.label}</h3>

        {/* اختيار المعلم */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">اسم المعلم *</label>
          <select value={selectedTeacher} onChange={e=>handleSelectTeacher(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none"
            style={{fontFamily:"inherit", borderColor:selectedTeacher?FORM_GREEN:"#e5e7eb"}}>
            <option value="">— اختر المعلم —</option>
            {teachers.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {selectedTeacher && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">رقم الهوية / السجل المدني</label>
              <input value={formData.nationalId} onChange={e=>setFormData(p=>({...p,nationalId:e.target.value}))}
                placeholder="يُجلب تلقائياً من الحسابات" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                style={{fontFamily:"inherit"}}/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">التخصص</label>
              <input value={formData.spec} onChange={e=>setFormData(p=>({...p,spec:e.target.value}))}
                placeholder="التخصص" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                style={{fontFamily:"inherit"}}/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">المستوى / المرتبة</label>
              <input value={formData.rank} onChange={e=>setFormData(p=>({...p,rank:e.target.value}))}
                placeholder="مثال: الثامنة" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                style={{fontFamily:"inherit"}}/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">رقم الوظيفة</label>
              <input value={formData.jobNo} onChange={e=>setFormData(p=>({...p,jobNo:e.target.value}))}
                placeholder="رقم الوظيفة" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                style={{fontFamily:"inherit"}}/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">العمل الحالي</label>
              <input value={formData.jobTitle} onChange={e=>setFormData(p=>({...p,jobTitle:e.target.value}))}
                placeholder="مثال: معلم" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                style={{fontFamily:"inherit"}}/>
            </div>
            {/* منتقي التاريخ */}
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 block mb-1">التاريخ</label>
              <div className="flex gap-2 items-center">
                <select value={formData.calType||"hijri"} onChange={e=>setFormData(p=>({...p,calType:e.target.value,dateH:""}))}
                  className="px-2 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
                  <option value="hijri">🌙 هجري</option>
                  <option value="greg">☀️ ميلادي</option>
                </select>
                <select value={formData.dateDay||""} onChange={e=>setFormData(p=>({...p,dateDay:e.target.value}))}
                  className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none text-center" style={{fontFamily:"inherit"}}>
                  <option value="">يوم</option>
                  {Array.from({length:30},(_,i)=>i+1).map(d=><option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
                </select>
                <span className="text-gray-400 font-bold">/</span>
                <select value={formData.dateMonth||""} onChange={e=>setFormData(p=>({...p,dateMonth:e.target.value}))}
                  className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none text-center" style={{fontFamily:"inherit"}}>
                  <option value="">شهر</option>
                  {(formData.calType==="greg"
                    ?["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
                    :["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"]
                  ).map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
                <span className="text-gray-400 font-bold">/</span>
                <select value={formData.dateYear||""} onChange={e=>setFormData(p=>({...p,dateYear:e.target.value}))}
                  className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none text-center" style={{fontFamily:"inherit"}}>
                  <option value="">سنة</option>
                  {Array.from({length:5},(_,i)=>(formData.calType==="greg"?2025:1447)+i).map(y=><option key={y} value={y}>{y}</option>)}
                </select>
                <span className="text-xs font-bold text-gray-400">{formData.calType==="greg"?"م":"هـ"}</span>
              </div>
            </div>

            {(formType==="warning") && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">نوع المخالفة</label>
                  <select value={formData.type} onChange={e=>setFormData(p=>({...p,type:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                    style={{fontFamily:"inherit"}}>
                    <option>تأخر</option>
                    <option>مغادرة أثناء العمل</option>
                    <option>انصراف مبكر</option>
                  </select>
                </div>
                {/* منتقي الوقت — الساعة من */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">الساعة من</label>
                  <div className="flex gap-1 items-center">
                    <select value={formData.timeFromH||""} onChange={e=>setFormData(p=>({...p,timeFromH:e.target.value}))}
                      className="flex-1 px-1 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none" style={{fontFamily:"inherit"}}>
                      <option value="">س</option>
                      {Array.from({length:12},(_,i)=>i+1).map(h=><option key={h} value={h}>{String(h).padStart(2,"0")}</option>)}
                    </select>
                    <span className="font-black text-gray-400">:</span>
                    <select value={formData.timeFromM||""} onChange={e=>setFormData(p=>({...p,timeFromM:e.target.value}))}
                      className="flex-1 px-1 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none" style={{fontFamily:"inherit"}}>
                      <option value="">د</option>
                      {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={formData.timeFromP||"ص"} onChange={e=>setFormData(p=>({...p,timeFromP:e.target.value}))}
                      className="px-1 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold text-center focus:outline-none" style={{fontFamily:"inherit"}}>
                      <option>ص</option><option>م</option>
                    </select>
                  </div>
                </div>
                {/* منتقي الوقت — إلى الساعة */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">إلى الساعة</label>
                  <div className="flex gap-1 items-center">
                    <select value={formData.timeToH||""} onChange={e=>setFormData(p=>({...p,timeToH:e.target.value}))}
                      className="flex-1 px-1 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none" style={{fontFamily:"inherit"}}>
                      <option value="">س</option>
                      {Array.from({length:12},(_,i)=>i+1).map(h=><option key={h} value={h}>{String(h).padStart(2,"0")}</option>)}
                    </select>
                    <span className="font-black text-gray-400">:</span>
                    <select value={formData.timeToM||""} onChange={e=>setFormData(p=>({...p,timeToM:e.target.value}))}
                      className="flex-1 px-1 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none" style={{fontFamily:"inherit"}}>
                      <option value="">د</option>
                      {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={formData.timeToP||"ص"} onChange={e=>setFormData(p=>({...p,timeToP:e.target.value}))}
                      className="px-1 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold text-center focus:outline-none" style={{fontFamily:"inherit"}}>
                      <option>ص</option><option>م</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {(formType==="absence_investigate"||formType==="absence_deduct") && (
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">عدد أيام الغياب</label>
                <input value={formData.days} onChange={e=>setFormData(p=>({...p,days:e.target.value}))}
                  placeholder="يُحسب تلقائياً من سجل الحضور"
                  className="w-full px-3 py-2 rounded-xl border-2 text-sm focus:outline-none font-black text-center"
                  style={{fontFamily:"inherit", borderColor:formData.days?"#dc2626":"#e5e7eb", color:formData.days?"#dc2626":"#374151"}}/>
              </div>
            )}

            {formType==="deduct_late" && (
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">مجموع ساعات التأخر</label>
                <input value={formData.lateHours} onChange={e=>setFormData(p=>({...p,lateHours:e.target.value}))}
                  placeholder="يُحسب تلقائياً" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                  style={{fontFamily:"inherit"}}/>
              </div>
            )}
          </div>
        )}

        {/* مدة التأخير المحتسبة تلقائياً */}
        {selectedTeacher && formType==="warning" && (formData.timeFromH||formData.timeToH) && (()=>{
          const mins = calcLateMins();
          return mins ? (
            <div className="rounded-2xl p-4 border-2 border-amber-300 bg-amber-50 flex items-center gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <div className="font-black text-amber-800 text-sm">مدة التأخير المحتسبة تلقائياً</div>
                <div className="text-xl font-black text-amber-600">{fmtMins(mins)}</div>
              </div>
            </div>
          ) : null;
        })()}

        {/* سجل التأخرات المتراكمة */}
        {selectedTeacher && (()=>{
          const recs = lateRecords[selectedTeacher]||[];
          const total = totalLateMins(selectedTeacher);
          const pct = Math.min(total/(7*60)*100,100);
          const danger = total >= 7*60;
          const warn   = total >= 5*60;
          return (
            <div className="rounded-2xl p-4 border-2 space-y-3"
              style={{borderColor:danger?"#dc2626":warn?"#f59e0b":"#e5e7eb", background:danger?"#fef2f2":warn?"#fffbeb":"#f9fafb"}}>
              <div className="flex items-center justify-between">
                <div className="font-black text-sm" style={{color:danger?"#dc2626":warn?"#b45309":"#374151"}}>
                  {danger?"🚨 تجاوز حد الحسم!":warn?"⚠️ اقترب من حد الحسم":"📊"} سجل التأخرات المتراكمة
                </div>
                <div className="font-black text-lg" style={{color:danger?"#dc2626":warn?"#b45309":"#6366f1"}}>
                  {fmtMins(total)} / ٧ ساعات
                </div>
              </div>
              {/* شريط تقدم */}
              <div className="h-4 rounded-full overflow-hidden" style={{background:"#e5e7eb"}}>
                <div className="h-full rounded-full transition-all"
                  style={{width:pct+"%", background:danger?"#dc2626":warn?"#f59e0b":"#10b981"}}/>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>٠</span>
                <span style={{color:"#f59e0b",fontWeight:"bold"}}>٥ ساعات</span>
                <span style={{color:"#dc2626",fontWeight:"bold"}}>٧ ساعات (حسم)</span>
              </div>
              {recs.length>0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {recs.map((r,i)=>(
                    <div key={r.id||i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 text-xs border border-gray-100">
                      <span className="font-bold text-gray-700">{r.date}</span>
                      <span className="font-bold text-gray-500">{r.type}</span>
                      <span className="font-black text-amber-600">{fmtMins(r.mins)}</span>
                      <button onClick={()=>{
                        if(!confirm("حذف هذا السجل؟")) return;
                        const updated={...lateRecords,[selectedTeacher]:recs.filter((_,j)=>j!==i)};
                        saveLateRecords(updated);
                      }} className="text-red-400 hover:text-red-600 px-1">✕</button>
                    </div>
                  ))}
                </div>
              )}
              {recs.length===0 && <div className="text-xs text-gray-400 text-center py-2">لا توجد تنبيهات مسجلة بعد</div>}
              {danger && (
                <button onClick={()=>setFormType("deduct_late")}
                  className="w-full py-2.5 rounded-xl font-black text-white text-sm"
                  style={{background:"#dc2626"}}>
                  📋 إصدار قرار حسم ساعات التأخر
                </button>
              )}
            </div>
          );
        })()}

        {/* شريط الحفظ */}
        {savedBanner && (
          <div className="rounded-2xl p-3 text-center font-black text-sm text-green-700 bg-green-50 border border-green-200">
            {savedBanner}
          </div>
        )}

        {/* معاينة */}
        {selectedTeacher && (
          <div className="rounded-2xl p-4 border-2" style={{background:FORM_LIGHT, borderColor:FORM_GREEN+"44"}}>
            <div className="text-xs font-black mb-2" style={{color:FORM_GREEN}}>👁️ معاينة البيانات</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-gray-500">الاسم:</span> <strong>{selectedTeacher}</strong></div>
              <div><span className="text-gray-500">الهوية:</span> <strong>{formData.nationalId||"—"}</strong></div>
              <div><span className="text-gray-500">المدرسة:</span> <strong>{SCHOOL_NAME}</strong></div>
              {formData.days&&<div><span className="text-gray-500">الغياب:</span> <strong className="text-red-600">{formData.days} أيام</strong></div>}
              {calcLateMins()&&<div><span className="text-gray-500">التأخر الحالي:</span> <strong className="text-amber-600">{fmtMins(calcLateMins())}</strong></div>}
              {totalLateMins(selectedTeacher)>0&&<div className="col-span-2"><span className="text-gray-500">المتراكم:</span> <strong className="text-red-600">{fmtMins(totalLateMins(selectedTeacher))}</strong></div>}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {formType==="warning" && selectedTeacher && (
            <button onClick={saveWarningRecord}
              className="flex-1 py-4 rounded-2xl font-black text-base transition-all hover:shadow-xl flex items-center justify-center gap-2"
              style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff"}}>
              💾 حفظ في السجل
            </button>
          )}
          <button onClick={printForm} disabled={!selectedTeacher}
            className="flex-1 py-4 rounded-2xl text-white font-black text-base disabled:opacity-40 transition-all hover:shadow-xl flex items-center justify-center gap-2"
            style={{background:`linear-gradient(135deg,${FORM_GREEN},#40916c)`}}>
            🖨️ طباعة النموذج
          </button>
        </div>
      </div>
    </div>
  );
}


// -
// صفحة ملف الطالب الشامل
// -
function StudentPortfolioPage({ classList, weekArchive, attendance, week, teachers }) {
  const [selClass,   setSelClass]   = useState("");
  const [selStudent, setSelStudent] = useState("");
  const [tab,        setTab]        = useState("overview");

  const cls  = classList.find(c=>c.id===selClass);
  const stu  = cls?.students?.find(s=>s.id===selStudent);

  // حضور الطالب
  const absCount = stu ? (() => {
    let abs = 0;
    teachers.forEach((_,ti)=>{
      week.days.forEach((_,di)=>{
        if ((attendance[ti]?.[di]?.status||"حاضر")==="غائب") abs++;
      });
    });
    return abs;
  })() : 0;

  // تقييمات المادة
  const evals = stu?.evals || [];
  const subjEvals = {};
  evals.forEach(ev=>{
    if (!ev.subject) return;
    if (!subjEvals[ev.subject]) subjEvals[ev.subject]=[];
    subjEvals[ev.subject].push(ev);
  });

  const lvLabel = l => ({excel:"ممتاز",vgood:"جيد جداً",good:"جيد",accept:"مقبول",weak:"ضعيف"}[l]||l);
  const lvColor = l => ({excel:"#10b981",vgood:"#3b82f6",good:"#f59e0b",accept:"#f97316",weak:"#ef4444"}[l]||"#6b7280");

  return (
    <div dir="rtl" className="space-y-4">
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#0f172a,#7c3aed)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">📁 ملف الطالب الشامل</h2>
          <p className="opacity-80 text-sm">سجل متكامل — الأداء الأكاديمي والحضور والتقييمات</p>
        </div>
      </div>

      {/* اختيار الطالب */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3 flex-wrap">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 block mb-1">الفصل</label>
          <select value={selClass} onChange={e=>{setSelClass(e.target.value);setSelStudent("");}}
            className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
            <option value="">— اختر الفصل —</option>
            {classList.map(c=><option key={c.id} value={c.id}>{c.name||`${c.level}/${c.section}`}</option>)}
          </select>
        </div>
        {cls && (
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 block mb-1">الطالب</label>
            <select value={selStudent} onChange={e=>setSelStudent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
              <option value="">— اختر الطالب —</option>
              {(cls.students||[]).filter(s=>s.name).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {stu && (
        <>
          {/* بطاقة الطالب */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-5 text-white flex items-center gap-4" style={{background:"linear-gradient(135deg,#0f172a,#7c3aed)"}}>
              <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center text-3xl flex-shrink-0">👨‍🎓</div>
              <div>
                <h3 className="text-xl font-black">{stu.name}</h3>
                <p className="opacity-70 text-sm">{cls?.level} / شعبة {cls?.section} — {cls?.teacher}</p>
                {stu.nationalId && <p className="opacity-60 text-xs mt-0.5">الهوية: {stu.nationalId}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-x-reverse bg-white">
              {[
                {l:"مواد مقيّمة",v:Object.keys(subjEvals).length,c:"#6366f1"},
                {l:"أيام الغياب",v:absCount,c:absCount>3?"#ef4444":"#10b981"},
                {l:"المرحلة",v:cls?.level||"—",c:"#0ea5e9"},
              ].map(k=>(
                <div key={k.l} className="p-4 text-center">
                  <div className="text-2xl font-black" style={{color:k.c}}>{k.v}</div>
                  <div className="text-xs text-gray-400 font-bold mt-1">{k.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* تبويبات */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto">
            {[{id:"overview",l:"📊 نظرة عامة"},{id:"subjects",l:"📚 المواد"},{id:"attendance",l:"📋 الحضور"},{id:"plan",l:"💡 خطة التطوير"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={"flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all "+(tab===t.id?"bg-purple-600 text-white shadow":"text-gray-500 hover:bg-gray-50")}>
                {t.l}
              </button>
            ))}
          </div>

          {/* نظرة عامة */}
          {tab==="overview" && (
            <div className="space-y-3">
              {Object.keys(subjEvals).length===0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="font-black text-gray-400">لا توجد تقييمات بعد لهذا الطالب</div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {Object.entries(subjEvals).map(([subj,evs])=>{
                    const last = evs[evs.length-1];
                    const color = lvColor(last?.level);
                    return (
                      <div key={subj} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="font-black text-gray-800 text-sm">{subj}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{evs.length} تقييم</div>
                        </div>
                        <span className="font-black px-3 py-1.5 rounded-xl text-sm" style={{background:color+"18",color}}>{lvLabel(last?.level)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* تفاصيل المواد */}
          {tab==="subjects" && (
            <div className="space-y-3">
              {Object.entries(subjEvals).map(([subj,evs])=>(
                <div key={subj} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h4 className="font-black text-gray-800 mb-3 text-sm">{subj}</h4>
                  <div className="space-y-2">
                    {evs.map((ev,i)=>{
                      const c=lvColor(ev.level);
                      return (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                          <span className="text-xs text-gray-500">{ev.dateH||ev.day||"—"}</span>
                          <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{background:c+"18",color:c}}>{lvLabel(ev.level)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* الحضور */}
          {tab==="attendance" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-black text-gray-800 mb-4 text-sm">📋 سجل الحضور الأسبوعي</h4>
              <div className="grid grid-cols-5 gap-2">
                {(week.days||[]).map((day,di)=>{
                  const ti = teachers.indexOf(cls?.teacher||"");
                  const status = ti>=0?(attendance[ti]?.[di]?.status||"حاضر"):"—";
                  const col = status==="حاضر"?"#10b981":status==="غائب"?"#ef4444":"#f59e0b";
                  return (
                    <div key={di} className="rounded-xl p-3 text-center border" style={{borderColor:col+"44",background:col+"11"}}>
                      <div className="text-xs font-black" style={{color:col}}>{day.name}</div>
                      <div className="text-xs mt-1" style={{color:col}}>{status}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* خطة التطوير */}
          {tab==="plan" && (
            <StudentImprovementPlan student={stu} subjEvals={subjEvals} lvLabel={lvLabel} lvColor={lvColor}/>
          )}
        </>
      )}
      {!stu && !cls && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border">
          <div className="text-4xl mb-3">📁</div>
          <div className="font-black text-gray-600">اختر فصلاً وطالباً لعرض ملفه الشامل</div>
        </div>
      )}
    </div>
  );
}

// مكوّن خطة التحسين الفردية
function StudentImprovementPlan({ student, subjEvals, lvLabel, lvColor }) {
  const [saved, setSaved]   = useState(false);
  const [notes, setNotes]   = useState("");
  const [goals, setGoals]   = useState([{text:"",done:false}]);

  const weakSubjects = Object.entries(subjEvals).filter(([,evs])=>{
    const last = evs[evs.length-1];
    return ["weak","accept"].includes(last?.level);
  });

  const addGoal = () => setGoals(g=>[...g,{text:"",done:false}]);
  const saveP   = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const printP  = () => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
    <title>خطة تطوير — ${student.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <style>body{font-family:'Cairo';direction:rtl;padding:24px;color:#1e293b}
    h1{font-size:18px;font-weight:900;color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:8px;margin-bottom:16px}
    h3{font-size:14px;font-weight:800;color:#1e3a5f;margin:16px 0 8px}
    .badge{background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:20px;font-weight:700;font-size:12px}
    .goal{padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;margin:4px 0;font-size:13px}
    .notes{background:#f8fafc;border-radius:8px;padding:12px;font-size:13px;line-height:2}
    @media print{@page{margin:1.5cm}}</style></head><body>
    <h1>📋 خطة تطوير الطالب</h1>
    <p><strong>الاسم:</strong> ${student.name}</p>
    <p><strong>رقم الهوية:</strong> ${student.nationalId||"—"}</p>
    <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString("ar-SA")}</p>
    ${weakSubjects.length>0?`<h3>المواد التي تحتاج دعماً:</h3>${weakSubjects.map(([s,evs])=>`<span class="badge">${s}: ${lvLabel(evs[evs.length-1].level)}</span> `).join("")}`:""}
    <h3>الأهداف:</h3>${goals.filter(g=>g.text).map(g=>`<div class="goal">${g.text}</div>`).join("")}
    ${notes?`<h3>ملاحظات المعلم:</h3><div class="notes">${notes}</div>`:""}
    <script>window.onload=()=>window.print()</script></body></html>`);
  };

  return (
    <div className="space-y-4">
      {weakSubjects.length>0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h4 className="font-black text-red-700 mb-2 text-sm">⚠️ مواد تحتاج دعماً</h4>
          <div className="flex flex-wrap gap-2">
            {weakSubjects.map(([s,evs])=>{
              const c=lvColor(evs[evs.length-1]?.level);
              return <span key={s} className="px-3 py-1.5 rounded-xl font-black text-xs" style={{background:c+"18",color:c}}>{s}: {lvLabel(evs[evs.length-1].level)}</span>;
            })}
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h4 className="font-black text-gray-800 text-sm">🎯 أهداف خطة التطوير</h4>
        {goals.map((g,i)=>(
          <div key={i} className="flex items-center gap-2">
            <input type="checkbox" checked={g.done} onChange={e=>setGoals(gs=>gs.map((x,j)=>j===i?{...x,done:e.target.checked}:x))} className="w-4 h-4 accent-green-500"/>
            <input value={g.text} onChange={e=>setGoals(gs=>gs.map((x,j)=>j===i?{...x,text:e.target.value}:x))}
              placeholder={`هدف ${i+1}...`} className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-purple-400" style={{fontFamily:"inherit"}}/>
            {goals.length>1&&<button onClick={()=>setGoals(gs=>gs.filter((_,j)=>j!==i))} className="text-red-400 px-2">✕</button>}
          </div>
        ))}
        <button onClick={addGoal} className="text-xs text-purple-600 font-black hover:underline">+ إضافة هدف</button>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h4 className="font-black text-gray-800 text-sm mb-2">📝 ملاحظات المعلم</h4>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4}
          placeholder="أكتب ملاحظاتك وتوصياتك للطالب وولي أمره..."
          className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-purple-400 resize-none" style={{fontFamily:"inherit"}}/>
      </div>
      {saved && <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center font-black text-green-700 text-sm">✅ تم حفظ الخطة</div>}
      <div className="flex gap-3">
        <button onClick={saveP} className="flex-1 py-3 rounded-2xl font-black text-white text-sm" style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>💾 حفظ الخطة</button>
        <button onClick={printP} className="flex-1 py-3 rounded-2xl font-black text-white text-sm" style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)"}}>🖨️ طباعة وإرسال لولي الأمر</button>
      </div>
    </div>
  );
}

// -
// صفحة تنبيه الطلاب المعرضين للرسوب
// -
function EarlyWarningPage({ classList }) {
  const [threshold, setThreshold] = useState(60);
  const [selectedClass, setSelectedClass] = useState("all");

  const allStudents = classList.flatMap(cls=>
    (cls.students||[]).filter(s=>s.name).map(s=>({...s,cls}))
  );

  const filtered = selectedClass==="all"?allStudents:allStudents.filter(s=>s.cls.id===selectedClass);

  const atRisk = filtered.map(s=>{
    const evals = s.evals||[];
    const subjects = {};
    evals.forEach(ev=>{
      if(!ev.subject) return;
      const scores = {excel:5,vgood:4,good:3,accept:2,weak:1};
      if(!subjects[ev.subject]) subjects[ev.subject]=[];
      subjects[ev.subject].push(scores[ev.level]||0);
    });
    const subjectAvgs = Object.entries(subjects).map(([sub,sc])=>({
      sub, avg:sc.reduce((a,b)=>a+b,0)/sc.length*20
    }));
    const overall = subjectAvgs.length?subjectAvgs.reduce((a,b)=>a+b.avg,0)/subjectAvgs.length:0;
    const weakSubjects = subjectAvgs.filter(x=>x.avg<threshold);
    return {...s, overall:Math.round(overall), subjectAvgs, weakSubjects};
  }).filter(s=>s.weakSubjects.length>0).sort((a,b)=>a.overall-b.overall);

  const riskLevel = pct => pct<40?"critical":pct<threshold?"high":"medium";
  const riskColor = l => ({critical:"#dc2626",high:"#ea580c",medium:"#f59e0b"}[l]);
  const riskBg    = l => ({critical:"#fee2e2",high:"#ffedd5",medium:"#fef3c7"}[l]);
  const riskLabel = l => ({critical:"خطر شديد",high:"معرض للرسوب",medium:"يحتاج متابعة"}[l]);

  return (
    <div dir="rtl" className="space-y-4">
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#dc2626,#b91c1c)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">🚨 نظام الإنذار المبكر</h2>
          <p className="opacity-80 text-sm">رصد الطلاب المعرضين للتعثر قبل فوات الأوان</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">الفصل</label>
          <select value={selectedClass} onChange={e=>setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
            <option value="all">كل الفصول</option>
            {classList.map(c=><option key={c.id} value={c.id}>{c.name||`${c.level}/${c.section}`}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 block mb-1">حد التنبيه: {threshold}%</label>
          <input type="range" min="40" max="75" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} className="w-full"/>
        </div>
        <div className="text-center bg-red-50 rounded-xl px-4 py-2">
          <div className="text-2xl font-black text-red-600">{atRisk.length}</div>
          <div className="text-xs text-red-400 font-bold">طالب معرض للخطر</div>
        </div>
      </div>

      {atRisk.length===0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🌟</div>
          <div className="font-black text-green-700 text-lg">ممتاز! لا يوجد طلاب معرضون للخطر</div>
          <div className="text-sm text-green-600 mt-1">جميع الطلاب فوق حد {threshold}%</div>
        </div>
      ) : (
        <div className="space-y-3">
          {atRisk.map(s=>{
            const level = riskLevel(s.overall);
            const col   = riskColor(level);
            const bg    = riskBg(level);
            return (
              <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border-2" style={{borderColor:col+"44"}}>
                <div className="flex items-center justify-between px-5 py-3" style={{background:bg}}>
                  <div>
                    <div className="font-black text-sm" style={{color:col}}>{s.name}</div>
                    <div className="text-xs mt-0.5" style={{color:col,opacity:.7}}>{s.cls.name||`${s.cls.level}/${s.cls.section}`}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-black" style={{color:col}}>{s.overall}%</div>
                      <div className="text-xs font-bold" style={{color:col,opacity:.7}}>المتوسط</div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl font-black text-xs text-white" style={{background:col}}>
                      {riskLabel(level)}
                    </span>
                  </div>
                </div>
                <div className="px-5 py-3">
                  <div className="text-xs font-bold text-gray-500 mb-2">مواد تحتاج تدخل:</div>
                  <div className="flex flex-wrap gap-2">
                    {s.weakSubjects.map(w=>(
                      <span key={w.sub} className="px-2 py-1 rounded-lg text-xs font-black" style={{background:"#fee2e2",color:"#dc2626"}}>
                        {w.sub}: {Math.round(w.avg)}%
                      </span>
                    ))}
                  </div>
                  {/* شريط تقدم */}
                  <div className="mt-3 h-2.5 rounded-full overflow-hidden" style={{background:"#f3f4f6"}}>
                    <div className="h-full rounded-full" style={{width:s.overall+"%",background:col}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -
// صفحة الاجتماعات وحجز المواعيد
// -
function MeetingsPage({ teachers }) {
  const [meetings, setMeetings] = useState([]);
  const [form,     setForm]     = useState({title:"",teacher:"",date:"",dateH:"",time:"",type:"حضوري",notes:""});
  const [showForm, setShowForm] = useState(false);
  const [filter,   setFilter]   = useState("all");

  useEffect(()=>{
    DB.get("school-meetings",[]).then(d=>setMeetings(Array.isArray(d)?d:[]));
  },[]);

  const saveMeetings = m => { setMeetings(m); DB.set("school-meetings",m); };

  const addMeeting = () => {
    if (!form.title.trim()||!form.teacher||!form.dateH) { alert("أكمل البيانات المطلوبة"); return; }
    saveMeetings([{id:Date.now(),...form,status:"مجدول",createdAt:new Date().toLocaleDateString("ar-SA")},...meetings]);
    setForm({title:"",teacher:"",date:"",dateH:"",time:"",type:"حضوري",notes:""});
    setShowForm(false);
  };

  const updateStatus = (id,status) => saveMeetings(meetings.map(m=>m.id===id?{...m,status}:m));
  const deleteMeeting = id => { if(confirm("حذف الاجتماع؟")) saveMeetings(meetings.filter(m=>m.id!==id)); };

  const filtered = filter==="all"?meetings:meetings.filter(m=>m.status===filter);

  const statusColors = {
    "مجدول":{bg:"#dbeafe",c:"#1d4ed8"},
    "منجز": {bg:"#dcfce7",c:"#166534"},
    "مؤجل": {bg:"#fef3c7",c:"#854d0e"},
    "ملغي": {bg:"#fee2e2",c:"#991b1b"},
  };

  const HIJRI_MONTHS_M = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];

  return (
    <div dir="rtl" className="space-y-4">
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#0f172a,#0891b2)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">📅 الاجتماعات والمواعيد</h2>
          <p className="opacity-80 text-sm">جدولة اجتماعات أولياء الأمور والمعلمين</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={()=>setShowForm(!showForm)} className="px-4 py-2 rounded-xl font-black text-sm text-white" style={{background:"linear-gradient(135deg,#0891b2,#0284c7)"}}>
          ➕ إضافة اجتماع
        </button>
        {["all","مجدول","منجز","مؤجل"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={"px-4 py-2 rounded-xl font-black text-xs transition-all "+(filter===f?"bg-blue-600 text-white":"bg-white text-gray-600 border border-gray-200")}>
            {f==="all"?"الكل":f}
          </button>
        ))}
        <div className="mr-auto text-xs text-gray-400 flex items-center">{filtered.length} اجتماع</div>
      </div>

      {showForm && (
        <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-5 space-y-3">
          <div className="font-black text-cyan-800 text-sm">➕ اجتماع جديد</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 block mb-1">عنوان الاجتماع *</label>
              <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="مثال: اجتماع أولياء الأمور الفصل الأول" className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" style={{fontFamily:"inherit"}}/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">المعلم المسؤول *</label>
              <select value={form.teacher} onChange={e=>setForm(p=>({...p,teacher:e.target.value}))} className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" style={{fontFamily:"inherit"}}>
                <option value="">— اختر —</option>
                <option value="مدير المدرسة">مدير المدرسة</option>
                {teachers.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">نوع الاجتماع</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" style={{fontFamily:"inherit"}}>
                {["حضوري","عن بُعد (زووم)","هاتفي","مزدوج"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">التاريخ الهجري *</label>
              <div className="flex gap-1">
                <select value={form.dateDay||""} onChange={e=>setForm(p=>({...p,dateDay:e.target.value}))} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-xs focus:outline-none text-center" style={{fontFamily:"inherit"}}>
                  <option value="">يوم</option>
                  {Array.from({length:30},(_,i)=>i+1).map(d=><option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
                </select>
                <select value={form.dateMonth||""} onChange={e=>setForm(p=>({...p,dateMonth:e.target.value}))} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-xs focus:outline-none" style={{fontFamily:"inherit"}}>
                  <option value="">شهر</option>
                  {HIJRI_MONTHS_M.map((m,i)=><option key={i} value={m}>{m}</option>)}
                </select>
                <select value={form.dateYear||"1447"} onChange={e=>setForm(p=>({...p,dateYear:e.target.value}))} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-xs focus:outline-none text-center" style={{fontFamily:"inherit"}}>
                  {[1447,1448,1449].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">الوقت</label>
              <div className="flex gap-1">
                <select value={form.timeH||""} onChange={e=>setForm(p=>({...p,timeH:e.target.value}))} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-xs focus:outline-none text-center" style={{fontFamily:"inherit"}}>
                  <option value="">س</option>
                  {Array.from({length:12},(_,i)=>i+1).map(h=><option key={h} value={h}>{String(h).padStart(2,"0")}</option>)}
                </select>
                <select value={form.timeM||"00"} onChange={e=>setForm(p=>({...p,timeM:e.target.value}))} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-xs focus:outline-none text-center" style={{fontFamily:"inherit"}}>
                  {["00","15","30","45"].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <select value={form.timeP||"ص"} onChange={e=>setForm(p=>({...p,timeP:e.target.value}))} className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-xs focus:outline-none text-center" style={{fontFamily:"inherit"}}>
                  <option>ص</option><option>م</option>
                </select>
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 block mb-1">ملاحظات</label>
              <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={2} placeholder="أجندة الاجتماع أو ملاحظات..." className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none resize-none" style={{fontFamily:"inherit"}}/>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addMeeting} className="flex-1 py-2.5 rounded-xl bg-cyan-600 text-white font-black hover:bg-cyan-700">✅ إضافة</button>
            <button onClick={()=>setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold">إلغاء</button>
          </div>
        </div>
      )}

      {filtered.length===0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">📅</div><div className="font-black text-gray-400">لا توجد اجتماعات</div></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m=>{
            const sc=statusColors[m.status]||{bg:"#f3f4f6",c:"#374151"};
            const timeStr=m.timeH?`${String(m.timeH).padStart(2,"0")}:${m.timeM||"00"} ${m.timeP||""}`:""
            const dateStr=m.dateDay?`${m.dateDay}/${m.dateMonth||""}/${m.dateYear||"1447"} هـ`:m.dateH||"—";
            return (
              <div key={m.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex-1">
                    <div className="font-black text-gray-800 text-sm">{m.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>👤 {m.teacher}</span>
                      <span>📅 {dateStr}</span>
                      {timeStr&&<span>⏰ {timeStr}</span>}
                      <span className="px-2 py-0.5 rounded-full font-bold" style={{background:"#f3f4f6",color:"#374151"}}>{m.type}</span>
                    </div>
                    {m.notes&&<div className="text-xs text-gray-400 mt-1 truncate">{m.notes}</div>}
                  </div>
                  <div className="flex items-center gap-2 mr-3">
                    <span className="px-2 py-1 rounded-lg font-black text-xs" style={{background:sc.bg,color:sc.c}}>{m.status}</span>
                    <div className="flex gap-1">
                      {m.status==="مجدول"&&<>
                        <button onClick={()=>updateStatus(m.id,"منجز")} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 font-bold">✅</button>
                        <button onClick={()=>updateStatus(m.id,"مؤجل")} className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-100 font-bold">⏸</button>
                      </>}
                      <button onClick={()=>deleteMeeting(m.id)} className="text-xs bg-red-50 text-red-400 px-2 py-1 rounded-lg hover:bg-red-100">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -
// خريطة حرارية للنشاط المدرسي
// -
function HeatmapPage({ teachers, attendance, week, weekArchive, announcements, activities }) {
  const dayNames = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس"];

  // حساب نسبة الحضور لكل يوم في الأرشيف
  const archiveStats = weekArchive.map(entry=>{
    const dayRates = (entry.week?.days||[]).map((_,di)=>{
      const present=teachers.filter((_,ti)=>(entry.attendance?.[ti]?.[di]?.status||"حاضر")==="حاضر").length;
      return teachers.length>0?Math.round(present/teachers.length*100):0;
    });
    return {week:entry.week,rates:dayRates,date:entry.archivedAt};
  });

  // الأسبوع الحالي
  const currentRates = dayNames.map((_,di)=>{
    const present=teachers.filter((_,ti)=>(attendance[ti]?.[di]?.status||"حاضر")==="حاضر").length;
    return teachers.length>0?Math.round(present/teachers.length*100):0;
  });

  const heatColor = v => v>=95?"#16a34a":v>=85?"#65a30d":v>=75?"#ca8a04":v>=60?"#ea580c":"#dc2626";
  const heatBg    = v => v>=95?"#dcfce7":v>=85?"#ecfccb":v>=75?"#fef3c7":v>=60?"#ffedd5":"#fee2e2";

  // إحصائيات الإعلانات والأنشطة بالأشهر
  const announcementsPerMonth = {};
  announcements.forEach(a=>{
    const month = a.date?.substring(3,10)||"غير محدد";
    announcementsPerMonth[month]=(announcementsPerMonth[month]||0)+1;
  });

  return (
    <div dir="rtl" className="space-y-5">
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">🗺️ خريطة نشاط المدرسة</h2>
          <p className="opacity-80 text-sm">رؤية بصرية شاملة للأيام والأسابيع والنشاط المدرسي</p>
        </div>
      </div>

      {/* الأسبوع الحالي */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 mb-4 text-sm">📅 الأسبوع الحالي — نسبة الحضور اليومية</h3>
        <div className="grid grid-cols-5 gap-3">
          {dayNames.map((day,di)=>{
            const rate=currentRates[di];
            return (
              <div key={day} className="rounded-2xl p-4 text-center" style={{background:heatBg(rate)}}>
                <div className="text-xs font-black mb-2" style={{color:heatColor(rate)}}>{day}</div>
                <div className="text-2xl font-black" style={{color:heatColor(rate)}}>{rate}%</div>
                <div className="text-xs mt-1" style={{color:heatColor(rate),opacity:.7}}>
                  {rate>=95?"ممتاز":rate>=85?"جيد":rate>=75?"مقبول":"يحتاج متابعة"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* أرشيف الأسابيع كخريطة حرارية */}
      {archiveStats.length>0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-x-auto">
          <h3 className="font-black text-gray-800 mb-4 text-sm">📊 خريطة الحضور — الأسابيع المؤرشفة</h3>
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-right text-gray-500 font-bold">الأسبوع</th>
                {dayNames.map(d=><th key={d} className="px-3 py-2 text-center text-gray-500 font-bold">{d}</th>)}
                <th className="px-3 py-2 text-center text-gray-500 font-bold">المتوسط</th>
              </tr>
            </thead>
            <tbody>
              {archiveStats.map((w,wi)=>{
                const avg=w.rates.length?Math.round(w.rates.reduce((a,b)=>a+b,0)/w.rates.length):0;
                return (
                  <tr key={wi}>
                    <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{w.date}</td>
                    {w.rates.map((rate,di)=>(
                      <td key={di} className="px-1 py-1">
                        <div className="w-12 h-8 rounded-lg flex items-center justify-center text-xs font-black mx-auto"
                          style={{background:heatBg(rate),color:heatColor(rate)}}>
                          {rate}%
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center">
                      <span className="font-black text-xs px-2 py-1 rounded-full" style={{background:heatBg(avg),color:heatColor(avg)}}>{avg}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* أيام الأسبوع الأكثر غياباً */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 mb-4 text-sm">📉 تحليل أيام الغياب</h3>
        {archiveStats.length>0 ? (
          <div className="space-y-3">
            {dayNames.map((day,di)=>{
              const rates=archiveStats.map(w=>w.rates[di]||0);
              const avg=rates.length?Math.round(rates.reduce((a,b)=>a+b,0)/rates.length):0;
              const absPct=100-avg;
              return (
                <div key={day}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-700">{day}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">حضور {avg}%</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{background:heatBg(avg),color:heatColor(avg)}}>
                        غياب {absPct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{background:"#f3f4f6"}}>
                    <div className="h-full rounded-full" style={{width:avg+"%",background:heatColor(avg)}}/>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">أرشف أسبوعاً واحداً على الأقل لرؤية التحليل</div>
        )}
      </div>

      {/* نشاط الإعلانات */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 mb-4 text-sm">📢 نشاط الإعلانات والأنشطة</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 text-center bg-blue-50 border border-blue-100">
            <div className="text-3xl font-black text-blue-700">{announcements.length}</div>
            <div className="text-xs text-blue-500 font-bold mt-1">إجمالي الإعلانات</div>
          </div>
          <div className="rounded-2xl p-4 text-center bg-purple-50 border border-purple-100">
            <div className="text-3xl font-black text-purple-700">{activities.length}</div>
            <div className="text-xs text-purple-500 font-bold mt-1">إجمالي الأنشطة</div>
          </div>
        </div>
      </div>
    </div>
  );
}


// -
// صفحة اجتماعات اللجان والفرق — الدليل التنظيمي والإجرائي
// -
const SCHOOL_COMMITTEES = [
  { id:"monthly",      label:"الاجتماع الشهري",              type:"شهري",    members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل الشؤون التعليمية",job:"عضو"},
    {name:"",role:"وكيل شؤون الطلاب",   job:"عضو"},
    {name:"",role:"وكيل الشؤون المدرسية",job:"عضو"},
    {name:"",role:"الموجه الطلابي",      job:"عضو"},
    {name:"",role:"رائد النشاط",         job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً للجنة"},
  ]},
  { id:"safety",       label:"لجنة الأمن والسلامة",          type:"دوري",    members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل الشؤون المدرسية",job:"عضو"},
    {name:"",role:"المشرف على السلامة",  job:"عضو"},
    {name:"",role:"رائد النشاط",         job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
  { id:"discipline",   label:"لجنة الانضباط المدرسي",        type:"دوري",    members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل شؤون الطلاب",   job:"عضو"},
    {name:"",role:"الموجه الطلابي",      job:"عضو"},
    {name:"",role:"رائد النشاط",         job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
  { id:"exams",        label:"لجنة الاختبارات",               type:"فصلي",   members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل الشؤون التعليمية",job:"عضو"},
    {name:"",role:"وكيل شؤون الطلاب",   job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
  { id:"activity",     label:"لجنة النشاط الطلابي",           type:"دوري",   members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل شؤون الطلاب",   job:"عضو"},
    {name:"",role:"رائد النشاط",         job:"عضو"},
    {name:"",role:"الموجه الطلابي",      job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
  { id:"dev",          label:"لجنة التخطيط والتطوير",         type:"فصلي",   members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل الشؤون التعليمية",job:"عضو"},
    {name:"",role:"وكيل الشؤون المدرسية",job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
  { id:"health",       label:"لجنة الصحة المدرسية",           type:"فصلي",   members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل شؤون الطلاب",   job:"عضو"},
    {name:"",role:"مشرف الصحة",         job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
  { id:"community",    label:"لجنة الشراكة المجتمعية",        type:"فصلي",   members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل الشؤون المدرسية",job:"عضو"},
    {name:"",role:"رائد النشاط",         job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
  { id:"eval",         label:"لجنة المتابعة والتقويم",        type:"فصلي",   members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل الشؤون التعليمية",job:"عضو"},
    {name:"",role:"وكيل شؤون الطلاب",   job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
  { id:"env",          label:"لجنة البيئة المدرسية",          type:"فصلي",   members:[
    {name:"",role:"مدير المدرسة",        job:"رئيساً"},
    {name:"",role:"وكيل الشؤون المدرسية",job:"عضو"},
    {name:"",role:"رائد النشاط",         job:"عضو"},
    {name:"",role:"معلم",                job:"عضو"},
    {name:"",role:"مساعد إداري",         job:"مقرراً"},
  ]},
];

const HIJRI_M = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
const DAYS_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const COM_PERIODS = ["الحصة الأولى","الحصة الثانية","الحصة الثالثة","الحصة الرابعة","الحصة الخامسة","الحصة السادسة","ما بعد الدوام","فترة الإشراف"];
const COM_GREEN = "#4a7c59";
const COM_LIGHT = "#d8f3dc";

function CommitteeMeetingPage({ teachers }) {
  const [selectedCom, setSelectedCom] = useState("monthly");
  const [meetingNum,  setMeetingNum]  = useState("1");
  const [dateDay,     setDateDay]     = useState("");
  const [dateMonth,   setDateMonth]   = useState("");
  const [dateYear,    setDateYear]    = useState("1447");
  const [dayName,     setDayName]     = useState("الأحد");
  const [period,      setPeriod]      = useState("الحصة الثالثة");
  const [location,    setLocation]    = useState("إدارة المدرسة");
  const [agenda,      setAgenda]      = useState(["","","","",""]);
  const [members,     setMembers]     = useState([]);
  const [recommendations, setRecs]   = useState([{text:"",jt:"",ms:"",jf:""},{text:"",jt:"",ms:"",jf:""},{text:"",jt:"",ms:"",jf:""},{text:"",jt:"",ms:"",jf:""},{text:"",jt:"",ms:"",jf:""}]);
  const [decision,    setDecision]    = useState("");
  const [endTime,     setEndTime]     = useState("");
  const [attendees,   setAttendees]   = useState("");
  const [targetGroup, setTargetGroup] = useState("أعضاء اللجنة");
  const [workTeam,    setWorkTeam]    = useState("الهيئة التعليمية");
  const [tab,         setTab]         = useState("form"); // form | preview | history
  const [saved,       setSaved]       = useState(false);
  const [history,     setHistory]     = useState([]);
  const [accounts,    setAccounts]    = useState([]);

  useEffect(()=>{
    DB.get("school-teacher-accounts",[]).then(d=>setAccounts(Array.isArray(d)?d:[]));
    DB.get("school-committee-history",[]).then(d=>setHistory(Array.isArray(d)?d:[]));
  },[]);

  // عند اختيار اللجنة — تحميل أعضائها الافتراضيين
  useEffect(()=>{
    const com = SCHOOL_COMMITTEES.find(c=>c.id===selectedCom);
    if (com) {
      setMembers(com.members.map(m=>({...m})));
    }
  },[selectedCom]);

  const com = SCHOOL_COMMITTEES.find(c=>c.id===selectedCom);
  const dateStr = dateDay&&dateMonth ? `${String(dateDay).padStart(2,"0")} / ${dateMonth} / ${dateYear} هـ` : `_____ / _____ / ${dateYear} هـ`;

  const updateMember = (i,field,val) => setMembers(ms=>ms.map((m,j)=>j===i?{...m,[field]:val}:m));
  const addMember    = ()=>setMembers(ms=>[...ms,{name:"",role:"معلم",job:"عضو"}]);
  const removeMember = i=>setMembers(ms=>ms.filter((_,j)=>j!==i));
  const updateRec    = (i,field,val)=>setRecs(rs=>rs.map((r,j)=>j===i?{...r,[field]:val}:r));
  const addRec       = ()=>setRecs(rs=>[...rs,{text:"",jt:"",ms:"",jf:""}]);

  const saveMeeting = ()=>{
    const entry = {
      id:Date.now(), committee:selectedCom, comLabel:com?.label,
      meetingNum, dateStr, dayName, period, location,
      agenda:agenda.filter(a=>a.trim()),
      members:[...members], recommendations:[...recommendations],
      decision, attendees, targetGroup, workTeam,
      savedAt:new Date().toLocaleDateString("ar-SA"),
    };
    const updated=[entry,...history];
    setHistory(updated);
    DB.set("school-committee-history",updated);
    setSaved(true);
    setTimeout(()=>setSaved(false),3000);
  };

  const printMeeting = ()=>{
    const activeMembers = members.filter(m=>m.name||m.role);
    const activeRecs    = recommendations.filter(r=>r.text);
    const activeAgenda  = agenda.filter(a=>a.trim());

    printWindow(`<!DOCTYPE html><html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<title>محضر اجتماع — ${com?.label}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Cairo',sans-serif; direction:rtl; background:#fff; color:#1a1a1a; font-size:12px; }
  .page { width:210mm; margin:0 auto; padding:10mm 12mm; }

  /* الرأس */
  .header { display:flex; align-items:center; justify-content:space-between; border-bottom:3px solid ${COM_GREEN}; padding-bottom:8px; margin-bottom:12px; }
  .header-center { text-align:center; }
  .header-center h1 { font-size:15px; font-weight:900; color:${COM_GREEN}; }
  .header-center h2 { font-size:13px; font-weight:700; color:#333; margin-top:2px; }
  .header-center h3 { font-size:12px; color:#555; margin-top:2px; }
  .logo-box { width:70px; text-align:center; }
  .logo-box img { width:60px; }
  .logo-text { font-size:11px; color:${COM_GREEN}; font-weight:700; text-align:center; line-height:1.4; }

  /* عنوان الاجتماع */
  .meeting-title { display:flex; justify-content:space-between; align-items:center; margin:10px 0 8px; }
  .meeting-title .type-label { font-size:16px; font-weight:900; color:${COM_GREEN}; }
  .meeting-title .num-box { font-size:14px; font-weight:700; border:1.5px solid #333; padding:3px 20px; border-radius:4px; }

  /* الجدول الرئيسي */
  table { width:100%; border-collapse:collapse; margin-bottom:10px; }
  th { background:${COM_GREEN}; color:#fff; padding:5px 8px; font-size:11px; font-weight:700; text-align:center; border:1px solid ${COM_GREEN}; }
  td { padding:5px 8px; border:1px solid #aaa; font-size:11px; text-align:center; vertical-align:middle; }
  td.right { text-align:right; }
  tr:nth-child(even) td { background:#f9f9f9; }

  /* قسم الأعمال */
  .section-title { font-size:13px; font-weight:900; color:${COM_GREEN}; margin:10px 0 6px; border-right:4px solid ${COM_GREEN}; padding-right:8px; }
  .agenda-table td.num { background:${COM_GREEN}; color:#fff; width:30px; text-align:center; font-weight:700; }
  .agenda-table td.text { text-align:right; min-height:20px; }

  /* التوصيات */
  .rec-th { background:${COM_GREEN}; color:#fff; font-size:10px; font-weight:700; }

  /* قرار اللجنة */
  .decision-box { border:1.5px solid ${COM_GREEN}; border-radius:6px; padding:10px 14px; margin:10px 0; }
  .decision-box .dt { font-weight:900; color:${COM_GREEN}; margin-bottom:5px; font-size:12px; }
  .decision-box .dc { font-size:11px; line-height:1.9; min-height:40px; }

  /* التوقيعات */
  .sig-th { background:${COM_GREEN}; color:#fff; font-weight:700; font-size:11px; }
  .sig-td { min-height:24px; }

  /* التذييل */
  .footer { display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:8px; border-top:2px solid ${COM_GREEN}; font-size:11px; }
  .footer-left { font-weight:700; color:#333; }
  .footer-right { font-weight:900; font-size:13px; color:${COM_GREEN}; }

  @media print {
    @page { size: A4; margin: 10mm 12mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- الرأس -->
  <div class="header">
    <div class="logo-text">الإدارة العامة للتعليم<br>بمحافظة جدة<br>مدرسة عبيدة بن الحارث المتوسطة</div>
    <div class="header-center">
      <h1>وزارة التعليم</h1>
      <h2>Ministry of Education</h2>
    </div>
    <div class="logo-text" style="text-align:left;font-size:10px;color:#555">
      ⠿⠿⠿⠿<br>⠿⠿⠿⠿<br>⠿⠿⠿⠿
    </div>
  </div>

  <!-- عنوان الاجتماع -->
  <div class="meeting-title">
    <div><span style="font-size:13px;font-weight:700;">●  الاجتماع: </span><span class="type-label">${com?.label}</span></div>
    <div class="num-box">رقم ( ${meetingNum} )</div>
  </div>

  <!-- بيانات الاجتماع -->
  <table>
    <tr>
      <th>مقر الاجتماع</th>
      <th>إدارة المدرسة</th>
      <th>موعد الاجتماع</th>
      <th>${period}</th>
      <th>الفئة المستهدفة</th>
      <th>فريق العمل</th>
      <th>الحاضـــرون</th>
    </tr>
    <tr>
      <td>${location}</td>
      <td>${dayName} ${dateStr}</td>
      <td colspan="2"></td>
      <td>${targetGroup}</td>
      <td>${workTeam}</td>
      <td>${attendees||activeMembers.length}</td>
    </tr>
  </table>

  <!-- جدول الأعمال -->
  <div class="section-title">جـــدول أعمـــال الاجتمـــاع :</div>
  <table class="agenda-table">
    ${activeAgenda.length>0
      ? activeAgenda.map((a,i)=>`<tr><td class="num">${i+1}</td><td class="right">${a}</td></tr>`).join("")
      : Array(5).fill(0).map((_,i)=>`<tr><td class="num">${i+1}</td><td class="right">&nbsp;</td></tr>`).join("")
    }
  </table>

  <!-- وقت الاجتماع -->
  <p style="font-size:11px;margin:6px 0;text-align:right;">إنه في تمام الساعة ( ${endTime||"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"} ) يوم / ${dayName} الموافق ${dateStr} &nbsp; تمت مناقشة الأعمال وعليه تمت التوصيات بالآتي:</p>

  <!-- التوصيات -->
  <table>
    <tr>
      <th style="width:30px">م</th>
      <th>التوصيـــــة</th>
      <th style="width:18%">الجهة المكلفة بالتنفيذ</th>
      <th style="width:14%">مـسنـدة التنفيذ</th>
      <th style="width:18%">الجهة التابعة للتنفيذ</th>
    </tr>
    ${recommendations.map((r,i)=>`
    <tr>
      <td style="background:${COM_GREEN};color:#fff;font-weight:700;">${i+1}</td>
      <td class="right" style="min-height:22px">${r.text||"&nbsp;"}</td>
      <td>${r.jt||"&nbsp;"}</td>
      <td>${r.ms||"&nbsp;"}</td>
      <td>${r.jf||"&nbsp;"}</td>
    </tr>`).join("")}
  </table>

  <!-- قرار اللجنة -->
  <div class="decision-box">
    <div class="dt">قرار اللجنة الإدارية:</div>
    <div class="dc">${decision||"&nbsp;"}</div>
  </div>

  <!-- التوقيعات -->
  <table>
    <tr>
      <th class="sig-th">الاسم</th>
      <th class="sig-th">الوصف الوظيفي</th>
      <th class="sig-th">العمل المكلف به</th>
      <th class="sig-th">التوقيع</th>
    </tr>
    ${activeMembers.map(m=>`
    <tr>
      <td class="sig-td right">${m.name||"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</td>
      <td>${m.role}</td>
      <td>${m.job}</td>
      <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
    </tr>`).join("")}
  </table>

  <!-- التذييل -->
  <div class="footer">
    <div class="footer-left">وانتهى الاجتماع في تمام الساعة (${endTime||"........"}) بالشكر لجميع الحاضرين</div>
    <div class="footer-right">يعتمد / مدير المدرسة</div>
  </div>

</div>
<script>window.onload=()=>window.print()</script>
</body></html>`);
  };

  return (
    <div dir="rtl" className="space-y-4">
      {/* رأس الصفحة */}
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{background:`linear-gradient(135deg,#1a3a2a,${COM_GREEN})`}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">📋 اجتماعات اللجان والفرق</h2>
          <p className="opacity-80 text-sm">وفق الدليل التنظيمي والإجرائي — وزارة التعليم</p>
        </div>
      </div>

      {/* تبويبات */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {[{id:"form",l:"📝 إنشاء محضر"},{id:"preview",l:"👁️ معاينة"},{id:"history",l:`📚 السجل (${history.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={"flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all "+(tab===t.id?"text-white shadow":"text-gray-500 hover:bg-gray-50")}
            style={tab===t.id?{background:`linear-gradient(135deg,${COM_GREEN},#2d6a4f)`}:{}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* - نموذج الإدخال - */}
      {tab==="form" && (
        <div className="space-y-4">

          {/* اختيار اللجنة */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-black text-sm mb-3" style={{color:COM_GREEN}}>🏛️ اختيار اللجنة</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SCHOOL_COMMITTEES.map(c=>(
                <button key={c.id} onClick={()=>setSelectedCom(c.id)}
                  className="p-3 rounded-2xl border-2 text-right transition-all"
                  style={{borderColor:selectedCom===c.id?COM_GREEN:"#e5e7eb",background:selectedCom===c.id?COM_LIGHT:"#fff"}}>
                  <div className="font-black text-xs" style={{color:selectedCom===c.id?COM_GREEN:"#374151"}}>{c.label}</div>
                  <div className="text-xs mt-0.5" style={{color:"#6b7280"}}>{c.type} — {c.members.length} أعضاء</div>
                </button>
              ))}
            </div>
          </div>

          {/* بيانات الاجتماع */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-black text-sm" style={{color:COM_GREEN}}>📅 بيانات الاجتماع</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">رقم الاجتماع</label>
                <input value={meetingNum} onChange={e=>setMeetingNum(e.target.value)} type="number" min="1" max="50"
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none"
                  style={{fontFamily:"inherit",borderColor:COM_GREEN+"55"}}/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">يوم الاجتماع</label>
                <select value={dayName} onChange={e=>setDayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
                  {DAYS_AR.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">الحصة / الوقت</label>
                <select value={period} onChange={e=>setPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
                  {COM_PERIODS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* منتقي التاريخ الهجري */}
              <div className="col-span-2 sm:col-span-3">
                <label className="text-xs font-bold text-gray-500 block mb-1">التاريخ الهجري</label>
                <div className="flex gap-2 items-center">
                  <select value={dateDay} onChange={e=>setDateDay(e.target.value)}
                    className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none" style={{fontFamily:"inherit"}}>
                    <option value="">يوم</option>
                    {Array.from({length:30},(_,i)=>i+1).map(d=><option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
                  </select>
                  <span className="font-bold text-gray-400">/</span>
                  <select value={dateMonth} onChange={e=>setDateMonth(e.target.value)}
                    className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
                    <option value="">الشهر</option>
                    {HIJRI_M.map((m,i)=><option key={i} value={m}>{m}</option>)}
                  </select>
                  <span className="font-bold text-gray-400">/</span>
                  <select value={dateYear} onChange={e=>setDateYear(e.target.value)}
                    className="flex-1 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-center focus:outline-none" style={{fontFamily:"inherit"}}>
                    {[1446,1447,1448,1449].map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="text-sm font-bold text-gray-500">هـ</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">مقر الاجتماع</label>
                <select value={location} onChange={e=>setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
                  {["إدارة المدرسة","غرفة الاجتماعات","المكتبة","قاعة النشاط","الفصل الدراسي"].map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">الفئة المستهدفة</label>
                <input value={targetGroup} onChange={e=>setTargetGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" style={{fontFamily:"inherit"}}/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">وقت انتهاء الاجتماع</label>
                <input value={endTime} onChange={e=>setEndTime(e.target.value)} placeholder="مثال: 10:30 ص"
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" style={{fontFamily:"inherit"}}/>
              </div>
            </div>
          </div>

          {/* جدول الأعمال */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-black text-sm" style={{color:COM_GREEN}}>📋 جدول أعمال الاجتماع</h3>
            {agenda.map((a,i)=>(
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{background:COM_GREEN}}>{i+1}</div>
                <input value={a} onChange={e=>setAgenda(ag=>ag.map((x,j)=>j===i?e.target.value:x))}
                  placeholder={`البند ${i+1}...`}
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none"
                  style={{fontFamily:"inherit",borderColor:a?COM_GREEN+"44":"#e5e7eb"}}/>
                {agenda.length>3&&<button onClick={()=>setAgenda(ag=>ag.filter((_,j)=>j!==i))} className="text-red-400 px-2 text-sm">✕</button>}
              </div>
            ))}
            <button onClick={()=>setAgenda(ag=>[...ag,""])} className="text-xs font-black hover:underline" style={{color:COM_GREEN}}>+ إضافة بند</button>
          </div>

          {/* التوصيات */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-black text-sm" style={{color:COM_GREEN}}>✅ التوصيات</h3>
            {recommendations.map((r,i)=>(
              <div key={i} className="border border-gray-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{background:COM_GREEN}}>{i+1}</div>
                  <input value={r.text} onChange={e=>updateRec(i,"text",e.target.value)} placeholder="نص التوصية..."
                    className="flex-1 px-3 py-1.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none" style={{fontFamily:"inherit"}}/>
                </div>
                <div className="grid grid-cols-3 gap-2 mr-8">
                  <input value={r.jt} onChange={e=>updateRec(i,"jt",e.target.value)} placeholder="الجهة المكلفة"
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" style={{fontFamily:"inherit"}}/>
                  <input value={r.ms} onChange={e=>updateRec(i,"ms",e.target.value)} placeholder="مسند التنفيذ"
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" style={{fontFamily:"inherit"}}/>
                  <input value={r.jf} onChange={e=>updateRec(i,"jf",e.target.value)} placeholder="الجهة التابعة"
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" style={{fontFamily:"inherit"}}/>
                </div>
              </div>
            ))}
            <button onClick={addRec} className="text-xs font-black hover:underline" style={{color:COM_GREEN}}>+ إضافة توصية</button>
          </div>

          {/* قرار اللجنة */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-black text-sm mb-3" style={{color:COM_GREEN}}>⚖️ قرار اللجنة الإدارية</h3>
            <textarea value={decision} onChange={e=>setDecision(e.target.value)} rows={3}
              placeholder="قرار اللجنة..."
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none resize-none" style={{fontFamily:"inherit"}}/>
          </div>

          {/* الأعضاء */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-black text-sm mb-3" style={{color:COM_GREEN}}>👥 أعضاء {com?.label}</h3>
            <div className="space-y-2 mb-3">
              {members.map((m,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{background:COM_GREEN}}>{i+1}</div>
                  {/* اسم العضو — من الحسابات أو يدوي */}
                  <select value={m.name} onChange={e=>updateMember(i,"name",e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-xl border-2 border-gray-200 text-xs font-bold focus:outline-none" style={{fontFamily:"inherit"}}>
                    <option value="">— اختر أو أدخل الاسم —</option>
                    {teachers.map(t=><option key={t} value={t}>{t}</option>)}
                    {accounts.filter(a=>!teachers.includes(a.name)).map(a=><option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                  <input value={m.name} onChange={e=>updateMember(i,"name",e.target.value)}
                    placeholder="أو اكتب الاسم" className="w-28 px-2 py-1.5 rounded-xl border-2 border-gray-200 text-xs focus:outline-none" style={{fontFamily:"inherit"}}/>
                  <input value={m.role} onChange={e=>updateMember(i,"role",e.target.value)}
                    className="w-32 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" style={{fontFamily:"inherit"}}/>
                  <select value={m.job} onChange={e=>updateMember(i,"job",e.target.value)}
                    className="w-28 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" style={{fontFamily:"inherit"}}>
                    {["رئيساً","عضو","مقرراً","مقرراً للجنة","مشرفاً"].map(j=><option key={j} value={j}>{j}</option>)}
                  </select>
                  <button onClick={()=>removeMember(i)} className="text-red-400 text-sm px-1 hover:text-red-600">✕</button>
                </div>
              ))}
            </div>
            <button onClick={addMember} className="text-xs font-black hover:underline" style={{color:COM_GREEN}}>+ إضافة عضو</button>
          </div>

          {saved && <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center font-black text-green-700 text-sm">✅ تم حفظ المحضر في السجل</div>}

          <div className="flex gap-3">
            <button onClick={saveMeeting}
              className="flex-1 py-4 rounded-2xl text-white font-black text-sm shadow-lg"
              style={{background:`linear-gradient(135deg,${COM_GREEN},#2d6a4f)`}}>
              💾 حفظ المحضر
            </button>
            <button onClick={printMeeting}
              className="flex-1 py-4 rounded-2xl text-white font-black text-sm shadow-lg"
              style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)"}}>
              🖨️ طباعة المحضر الرسمي
            </button>
          </div>
        </div>
      )}

      {/* - معاينة المحضر - */}
      {tab==="preview" && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {/* كليشة المعاينة */}
          <div className="p-4 border-b-4" style={{borderColor:COM_GREEN}}>
            <div className="flex items-start justify-between">
              <div className="text-xs leading-relaxed" style={{color:COM_GREEN}}>
                <div className="font-black">الإدارة العامة للتعليم</div>
                <div className="font-bold">بمحافظة جدة</div>
                <div className="font-bold">مدرسة عبيدة بن الحارث المتوسطة</div>
              </div>
              <div className="text-center">
                <div className="font-black text-sm" style={{color:COM_GREEN}}>وزارة التعليم</div>
                <div className="text-xs text-gray-400">Ministry of Education</div>
              </div>
            </div>
          </div>
          {/* عنوان */}
          <div className="flex justify-between items-center px-5 py-3 border-b">
            <div className="text-base font-black" style={{color:COM_GREEN}}>● الاجتماع: {com?.label}</div>
            <div className="border-2 px-4 py-1 rounded font-black text-sm" style={{borderColor:COM_GREEN}}>رقم ( {meetingNum} )</div>
          </div>
          {/* جدول بيانات */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:COM_GREEN}}>
                  {["مقر الاجتماع","إدارة المدرسة","موعد الاجتماع",period,"الفئة المستهدفة","فريق العمل","الحاضـرون"].map(h=>(
                    <th key={h} className="px-3 py-2 text-white font-bold text-center border" style={{borderColor:COM_GREEN+"88"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 text-center border border-gray-300 font-bold">{location}</td>
                  <td className="px-3 py-2 text-center border border-gray-300">{dayName} {dateStr}</td>
                  <td colSpan={2} className="px-3 py-2 border border-gray-300"/>
                  <td className="px-3 py-2 text-center border border-gray-300">{targetGroup}</td>
                  <td className="px-3 py-2 text-center border border-gray-300">{workTeam}</td>
                  <td className="px-3 py-2 text-center border border-gray-300 font-black">{members.filter(m=>m.name).length}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* أعمال */}
          <div className="px-5 py-3">
            <div className="font-black text-sm mb-2 border-r-4 pr-2" style={{color:COM_GREEN,borderColor:COM_GREEN}}>جـدول أعمال الاجتماع:</div>
            <table className="w-full text-xs" style={{borderCollapse:"collapse"}}>
              {agenda.filter(a=>a.trim()).map((a,i)=>(
                <tr key={i}>
                  <td className="w-8 text-center font-black text-white py-1.5 px-2" style={{background:COM_GREEN}}>{i+1}</td>
                  <td className="border border-gray-300 px-3 py-1.5">{a}</td>
                </tr>
              ))}
            </table>
          </div>
          {/* توصيات */}
          <div className="px-5 pb-3">
            <div className="font-black text-sm mb-2 border-r-4 pr-2" style={{color:COM_GREEN,borderColor:COM_GREEN}}>التوصيات:</div>
            <table className="w-full text-xs" style={{borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:COM_GREEN}}>
                  {["م","التوصية","الجهة المكلفة","مسند التنفيذ","الجهة التابعة"].map(h=>(
                    <th key={h} className="px-2 py-1.5 text-white font-bold text-center border" style={{borderColor:COM_GREEN+"88"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recommendations.map((r,i)=>(
                  <tr key={i}>
                    <td className="w-8 text-center font-black text-white py-1.5" style={{background:COM_GREEN}}>{i+1}</td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right">{r.text||<span className="text-gray-300">—</span>}</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-500">{r.jt||"—"}</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-500">{r.ms||"—"}</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-500">{r.jf||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* قرار */}
          {decision&&<div className="mx-5 mb-3 border-2 rounded-xl p-3 text-sm" style={{borderColor:COM_GREEN}}>
            <div className="font-black text-xs mb-1" style={{color:COM_GREEN}}>قرار اللجنة الإدارية:</div>
            <div className="text-gray-700 text-xs leading-relaxed">{decision}</div>
          </div>}
          {/* التوقيعات */}
          <div className="px-5 pb-3">
            <table className="w-full text-xs" style={{borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:COM_GREEN}}>
                  {["الاسم","الوصف الوظيفي","العمل المكلف به","التوقيع"].map(h=>(
                    <th key={h} className="px-3 py-2 text-white font-bold border" style={{borderColor:COM_GREEN+"88"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m,i)=>(
                  <tr key={i} className={i%2===0?"":"bg-gray-50"}>
                    <td className="border border-gray-300 px-3 py-2 font-bold">{m.name||<span className="text-gray-300">—</span>}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{m.role}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{m.job}</td>
                    <td className="border border-gray-300 px-8 py-2"/>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* تذييل */}
          <div className="flex justify-between items-center px-5 py-3 border-t-2 text-xs" style={{borderColor:COM_GREEN}}>
            <div className="text-gray-600">وانتهى الاجتماع في تمام الساعة ({endTime||"........"}) بالشكر لجميع الحاضرين</div>
            <div className="font-black text-sm" style={{color:COM_GREEN}}>يعتمد / مدير المدرسة</div>
          </div>
          {/* زر الطباعة */}
          <div className="p-4">
            <button onClick={printMeeting} className="w-full py-3 rounded-2xl text-white font-black text-sm"
              style={{background:`linear-gradient(135deg,${COM_GREEN},#2d6a4f)`}}>
              🖨️ طباعة المحضر الرسمي بالألوان
            </button>
          </div>
        </div>
      )}

      {/* - السجل - */}
      {tab==="history" && (
        <div className="space-y-3">
          {history.length===0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border"><div className="text-4xl mb-2">📚</div><div className="font-black text-gray-400">لا توجد محاضر مسجلة بعد</div></div>
          ) : history.map(entry=>(
            <div key={entry.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{background:COM_LIGHT}}>
                <div>
                  <div className="font-black text-sm" style={{color:COM_GREEN}}>{entry.comLabel}</div>
                  <div className="text-xs text-gray-500 mt-0.5">اجتماع رقم {entry.meetingNum} — {entry.dateStr}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400">{entry.savedAt}</span>
                  <button onClick={()=>{if(confirm("حذف المحضر؟")){const u=history.filter(h=>h.id!==entry.id);setHistory(u);DB.set("school-committee-history",u);}}} className="text-red-400 text-xs hover:text-red-600">🗑️</button>
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="text-xs text-gray-500 mb-1 font-bold">أعمال الاجتماع:</div>
                <div className="space-y-1">
                  {(entry.agenda||[]).map((a,i)=><div key={i} className="text-xs text-gray-700">• {a}</div>)}
                </div>
                {entry.recommendations?.filter(r=>r.text).length>0&&(
                  <div className="mt-2">
                    <div className="text-xs font-bold text-gray-500 mb-1">التوصيات:</div>
                    {entry.recommendations.filter(r=>r.text).map((r,i)=>(
                      <div key={i} className="text-xs text-gray-600">✅ {r.text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsPage({ teachers, setTeachers, saveTeachers, week, setWeek, saveWeek, users, siteFont, setSiteFont, saveSiteFont, weekArchive, archiveCurrentWeek }) {
  const [newT, setNewT] = useState("");
  const [editWeek, setEditWeek] = useState(false);
  const [tmpWeek, setTmpWeek] = useState(week);
  const [editIdx, setEditIdx] = useState(-1);
  const [editName, setEditName] = useState("");

  const addT = () => { if (!newT.trim()) return; const u = [...teachers, newT.trim()]; setTeachers(u); saveTeachers(u); setNewT(""); };
  const rmT = (i) => { const u = teachers.filter((_,j) => j !== i); setTeachers(u); saveTeachers(u); };
  const saveE = () => { if (!editName.trim()) return; const u = [...teachers]; u[editIdx] = editName.trim(); setTeachers(u); saveTeachers(u); setEditIdx(-1); };
  const saveW = () => { setWeek(tmpWeek); saveWeek(tmpWeek); setEditWeek(false); };
  const updDay = (i, f, v) => setTmpWeek(p => ({...p, days: p.days.map((d,j) => j === i ? {...d, [f]: v} : d)}));

  return (
    <div>
      <h2 className="text-2xl font-black text-teal-900 mb-6">إعدادات النظام</h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔤 خط الموقع</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {FONTS.map(f => (
            <button key={f.value} onClick={() => { setSiteFont(f.value); saveSiteFont(f.value); }}
              className={`p-3 rounded-xl border-2 text-sm transition-all text-right ${siteFont === f.value ? "border-teal-500 bg-teal-50 text-teal-800" : "border-gray-200 hover:border-teal-300"}`}
              style={{ fontFamily: f.value }}>
              <div className="font-bold">{f.label}</div>
              <div className="text-xs mt-1 opacity-60">مدرسة عبيدة بن الحارث</div>
            </button>
          ))}
        </div>
      </div>
      {/* ===== إعدادات الأسبوع ===== */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-gray-800">📅 إعدادات الأسبوع الدراسي</h3>
          <div className="flex gap-2 flex-wrap">
            <button onClick={archiveCurrentWeek}
              className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1">
              🗂️ أرشفة الأسبوع الحالي
            </button>
            {!editWeek ? (
              <button onClick={() => { setEditWeek(true); setTmpWeek(week); }} className="bg-teal-100 text-teal-700 px-3 py-2 rounded-xl text-xs font-bold">✏️ تعديل</button>
            ) : (
              <>
                <button onClick={saveW} className="bg-teal-600 text-white px-3 py-2 rounded-xl text-xs font-bold">💾 حفظ</button>
                <button onClick={() => setEditWeek(false)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold">إلغاء</button>
              </>
            )}
          </div>
        </div>

        {/* ===== إنشاء أسبوع بالقوائم المنسدلة ===== */}
        {(() => {
          const [calType,  setCalType]  = React.useState("hijri");
          const [selDay,   setSelDay]   = React.useState(10);
          const [selMonth, setSelMonth] = React.useState(10);
          const [selYear,  setSelYear]  = React.useState(1447);
          const [preview,  setPreview]  = React.useState(null);
          const [err,      setErr]      = React.useState("");

          const GREG_M = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
          const yearOptions = calType === "hijri"
            ? Array.from({length:20},(_,i)=>1440+i)
            : Array.from({length:10},(_,i)=>2023+i);

          const doGenerate = () => {
            setErr("");
            try {
              const gen = calType === "hijri"
                ? generateWeekDaysFromHijri(selDay, selMonth, selYear)
                : generateWeekDays(`${selYear}-${String(selMonth).padStart(2,"0")}-${String(selDay).padStart(2,"0")}`);
              setPreview(gen);
            } catch(e) { setErr("تاريخ غير صحيح — تأكد أن اليوم المختار هو الأحد"); }
          };

          const doConfirm = () => {
            if (!preview) return;
            setWeek(preview); saveWeek(preview); setPreview(null);
          };

          React.useEffect(() => { setPreview(null); setErr(""); }, [calType, selDay, selMonth, selYear]);

          return (
            <div className="bg-gradient-to-l from-amber-50 to-teal-50 border-2 border-teal-200 rounded-2xl p-4 mb-4">
              <div className="font-black text-teal-800 text-sm mb-3 flex items-center gap-2">
                📅 تحديد أسبوع جديد
                <span className="text-xs text-gray-400 font-normal">اختر تاريخ يوم الأحد</span>
              </div>

              {/* نوع التقويم */}
              <div className="flex gap-2 mb-3">
                {[{v:"hijri",l:"🌙 هجري"},{v:"gregorian",l:"☀️ ميلادي"}].map(t => (
                  <button key={t.v} onClick={() => {
                    setCalType(t.v);
                    setSelDay(1); setSelMonth(1);
                    setSelYear(t.v==="hijri" ? 1447 : 2026);
                  }} className={"flex-1 py-2 rounded-xl text-sm font-black transition-all border-2 " +
                    (calType===t.v ? "border-teal-500 bg-teal-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-teal-300")}>
                    {t.l}
                  </button>
                ))}
              </div>

              {/* القوائم المنسدلة */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">اليوم</label>
                  <select value={selDay} onChange={e => setSelDay(Number(e.target.value))}
                    className="w-full px-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm font-bold bg-white text-center"
                    style={{fontFamily:"inherit"}}>
                    {Array.from({length: calType==="hijri" ? 30 : 31}, (_,i) => i+1).map(d => (
                      <option key={d} value={d}>{String(d).padStart(2,"0")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">الشهر</label>
                  <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}
                    className="w-full px-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm font-bold bg-white"
                    style={{fontFamily:"inherit"}}>
                    {(calType==="hijri" ? HIJRI_MONTHS : GREG_M).map((m,i) => (
                      <option key={i+1} value={i+1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">السنة</label>
                  <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
                    className="w-full px-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm font-bold bg-white text-center"
                    style={{fontFamily:"inherit"}}>
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y} {calType==="hijri"?"هـ":"م"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* أزرار */}
              <div className="flex gap-2">
                <button onClick={doGenerate}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black transition-all">
                  👁️ معاينة الأسبوع
                </button>
                {preview && (
                  <button onClick={doConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-black transition-all animate-pulse">
                    ✅ تأكيد وحفظ
                  </button>
                )}
              </div>

              {err && <div className="mt-2 text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{err}</div>}

              {/* معاينة الأيام */}
              {preview && (
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {preview.days.map((d,i) => (
                    <div key={i} className="bg-white rounded-xl p-2 text-center border-2 border-teal-200 shadow-sm">
                      <div className="text-xs font-black text-teal-800">{d.name}</div>
                      <div className="text-xs text-amber-700 font-bold mt-1">🌙 {d.dateH}</div>
                      <div className="text-xs text-gray-500 mt-0.5">☀️ {d.dateM}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* عرض وتعديل الأيام */}
        {editWeek ? (
          <div className="space-y-2">{tmpWeek.days.map((day, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 flex-wrap">
              <span className="font-black text-teal-800 w-16 text-sm">{day.name}</span>
              <div className="flex-1 min-w-28">
                <label className="text-xs text-gray-400 block mb-0.5">🌙 هجري</label>
                <input type="text" value={day.dateH} onChange={e => updDay(i, "dateH", e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none text-center" />
              </div>
              <div className="flex-1 min-w-28">
                <label className="text-xs text-gray-400 block mb-0.5">☀️ ميلادي</label>
                <input type="text" value={day.dateM} onChange={e => updDay(i, "dateM", e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none text-center" />
              </div>
            </div>
          ))}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="p-2 text-right font-bold text-gray-600">اليوم</th>
                <th className="p-2 text-center font-bold text-amber-700">🌙 هجري</th>
                <th className="p-2 text-center font-bold text-teal-700">☀️ ميلادي</th>
              </tr></thead>
              <tbody>{week.days.map((d,i) => (
                <tr key={i} className={i%2===0?"":"bg-gray-50"}>
                  <td className="p-2 font-black text-gray-800">{d.name}</td>
                  <td className="p-2 text-center font-bold text-amber-800 dir-ltr">{d.dateH} هـ</td>
                  <td className="p-2 text-center font-bold text-teal-800 dir-ltr">{d.dateM} م</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* الأرشيف */}
        {weekArchive.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="text-xs font-black text-gray-500 mb-2">🗂️ الأسابيع المؤرشفة ({weekArchive.length})</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {weekArchive.map((w,i) => (
                <div key={w.id} className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-amber-800">{weekLabel(w.week)}</span>
                  <span className="text-xs text-amber-600">{w.archivedAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">👨‍🏫 إدارة أسماء المعلمين ({teachers.length})</h3>
        <div className="flex gap-2 mb-4">
          <input type="text" placeholder="أدخل اسم المعلم الجديد..." value={newT} onChange={e => setNewT(e.target.value)} onKeyDown={e => e.key === "Enter" && addT()}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm" />
          <button onClick={addT} className="bg-teal-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-teal-700">+ إضافة</button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">{teachers.map((t, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 group">
            {editIdx === i ? (
              <div className="flex items-center gap-2 flex-1">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveE()}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-teal-300 text-sm focus:outline-none" autoFocus />
                <button onClick={saveE} className="text-teal-600 text-xs font-bold px-2 py-1">حفظ</button>
                <button onClick={() => setEditIdx(-1)} className="text-gray-400 text-xs px-2 py-1">إلغاء</button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium"><span className="text-gray-400 ml-2">{i+1}.</span>{t}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditIdx(i); setEditName(t); }} className="text-xs px-2 py-1 rounded-lg hover:bg-teal-100 text-teal-600">✏️</button>
                  <button onClick={() => rmT(i)} className="text-xs px-2 py-1 rounded-lg hover:bg-red-100 text-red-500">🗑️</button>
                </div>
              </>
            )}
          </div>
        ))}</div>
      </div>
      <div className={cx.card}>
        <h3 className="font-bold text-gray-800 mb-4">🔐 حسابات المستخدمين</h3>
        <div className="space-y-2">{users.map((u, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div><span className="font-bold text-sm">{u.name}</span><span className="text-xs text-gray-400 mr-2">({u.role})</span></div>
            <span className="text-xs text-gray-400">{u.username}</span>
          </div>
        ))}</div>
      </div>
      <TeacherAccountsSection />
    </div>
  );
}

// ===== إدارة حسابات المعلمين =====
function TeacherAccountsSection() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newId, setNewId] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    DB.get("school-teacher-accounts", []).then(data => {
      setAccounts(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const save = async (list) => {
    setAccounts(list);
    await DB.set("school-teacher-accounts", list);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addOne = () => {
    if (!newName.trim() || !newId.trim()) return;
    if (accounts.find(a => a.id === newId.trim())) { alert("هذه الهوية موجودة بالفعل"); return; }
    save([...accounts, { name: newName.trim(), id: newId.trim() }]);
    setNewName(""); setNewId("");
  };

  const removeOne = (id) => {
    if (!confirm("حذف هذا المعلم من بوابة المعلمين؟")) return;
    save(accounts.filter(a => a.id !== id));
  };

  const handleExcel = async (file) => {
    await loadXLSX();
    const buf = await file.arrayBuffer();
    const wb = window.XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
    const hdrs = data[0]?.map(h => String(h || "").trim()) || [];
    const nameIdx = hdrs.findIndex(h => h.includes("اسم") || h.toLowerCase().includes("name"));
    const idIdx = hdrs.findIndex(h => h.includes("هوية") || h.includes("هوي") || h.includes("رقم") || h.toLowerCase().includes("id"));
    if (nameIdx < 0 || idIdx < 0) { alert("لم يتم العثور على أعمدة الاسم والهوية. تأكد أن الملف يحتوي على عمودي: الاسم ورقم الهوية"); return; }
    const imported = data.slice(1)
      .filter(r => r[nameIdx] && r[idIdx])
      .map(r => ({ name: String(r[nameIdx]).trim(), id: String(r[idIdx]).trim() }));
    const merged = [...accounts];
    let added = 0;
    imported.forEach(t => {
      if (!merged.find(a => a.id === t.id)) { merged.push(t); added++; }
    });
    save(merged);
    alert(`✅ تم إضافة ${added} معلم جديد. الإجمالي: ${merged.length}`);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">👨‍🏫 حسابات المعلمين — بوابة المعلم</h3>
        {saved && <span className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">✅ تم الحفظ</span>}
      </div>
      <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-medium mb-4">
        💡 كل معلم يدخل بوابة المعلم برقم هويته كـ"كلمة مرور" — يمكنه فقط إدخال مستويات الطلاب
      </div>

      {/* إضافة يدوية */}
      <div className="flex gap-2 mb-3">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="اسم المعلم"
          className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400 focus:outline-none" />
        <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="رقم الهوية"
          className="w-32 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm text-center focus:border-blue-400 focus:outline-none" />
        <button onClick={addOne} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700">إضافة</button>
      </div>

      {/* استيراد إكسل */}
      <div className="mb-4">
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-green-300 text-green-700 text-sm font-bold hover:border-green-500 hover:bg-green-50 transition-all">
          📊 استيراد من إكسل (اسم + هوية)
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleExcel(f); e.target.value = ""; }} />
      </div>

      {/* قائمة المعلمين */}
      {loading ? <div className="text-center text-gray-400 py-4">جاري التحميل…</div> : (
        accounts.length === 0 ? (
          <div className="text-center text-gray-400 py-6 text-sm">لا يوجد معلمون مسجلون بعد</div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {accounts.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 rounded-xl px-3 py-2.5 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">{i + 1}</div>
                  <span className="font-medium text-sm text-gray-800">{a.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg font-mono">{a.id}</span>
                  <button onClick={() => removeOne(a.id)} className="text-red-400 hover:text-red-600 text-sm px-1">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      <div className="mt-3 text-xs text-gray-400 text-center">{accounts.length} معلم مسجل</div>
    </div>
  );
}

// ===== عداد الزوار =====
function VisitorCounter({ siteFont }) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    DB.get("school-visitor-count", 0).then(c => {
      const n = (c || 0) + 1;
      setCount(n);
      DB.set("school-visitor-count", n);
    });
  }, []);
  if (count === null) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-teal-600 font-bold opacity-70">
      <span>👁</span>
      <span>{count.toLocaleString("ar-SA")} زيارة</span>
    </div>
  );
}

// ===== صفحة الإذاعة المدرسية =====
function BroadcastPage() {
  const defaultItems = [
    { id: 1, title: "الافتتاح", icon: "🎙️", content: "بسم الله الرحمن الرحيم", type: "text" },
    { id: 2, title: "آية قرآنية", icon: "📖", content: "", type: "text" },
    { id: 3, title: "حديث شريف", icon: "🌿", content: "", type: "text" },
    { id: 4, title: "كلمة الإذاعة", icon: "🎤", content: "", type: "text" },
    { id: 5, title: "الأخبار والإعلانات", icon: "📢", content: "", type: "text" },
    { id: 6, title: "نشاط ثقافي", icon: "💡", content: "", type: "text" },
    { id: 7, title: "الخاتمة", icon: "🤲", content: "والسلام عليكم ورحمة الله وبركاته", type: "text" },
  ];
  const [items, setItems] = useState(defaultItems);
  const [date, setDate] = useState(new Date().toLocaleDateString("ar-SA-u-nu-arab", {weekday:"long", year:"numeric", month:"long", day:"numeric"}));
  const [schoolName] = useState("مدرسة عبيدة بن الحارث المتوسطة");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    DB.get("school-broadcast", null).then(d => { if (d) setItems(d); });
  }, []);

  const save = () => {
    DB.set("school-broadcast", items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => { setItems(defaultItems); };

  const update = (id, val) => setItems(items.map(i => i.id === id ? {...i, content: val} : i));

  const print = () => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head>
      <meta charset="utf-8"/>
      <title>إذاعة المدرسة</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1a1a1a; direction: rtl; }
        h1 { text-align: center; color: #0d9488; font-size: 22px; margin-bottom: 4px; }
        .date { text-align: center; color: #666; font-size: 13px; margin-bottom: 24px; }
        .item { margin-bottom: 20px; page-break-inside: avoid; }
        .item-title { font-size: 15px; font-weight: bold; color: #0d9488; border-right: 4px solid #0d9488; padding-right: 10px; margin-bottom: 8px; }
        .item-content { font-size: 14px; line-height: 2; background: #f8fffe; padding: 12px 16px; border-radius: 8px; white-space: pre-wrap; }
        hr { border: none; border-top: 1px dashed #ccc; margin: 20px 0; }
        @media print { body { padding: 10px; } }
      </style>
    </head><body>
      <h1>🏫 ${schoolName}</h1>
      <div class="date">إذاعة يوم ${date}</div>
      <hr/>
      ${items.map(i => `<div class="item"><div class="item-title">${i.icon} ${i.title}</div><div class="item-content">${i.content || "—"}</div></div>`).join("")}
    </body></html>`);
  };

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#0d9488,#065f46)"}}>
        <h2 className="text-2xl font-black">🎙️ الإذاعة المدرسية</h2>
        <p className="opacity-80 text-sm mt-1">أعد محتوى الإذاعة واطبعها بسهولة</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-teal-100 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <label className={cx.label}>📅 تاريخ الإذاعة</label>
          <input value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 w-64" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={save} className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700">
            {saved ? "✅ تم الحفظ" : "💾 حفظ"}
          </button>
          <button onClick={print} className={cx.btn}>
            🖨️ طباعة
          </button>
          <button onClick={reset} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200">
            🔄 إعادة تعيين
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className={cx.cardSm}>
            <div className="flex items-center gap-2 px-5 py-3 bg-teal-50 border-b border-teal-100">
              <span className="text-xl">{item.icon}</span>
              <span className="font-black text-teal-800 text-sm">{item.title}</span>
            </div>
            <div className="p-4">
              <textarea value={item.content} onChange={e => update(item.id, e.target.value)}
                rows={4} placeholder={"اكتب " + item.title + " هنا..."}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm resize-none leading-loose" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== صفحة تقسيم الطلاب لمجموعات =====
function GroupDividerPage() {
  const [names, setNames] = useState("");
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState([]);
  const [divided, setDivided] = useState(false);
  const [groupNames, setGroupNames] = useState([]);

  const divide = () => {
    const list = names.split("\n").map(n => n.trim()).filter(Boolean);
    if (list.length === 0) { alert("أدخل أسماء الطلاب أولاً"); return; }
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const result = Array.from({length: groupCount}, () => []);
    shuffled.forEach((name, i) => result[i % groupCount].push(name));
    setGroups(result);
    setGroupNames(Array.from({length: groupCount}, (_, i) => "المجموعة " + (i + 1)));
    setDivided(true);
  };

  const handleExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readFileAsync(file, "text").then(ev => {
      const text = ev;
      const lines = text.split("\n").map(l => l.split(",")[0].trim()).filter(Boolean);
      setNames(lines.join("\n"));
    });
  };

  const print = () => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head>
      <meta charset="utf-8"/><title>تقسيم المجموعات</title>
      <style>
        body{font-family:'Segoe UI',Tahoma,sans-serif;padding:20px;direction:rtl;}
        h1{text-align:center;color:#0d9488;font-size:20px;margin-bottom:16px;}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;}
        .group{border:2px solid #0d9488;border-radius:12px;padding:12px;}
        .group-title{font-weight:bold;color:#0d9488;font-size:14px;margin-bottom:8px;text-align:center;border-bottom:1px dashed #ccc;padding-bottom:6px;}
        .name{font-size:13px;padding:4px 0;border-bottom:1px solid #f0f0f0;}
      </style>
    </head><body>
      <h1>🏫 مدرسة عبيدة بن الحارث المتوسطة — تقسيم المجموعات</h1>
      <div class="grid">
        ${groups.map((g, i) => `<div class="group"><div class="group-title">${groupNames[i]||"المجموعة "+(i+1)} (${g.length} طلاب)</div>${g.map(n => `<div class="name">• ${n}</div>`).join("")}</div>`).join("")}
      </div>
    </body></html>`);
  };

  const colors = ["bg-teal-50 border-teal-300","bg-blue-50 border-blue-300","bg-purple-50 border-purple-300","bg-amber-50 border-amber-300","bg-pink-50 border-pink-300","bg-green-50 border-green-300","bg-red-50 border-red-300","bg-indigo-50 border-indigo-300"];
  const headerColors = ["bg-teal-500","bg-blue-500","bg-purple-500","bg-amber-500","bg-pink-500","bg-green-500","bg-red-500","bg-indigo-500"];

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
        <h2 className="text-2xl font-black">👥 تقسيم الطلاب لمجموعات</h2>
        <p className="opacity-80 text-sm mt-1">قسّم طلابك عشوائياً بضغطة واحدة</p>
      </div>
      {!divided ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-black text-gray-700 mb-2 block">📋 أسماء الطلاب (سطر لكل اسم)</label>
              <textarea value={names} onChange={e => setNames(e.target.value)} rows={12}
                placeholder={"أحمد محمد\nسلطان علي\nعمر خالد\n..."}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm resize-none" />
              <div className="mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-purple-600 hover:text-purple-700">
                  <span>📥 استيراد من Excel/CSV</span>
                  <input type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={handleExcel} />
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-black text-gray-700 mb-2 block">🔢 عدد المجموعات</label>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[2,3,4,5,6,7,8,10].map(n => (
                  <button key={n} onClick={() => setGroupCount(n)}
                    className={"py-3 rounded-xl font-black text-sm border-2 transition-all " + (groupCount===n?"bg-purple-600 text-white border-purple-600":"bg-white text-gray-600 border-gray-200 hover:border-purple-300")}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 text-center">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-sm font-bold text-purple-800">
                  {names.split("\n").filter(Boolean).length} طالب ← {groupCount} مجموعات
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  تقريباً {Math.ceil(names.split("\n").filter(Boolean).length / groupCount)} طالب في كل مجموعة
                </p>
              </div>
            </div>
          </div>
          <button onClick={divide} className="mt-6 w-full py-4 rounded-2xl font-black text-white text-lg"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
            🎲 قسّم المجموعات عشوائياً
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setDivided(false)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200">← تعديل</button>
            <button onClick={divide} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700">🔀 إعادة التقسيم</button>
            <button onClick={print} className={cx.btn}>🖨️ طباعة</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groups.map((group, i) => (
              <div key={i} className={"rounded-2xl border-2 overflow-hidden " + (colors[i % colors.length])}>
                <div className={"px-4 py-2.5 flex items-center justify-between " + (headerColors[i % headerColors.length])}>
                  <input value={groupNames[i]||""} onChange={e => { const ng = [...groupNames]; ng[i]=e.target.value; setGroupNames(ng); }}
                    className="bg-transparent text-white font-black text-sm focus:outline-none w-full" />
                  <span className="text-white text-xs opacity-80 shrink-0">{group.length} طلاب</span>
                </div>
                <div className="p-3 space-y-1">
                  {group.map((name, j) => (
                    <div key={j} className="text-sm font-bold text-gray-700 py-1 px-2 bg-white bg-opacity-60 rounded-lg">
                      {j+1}. {name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== صفحة اختبارات الطلاب =====
function QuizPage() {
  const [tab, setTab] = useState("create"); // create | take | results
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", questions: [] });
  const [newQ, setNewQ] = useState({ text: "", type: "mcq", options: ["","","",""], answer: 0, points: 1 });
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    DB.get("school-quizzes", []).then(d => setQuizzes(Array.isArray(d) ? d : []));
    DB.get("school-quiz-results", []).then(d => setResults(Array.isArray(d) ? d : []));
  }, []);

  const saveQuizzes = (q) => { setQuizzes(q); DB.set("school-quizzes", q); };
  const saveResults = (r) => { setResults(r); DB.set("school-quiz-results", r); };

  const addQuestion = () => {
    if (!newQ.text.trim()) return;
    setForm(f => ({...f, questions: [...f.questions, {...newQ, id: Date.now()}]}));
    setNewQ({ text: "", type: "mcq", options: ["","","",""], answer: 0, points: 1 });
  };

  const saveQuiz = () => {
    if (!form.title.trim() || form.questions.length === 0) { alert("أضف عنوان الاختبار وسؤالاً على الأقل"); return; }
    const q = { ...form, id: Date.now(), createdAt: new Date().toLocaleDateString("ar-SA") };
    saveQuizzes([q, ...quizzes]);
    setForm({ title: "", description: "", questions: [] });
    alert("✅ تم حفظ الاختبار!");
  };

  const submitQuiz = () => {
    if (!studentName.trim()) { alert("أدخل اسمك"); return; }
    let total = 0, earned = 0;
    currentQuiz.questions.forEach(q => {
      total += q.points;
      if (q.type === "mcq" && answers[q.id] === q.answer) earned += q.points;
      if (q.type === "truefalse" && answers[q.id] === q.answer) earned += q.points;
    });
    const result = { id: Date.now(), quizId: currentQuiz.id, quizTitle: currentQuiz.title, studentName, studentId, earned, total, percent: Math.round(earned/total*100), date: new Date().toLocaleDateString("ar-SA") };
    saveResults([result, ...results]);
    setScore(result);
    setSubmitted(true);
  };

  const printResult = (r) => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"/><title>نتيجة الاختبار</title>
    <style>body{font-family:sans-serif;padding:30px;direction:rtl;} h1{color:#0d9488;} .score{font-size:48px;font-weight:bold;text-align:center;color:${r.percent>=60?"#0d9488":"#dc2626"};}</style>
    </head><body>
    <h1>🏫 مدرسة عبيدة بن الحارث المتوسطة</h1>
    <h2>نتيجة اختبار: ${r.quizTitle}</h2>
    <p>الطالب: <strong>${r.studentName}</strong></p>
    <p>رقم الهوية: ${r.studentId||"—"}</p>
    <div class="score">${r.percent}%</div>
    <p style="text-align:center">الدرجة: ${r.earned} من ${r.total}</p>
    <p style="text-align:center">التاريخ: ${r.date}</p>
    </body></html>`);
  };

  const tabStyle = (t) => "px-4 py-2.5 rounded-xl font-bold text-sm transition-all " + (tab===t?"bg-teal-600 text-white shadow":"bg-white text-gray-600 border border-gray-200 hover:border-teal-300");

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#0284c7,#0369a1)"}}>
        <h2 className="text-2xl font-black">📝 اختبارات الطلاب</h2>
        <p className="opacity-80 text-sm mt-1">أنشئ اختبارات وتابع نتائج طلابك</p>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setTab("create")} className={tabStyle("create")}>➕ إنشاء اختبار</button>
        <button onClick={() => { setTab("take"); setSubmitted(false); setAnswers({}); setScore(null); }} className={tabStyle("take")}>📋 أداء الاختبار</button>
        <button onClick={() => setTab("results")} className={tabStyle("results")}>📊 النتائج ({results.length})</button>
      </div>

      {tab === "create" && (
        <div className="space-y-4">
          <div className={cx.card}>
            <h3 className="font-black text-gray-800 mb-3">معلومات الاختبار</h3>
            <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="عنوان الاختبار"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm mb-2" />
            <input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="وصف أو تعليمات (اختياري)"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm" />
          </div>

          {form.questions.length > 0 && (
            <div className={cx.card}>
              <h3 className="font-black text-gray-800 mb-3">الأسئلة المضافة ({form.questions.length})</h3>
              <div className="space-y-2">
                {form.questions.map((q, i) => (
                  <div key={q.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-sm">
                    <span className="font-black text-blue-600 shrink-0">{i+1}.</span>
                    <span className="flex-1 text-gray-700">{q.text}</span>
                    <span className="text-xs text-gray-400">{q.type==="mcq"?"اختيار":"صح/خطأ"} • {q.points} درجة</span>
                    <button onClick={() => setForm(f=>({...f, questions: f.questions.filter(x=>x.id!==q.id)}))} className="text-red-400 hover:text-red-600 font-bold text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={cx.card}>
            <h3 className="font-black text-gray-800 mb-3">إضافة سؤال جديد</h3>
            <div className="space-y-3">
              <textarea value={newQ.text} onChange={e => setNewQ(q=>({...q,text:e.target.value}))} rows={2}
                placeholder="نص السؤال" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm resize-none" />
              <div className="flex gap-3 flex-wrap items-center">
                <div className="flex gap-2">
                  <button onClick={() => setNewQ(q=>({...q,type:"mcq"}))} className={"px-3 py-2 rounded-xl text-xs font-bold border-2 " + (newQ.type==="mcq"?"bg-blue-600 text-white border-blue-600":"bg-white text-gray-600 border-gray-200")}>اختيار متعدد</button>
                  <button onClick={() => setNewQ(q=>({...q,type:"truefalse"}))} className={"px-3 py-2 rounded-xl text-xs font-bold border-2 " + (newQ.type==="truefalse"?"bg-blue-600 text-white border-blue-600":"bg-white text-gray-600 border-gray-200")}>صح / خطأ</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">الدرجة:</span>
                  <input type="number" min="1" max="10" value={newQ.points} onChange={e => setNewQ(q=>({...q,points:Number(e.target.value)}))}
                    className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-center" />
                </div>
              </div>
              {newQ.type === "mcq" ? (
                <div className="space-y-2">
                  {newQ.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button onClick={() => setNewQ(q=>({...q,answer:i}))}
                        className={"w-7 h-7 rounded-full shrink-0 border-2 font-black text-xs " + (newQ.answer===i?"bg-green-500 text-white border-green-500":"bg-white border-gray-300")}>
                        {["أ","ب","ج","د"][i]}
                      </button>
                      <input value={opt} onChange={e => { const o=[...newQ.options]; o[i]=e.target.value; setNewQ(q=>({...q,options:o})); }}
                        placeholder={"الخيار " + (i+1)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-sm" />
                    </div>
                  ))}
                  <p className="text-xs text-gray-400">اضغط على حرف الإجابة الصحيحة (الأخضر)</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setNewQ(q=>({...q,answer:true}))} className={"px-6 py-3 rounded-xl font-black text-sm border-2 " + (newQ.answer===true?"bg-green-500 text-white border-green-500":"bg-white text-gray-600 border-gray-200")}>✅ صح</button>
                  <button onClick={() => setNewQ(q=>({...q,answer:false}))} className={"px-6 py-3 rounded-xl font-black text-sm border-2 " + (newQ.answer===false?"bg-red-500 text-white border-red-500":"bg-white text-gray-600 border-gray-200")}>❌ خطأ</button>
                </div>
              )}
              <button onClick={addQuestion} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700">+ إضافة السؤال</button>
            </div>
          </div>

          <button onClick={saveQuiz} className="w-full py-4 rounded-2xl font-black text-white text-base" style={{background:"linear-gradient(135deg,#0284c7,#0369a1)"}}>
            💾 حفظ الاختبار
          </button>
        </div>
      )}

      {tab === "take" && (
        <div>
          {!currentQuiz ? (
            <div className="space-y-3">
              {quizzes.length === 0 && <div className={cx.empty}><div className="text-4xl mb-2">📭</div><p className="font-bold">لا توجد اختبارات بعد</p></div>}
              {quizzes.map(q => (
                <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-black text-gray-800">{q.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{q.questions.length} سؤال • {q.createdAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setCurrentQuiz(q); setAnswers({}); setSubmitted(false); }}
                      className={cx.btn}>ابدأ الاختبار</button>
                    <button onClick={() => { if(window.confirm("حذف الاختبار؟")) saveQuizzes(quizzes.filter(x=>x.id!==q.id)); }}
                      className="px-3 py-2 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : submitted ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className={"text-6xl mb-4"}>{score.percent >= 60 ? "🎉" : "📚"}</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{score.percent >= 60 ? "أحسنت!" : "حاول مرة أخرى"}</h2>
              <div className={"text-5xl font-black mb-2 " + (score.percent>=60?"text-green-600":"text-red-500")}>{score.percent}%</div>
              <p className="text-gray-500 mb-1">الدرجة: <span className="font-black">{score.earned}</span> من <span className="font-black">{score.total}</span></p>
              <p className="text-gray-400 text-sm mb-6">الطالب: {score.studentName}</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <button onClick={() => printResult(score)} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm">🖨️ طباعة النتيجة</button>
                <button onClick={() => { setCurrentQuiz(null); setSubmitted(false); }} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm">← الاختبارات</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 rounded-2xl p-5 mb-5 flex flex-wrap gap-3 items-end justify-between">
                <div>
                  <h3 className="font-black text-blue-800 text-lg">{currentQuiz.title}</h3>
                  {currentQuiz.description && <p className="text-blue-600 text-sm mt-1">{currentQuiz.description}</p>}
                </div>
                <button onClick={() => setCurrentQuiz(null)} className="text-xs text-gray-500 font-bold hover:text-gray-700">← العودة</button>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-gray-500 mb-1 block">👤 اسم الطالب</label>
                    <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="أدخل اسمك الكامل"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 mb-1 block">🪪 رقم الهوية (اختياري)</label>
                    <input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="رقم الهوية"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm" />
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                {currentQuiz.questions.map((q, i) => (
                  <div key={q.id} className={cx.card}>
                    <p className="font-black text-gray-800 mb-3"><span className="text-blue-600 ml-1">{i+1}.</span>{q.text} <span className="text-xs text-gray-400">({q.points} درجة)</span></p>
                    {q.type === "mcq" ? (
                      <div className="space-y-2">
                        {q.options.filter(Boolean).map((opt, j) => (
                          <button key={j} onClick={() => setAnswers(a=>({...a,[q.id]:j}))}
                            className={"w-full text-right px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all " + (answers[q.id]===j?"bg-blue-600 text-white border-blue-600":"bg-white text-gray-700 border-gray-200 hover:border-blue-300")}>
                            <span className="font-black ml-2">{["أ","ب","ج","د"][j]}</span> {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setAnswers(a=>({...a,[q.id]:true}))} className={"flex-1 py-3 rounded-xl font-black border-2 " + (answers[q.id]===true?"bg-green-500 text-white border-green-500":"bg-white text-gray-600 border-gray-200 hover:border-green-300")}>✅ صح</button>
                        <button onClick={() => setAnswers(a=>({...a,[q.id]:false}))} className={"flex-1 py-3 rounded-xl font-black border-2 " + (answers[q.id]===false?"bg-red-500 text-white border-red-500":"bg-white text-gray-600 border-gray-200 hover:border-red-300")}>❌ خطأ</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={submitQuiz} className="w-full py-4 rounded-2xl font-black text-white text-base" style={{background:"linear-gradient(135deg,#0284c7,#0369a1)"}}>
                ✅ تسليم الاختبار
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "results" && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-black text-gray-800">نتائج الطلاب ({results.length})</h3>
            {results.length > 0 && <button onClick={() => { if(window.confirm("حذف كل النتائج؟")) saveResults([]); }} className="text-xs text-red-500 font-bold px-3 py-1.5 rounded-lg bg-red-50">🗑️ حذف الكل</button>}
          </div>
          {results.length === 0 && <div className={cx.empty}><div className="text-4xl mb-2">📭</div><p className="font-bold">لا توجد نتائج بعد</p></div>}
          <div className="space-y-2">
            {results.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 flex-wrap">
                <div className={"w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 " + (r.percent>=60?"bg-green-500":"bg-red-500")}>{r.percent}%</div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-800 text-sm truncate">{r.studentName}</p>
                  <p className="text-xs text-gray-400">{r.quizTitle} • {r.earned}/{r.total} • {r.date}</p>
                </div>
                <button onClick={() => printResult(r)} className="text-xs text-blue-600 font-bold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 shrink-0">🖨️</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== مؤقت الحصة =====
function ClassTimerPage() {
  const STAGES = [
    { id: 0, name: "التهيئة",            icon: "🎯", minutes: 5,  color: "#f59e0b", colorDark: "#b45309", bullets: ["ربط الدرس السابق بالجديد","سؤال سريع أو موقف حياتي","هدف الحصة بلغة بسيطة"] },
    { id: 1, name: "عرض المفهوم",        icon: "📚", minutes: 10, color: "#3b82f6", colorDark: "#1d4ed8", bullets: ["شرح مختصر ومباشر","استخدام مثال واحد واضح","السبورة + مشاركة الطلاب"] },
    { id: 2, name: "تعلم نشط موجّه",    icon: "👥", minutes: 10, color: "#8b5cf6", colorDark: "#6d28d9", bullets: ["تقسيم إلى مجموعات ٢–٣","نشاط: حل سؤال / مناقشة","المعلم يتجول ويعزز"] },
    { id: 3, name: "تطبيق فردي",         icon: "✏️", minutes: 10, color: "#10b981", colorDark: "#047857", bullets: ["تمارين سريعة فردية","مراعاة الفروق (سهل–تحدي)","متابعة سريعة للضعاف"] },
    { id: 4, name: "التقويم السريع",     icon: "📊", minutes: 5,  color: "#ef4444", colorDark: "#b91c1c", bullets: ["سؤال شفهي أو بطاقة خروج","رفع يد / اختيار من متعدد","قياس الفهم فوراً"] },
    { id: 5, name: "الإغلاق",            icon: "🏁", minutes: 5,  color: "#0d9488", colorDark: "#065f46", bullets: ["تلخيص النقاط الأساسية","تصحيح أخطاء شائعة","واجب بسيط مرتبط بالدرس"] },
  ];
  const TOTAL_SECS = STAGES.reduce((s, st) => s + st.minutes * 60, 0);

  const [stageIdx, setStageIdx]   = useState(0);
  const [remaining, setRemaining] = useState(STAGES[0].minutes * 60);
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [showDoneAnim, setShowDoneAnim] = useState(false);
  const intervalRef = useRef(null);

  const stage = STAGES[stageIdx];

  /* ضبط عام */
  const resetAll = () => {
    clearInterval(intervalRef.current);
    setStageIdx(0); setRemaining(STAGES[0].minutes * 60);
    setRunning(false); setDone(false); setTotalElapsed(0);
    setCompletedStages([]); setShowDoneAnim(false);
  };

  /* الانتقال للمرحلة التالية يدوياً */
  const goToStage = (idx) => {
    if (done) return;
    clearInterval(intervalRef.current); setRunning(false);
    const elapsed = STAGES.slice(0, idx).reduce((s, st) => s + st.minutes * 60, 0);
    setStageIdx(idx); setRemaining(STAGES[idx].minutes * 60);
    setTotalElapsed(elapsed);
    setCompletedStages(STAGES.slice(0, idx).map(s => s.id));
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            const nextIdx = stageIdx + 1;
            if (nextIdx >= STAGES.length) {
              setDone(true); setShowDoneAnim(true);
              setTimeout(() => setShowDoneAnim(false), 3000);
            } else {
              setCompletedStages(prev => [...prev, stageIdx]);
              setStageIdx(nextIdx);
              setRemaining(STAGES[nextIdx].minutes * 60);
              setTotalElapsed(prev => prev + 1);
            }
            return 0;
          }
          setTotalElapsed(prev => prev + 1);
          return r - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, stageIdx]);

  const stageMins  = Math.floor(remaining / 60);
  const stageSecs  = remaining % 60;
  const stagePct   = (STAGES[stageIdx].minutes * 60 - remaining) / (STAGES[stageIdx].minutes * 60);
  const totalPct   = totalElapsed / TOTAL_SECS;
  const totalMinsLeft = Math.floor((TOTAL_SECS - totalElapsed) / 60);
  const totalSecsLeft = (TOTAL_SECS - totalElapsed) % 60;
  const R = 72, CIRC = 2 * Math.PI * R;

  const urgent = remaining <= 60 && !done;

  const stageGradient = `linear-gradient(135deg, ${stage.color}dd, ${stage.colorDark})`;

  return (
    <div style={{fontFamily:"'Tajawal',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
        @keyframes ct-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes ct-bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes ct-celebrate { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.15) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes ct-slide-in { from{transform:translateX(30px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes ct-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        .ct-urgent { animation: ct-pulse 0.8s ease-in-out infinite; }
        .ct-done-anim { animation: ct-celebrate 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
        .ct-slide { animation: ct-slide-in 0.35s ease forwards; }
        .ct-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent); animation:ct-shimmer 2s linear infinite; }
      `}</style>

      <div className="page-header-bar mb-4" style={{background:"linear-gradient(135deg,#0369a1,#1e3a5f)"}}>
        <h2 className="text-2xl font-black">⏱️ مؤقت الحصة النموذجية</h2>
        <p className="opacity-80 text-sm mt-1">٤٥ دقيقة · ٦ مراحل متكاملة</p>
      </div>

      <div className="max-w-2xl mx-auto px-2">

        {/* بطاقة المرحلة الحالية */}
        {!done ? (
          <div className="ct-slide rounded-3xl p-5 mb-4 text-white shadow-2xl relative overflow-hidden ct-shimmer"
            style={{background: stageGradient}}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{stage.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold opacity-75">المرحلة {stageIdx + 1} من {STAGES.length}</p>
                <h3 className="text-xl font-black leading-tight">{stage.name}</h3>
              </div>
              <div className="text-left">
                <p className="text-xs opacity-70">الوقت الكلي</p>
                <p className="text-sm font-black">{String(totalMinsLeft).padStart(2,"0")}:{String(totalSecsLeft).padStart(2,"0")}</p>
              </div>
            </div>

            {/* الشاشة الكبيرة */}
            <div className="flex items-center justify-center gap-6 mb-4">
              {/* دائرة الوقت */}
              <div className="relative shrink-0">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="10"/>
                  <circle cx="80" cy="80" r={R} fill="none" stroke="white" strokeWidth="10"
                    strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - stagePct)}
                    strokeLinecap="round" transform="rotate(-90 80 80)"
                    style={{transition:"stroke-dashoffset 1s linear"}}/>
                </svg>
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${urgent?"ct-urgent":""}`}>
                  <span className="text-4xl font-black leading-none tracking-tighter">
                    {String(stageMins).padStart(2,"0")}:{String(stageSecs).padStart(2,"0")}
                  </span>
                  <span className="text-xs opacity-70 mt-1">{running ? "جارٍ" : "متوقف"}</span>
                </div>
              </div>

              {/* نقاط المرحلة */}
              <div className="flex-1 space-y-2">
                {stage.bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white bg-opacity-25 flex items-center justify-center text-xs font-black shrink-0">{i+1}</span>
                    <span className="opacity-90 leading-snug">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-2 justify-center">
              <button onClick={() => setRunning(r => !r)}
                className="flex-1 max-w-xs py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
                style={{background: running ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.95)", color: running ? "white" : stage.colorDark}}>
                {running ? "⏸ إيقاف مؤقت" : "▶ تشغيل"}
              </button>
              {stageIdx < STAGES.length - 1 && (
                <button onClick={() => { setCompletedStages(prev=>[...prev,stageIdx]); goToStage(stageIdx+1); }}
                  className="px-4 py-3 rounded-2xl font-black text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-all active:scale-95">
                  التالي ←
                </button>
              )}
              <button onClick={resetAll}
                className="px-4 py-3 rounded-2xl font-black text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-all active:scale-95">
                ⟳
              </button>
            </div>

            {/* شريط تقدم الحصة الكاملة */}
            <div className="mt-4">
              <div className="flex justify-between text-xs opacity-70 mb-1">
                <span>تقدم الحصة الكاملة</span>
                <span>{Math.round(totalPct * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white bg-opacity-20 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all duration-1000"
                  style={{width: `${totalPct * 100}%`}}/>
              </div>
            </div>
          </div>
        ) : (
          <div className={`rounded-3xl p-8 mb-4 text-center shadow-2xl ${showDoneAnim?"ct-done-anim":""}`}
            style={{background:"linear-gradient(135deg,#0d9488,#065f46)"}}>
            <div className="text-6xl mb-3">🎉</div>
            <h3 className="text-2xl font-black text-white mb-1">انتهت الحصة!</h3>
            <p className="text-teal-200 text-sm mb-4">٤٥ دقيقة من التعلم الفعّال</p>
            <button onClick={resetAll}
              className="px-8 py-3 rounded-2xl bg-white text-teal-700 font-black text-sm hover:shadow-lg transition-all active:scale-95">
              🔄 حصة جديدة
            </button>
          </div>
        )}

        {/* قائمة المراحل */}
        <div className="space-y-2">
          {STAGES.map((st, i) => {
            const isActive    = i === stageIdx && !done;
            const isCompleted = completedStages.includes(st.id) || done;
            const isUpcoming  = !isActive && !isCompleted;
            return (
              <button key={st.id} onClick={() => !done && goToStage(i)}
                disabled={done}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-right border-2 ${
                  isActive
                    ? "border-transparent shadow-lg scale-[1.01]"
                    : isCompleted
                    ? "border-transparent opacity-60"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                style={isActive ? {background: stageGradient, color:"white"} : isCompleted ? {background:"#f0fdf4", borderColor: st.color+"44"} : {}}>
                <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg"
                  style={{background: isActive ? "rgba(255,255,255,.25)" : isCompleted ? st.color+"22" : "#f3f4f6"}}>
                  {isCompleted ? "✅" : st.icon}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className={`font-black text-sm ${isActive?"text-white":isCompleted?"":"text-gray-800"}`}>{st.name}</p>
                  <p className={`text-xs truncate ${isActive?"opacity-70 text-white":isCompleted?"text-green-600":"text-gray-400"}`}>
                    {st.bullets[0]}
                  </p>
                </div>
                <div className={`shrink-0 text-xs font-black px-2 py-1 rounded-full ${
                  isActive ? "bg-white bg-opacity-25 text-white" : isCompleted ? "text-green-600" : "text-gray-400"
                }`}>
                  {st.minutes} د
                </div>
                {isActive && (
                  <div className={`shrink-0 text-sm font-black text-white ${urgent?"ct-urgent":""}`}>
                    {String(stageMins).padStart(2,"0")}:{String(stageSecs).padStart(2,"0")}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ملخص الوقت */}
        <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <span className="text-sm font-bold text-gray-500">⏳ إجمالي الحصة</span>
          <span className="text-lg font-black text-teal-600">٤٥ دقيقة</span>
        </div>
      </div>
    </div>
  );
}

// ===== عجلة الحظ =====
function LuckyWheelPage() {
  const [names, setNames] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [angle, setAngle] = useState(0);
  const [history, setHistory] = useState([]);
  const canvasRef = useRef(null);
  const colors = ["#0d9488","#2563eb","#7c3aed","#db2777","#d97706","#059669","#dc2626","#0284c7","#65a30d","#9333ea"];

  const nameList = names.split("\n").map(n=>n.trim()).filter(Boolean);

  const drawWheel = (rot) => {
    const canvas = canvasRef.current;
    if (!canvas || nameList.length === 0) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const slice = (2 * Math.PI) / nameList.length;
    nameList.forEach((name, i) => {
      const start = rot + i * slice, end = start + slice;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + slice / 2);
      ctx.textAlign = "right"; ctx.fillStyle = "white";
      ctx.font = `bold ${Math.min(14, 100/nameList.length + 8)}px sans-serif`;
      ctx.fillText(name.length > 10 ? name.substring(0,10)+"…" : name, r - 10, 5);
      ctx.restore();
    });
    // المؤشر
    ctx.beginPath(); ctx.moveTo(cx + r - 5, cy);
    ctx.lineTo(cx + r + 20, cy - 10); ctx.lineTo(cx + r + 20, cy + 10);
    ctx.fillStyle = "#1f2937"; ctx.fill();
  };

  useEffect(() => { drawWheel(angle * Math.PI / 180); }, [names, angle]);

  const spin = () => {
    if (spinning || nameList.length === 0) return;
    setSpinning(true); setWinner(null);
    const extra = 1800 + Math.random() * 1800;
    const target = angle + extra;
    const slice = 360 / nameList.length;
    const finalAngle = target % 360;
    const winIdx = Math.floor(((360 - finalAngle) % 360) / slice) % nameList.length;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start, duration = 4000;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const cur = angle + extra * ease;
      setAngle(cur);
      drawWheel((cur * Math.PI) / 180);
      if (progress < 1) requestAnimationFrame(animate);
      else {
        setSpinning(false);
        const w = nameList[winIdx];
        setWinner(w);
        setHistory(h => [{ name: w, time: new Date().toLocaleTimeString("ar-SA") }, ...h.slice(0,9)]);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleExcel = (e) => {
    const file = e.target.files[0]; if (!file) return;
    readFileAsync(file, "text").then(ev => { const lines = ev.split("\n").map(l=>l.split(",")[0].trim()).filter(Boolean); setNames(lines.join("\n")); });
  };

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#7c3aed,#db2777)"}}>
        <h2 className="text-2xl font-black">🎯 عجلة الحظ</h2>
        <p className="opacity-80 text-sm mt-1">اختر طالباً عشوائياً بطريقة ممتعة</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <label className="text-sm font-black text-gray-700 mb-2 block">📋 أسماء الطلاب</label>
            <textarea value={names} onChange={e => setNames(e.target.value)} rows={10}
              placeholder={"أحمد محمد\nسلطان علي\nعمر خالد\n..."}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm resize-none mb-2" />
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-purple-600">
              📥 استيراد من Excel
              <input type="file" accept=".csv,.txt" className="hidden" onChange={handleExcel} />
            </label>
          </div>
          {history.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-700 text-sm mb-3">📜 سجل الاختيارات</h3>
              <div className="space-y-1">
                {history.map((h,i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-1.5 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-700">🏆 {h.name}</span>
                    <span className="text-xs text-gray-400">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <canvas ref={canvasRef} width={300} height={300} className="rounded-full shadow-2xl cursor-pointer" onClick={spin} />
            {nameList.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
                <p className="text-gray-400 font-bold text-sm">أضف الأسماء أولاً</p>
              </div>
            )}
          </div>
          {winner && (
            <div className="bg-gradient-to-l from-purple-600 to-pink-600 rounded-2xl p-5 text-white mb-4 animate-pulse">
              <div className="text-3xl mb-1">🎉</div>
              <p className="text-xl font-black">{winner}</p>
              <p className="text-sm opacity-80 mt-1">الطالب المختار</p>
            </div>
          )}
          <button onClick={spin} disabled={spinning || nameList.length === 0}
            className={"w-full py-4 rounded-2xl font-black text-white text-lg transition-all " + (spinning||nameList.length===0?"opacity-40 cursor-not-allowed":"hover:shadow-xl")}
            style={{background:"linear-gradient(135deg,#7c3aed,#db2777)"}}>
            {spinning ? "🌀 جاري الدوران..." : "🎯 أدِر العجلة!"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== بطاقة الخروج =====
function ExitTicketPage() {
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState("setup"); // setup | answer | results

  useEffect(() => {
    DB.get("school-exit-ticket", { question:"", responses:[] }).then(d => {
      if (d && d.question) { setQuestion(d.question); setResponses(d.responses||[]); }
    });
  }, []);

  const saveTicket = (q, r) => DB.set("school-exit-ticket", { question: q, responses: r });

  const publish = () => {
    if (!question.trim()) return;
    setResponses([]); saveTicket(question, []); setMode("answer");
  };

  const submitAnswer = () => {
    if (!studentName.trim() || !answer.trim()) { alert("أدخل اسمك وإجابتك"); return; }
    const r = [...responses, { name: studentName, answer, time: new Date().toLocaleTimeString("ar-SA") }];
    setResponses(r); saveTicket(question, r);
    setSubmitted(true);
  };

  const print = () => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"/><title>بطاقات الخروج</title>
    <style>body{font-family:sans-serif;padding:20px;direction:rtl;} h1{color:#0d9488;font-size:18px;} .card{border:1px solid #ccc;border-radius:8px;padding:12px;margin:8px 0;page-break-inside:avoid;} .q{font-weight:bold;color:#0d9488;margin-bottom:6px;} .name{font-size:12px;color:#666;} .ans{font-size:13px;margin-top:4px;}</style>
    </head><body><h1>🚪 بطاقات الخروج — ${question}</h1>
    ${responses.map(r=>`<div class="card"><div class="name">👤 ${r.name} — ${r.time}</div><div class="ans">💬 ${r.answer}</div></div>`).join("")}
    </body></html>`);
  };

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#059669,#065f46)"}}>
        <h2 className="text-2xl font-black">🚪 بطاقة الخروج</h2>
        <p className="opacity-80 text-sm mt-1">سؤال سريع قبل نهاية الحصة</p>
      </div>
      <div className="flex gap-2 mb-6">
        {["setup","answer","results"].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={"px-4 py-2.5 rounded-xl font-bold text-sm " + (mode===m?"bg-teal-600 text-white":"bg-white text-gray-600 border border-gray-200")}>
            {m==="setup"?"⚙️ إعداد السؤال":m==="answer"?"✏️ إجابة الطلاب":"📊 النتائج ("+responses.length+")"}
          </button>
        ))}
      </div>

      {mode === "setup" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label className="text-sm font-black text-gray-700 mb-2 block">💡 سؤال بطاقة الخروج</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
            placeholder="مثال: ما أهم شيء تعلمته اليوم؟ أو ما سؤالك عن الدرس؟"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm resize-none mb-4" />
          <button onClick={publish} className="w-full py-3 rounded-2xl bg-teal-600 text-white font-black hover:bg-teal-700">
            📤 نشر السؤال للطلاب
          </button>
        </div>
      )}

      {mode === "answer" && (
        <div className="max-w-md mx-auto">
          {!submitted ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="bg-teal-50 rounded-xl p-4 mb-5 text-center">
                <p className="font-black text-teal-800 text-lg">{question || "لم يُنشر سؤال بعد"}</p>
              </div>
              <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="اسمك الكامل"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm mb-3" />
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4}
                placeholder="اكتب إجابتك هنا..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm resize-none mb-4" />
              <button onClick={submitAnswer} className="w-full py-3 rounded-2xl bg-teal-600 text-white font-black hover:bg-teal-700">
                ✅ إرسال الإجابة
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="font-black text-gray-800 text-xl mb-2">تم الإرسال!</h3>
              <p className="text-gray-500 text-sm">شكراً {studentName}</p>
              <button onClick={() => { setStudentName(""); setAnswer(""); setSubmitted(false); }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm">إجابة طالب آخر</button>
            </div>
          )}
        </div>
      )}

      {mode === "results" && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-black text-gray-800">الإجابات ({responses.length})</h3>
            <div className="flex gap-2">
              {responses.length > 0 && <button onClick={print} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">🖨️ طباعة</button>}
              <button onClick={() => { setResponses([]); saveTicket(question, []); }} className="px-4 py-2 rounded-xl bg-red-50 text-red-500 font-bold text-sm">🗑️ مسح</button>
            </div>
          </div>
          {responses.length === 0 && <div className={cx.empty}><div className="text-4xl mb-2">📭</div><p className="font-bold">لا توجد إجابات بعد</p></div>}
          <div className="space-y-3">
            {responses.map((r,i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-gray-800 text-sm">👤 {r.name}</span>
                  <span className="text-xs text-gray-400">{r.time}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">💬 {r.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== جدول الحصص الأسبوعي =====
function TimetablePage({ teachers }) {
  const days = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس"];
  const periods = [1,2,3,4,5,6,7,8];
  const [timetable, setTimetable] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState("الكل");

  useEffect(() => {
    DB.get("school-timetable", {}).then(d => setTimetable(d||{}));
  }, []);

  const save = (t) => { setTimetable(t); DB.set("school-timetable", t); };

  const update = (day, period, value) => {
    const t = { ...timetable, [`${day}-${period}`]: value };
    save(t);
  };

  const print = () => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"/><title>جدول الحصص</title>
    <style>body{font-family:sans-serif;direction:rtl;padding:20px;font-size:12px;} h1{color:#0d9488;text-align:center;} table{width:100%;border-collapse:collapse;margin-top:16px;} th,td{border:1px solid #ccc;padding:8px 6px;text-align:center;} th{background:#0d9488;color:white;font-size:11px;} td{font-size:11px;} .period{background:#f0fdfa;font-weight:bold;}</style>
    </head><body><h1>🏫 جدول الحصص الأسبوعي — مدرسة عبيدة بن الحارث المتوسطة</h1>
    <table><tr><th>الحصة</th>${days.map(d=>`<th>${d}</th>`).join("")}</tr>
    ${periods.map(p=>`<tr><td class="period">الحصة ${p}</td>${days.map(d=>`<td>${timetable[d+"-"+p]||""}</td>`).join("")}</tr>`).join("")}
    </table></body></html>`);
  };

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#0369a1,#1e3a5f)"}}>
        <h2 className="text-2xl font-black">🗓️ جدول الحصص الأسبوعي</h2>
        <p className="opacity-80 text-sm mt-1">جدول أسبوعي قابل للتعديل والطباعة</p>
      </div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-gray-500 font-bold">اضغط على أي خانة لتعديلها</p>
        <button onClick={print} className={cx.btn}>🖨️ طباعة الجدول</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse bg-white rounded-2xl overflow-hidden shadow-sm">
          <thead>
            <tr>
              <th className="px-3 py-3 text-white text-xs font-black" style={{background:"#0d9488"}}>الحصة</th>
              {days.map(d => <th key={d} className="px-3 py-3 text-white text-xs font-black" style={{background:"#0d9488"}}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {periods.map(p => (
              <tr key={p} className={p%2===0?"bg-gray-50":""}>
                <td className="px-3 py-2 text-center font-black text-teal-700 text-xs border border-gray-100">{p}</td>
                {days.map(d => (
                  <td key={d} className="border border-gray-100 p-1">
                    <input value={timetable[`${d}-${p}`]||""} onChange={e => update(d,p,e.target.value)}
                      placeholder="المادة / المعلم"
                      className="w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:bg-teal-50 bg-transparent hover:bg-gray-50 transition-all text-center" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== سجل الزيارات الصفية =====
function ClassVisitsPage({ teachers }) {
  const [visits, setVisits] = useState([]);
  const [form, setForm] = useState({ teacher:"", class:"", date: new Date().toLocaleDateString("ar-SA"), subject:"", strength:"", improvement:"", rating:4 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    DB.get("school-class-visits", []).then(d => setVisits(Array.isArray(d)?d:[]));
  }, []);

  const save = (v) => { setVisits(v); DB.set("school-class-visits", v); };

  const add = () => {
    if (!form.teacher || !form.class) { alert("أدخل اسم المعلم والفصل"); return; }
    save([{ ...form, id: Date.now() }, ...visits]);
    setForm({ teacher:"", class:"", date: new Date().toLocaleDateString("ar-SA"), subject:"", strength:"", improvement:"", rating:4 });
    setShowForm(false);
  };

  const print = (v) => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"/><title>تقرير زيارة صفية</title>
    <style>body{font-family:sans-serif;direction:rtl;padding:30px;} h1{color:#0d9488;font-size:18px;border-bottom:2px solid #0d9488;padding-bottom:8px;} .row{margin:12px 0;} .label{font-weight:bold;color:#0d9488;font-size:13px;} .val{font-size:13px;line-height:1.6;margin-top:4px;background:#f0fdfa;padding:8px 12px;border-radius:6px;} .stars{font-size:20px;margin-top:4px;}</style>
    </head><body>
    <h1>🏫 سجل الزيارة الصفية — مدرسة عبيدة بن الحارث المتوسطة</h1>
    <div class="row"><div class="label">المعلم:</div><div class="val">${v.teacher}</div></div>
    <div class="row"><div class="label">الفصل:</div><div class="val">${v.class}</div></div>
    <div class="row"><div class="label">المادة:</div><div class="val">${v.subject||"—"}</div></div>
    <div class="row"><div class="label">التاريخ:</div><div class="val">${v.date}</div></div>
    <div class="row"><div class="label">نقاط القوة:</div><div class="val">${v.strength||"—"}</div></div>
    <div class="row"><div class="label">نقاط التحسين:</div><div class="val">${v.improvement||"—"}</div></div>
    <div class="row"><div class="label">التقييم:</div><div class="stars">${"⭐".repeat(v.rating)}</div></div>
    </body></html>`);
  };

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#b45309,#92400e)"}}>
        <h2 className="text-2xl font-black">👁️ سجل الزيارات الصفية</h2>
        <p className="opacity-80 text-sm mt-1">توثيق الزيارات الصفية ومتابعتها</p>
      </div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <span className="text-sm font-bold text-gray-500">{visits.length} زيارة مسجلة</span>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700">
          {showForm ? "✕ إلغاء" : "+ تسجيل زيارة"}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 mb-5">
          <h3 className="font-black text-amber-800 mb-4">تسجيل زيارة صفية جديدة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={cx.label}>المعلم</label>
              <select value={form.teacher} onChange={e => setForm(f=>({...f,teacher:e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm">
                <option value="">اختر المعلم</option>
                {teachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={cx.label}>الفصل</label>
              <input value={form.class} onChange={e => setForm(f=>({...f,class:e.target.value}))} placeholder="مثال: أول أ"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className={cx.label}>المادة</label>
              <input value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} placeholder="المادة الدراسية"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className={cx.label}>التقييم</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm(f=>({...f,rating:n}))}
                    className={"text-2xl transition-transform hover:scale-110 " + (form.rating>=n?"":"opacity-30")}>⭐</button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className={cx.label}>✅ نقاط القوة</label>
              <textarea value={form.strength} onChange={e => setForm(f=>({...f,strength:e.target.value}))} rows={2}
                placeholder="ما الذي تميّز فيه المعلم؟"
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm resize-none" />
            </div>
            <div>
              <label className={cx.label}>📈 نقاط التحسين</label>
              <textarea value={form.improvement} onChange={e => setForm(f=>({...f,improvement:e.target.value}))} rows={2}
                placeholder="ما الذي يمكن تحسينه؟"
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm resize-none" />
            </div>
          </div>
          <button onClick={add} className="mt-4 w-full py-3 rounded-2xl bg-amber-600 text-white font-black hover:bg-amber-700">💾 حفظ الزيارة</button>
        </div>
      )}
      {visits.length === 0 && !showForm && <div className={cx.empty}><div className="text-4xl mb-2">📭</div><p className="font-bold">لا توجد زيارات مسجلة</p></div>}
      <div className="space-y-3">
        {visits.map(v => (
          <div key={v.id} className={cx.card}>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div>
                <h3 className="font-black text-gray-800">{v.teacher}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{v.class} • {v.subject} • {v.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{"⭐".repeat(v.rating)}</span>
                <button onClick={() => print(v)} className="text-xs text-blue-600 font-bold px-3 py-1.5 rounded-lg bg-blue-50">🖨️</button>
                <button onClick={() => save(visits.filter(x=>x.id!==v.id))} className="text-xs text-red-500 font-bold px-3 py-1.5 rounded-lg bg-red-50">🗑️</button>
              </div>
            </div>
            {v.strength && <div className="text-xs bg-green-50 rounded-lg p-2 mb-2"><span className="font-black text-green-700">✅ نقاط القوة:</span> <span className="text-gray-600">{v.strength}</span></div>}
            {v.improvement && <div className="text-xs bg-amber-50 rounded-lg p-2"><span className="font-black text-amber-700">📈 التحسين:</span> <span className="text-gray-600">{v.improvement}</span></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== لوحة الشرف =====
function HonorBoardPage({ classList }) {
  const [honorStudents, setHonorStudents] = useState([]);
  const [form, setForm] = useState({ name:"", class:"", reason:"", badge:"🏆" });
  const [showForm, setShowForm] = useState(false);
  const badges = ["🏆","⭐","🥇","🎖️","🌟","💎","🔥","👑","🎯","✨"];

  useEffect(() => {
    DB.get("school-honor-board", []).then(d => setHonorStudents(Array.isArray(d)?d:[]));
  }, []);

  const save = (v) => { setHonorStudents(v); DB.set("school-honor-board", v); };

  const add = () => {
    if (!form.name.trim()) { alert("أدخل اسم الطالب"); return; }
    save([{ ...form, id: Date.now(), date: new Date().toLocaleDateString("ar-SA") }, ...honorStudents]);
    setForm({ name:"", class:"", reason:"", badge:"🏆" }); setShowForm(false);
  };

  const print = () => {
    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"/><title>لوحة الشرف</title>
    <style>body{font-family:sans-serif;direction:rtl;padding:30px;text-align:center;background:#fffbeb;} h1{color:#0d9488;font-size:22px;margin-bottom:4px;} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-top:24px;} .card{background:white;border:2px solid #fde68a;border-radius:12px;padding:16px;} .badge{font-size:36px;} .name{font-weight:bold;font-size:14px;margin:8px 0 4px;} .class{font-size:12px;color:#666;} .reason{font-size:11px;color:#0d9488;margin-top:6px;}</style>
    </head><body>
    <h1>🏫 لوحة الشرف</h1><p style="color:#666;font-size:13px;">مدرسة عبيدة بن الحارث المتوسطة</p>
    <div class="grid">${honorStudents.map(s=>`<div class="card"><div class="badge">${s.badge}</div><div class="name">${s.name}</div><div class="class">${s.class}</div><div class="reason">${s.reason||""}</div></div>`).join("")}</div>
    </body></html>`);
  };

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#d97706,#b45309)"}}>
        <h2 className="text-2xl font-black">🏆 لوحة الشرف</h2>
        <p className="opacity-80 text-sm mt-1">كرّم طلابك المتميزين</p>
      </div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <span className="text-sm font-bold text-gray-500">{honorStudents.length} طالب متميز</span>
        <div className="flex gap-2">
          {honorStudents.length>0 && <button onClick={print} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">🖨️ طباعة</button>}
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700">
            {showForm?"✕ إلغاء":"+ إضافة طالب"}
          </button>
        </div>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="اسم الطالب"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
            <input value={form.class} onChange={e => setForm(f=>({...f,class:e.target.value}))} placeholder="الفصل"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm" />
          </div>
          <input value={form.reason} onChange={e => setForm(f=>({...f,reason:e.target.value}))} placeholder="سبب التكريم (اختياري)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-sm mb-3" />
          <div className="flex gap-2 flex-wrap mb-3">
            {badges.map(b => (
              <button key={b} onClick={() => setForm(f=>({...f,badge:b}))}
                className={"text-2xl p-2 rounded-xl border-2 transition-all " + (form.badge===b?"border-amber-400 bg-amber-50":"border-transparent hover:border-gray-200")}>
                {b}
              </button>
            ))}
          </div>
          <button onClick={add} className="w-full py-3 rounded-2xl bg-amber-600 text-white font-black hover:bg-amber-700">✨ إضافة للوحة الشرف</button>
        </div>
      )}
      {honorStudents.length === 0 && !showForm && <div className={cx.empty}><div className="text-5xl mb-2">🏆</div><p className="font-bold">لوحة الشرف فارغة</p></div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {honorStudents.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-4 text-center shadow-sm border-2 border-amber-200 hover:shadow-md transition-all relative group">
            <button onClick={() => save(honorStudents.filter(x=>x.id!==s.id))} className="absolute top-2 left-2 text-xs text-red-400 opacity-0 group-hover:opacity-100 font-bold">✕</button>
            <div className="text-4xl mb-2">{s.badge}</div>
            <p className="font-black text-gray-800 text-sm">{s.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.class}</p>
            {s.reason && <p className="text-xs text-teal-600 mt-1 font-bold">{s.reason}</p>}
            <p className="text-xs text-gray-300 mt-1">{s.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== تتبع المهام =====
function TasksPage({ teachers }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title:"", assignedTo:"", dueDate:"", priority:"عادي", notes:"" });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("الكل");

  useEffect(() => {
    DB.get("school-tasks", []).then(d => setTasks(Array.isArray(d)?d:[]));
  }, []);

  const save = (t) => { setTasks(t); DB.set("school-tasks", t); };
  const add = () => {
    if (!form.title.trim()) { alert("أدخل عنوان المهمة"); return; }
    save([{ ...form, id: Date.now(), status:"لم تبدأ", createdAt: new Date().toLocaleDateString("ar-SA") }, ...tasks]);
    setForm({ title:"", assignedTo:"", dueDate:"", priority:"عادي", notes:"" }); setShowForm(false);
  };
  const updateStatus = (id, status) => save(tasks.map(t => t.id===id ? {...t,status} : t));
  const del = (id) => save(tasks.filter(t => t.id!==id));

  const statuses = ["لم تبدأ","جارية","مكتملة","متأخرة"];
  const statusColors = {"لم تبدأ":"bg-gray-100 text-gray-600","جارية":"bg-blue-100 text-blue-700","مكتملة":"bg-green-100 text-green-700","متأخرة":"bg-red-100 text-red-700"};
  const priorityColors = {"عادي":"bg-gray-50 border-gray-200","مهم":"bg-amber-50 border-amber-200","عاجل":"bg-red-50 border-red-200"};
  const filtered = filter==="الكل" ? tasks : tasks.filter(t=>t.status===filter);

  return (
    <div>
      <div className="page-header-bar mb-6" style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)"}}>
        <h2 className="text-2xl font-black">✅ تتبع المهام والتكليفات</h2>
        <p className="opacity-80 text-sm mt-1">وزّع المهام وتابع إنجازها</p>
      </div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {["الكل",...statuses].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={"px-3 py-1.5 rounded-xl text-xs font-bold border " + (filter===s?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-600 border-gray-200")}>
              {s} {s!=="الكل" && "("+tasks.filter(t=>t.status===s).length+")"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700">
          {showForm?"✕ إلغاء":"+ مهمة جديدة"}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100 mb-5">
          <div className="space-y-3">
            <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="عنوان المهمة"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select value={form.assignedTo} onChange={e => setForm(f=>({...f,assignedTo:e.target.value}))}
                className="px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm">
                <option value="">تعيين إلى...</option>
                {teachers.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))}
                className="px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm" />
              <select value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}
                className="px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm">
                <option>عادي</option><option>مهم</option><option>عاجل</option>
              </select>
            </div>
            <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={2}
              placeholder="ملاحظات إضافية..." className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm resize-none" />
            <button onClick={add} className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700">+ إضافة المهمة</button>
          </div>
        </div>
      )}
      {filtered.length===0 && <div className={cx.empty}><div className="text-4xl mb-2">✅</div><p className="font-bold">لا توجد مهام</p></div>}
      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} className={"bg-white rounded-2xl p-4 shadow-sm border-2 " + (priorityColors[t.priority]||"bg-white border-gray-100")}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className={"font-black text-gray-800 text-sm " + (t.status==="مكتملة"?"line-through text-gray-400":"")}>{t.title}</h3>
                  <span className={"text-xs px-2 py-0.5 rounded-full font-bold " + (statusColors[t.status]||"")}>{t.status}</span>
                  {t.priority!=="عادي" && <span className={"text-xs px-2 py-0.5 rounded-full font-bold " + (t.priority==="عاجل"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700")}>{t.priority}</span>}
                </div>
                <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                  {t.assignedTo && <span>👤 {t.assignedTo}</span>}
                  {t.dueDate && <span>📅 {t.dueDate}</span>}
                  <span>🕐 {t.createdAt}</span>
                </div>
                {t.notes && <p className="text-xs text-gray-500 mt-1">{t.notes}</p>}
              </div>
              <div className="flex gap-1 flex-wrap">
                <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                  className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none">
                  {statuses.map(s=><option key={s}>{s}</option>)}
                </select>
                <button onClick={() => del(t.id)} className="text-xs text-red-400 font-bold px-2 py-1.5 rounded-lg hover:bg-red-50">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== إحصائيات الغياب =====
function AbsenceStatsPage({ teachers, attendance, week, weekArchive }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [viewMode, setViewMode] = useState("overview"); // overview | teacher

  // دمج كل الأسابيع (الحالي + المؤرشفة)
  const allWeeks = [
    { id: "current", week, attendance, label: weekLabel(week) + " (الحالي)" },
    ...(weekArchive || []).map(w => ({ id: w.id, week: w.week, attendance: w.attendance, label: weekLabel(w.week) }))
  ];

  // حساب إحصائيات كل معلم عبر كل الأسابيع
  const teacherStats = teachers.map((name, ti) => {
    let totalDays = 0, absent = 0, lateMorn = 0, latePeriod = 0, lateMins = 0;
    const weeklyData = [];

    allWeeks.forEach(({ week: w, attendance: att, label }) => {
      let wAbsent=0, wLateMorn=0, wLatePeriod=0, wPresent=0, wMins=0;
      w.days.forEach((day, di) => {
        const r = att[ti]?.[di] || {};
        const st = r.status || "حاضر";
        totalDays++;
        if (st === "غائب") { absent++; wAbsent++; }
        else if (st === "متأخر") {
          const mins = parseInt(r.lateMinutes) || 0;
          lateMins += mins; wMins += mins;
          if (r.lateType === "حصص") { latePeriod++; wLatePeriod++; }
          else { lateMorn++; wLateMorn++; }
        } else { wPresent++; }
      });
      weeklyData.push({ label, absent: wAbsent, late: wLateMorn+wLatePeriod, present: wPresent, days: w.days.length });
    });

    const present = totalDays - absent - lateMorn - latePeriod;
    const rate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 100;
    return { name, totalDays, absent, lateMorn, latePeriod, lateMins, present, rate, weeklyData };
  }).sort((a,b) => a.rate - b.rate);

  const totalAbsences = teacherStats.reduce((s,t)=>s+t.absent,0);
  const totalLate = teacherStats.reduce((s,t)=>s+t.lateMorn+t.latePeriod,0);
  const avgRate = teacherStats.length > 0 ? Math.round(teacherStats.reduce((s,t)=>s+t.rate,0)/teacherStats.length) : 100;
  const topPerformers = [...teacherStats].sort((a,b)=>b.rate-a.rate).slice(0,3);
  const atRisk = teacherStats.filter(t=>t.absent>=3||t.rate<80);

  const st = selectedTeacher ? teacherStats.find(t=>t.name===selectedTeacher) : null;

  return (
    <div dir="rtl">
      {/* رأس الصفحة */}
      <div className="rounded-3xl overflow-hidden mb-6 shadow-xl" style={{background:"linear-gradient(135deg,#1e3a5f,#dc2626)"}}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-black mb-1">📊 التحليل الإحصائي للأداء</h2>
          <p className="opacity-80 text-sm">تحليل شامل لحضور وغياب المعلمين — {allWeeks.length} أسبوع مسجل</p>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              {label:"نسبة الحضور الكلية", value:avgRate+"%", icon:"✅", color:"#22c55e"},
              {label:"إجمالي الغياب", value:totalAbsences, icon:"❌", color:"#ef4444"},
              {label:"إجمالي التأخر", value:totalLate, icon:"⚠️", color:"#f59e0b"},
              {label:"في خطر", value:atRisk.length, icon:"🔴", color:"#f97316"},
            ].map(s=>(
              <div key={s.label} className="bg-white bg-opacity-10 rounded-2xl p-3 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-black" style={{color:s.color}}>{s.value}</div>
                <div className="text-xs opacity-70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* تبويب العرض */}
      <div className="flex gap-2 mb-6">
        {[{id:"overview",label:"نظرة عامة",icon:"📈"},{id:"teacher",label:"تحليل لكل معلم",icon:"👨‍🏫"}].map(t=>(
          <button key={t.id} onClick={()=>setViewMode(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all ${viewMode===t.id?"bg-blue-600 text-white shadow-lg":"bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ===== نظرة عامة ===== */}
      {viewMode === "overview" && (
        <div className="space-y-6">
          {/* المعلمون في خطر */}
          {atRisk.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
              <h3 className="font-black text-red-800 mb-3 flex items-center gap-2">🔴 تنبيه — معلمون يحتاجون متابعة ({atRisk.length})</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {atRisk.map(t=>(
                  <div key={t.name} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between border border-red-100">
                    <span className="font-bold text-gray-800 text-sm">{t.name}</span>
                    <div className="flex gap-2 text-xs">
                      {t.absent>0&&<span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{t.absent} غياب</span>}
                      {(t.lateMorn+t.latePeriod)>0&&<span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{t.lateMorn+t.latePeriod} تأخر</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نجوم الأسبوع */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <h3 className="font-black text-green-800 mb-3">🏆 الأكثر التزاماً</h3>
            <div className="flex gap-3 flex-wrap">
              {topPerformers.map((t,i)=>(
                <div key={t.name} className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-green-100">
                  <span className="text-xl">{i===0?"🥇":i===1?"🥈":"🥉"}</span>
                  <div><div className="font-black text-gray-800 text-sm">{t.name}</div>
                    <div className="text-xs text-green-700 font-bold">{t.rate}% حضور</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* الرسم البياني الرئيسي */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-800 mb-4">📊 نسبة الحضور لكل معلم</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {teacherStats.map(t=>{
                const rateColor = t.rate>=95?"#22c55e":t.rate>=85?"#84cc16":t.rate>=75?"#f59e0b":"#ef4444";
                const bgColor = t.rate>=95?"#dcfce7":t.rate>=85?"#ecfccb":t.rate>=75?"#fef3c7":"#fee2e2";
                return (
                  <div key={t.name} className="cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={()=>{setSelectedTeacher(t.name);setViewMode("teacher");}}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[55%]">{t.name}</span>
                      <div className="flex items-center gap-2 text-xs">
                        {t.absent>0&&<span className="text-red-600 font-bold">{t.absent}❌</span>}
                        {(t.lateMorn+t.latePeriod)>0&&<span className="text-amber-600 font-bold">{t.lateMorn+t.latePeriod}⚠️</span>}
                        <span className="font-black px-2 py-0.5 rounded-full text-xs" style={{background:bgColor,color:rateColor}}>{t.rate}%</span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full" style={{background:"#f3f4f6"}}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{width:t.rate+"%", background:`linear-gradient(to left, ${rateColor}, ${rateColor}88)`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-gray-500 flex-wrap">
              {[{c:"#22c55e",l:"ممتاز ≥95%"},{c:"#84cc16",l:"جيد ≥85%"},{c:"#f59e0b",l:"متوسط ≥75%"},{c:"#ef4444",l:"ضعيف <75%"}].map(x=>(
                <span key={x.l} className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:x.c}}></span>{x.l}</span>
              ))}
            </div>
          </div>

          {/* جدول تفصيلي */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-800">📋 جدول تفاصيل المعلمين</h3>
              <span className="text-xs text-gray-400">{allWeeks.length} أسبوع</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-black text-gray-500">المعلم</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-red-600">غياب</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-amber-600">تأخر ص</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-orange-600">تأخر ح</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-gray-500">دقائق</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-green-600">الحضور</th>
                    <th className="px-3 py-3 text-center text-xs font-black text-blue-600">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {[...teacherStats].sort((a,b)=>b.absent-a.absent).map((t,i)=>{
                    const rateColor=t.rate>=95?"bg-green-100 text-green-700":t.rate>=85?"bg-lime-100 text-lime-700":t.rate>=75?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700";
                    return (
                      <tr key={t.name} className={(i%2===0?"":"bg-gray-50")+" hover:bg-blue-50 cursor-pointer"}
                        onClick={()=>{setSelectedTeacher(t.name);setViewMode("teacher");}}>
                        <td className="px-4 py-3 font-bold text-gray-800 text-sm">{t.name}</td>
                        <td className="px-3 py-3 text-center font-black text-red-600">{t.absent||"—"}</td>
                        <td className="px-3 py-3 text-center font-black text-amber-600">{t.lateMorn||"—"}</td>
                        <td className="px-3 py-3 text-center font-black text-orange-600">{t.latePeriod||"—"}</td>
                        <td className="px-3 py-3 text-center text-gray-500 text-xs">{t.lateMins>0?t.lateMins+"د":"—"}</td>
                        <td className="px-3 py-3 text-center font-black text-green-600">{t.present}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={"text-xs font-black px-2 py-1 rounded-full "+rateColor}>{t.rate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== تحليل معلم محدد ===== */}
      {viewMode === "teacher" && (
        <div className="space-y-5">
          {/* اختيار معلم */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="text-xs font-bold text-gray-500 mb-2 block">اختر معلماً للتحليل التفصيلي</label>
            <div className="flex gap-2 flex-wrap">
              <select value={selectedTeacher||""} onChange={e=>setSelectedTeacher(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm"
                style={{fontFamily:"inherit"}}>
                <option value="">— اختر معلماً —</option>
                {teachers.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={()=>setViewMode("overview")}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200">
                ← العودة
              </button>
            </div>
          </div>

          {st && (
            <>
              {/* بطاقة ملخص المعلم */}
              <div className="rounded-2xl overflow-hidden shadow-xl" style={{background:"linear-gradient(135deg,#1e3a5f,#2563eb)"}}>
                <div className="p-5 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-black">
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{st.name}</h3>
                      <p className="opacity-70 text-sm">{st.totalDays} يوم مسجل — {allWeeks.length} أسبوع</p>
                    </div>
                    <div className="mr-auto text-center">
                      <div className="text-4xl font-black" style={{color:st.rate>=95?"#86efac":st.rate>=80?"#fde68a":"#fca5a5"}}>{st.rate}%</div>
                      <div className="text-xs opacity-70">نسبة الحضور</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      {label:"أيام الحضور",value:st.present,color:"#86efac"},
                      {label:"الغياب",value:st.absent,color:"#fca5a5"},
                      {label:"تأخر صباحي",value:st.lateMorn,color:"#fde68a"},
                      {label:"تأخر حصص",value:st.latePeriod,color:"#fb923c"},
                    ].map(s=>(
                      <div key={s.label} className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
                        <div className="text-xl font-black" style={{color:s.color}}>{s.value}</div>
                        <div className="text-xs opacity-70 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* شريط الحضور المرئي */}
                <div className="h-3 flex">
                  <div style={{width:st.totalDays>0?(st.present/st.totalDays*100)+"%":"0%",background:"#22c55e"}}/>
                  <div style={{width:st.totalDays>0?((st.lateMorn+st.latePeriod)/st.totalDays*100)+"%":"0%",background:"#f59e0b"}}/>
                  <div style={{width:st.totalDays>0?(st.absent/st.totalDays*100)+"%":"0%",background:"#ef4444"}}/>
                </div>
              </div>

              {/* مخطط الأسابيع */}
              {st.weeklyData.length > 1 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-800 mb-4">📅 الأداء الأسبوعي</h3>
                  <div className="space-y-3">
                    {st.weeklyData.map((w,i)=>{
                      const rate = w.days>0?Math.round((w.present/w.days)*100):100;
                      const color = rate>=100?"#22c55e":rate>=80?"#84cc16":rate>=60?"#f59e0b":"#ef4444";
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 font-bold truncate max-w-[65%]">{w.label}</span>
                            <div className="flex gap-1 text-xs">
                              {w.absent>0&&<span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">{w.absent}❌</span>}
                              {w.late>0&&<span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">{w.late}⚠️</span>}
                              <span className="font-black" style={{color}}>{rate}%</span>
                            </div>
                          </div>
                          <div className="h-2.5 rounded-full" style={{background:"#f3f4f6"}}>
                            <div className="h-full rounded-full transition-all" style={{width:rate+"%",background:color}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* دقائق التأخر */}
              {st.lateMins > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <h3 className="font-black text-amber-800 mb-2">⏱️ إجمالي دقائق التأخر</h3>
                  <div className="text-3xl font-black text-amber-700">{st.lateMins} <span className="text-base font-bold">دقيقة</span></div>
                  <div className="text-xs text-amber-600 mt-1">= {Math.floor(st.lateMins/60)} ساعة و {st.lateMins%60} دقيقة</div>
                </div>
              )}
            </>
          )}

          {!st && selectedTeacher === null && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-2">👨‍🏫</div>
              <p className="font-black text-gray-600">اختر معلماً من القائمة أعلاه لعرض تحليله التفصيلي</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== صفحة تحليل الحضور والانصراف =====
function AttendanceAnalysisPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [timeFormat, setTimeFormat] = useState("24");
  const [workStart, setWorkStart] = useState("07:00");
  const [workEnd, setWorkEnd] = useState("14:00");
  const [activeTab, setActiveTab] = useState("summary"); // summary | details | chart

  const toMins = (t) => {
    if (!t || t === "-" || t === "00:00") return null;
    const parts = t.split(":");
    if (parts.length < 2) return null;
    const [h, m] = parts.map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const fmtMins = (mins, showSign = false) => {
    if (mins === null || mins === undefined || mins === 0) return "—";
    const sign = showSign && mins > 0 ? "+" : "";
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.abs(mins) % 60;
    if (h > 0 && m > 0) return sign + h + "س " + m + "د";
    if (h > 0) return sign + h + " ساعة";
    return sign + m + " دقيقة";
  };

  const fmtTime = (t) => {
    if (!t || t === "-") return "—";
    if (timeFormat === "12") {
      const [h, m] = t.split(":").map(Number);
      const ampm = h >= 12 ? "م" : "ص";
      const h12 = h % 12 || 12;
      return h12 + ":" + String(m).padStart(2, "0") + " " + ampm;
    }
    return t;
  };

  const getRating = (stats) => {
    const { totalDays, absences, latedays, totalLateMins, earlyDays } = stats;
    if (totalDays === 0) return { label: "لا بيانات", color: "bg-gray-100 text-gray-600", score: 0, icon: "❓" };
    const absenceRate = absences / totalDays;
    const lateRate = latedays / totalDays;
    const avgLate = totalDays > 0 ? totalLateMins / totalDays : 0;
    let score = 100;
    score -= absenceRate * 40;
    score -= lateRate * 20;
    score -= (avgLate / 60) * 15;
    score -= (earlyDays / totalDays) * 15;
    score = Math.max(0, Math.min(100, score));
    if (score >= 90) return { label: "ممتاز", color: "bg-green-100 text-green-800", score: Math.round(score), icon: "🌟" };
    if (score >= 75) return { label: "جيد جداً", color: "bg-teal-100 text-teal-800", score: Math.round(score), icon: "✅" };
    if (score >= 60) return { label: "جيد", color: "bg-blue-100 text-blue-800", score: Math.round(score), icon: "👍" };
    if (score >= 45) return { label: "مقبول", color: "bg-amber-100 text-amber-800", score: Math.round(score), icon: "⚠️" };
    return { label: "يحتاج متابعة", color: "bg-red-100 text-red-800", score: Math.round(score), icon: "🚨" };
  };

  const parseExcel = async (file) => {
    return new Promise(async (resolve) => {
      try {
        const buf = await file.arrayBuffer();
        const data = new Uint8Array(buf);
          const XLSX = window.XLSX;
          const workbook = XLSX.read(data, { type: "array" });
          const ws = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

          let empName = "موظف غير محدد", empId = "", empRole = "", dateRange = "";
          for (let i = 0; i < Math.min(5, rows.length); i++) {
            const cell = rows[i].find(c => typeof c === "string" && c.includes("من:"));
            if (cell) {
              const lines = cell.split("\n");
              const rangeLine = lines.find(l => l.includes("من:")) || "";
              dateRange = rangeLine.trim();
              const infoLine = lines.find(l => l.includes("-") && !l.includes("من:")) || lines[lines.length - 1];
              const parts = infoLine.split("-").map(s => s.trim());
              empName = parts[0] || "موظف";
              empId = parts[1] || "";
              empRole = parts[2] || "";
              break;
            }
          }

          let headerRow = -1;
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].some(c => String(c).includes("التاريخ"))) { headerRow = i; break; }
          }
          if (headerRow === -1) { resolve(null); return; }

          const headers = rows[headerRow];
          const colIdx = {
            date: headers.findIndex(h => String(h).includes("التاريخ")),
            status: headers.findIndex(h => String(h).includes("حالة")),
            arrival: headers.findIndex(h => String(h).includes("توقيت الحضور")),
            departure: headers.findIndex(h => String(h).includes("توقيت الإنصراف") || String(h).includes("توقيت الانصراف")),
            actualHours: headers.findIndex(h => String(h).includes("الفعلي")),
          };

          const wsMinutes = toMins(workStart) || 7 * 60;
          const weMinutes = toMins(workEnd) || 14 * 60;
          const records = [];

          for (let i = headerRow + 1; i < rows.length; i++) {
            const row = rows[i];
            const dateVal = String(row[colIdx.date] || "").trim();
            if (!dateVal || dateVal.includes("المجموع") || dateVal === "") continue;

            const status = String(row[colIdx.status] || "").trim();
            const arrival = String(row[colIdx.arrival] || "").trim();
            const departure = String(row[colIdx.departure] || "").trim();
            const actualHours = String(row[colIdx.actualHours] || "").trim();

            const isWeekend = dateVal.includes("الجمعة") || dateVal.includes("السبت");
            const isAbsent = status.includes("غياب");
            const isPermission = status.includes("إذن") || status.includes("استئذان") || status.includes("إجازة");
            const isAutoDepart = status.includes("تلقائي");
            const isComplete = status.includes("مكتملة");

            const arrivalMins = toMins(arrival);
            const departureMins = toMins(departure);

            // تأخر الصباح = وقت الحضور - وقت بدء الدوام
            const lateMins = (arrivalMins !== null && !isAbsent && !isWeekend)
              ? Math.max(0, arrivalMins - wsMinutes) : 0;

            // للانصراف التلقائي: النظام يضيف 14 ساعة على وقت الحضور
            // وقت الخروج الحقيقي = وقت الانصراف التلقائي (لأن النظام وضعه)
            // نحسب: وقت الانصراف التلقائي - وقت نهاية الدوام الرسمي
            const autoExtraMins = (isAutoDepart && departureMins !== null && !isAbsent && !isWeekend)
              ? Math.max(0, departureMins - weMinutes) : 0;

            // الانصراف المبكر = أقل من وقت نهاية الدوام (للأيام المكتملة فقط)
            const earlyDepartMins = (!isAutoDepart && !isAbsent && !isWeekend && departureMins !== null && departureMins < weMinutes)
              ? weMinutes - departureMins : 0;

            // تصنيف اليوم
            let dayType = "present";
            if (isWeekend) dayType = "weekend";
            else if (isAbsent) dayType = "absent";
            else if (isPermission) dayType = "permission";
            else if (isAutoDepart) dayType = "auto";
            else if (isComplete) dayType = "complete";

            records.push({
              date: dateVal, status, arrival, departure, actualHours,
              isWeekend, isAbsent, isPermission, isAutoDepart, isComplete,
              lateMins, earlyDepartMins, autoExtraMins,
              arrivalMins, departureMins, dayType,
            });
          }

          const workdays = records.filter(r => !r.isWeekend);
          const presentDays = workdays.filter(r => !r.isAbsent);
          const absenceDays = workdays.filter(r => r.isAbsent);
          const lateDays = workdays.filter(r => r.lateMins > 0);
          const earlyDays = workdays.filter(r => r.earlyDepartMins > 0);
          const autoDays = workdays.filter(r => r.isAutoDepart);
          const permDays = workdays.filter(r => r.isPermission);
          const totalLateMins = lateDays.reduce((s, r) => s + r.lateMins, 0);
          const totalEarlyMins = earlyDays.reduce((s, r) => s + r.earlyDepartMins, 0);
          const totalAutoExtraMins = autoDays.reduce((s, r) => s + r.autoExtraMins, 0);

          const stats = {
            totalDays: workdays.length,
            presentDays: presentDays.length,
            absences: absenceDays.length,
            permissions: permDays.length,
            latedays: lateDays.length,
            totalLateMins,
            avgLateMins: lateDays.length > 0 ? Math.round(totalLateMins / lateDays.length) : 0,
            earlyDays: earlyDays.length,
            totalEarlyMins,
            autoDeparts: autoDays.length,
            totalAutoExtraMins,
            avgAutoExtraMins: autoDays.length > 0 ? Math.round(totalAutoExtraMins / autoDays.length) : 0,
            attendanceRate: workdays.length > 0 ? Math.round((presentDays.length / workdays.length) * 100) : 0,
          };

          resolve({ empName, empId, empRole, dateRange, records, stats });
        } catch (err) { console.error(err); resolve(null); }
      });
  };

  const handleFiles = async (files) => {
    setLoading(true);
    await loadXLSX();
    const results = [];
    for (const file of files) {
      const emp = await parseExcel(file);
      if (emp) results.push(emp);
    }
    setEmployees(results);
    setSelectedEmp(results[0] || null);
    setLoading(false);
  };

  const printReport = (emp) => {
    const rating = getRating(emp.stats);
    const ratingBar = (val, max, color) =>
      `<div style="background:#f0f0f0;border-radius:4px;height:10px;width:100%;margin-top:4px">
        <div style="background:${color};height:10px;border-radius:4px;width:${Math.min(100,Math.round(val/max*100))}%"></div>
      </div>`;

    printWindow(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"/>
    <title>تقرير حضور ${emp.empName}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;padding:20px;font-size:11px;color:#111;}
      .header{background:linear-gradient(135deg,#0d9488,#065f46);color:white;padding:16px 20px;border-radius:10px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;}
      .header h1{font-size:16px;font-weight:800;} .header p{opacity:.8;font-size:11px;margin-top:2px;}
      .rating-badge{background:rgba(255,255,255,.2);padding:8px 14px;border-radius:8px;text-align:center;}
      .rating-badge .score{font-size:24px;font-weight:900;} .rating-badge .lbl{font-size:10px;opacity:.9;}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
      .stat{border:1.5px solid #e5e7eb;border-radius:8px;padding:8px;text-align:center;}
      .stat .val{font-size:18px;font-weight:900;} .stat .lbl{font-size:9px;color:#666;margin-top:1px;}
      .stat.red{border-color:#fca5a5;background:#fff1f2;} .stat.red .val{color:#dc2626;}
      .stat.amber{border-color:#fcd34d;background:#fffbeb;} .stat.amber .val{color:#d97706;}
      .stat.green{border-color:#6ee7b7;background:#f0fdf4;} .stat.green .val{color:#059669;}
      .stat.blue{border-color:#93c5fd;background:#eff6ff;} .stat.blue .val{color:#2563eb;}
      .stat.orange{border-color:#fdba74;background:#fff7ed;} .stat.orange .val{color:#ea580c;}
      .section{margin-bottom:14px;}
      .section-title{font-weight:800;font-size:12px;color:#0d9488;border-right:3px solid #0d9488;padding-right:8px;margin-bottom:8px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#0d9488;color:white;padding:6px 4px;font-size:9px;font-weight:700;text-align:center;}
      td{padding:5px 4px;text-align:center;font-size:10px;border-bottom:1px solid #f0f0f0;}
      .row-absent td{background:#fff1f2;color:#991b1b;}
      .row-late td{background:#fffbeb;}
      .row-auto td{background:#eff6ff;}
      .row-weekend td{background:#f9fafb;color:#9ca3af;}
      .badge{display:inline-block;padding:1px 5px;border-radius:8px;font-size:9px;font-weight:700;}
      .b-absent{background:#fee2e2;color:#991b1b;} .b-late{background:#fef3c7;color:#92400e;}
      .b-ok{background:#d1fae5;color:#065f46;} .b-auto{background:#dbeafe;color:#1e40af;}
      .b-weekend{background:#f3f4f6;color:#6b7280;} .b-early{background:#ffedd5;color:#c2410c;}
      .footer{margin-top:16px;text-align:center;font-size:9px;color:#9ca3af;border-top:1px dashed #ccc;padding-top:8px;}
      @media print{body{padding:8px;}}
    </style></head><body>

    <div class="header">
      <div>
        <h1>🏫 تقرير الحضور والانصراف</h1>
        <p>مدرسة عبيدة بن الحارث المتوسطة</p>
        <p style="margin-top:6px;font-size:13px;font-weight:700;">${emp.empName}</p>
        <p>${emp.empId}${emp.empRole ? " — " + emp.empRole : ""}</p>
        <p style="margin-top:2px;opacity:.7;">${emp.dateRange}</p>
      </div>
      <div class="rating-badge">
        <div>${rating.icon}</div>
        <div class="score">${rating.score}%</div>
        <div class="lbl">${rating.label}</div>
      </div>
    </div>

    <div class="stats">
      <div class="stat green"><div class="val">${emp.stats.attendanceRate}%</div><div class="lbl">نسبة الحضور</div></div>
      <div class="stat"><div class="val">${emp.stats.totalDays}</div><div class="lbl">أيام الدوام</div></div>
      <div class="stat green"><div class="val">${emp.stats.presentDays}</div><div class="lbl">أيام الحضور</div></div>
      <div class="stat red"><div class="val">${emp.stats.absences}</div><div class="lbl">أيام الغياب</div></div>
      <div class="stat amber"><div class="val">${emp.stats.latedays}</div><div class="lbl">أيام التأخر</div></div>
      <div class="stat amber"><div class="val">${emp.stats.totalLateMins}د</div><div class="lbl">إجمالي دقائق التأخر</div></div>
      <div class="stat amber"><div class="val">${emp.stats.avgLateMins}د</div><div class="lbl">متوسط التأخر</div></div>
      <div class="stat blue"><div class="val">${emp.stats.autoDeparts}</div><div class="lbl">انصراف تلقائي</div></div>
      <div class="stat orange"><div class="val">${emp.stats.earlyDays}</div><div class="lbl">انصراف مبكر</div></div>
      <div class="stat orange"><div class="val">${emp.stats.totalEarlyMins}د</div><div class="lbl">إجمالي الانصراف المبكر</div></div>
      <div class="stat blue"><div class="val">${emp.stats.totalAutoExtraMins > 0 ? Math.floor(emp.stats.totalAutoExtraMins/60)+"س" : "0"}</div><div class="lbl">وقت تلقائي إضافي</div></div>
      <div class="stat"><div class="val">${emp.stats.permissions}</div><div class="lbl">الاستئذانات</div></div>
    </div>

    <div class="section">
      <div class="section-title">السجل التفصيلي اليومي</div>
      <table>
        <tr>
          <th>#</th><th>التاريخ</th><th>الحالة</th>
          <th>توقيت الحضور</th><th>تأخر الصباح</th>
          <th>توقيت الانصراف</th><th>الانصراف التلقائي (إضافي)</th>
          <th>انصراف مبكر</th><th>ساعات الدوام الفعلي</th>
        </tr>
        ${emp.records.map((r, i) => {
          let cls = "";
          if (r.isWeekend) cls = "row-weekend";
          else if (r.isAbsent) cls = "row-absent";
          else if (r.isAutoDepart) cls = "row-auto";
          else if (r.lateMins > 0) cls = "row-late";

          let badgeCls = "b-ok";
          if (r.isWeekend) badgeCls = "b-weekend";
          else if (r.isAbsent) badgeCls = "b-absent";
          else if (r.isAutoDepart) badgeCls = "b-auto";
          else if (r.lateMins > 0) badgeCls = "b-late";
          else if (r.earlyDepartMins > 0) badgeCls = "b-early";

          const lateCell = r.lateMins > 0 ? `<span style="color:#d97706;font-weight:700">${r.lateMins}د</span>` : (r.isAbsent||r.isWeekend?"—":"✅");
          const autoCell = r.isAutoDepart && r.autoExtraMins > 0 ? `<span style="color:#2563eb;font-weight:700">${Math.floor(r.autoExtraMins/60)}س${r.autoExtraMins%60>0?" "+r.autoExtraMins%60+"د":""} إضافي</span>` : "—";
          const earlyCell = r.earlyDepartMins > 0 ? `<span style="color:#ea580c;font-weight:700">${r.earlyDepartMins}د مبكر</span>` : "—";

          return `<tr class="${cls}">
            <td>${i+1}</td>
            <td style="text-align:right;padding-right:6px">${r.date}</td>
            <td><span class="badge ${badgeCls}">${r.status}</span></td>
            <td>${r.arrival}</td><td>${lateCell}</td>
            <td>${r.departure}</td><td>${autoCell}</td>
            <td>${earlyCell}</td><td>${r.actualHours}</td>
          </tr>`;
        }).join("")}
      </table>
    </div>
    <div class="footer">تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} — وقت بدء الدوام: ${workStart} — وقت الانتهاء: ${workEnd}</div>
    </body></html>`);
  };

  const emp = selectedEmp;
  const rating = emp ? getRating(emp.stats) : null;

  const StatCard = ({ icon, label, value, color, sub }) => (
    <div className={"rounded-2xl p-4 border-2 text-center " + color}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-black">{value}</div>
      <div className="text-xs font-bold opacity-70 mt-0.5">{label}</div>
      {sub && <div className="text-xs opacity-50 mt-0.5">{sub}</div>}
    </div>
  );

  return (
    <div>
      <div className="page-header-bar mb-5" style={{background:"linear-gradient(135deg,#0369a1,#1e3a5f)"}}>
        <h2 className="text-2xl font-black">📊 تحليل الحضور والانصراف</h2>
        <p className="opacity-80 text-sm mt-1">تقرير شامل ودقيق لحضور الموظف</p>
      </div>

      {/* إعدادات الدوام */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-black text-gray-500 mb-3">⚙️ إعدادات أوقات الدوام</p>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className={cx.label}>⏰ بداية الدوام</label>
            <input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm font-bold" />
          </div>
          <div>
            <label className={cx.label}>🏁 نهاية الدوام الرسمي</label>
            <input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm font-bold" />
          </div>
          <div>
            <label className={cx.label}>🕐 صيغة الوقت</label>
            <select value={timeFormat} onChange={e => setTimeFormat(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm font-bold bg-white">
              <option value="24">24 ساعة</option>
              <option value="12">12 ساعة (ص/م)</option>
            </select>
          </div>
          <div className="text-xs text-blue-600 bg-blue-50 rounded-xl px-3 py-2 font-bold">
            💡 الانصراف التلقائي = النظام يضيف 14س على وقت الحضور<br/>
            الوقت الإضافي = وقت الانصراف التلقائي − نهاية الدوام الرسمي
          </div>
        </div>
      </div>

      {/* رفع الملفات */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="text-4xl mb-2">📥</div>
            <p className="font-black text-gray-700 mb-1">ارفع ملف Excel للحضور والانصراف</p>
            <p className="text-xs text-gray-400 mb-3">يمكن رفع أكثر من ملف لتحليل عدة موظفين</p>
            <span className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">اختر الملفات (.xlsx)</span>
            <input type="file" accept=".xlsx,.xls" multiple className="hidden"
              onChange={e => handleFiles(Array.from(e.target.files))} />
          </div>
        </label>
        {loading && <div className="text-center mt-3 text-blue-600 font-bold animate-pulse">⏳ جاري تحليل البيانات...</div>}
      </div>

      {/* قائمة الموظفين */}
      {employees.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {employees.map((e, i) => (
            <button key={i} onClick={() => setSelectedEmp(e)}
              className={"px-4 py-2.5 rounded-xl font-bold text-sm border-2 transition-all " +
                (selectedEmp?.empName === e.empName ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:border-blue-300")}>
              👤 {e.empName}
            </button>
          ))}
        </div>
      )}

      {/* التقرير */}
      {emp && rating && (
        <div>
          {/* رأس الموظف */}
          <div className="bg-gradient-to-l from-blue-800 to-blue-950 rounded-2xl p-5 mb-5 text-white">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-black mb-0.5">{emp.empName}</h3>
                <p className="opacity-70 text-sm">{emp.empId}{emp.empRole ? " — " + emp.empRole : ""}</p>
                {emp.dateRange && <p className="opacity-60 text-xs mt-1">{emp.dateRange}</p>}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {/* تقييم المستوى */}
                <div className={`px-5 py-3 rounded-2xl text-center ${rating.color}`}>
                  <div className="text-3xl">{rating.icon}</div>
                  <div className="text-2xl font-black">{rating.score}%</div>
                  <div className="text-xs font-black mt-0.5">{rating.label}</div>
                </div>
                {/* نسبة الحضور */}
                <div className="text-center">
                  <div className="text-4xl font-black text-green-300">{emp.stats.attendanceRate}%</div>
                  <div className="text-xs opacity-70">نسبة الحضور</div>
                  <div className="w-24 h-2 bg-white bg-opacity-20 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-green-400 transition-all" style={{width: emp.stats.attendanceRate+"%"}}/>
                  </div>
                </div>
                <button onClick={() => printReport(emp)}
                  className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-black text-sm hover:bg-blue-50">
                  🖨️ طباعة
                </button>
              </div>
            </div>
          </div>

          {/* بطاقات الإحصاء */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
            <StatCard icon="📅" label="أيام الدوام" value={emp.stats.totalDays} color="bg-blue-50 text-blue-700 border-blue-200" />
            <StatCard icon="✅" label="أيام الحضور" value={emp.stats.presentDays} color="bg-green-50 text-green-700 border-green-200" />
            <StatCard icon="❌" label="أيام الغياب" value={emp.stats.absences} color="bg-red-50 text-red-700 border-red-200"
              sub={emp.stats.totalDays > 0 ? Math.round(emp.stats.absences/emp.stats.totalDays*100)+"% من الأيام" : ""} />
            <StatCard icon="🙋" label="الاستئذانات" value={emp.stats.permissions} color="bg-purple-50 text-purple-700 border-purple-200" />
            <StatCard icon="⚠️" label="أيام التأخر" value={emp.stats.latedays} color="bg-amber-50 text-amber-700 border-amber-200" />
            <StatCard icon="⏱️" label="إجمالي دقائق التأخر" value={emp.stats.totalLateMins + "د"} color="bg-amber-50 text-amber-700 border-amber-200"
              sub={"متوسط " + emp.stats.avgLateMins + "د/يوم"} />
            <StatCard icon="🔄" label="انصراف تلقائي" value={emp.stats.autoDeparts} color="bg-blue-50 text-blue-700 border-blue-200"
              sub={"وقت إضافي: " + fmtMins(emp.stats.totalAutoExtraMins)} />
            <StatCard icon="🏃" label="انصراف مبكر" value={emp.stats.earlyDays} color="bg-orange-50 text-orange-700 border-orange-200"
              sub={emp.stats.totalEarlyMins + "د إجمالي"} />
          </div>

          {/* تبويبات */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[{id:"summary",label:"📈 ملخص بصري"},{id:"details",label:"📋 السجل التفصيلي"},{id:"auto",label:"🔄 الانصراف التلقائي"}].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={"px-4 py-2.5 rounded-xl font-bold text-sm border-2 transition-all " +
                  (activeTab===t.id?"bg-blue-600 text-white border-blue-600":"bg-white text-gray-600 border-gray-200 hover:border-blue-300")}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ملخص بصري */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              {/* شريط الحضور */}
              <div className={cx.card}>
                <h4 className="font-black text-gray-800 mb-4">📊 توزيع أيام الدوام</h4>
                <div className="space-y-3">
                  {[
                    { label: "أيام الحضور", val: emp.stats.presentDays, total: emp.stats.totalDays, color: "bg-green-500", textColor: "text-green-700" },
                    { label: "أيام الغياب", val: emp.stats.absences, total: emp.stats.totalDays, color: "bg-red-500", textColor: "text-red-700" },
                    { label: "أيام التأخر", val: emp.stats.latedays, total: emp.stats.presentDays, color: "bg-amber-500", textColor: "text-amber-700" },
                    { label: "انصراف تلقائي", val: emp.stats.autoDeparts, total: emp.stats.presentDays, color: "bg-blue-500", textColor: "text-blue-700" },
                    { label: "انصراف مبكر", val: emp.stats.earlyDays, total: emp.stats.presentDays, color: "bg-orange-500", textColor: "text-orange-700" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className={"text-xs font-bold " + item.textColor}>{item.label}</span>
                        <span className={"text-xs font-black " + item.textColor}>{item.val} ({item.total > 0 ? Math.round(item.val/item.total*100) : 0}%)</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={"h-full rounded-full transition-all " + item.color}
                          style={{width: (item.total > 0 ? Math.min(100, item.val/item.total*100) : 0)+"%"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ملخص التأخر والانصراف */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                  <h4 className="font-black text-amber-800 mb-3">⏱️ تفاصيل التأخر الصباحي</h4>
                  {emp.stats.latedays === 0
                    ? <p className="text-green-600 font-bold text-sm">✅ لا يوجد تأخر مسجّل</p>
                    : <div>
                        {/* جدول الأيام المتأخرة */}
                        <div className="overflow-x-auto mb-4 rounded-xl border border-amber-200">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-amber-500 text-white">
                                <th className="px-3 py-2 text-right font-black">#</th>
                                <th className="px-3 py-2 text-right font-black whitespace-nowrap">التاريخ</th>
                                <th className="px-3 py-2 text-center font-black whitespace-nowrap">من (الحضور)</th>
                                <th className="px-3 py-2 text-center font-black whitespace-nowrap">إلى (بداية الدوام)</th>
                                <th className="px-3 py-2 text-center font-black whitespace-nowrap">دقائق التأخر</th>
                              </tr>
                            </thead>
                            <tbody>
                              {emp.records.filter(r => r.lateMins > 0).map((r, i) => (
                                <tr key={i} className={i%2===0?"bg-amber-50":"bg-white"}>
                                  <td className="px-3 py-2 text-right font-black text-amber-700">{i+1}</td>
                                  <td className="px-3 py-2 text-right font-bold text-gray-700 whitespace-nowrap">{r.date}</td>
                                  <td className="px-3 py-2 text-center font-black text-amber-600">{fmtTime(r.arrival)}</td>
                                  <td className="px-3 py-2 text-center font-bold text-gray-500">{fmtTime(workStart)}</td>
                                  <td className="px-3 py-2 text-center">
                                    <span className="bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">{r.lateMins} د</span>
                                  </td>
                                </tr>
                              ))}
                              {/* صف المجموع */}
                              <tr className="bg-amber-600 text-white font-black">
                                <td colSpan={4} className="px-3 py-2 text-right">المجموع</td>
                                <td className="px-3 py-2 text-center">{emp.stats.totalLateMins} دقيقة</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        {/* الإحصاء */}
                        <div className="space-y-2 text-sm border-t border-amber-100 pt-3">
                          <div className="flex justify-between"><span className="text-gray-500">أيام التأخر:</span><span className="font-black text-amber-700">{emp.stats.latedays} يوم</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">إجمالي الدقائق:</span><span className="font-black text-amber-700">{emp.stats.totalLateMins} دقيقة</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">متوسط التأخر:</span><span className="font-black text-amber-700">{emp.stats.avgLateMins} دقيقة/يوم</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">معدل التأخر:</span><span className="font-black text-amber-700">{Math.round(emp.stats.latedays/emp.stats.totalDays*100)}% من أيام الدوام</span></div>
                        </div>
                      </div>
                  }
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
                  <h4 className="font-black text-blue-800 mb-3">🔄 تفاصيل الانصراف التلقائي</h4>
                  {emp.stats.autoDeparts === 0
                    ? <p className="text-green-600 font-bold text-sm">✅ لا يوجد انصراف تلقائي</p>
                    : <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">عدد الأيام:</span><span className="font-black text-blue-700">{emp.stats.autoDeparts} يوم</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">الوقت الإضافي المجمّع:</span><span className="font-black text-blue-700">{fmtMins(emp.stats.totalAutoExtraMins)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">متوسط الوقت الإضافي:</span><span className="font-black text-blue-700">{fmtMins(emp.stats.avgAutoExtraMins)}/يوم</span></div>
                        <div className="text-xs text-blue-500 mt-2 bg-blue-50 rounded-lg p-2">💡 الانصراف التلقائي = النظام لم يسجّل خروجاً فعلياً فأضاف 14 ساعة على الحضور. الوقت الإضافي = ما بعد {workEnd}</div>
                      </div>
                  }
                </div>
              </div>
            </div>
          )}

          {/* السجل التفصيلي */}
          {activeTab === "details" && (
            <div className={cx.cardSm}>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-black text-gray-800">السجل التفصيلي اليومي</h3>
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold">❌ غياب</span>
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">⚠️ تأخر</span>
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">🔄 تلقائي</span>
                  <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-bold">🏃 مبكر</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{background:"linear-gradient(135deg,#1e40af,#1e3a5f)"}} className="text-white">
                      <th className="px-3 py-3 text-right font-black whitespace-nowrap">التاريخ</th>
                      <th className="px-3 py-3 text-center font-black whitespace-nowrap">الحالة</th>
                      <th className="px-3 py-3 text-center font-black whitespace-nowrap">وقت الحضور</th>
                      <th className="px-3 py-3 text-center font-black whitespace-nowrap">تأخر الصباح</th>
                      <th className="px-3 py-3 text-center font-black whitespace-nowrap">وقت الانصراف</th>
                      <th className="px-3 py-3 text-center font-black whitespace-nowrap">وقت تلقائي إضافي</th>
                      <th className="px-3 py-3 text-center font-black whitespace-nowrap">انصراف مبكر</th>
                      <th className="px-3 py-3 text-center font-black whitespace-nowrap">ساعات الدوام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emp.records.map((r, i) => {
                      const rowBg = r.isWeekend ? "bg-gray-50 text-gray-400"
                        : r.isAbsent ? "bg-red-50"
                        : r.isAutoDepart ? "bg-blue-50/40"
                        : r.lateMins > 0 ? "bg-amber-50"
                        : i % 2 === 0 ? "" : "bg-slate-50/50";
                      return (
                        <tr key={i} className={rowBg}>
                          <td className="px-3 py-2.5 text-right font-bold whitespace-nowrap">{r.date}</td>
                          <td className="px-3 py-2.5 text-center">
                            {r.isWeekend ? <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold text-xs">إجازة</span>
                              : r.isAbsent ? <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-xs">غياب</span>
                              : r.isAutoDepart ? <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">تلقائي</span>
                              : r.isPermission ? <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs">استئذان</span>
                              : <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-xs">مكتملة</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold">
                            {r.arrival === "-" ? <span className="text-gray-300">—</span>
                              : <span className={r.lateMins > 0 ? "text-amber-600" : "text-green-600"}>{fmtTime(r.arrival)}</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center font-black">
                            {r.isWeekend || r.isAbsent ? <span className="text-gray-300">—</span>
                              : r.lateMins > 0 ? <span className="text-amber-600">⚠️ {r.lateMins}د</span>
                              : <span className="text-green-500">✅</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold">
                            {r.departure === "-" ? <span className="text-gray-300">—</span>
                              : <span className={r.isAutoDepart ? "text-blue-600" : "text-gray-700"}>{fmtTime(r.departure)}</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center font-black">
                            {r.isAutoDepart && r.autoExtraMins > 0
                              ? <span className="text-blue-600">+{fmtMins(r.autoExtraMins)}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center font-black">
                            {r.earlyDepartMins > 0 ? <span className="text-orange-600">🏃 {r.earlyDepartMins}د</span>
                              : r.isAutoDepart ? <span className="text-blue-400 text-xs">تلقائي</span>
                              : r.isAbsent || r.isWeekend ? <span className="text-gray-300">—</span>
                              : <span className="text-green-500">✅</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-gray-700">{r.actualHours}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تفاصيل الانصراف التلقائي */}
          {activeTab === "auto" && (
            <div>
              <div className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200">
                <p className="font-black text-blue-800 text-sm mb-1">📌 كيف يعمل الانصراف التلقائي؟</p>
                <p className="text-blue-700 text-xs leading-relaxed">
                  عندما لا يُسجَّل انصراف فعلي، يضيف النظام تلقائياً 14 ساعة على وقت الحضور.<br/>
                  مثال: حضور 06:39 → انصراف تلقائي 20:39<br/>
                  الوقت الإضافي = وقت الانصراف التلقائي (20:39) - نهاية الدوام الرسمي ({workEnd}) = {toMins("20:39") !== null ? fmtMins((toMins("20:39") || 0) - (toMins(workEnd) || 0)) : "—"}
                </p>
              </div>
              {emp.stats.autoDeparts === 0
                ? <div className={cx.empty}><div className="text-4xl mb-2">✅</div><p className="font-bold">لا يوجد انصراف تلقائي</p></div>
                : (
                  <div className={cx.cardSm}>
                    <div className="px-5 py-3 bg-blue-600 text-white flex justify-between items-center">
                      <span className="font-black">أيام الانصراف التلقائي ({emp.stats.autoDeparts} يوم)</span>
                      <span className="text-sm opacity-80">الوقت الإضافي الإجمالي: {fmtMins(emp.stats.totalAutoExtraMins)}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="px-4 py-2.5 text-right text-xs font-black text-blue-800">التاريخ</th>
                            <th className="px-4 py-2.5 text-center text-xs font-black text-blue-800">وقت الحضور</th>
                            <th className="px-4 py-2.5 text-center text-xs font-black text-blue-800">وقت الانصراف التلقائي</th>
                            <th className="px-4 py-2.5 text-center text-xs font-black text-blue-800">نهاية الدوام الرسمي</th>
                            <th className="px-4 py-2.5 text-center text-xs font-black text-blue-800">الوقت الإضافي</th>
                            <th className="px-4 py-2.5 text-center text-xs font-black text-blue-800">التأخر الصباحي</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emp.records.filter(r => r.isAutoDepart).map((r, i) => (
                            <tr key={i} className={i%2===0?"":"bg-blue-50/30"}>
                              <td className="px-4 py-2.5 text-right font-bold text-gray-700 whitespace-nowrap">{r.date}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-green-600">{fmtTime(r.arrival)}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-blue-600">{fmtTime(r.departure)}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-gray-500">{fmtTime(workEnd)}</td>
                              <td className="px-4 py-2.5 text-center font-black text-blue-700">
                                {r.autoExtraMins > 0 ? <span className="bg-blue-100 px-2 py-0.5 rounded-full">+{fmtMins(r.autoExtraMins)}</span> : "—"}
                              </td>
                              <td className="px-4 py-2.5 text-center font-black">
                                {r.lateMins > 0 ? <span className="text-amber-600">⚠️ {r.lateMins}د</span> : <span className="text-green-500">✅</span>}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-blue-100 font-black">
                            <td colSpan={4} className="px-4 py-2.5 text-right text-blue-800">الإجمالي</td>
                            <td className="px-4 py-2.5 text-center text-blue-800">+{fmtMins(emp.stats.totalAutoExtraMins)}</td>
                            <td className="px-4 py-2.5 text-center text-amber-700">{emp.records.filter(r=>r.isAutoDepart&&r.lateMins>0).reduce((s,r)=>s+r.lateMins,0)}د</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {employees.length === 0 && !loading && (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-black text-gray-500 text-lg mb-1">ارفع ملف Excel للبدء</p>
          <p className="text-sm">قم برفع تقرير الحضور والانصراف من نظام نور أو أي نظام آخر</p>
        </div>
      )}
    </div>
  );
}

// ===== نظام النوافذ العائمة =====

function FloatingPanelWindow({ panel, onClose, onToggleMin, onMove, onBringFront, children }) {
  const isDragging = useRef(false);
  const dragStart  = useRef({ mx:0, my:0, px:0, py:0 });

  const startDrag = (e) => {
    if (e.target.closest("button,input,select,textarea,label")) return;
    isDragging.current = true;
    dragStart.current = { mx:e.clientX, my:e.clientY, px:panel.x, py:panel.y };
    onBringFront(panel.id);
    const move = (ev) => {
      if (!isDragging.current) return;
      onMove(panel.id, Math.max(0, dragStart.current.px + ev.clientX - dragStart.current.mx), Math.max(0, dragStart.current.py + ev.clientY - dragStart.current.my));
    };
    const up = () => { isDragging.current = false; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div style={{ position:"fixed", left:panel.x, top:panel.y, zIndex:9000, width:panel.minimized?"auto":480, maxWidth:"95vw", maxHeight:panel.minimized?"auto":"85vh", borderRadius:18, boxShadow:"0 20px 60px rgba(0,0,0,.35)", display:"flex", flexDirection:"column", overflow:"hidden", background:"#fff" }} onClick={()=>onBringFront(panel.id)}>
      <div onMouseDown={startDrag} style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)", color:"#fff", padding:"8px 12px", display:"flex", alignItems:"center", gap:8, cursor:"grab", flexShrink:0, borderRadius:panel.minimized?18:"18px 18px 0 0" }}>
        <span style={{fontSize:18}}>{panel.icon}</span>
        <span style={{flex:1,fontFamily:"Cairo,sans-serif",fontWeight:700,fontSize:13}}>{panel.label}</span>
        <button onClick={e=>{e.stopPropagation();onToggleMin(panel.id);}} style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",borderRadius:8,width:26,height:26,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{panel.minimized?"^":"v"}</button>
        <button onClick={e=>{e.stopPropagation();onClose(panel.id);}} style={{background:"rgba(239,68,68,.7)",border:"none",color:"#fff",borderRadius:8,width:26,height:26,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
      </div>
      {!panel.minimized && <div style={{overflowY:"auto",flex:1,padding:"12px",direction:"rtl"}}>{children}</div>}
    </div>
  );
}

function FloatBar({ openFloat, floatingPanels }) {
  const tools = [
    {id:"classtimer",icon:"⏱",label:"مؤقت"},{id:"luckywheel",icon:"🎡",label:"عجلة"},
    {id:"exitticket",icon:"🎫",label:"تذكرة"},{id:"groupdivider",icon:"👥",label:"مجموعات"},
    {id:"raffle",icon:"🎯",label:"سحب"},{id:"quiz",icon:"❓",label:"اختبار"},{id:"poll",icon:"📊",label:"تصويت"},
  ];
  return (
    <div style={{position:"fixed",bottom:12,left:"50%",transform:"translateX(-50%)",zIndex:8999,background:"rgba(15,23,42,.92)",borderRadius:20,padding:"6px 10px",display:"flex",gap:6,alignItems:"center",boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
      {tools.map(t=>{
        const active = floatingPanels.some(p=>p.id===t.id);
        return (
          <button key={t.id} onClick={()=>openFloat(t.id,t.label,t.icon)} title={t.label}
            style={{background:active?"rgba(13,148,136,.7)":"rgba(255,255,255,.1)",border:active?"1.5px solid #0d9488":"1.5px solid rgba(255,255,255,.1)",color:"#fff",borderRadius:12,padding:"5px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontSize:16}}>{t.icon}</span>
            <span style={{fontSize:9,fontFamily:"Cairo,sans-serif",opacity:.7}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}


export default function SchoolWebsite() {
  const [loading, setLoading] = useState(true);
  const [floatingPanels, setFloatingPanels] = useState([]);
  const [user, setUser] = useState(null);
  const [parentPortal, setParentPortal] = useState(false);
  const [teacherPortal, setTeacherPortal] = useState(false);
  const [studentRaffle, setStudentRaffle] = useState(false);
  const [publicAnnouncements, setPublicAnnouncements] = useState(false);
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [teachers, setTeachers] = useState(DEFAULT_TEACHERS);
  const [week, setWeek] = useState(DEFAULT_WEEK);
  const [attendance, setAttendance] = useState({});
  const [announcements, setAnnouncements] = useState(DEFAULT_ANNOUNCEMENTS);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [classList, setClassList] = useState([]);
  const [users] = useState(DEFAULT_USERS);
  const [siteFont, setSiteFont] = useState("'Noto Naskh Arabic', serif");
  const [messages, setMessages] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [weekArchive, setWeekArchive] = useState([]);

  const [directAnnId, setDirectAnnId] = useState(() => {
    const h = window.location.hash.replace("#","");
    return h.startsWith("ann-") ? h.replace("ann-","") : null;
  });

  useEffect(() => {
    const h = () => {
      const hash = window.location.hash.replace("#","") || "home";
      if (hash.startsWith("ann-")) { setDirectAnnId(hash.replace("ann-","")); return; }
      setDirectAnnId(null);
      if (["home","attendance","announcements","activities","settings","students","messages","surveys","sms","report","gradeanalysis","monthlyreport","teacherprofile","absencestats","attendancereport","student-absence","strategies","calendar","gallery","certificates","poll","raffle","broadcast","groupdivider","quiz","classtimer","luckywheel","exitticket","timetable","classvisits","honorboard","tasks","dailyquiz","aiteacher","lessonrecommend","officialforms","portfolio","earlywarning","meetings","heatmap","committeemeeting"].includes(hash)) setPage(hash);
    };
    window.addEventListener("hashchange", h); h();
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const navigate = (p) => { setPage(p); window.location.hash = p; setMenuOpen(false); };
  const openFloat  = (id,label,icon) => setFloatingPanels(prev => prev.find(p=>p.id===id) ? prev : [...prev,{id,label,icon,x:80+prev.length*30,y:80+prev.length*30,minimized:false}]);
  const closeFloat = (id) => setFloatingPanels(prev=>prev.filter(p=>p.id!==id));
  const toggleMin  = (id) => setFloatingPanels(prev=>prev.map(p=>p.id===id?{...p,minimized:!p.minimized}:p));
  const movePanel  = (id,x,y) => setFloatingPanels(prev=>prev.map(p=>p.id===id?{...p,x,y}:p));
  const bringFront = (id) => setFloatingPanels(prev=>{ const p=prev.find(x=>x.id===id); return p?[...prev.filter(x=>x.id!==id),p]:prev; });

  useEffect(() => {
    (async () => {
      try {
        const [t, w, att, ann, act, font, clsListMeta, msgs, survs, wArch] = await Promise.all([
          DB.get("school-teachers", DEFAULT_TEACHERS),
          DB.get("school-week", DEFAULT_WEEK),
          DB.get("school-attendance", {}),
          DB.get("school-announcements", DEFAULT_ANNOUNCEMENTS),
          DB.get("school-activities", DEFAULT_ACTIVITIES),
          DB.get("school-font", "'Noto Naskh Arabic', serif"),
          DB.get("school-class-list", []),
          DB.get("school-messages", []),
          DB.get("school-surveys", []),
          DB.get("school-week-archive", []),
        ]);
        setTeachers(t); setWeek(w); setAttendance(att); setAnnouncements(ann);
        setActivities(act); setSiteFont(font);
        setMessages(Array.isArray(msgs) ? msgs : []);
        setSurveys(Array.isArray(survs) ? survs : []);
        setWeekArchive(Array.isArray(wArch) ? wArch : []);
        // تحميل بيانات كل فصل
        if (clsListMeta && clsListMeta.length > 0) {
          const classDataArr = await Promise.all(clsListMeta.map(m => DB.get(`school-cls-${m.id}`, { ...m, students: [] })));
          setClassList(classDataArr);
        } else {
          // أول تشغيل — حمّل الفصل المُدرج من ملف الإكسل تلقائياً
          const meta = [{ id: PRELOADED_CLASS.id, name: PRELOADED_CLASS.name, level: PRELOADED_CLASS.level, section: PRELOADED_CLASS.section, teacher: PRELOADED_CLASS.teacher, semester: PRELOADED_CLASS.semester }];
          await DB.set("school-class-list", meta);
          await DB.set(`school-cls-${PRELOADED_CLASS.id}`, PRELOADED_CLASS);
          setClassList([PRELOADED_CLASS]);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const saveTeachers = (v) => DB.set("school-teachers", v);
  const saveWeek = (v) => DB.set("school-week", v);
  const saveAttendance = (v) => DB.set("school-attendance", v);
  const saveAnnouncements = (v) => DB.set("school-announcements", v);
  const saveActivities = (v) => DB.set("school-activities", v);
  const saveSiteFont = (v) => DB.set("school-font", v);
  const saveClass = (cls) => DB.set(`school-cls-${cls.id}`, cls);
  const deleteClass = (id) => DB.set(`school-cls-${id}`, null);
  const saveMessages = (v) => DB.set("school-messages", v);
  const saveWeekArchive = (v) => DB.set("school-week-archive", v);
  const archiveCurrentWeek = () => {
    if (Object.keys(attendance).length === 0) { alert("لا توجد بيانات حضور لأرشفتها"); return; }
    const entry = { id: Date.now(), week: { ...week }, attendance: { ...attendance }, archivedAt: new Date().toLocaleDateString("ar-SA") };
    const updated = [entry, ...weekArchive];
    setWeekArchive(updated);
    saveWeekArchive(updated);
    setAttendance({});
    DB.set("school-attendance", {});
    alert("✅ تم أرشفة الأسبوع بنجاح! يمكنك الآن إدخال بيانات الأسبوع الجديد.");
  };

  // إرسال ملاحظة المعلم لولي الأمر
  const handleSendNote = async (student, noteText) => {
    const newMsg = {
      id: Date.now(),
      type: "teacher_note",
      studentName: student.name,
      studentId: student.nationalId || "",
      name: "المعلم",
      text: noteText,
      date: new Date().toLocaleDateString("ar-SA"),
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      reply: "",
      repliedAt: "",
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    await saveMessages(updated);
  };
  const saveSurveys = (v) => DB.set("school-surveys", v);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 50%, #f5f5f4 100%)" }}>
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🏫</div>
        <h2 className="text-xl font-black text-teal-800 mb-2">مدرسة عبيدة بن الحارث المتوسطة</h2>
        <p className="text-gray-400 text-sm">جاري تحميل البيانات…</p>
      </div>
    </div>
  );

  if (directAnnId) return <SingleAnnouncementPage announcements={announcements} siteFont={siteFont} annId={directAnnId} />;
  if (!user && publicAnnouncements) return <PublicAnnouncementsPage announcements={announcements} siteFont={siteFont} onBack={() => setPublicAnnouncements(false)} />;
  if (!user && studentRaffle) return <StudentRafflePortal siteFont={siteFont} onBack={() => setStudentRaffle(false)} />;
  if (!user && teacherPortal) return <TeacherPortal classList={classList} setClassList={setClassList} saveClass={saveClass} siteFont={siteFont} onBack={() => setTeacherPortal(false)} attendance={attendance} teachers={teachers} week={week} onSendNote={handleSendNote} messages={messages} setMessages={setMessages} saveMessages={saveMessages} announcements={announcements} activities={activities} surveys={surveys} weekArchive={weekArchive} />;
  if (!user && parentPortal) return <ParentPortal classList={classList} setClassList={setClassList} saveClass={saveClass} messages={messages} setMessages={setMessages} saveMessages={saveMessages} surveys={surveys} setSurveys={setSurveys} saveSurveys={saveSurveys} siteFont={siteFont} onBack={() => setParentPortal(false)} />;
  if (!user) return <LoginPage users={users} onLogin={setUser} siteFont={siteFont} onParentPortal={() => setParentPortal(true)} onTeacherPortal={() => setTeacherPortal(true)} onStudentRaffle={() => setStudentRaffle(true)} onPublicAnnouncements={() => setPublicAnnouncements(true)} />;

  const pages = [
    { id: "home",            label: "الرئيسية",        icon: "🏠" },
    { id: "attendance",      label: "غياب المعلمين",  icon: "📋" },
    { id: "student-absence", label: "غياب الطلاب",   icon: "🎒" },
    { id: "students",        label: "تقييم الطلاب",  icon: "👨‍🎓" },
    { id: "announcements", label: "الإعلانات",       icon: "📢" },
    { id: "activities",    label: "الأنشطة",         icon: "⚡" },
    { id: "messages",      label: "رسائل الأهالي",  icon: "✉️" },
    { id: "sms",           label: "رسائل SMS",       icon: "📱" },
    { id: "settings",      label: "الإعدادات",       icon: "⚙️" },
  ];

  const extraPages = [
    { id: "strategies",    label: "الاستراتيجيات",   icon: "📚" },
    { id: "calendar",      label: "التقويم المدرسي", icon: "📅" },
    { id: "gallery",       label: "معرض الأنشطة",   icon: "🖼" },
    { id: "certificates",  label: "الشهادات الرقمية",icon: "🏅" },
    { id: "poll",          label: "تميّز المعلم",    icon: "🏆" },
    { id: "raffle",        label: "سحب الطلاب",      icon: "🎰" },
    { id: "surveys",       label: "الاستبيانات",     icon: "📊" },
    { id: "report",        label: "تقرير برنامج",    icon: "📋" },
    { id: "broadcast",     label: "الإذاعة المدرسية", icon: "🎙️" },
    { id: "groupdivider",  label: "تقسيم المجموعات", icon: "👥" },
    { id: "quiz",          label: "اختبارات الطلاب",  icon: "📝" },
    { id: "classtimer",    label: "مؤقت الحصة",        icon: "⏱️" },
    { id: "luckywheel",    label: "عجلة الحظ",          icon: "🎯" },
    { id: "exitticket",    label: "بطاقة الخروج",       icon: "🚪" },
    { id: "timetable",     label: "جدول الحصص",         icon: "🗓️" },
    { id: "classvisits",   label: "الزيارات الصفية",    icon: "👁️" },
    { id: "honorboard",    label: "لوحة الشرف",         icon: "🏆" },
    { id: "tasks",         label: "تتبع المهام",        icon: "✅" },
    { id: "gradeanalysis",    label: "تحليل درجات الطلاب",     icon: "📊" },
    { id: "teacherprofile",   label: "ملف المعلم",             icon: "👨‍🏫" },
    { id: "monthlyreport",    label: "التقرير الشهري/الفصلي",  icon: "📋" },
    { id: "absencestats",  label: "إحصائيات الغياب",   icon: "📊" },
    { id: "attendancereport", label: "تحليل الحضور والانصراف", icon: "🗂️" },
    { id: "officialforms",    label: "النماذج الرسمية",          icon: "📋" },
    { id: "portfolio",        label: "ملف الطالب الشامل",       icon: "📁" },
    { id: "earlywarning",     label: "الإنذار المبكر",           icon: "🚨" },
    { id: "meetings",         label: "الاجتماعات والمواعيد",     icon: "📅" },
    { id: "heatmap",          label: "خريطة النشاط المدرسي",    icon: "🗺️" },
    { id: "committeemeeting",  label: "اجتماعات اللجان",           icon: "📋" },
    { id: "dailyquiz",     label: "الاختبار اليومي",     icon: "🎯" },
    { id: "aiteacher",     label: "مساعد المعلم الذكي",  icon: "🤖" },
    { id: "lessonrecommend",label: "التوصية بالدروس",    icon: "💡" },
  ];

  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
      .nav-pill-main {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 8px 20px; border-radius: 999px;
        font-size: 13px; font-weight: 800;
        font-family: 'Cairo', sans-serif;
        transition: all 0.2s ease; cursor: pointer; border: none;
        white-space: nowrap;
      }
      .nav-pill-main.active {
        background: linear-gradient(135deg,#0d9488,#0f766e);
        color: #fff; box-shadow: 0 4px 14px rgba(13,148,136,0.4);
        transform: scale(1.04);
      }
      .nav-pill-main:not(.active) {
        background: #f1f5f9; color: #475569;
        border: 1.5px solid #e2e8f0;
      }
      .nav-pill-main:not(.active):hover {
        background: #e0fdf4; color: #0d9488; border-color: #99f6e4;
      }
      .nav-pill-extra {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 6px 14px; border-radius: 999px;
        font-size: 12px; font-weight: 700;
        font-family: 'Cairo', sans-serif;
        transition: all 0.2s ease; cursor: pointer; border: none;
        white-space: nowrap;
      }
      .nav-pill-extra.active {
        background: linear-gradient(135deg,#7c3aed,#6d28d9);
        color: #fff; box-shadow: 0 4px 14px rgba(124,58,237,0.35);
        transform: scale(1.04);
      }
      .nav-pill-extra:not(.active) {
        background: #faf5ff; color: #7c3aed;
        border: 1.5px solid #e9d5ff;
      }
      .nav-pill-extra:not(.active):hover {
        background: #ede9fe; border-color: #c4b5fd;
      }
      .nav-pill-icon { font-size: 16px; }
    `}</style>
    <div dir="rtl" className="min-h-screen relative overflow-x-hidden" style={{ fontFamily: siteFont, background: "linear-gradient(160deg, #f0fdfa 0%, #ecfdf5 25%, #f5f5f4 60%, #fefce8 100%)" }}>

      {/* - رذاذ الزوايا المتحرك - */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Kufi+Arabic:wght@400;700&family=Cairo:wght@400;700;900&family=Tajawal:wght@400;700&family=Reem+Kufi:wght@400;700&family=Lateef&family=Amiri:wght@400;700&display=swap');

          :root {
            --c-primary: #0d9488;
            --c-primary-dark: #0f766e;
            --c-accent: #f59e0b;
            --c-page-bg: linear-gradient(160deg, #f0fdfa 0%, #ecfdf5 25%, #f5f5f4 60%, #fefce8 100%);
          }
          /* بطاقات موحدة */
          .page-card {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(13,148,136,.06);
            border: 1px solid rgba(13,148,136,.08);
          }
          /* شريط العنوان الرئيسي لكل صفحة */
          .page-header-bar {
            border-radius: 1rem;
            padding: 1.25rem 1.5rem;
            color: white;
            box-shadow: 0 4px 20px rgba(0,0,0,.15);
            position: relative;
            overflow: hidden;
          }
          .page-header-bar::before {
            content: '';
            position: absolute;
            top: -40%;
            right: -10%;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 70%);
            border-radius: 50%;
          }
          .page-header-bar::after {
            content: '';
            position: absolute;
            bottom: -50%;
            left: -5%;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(255,255,255,.08) 0%, transparent 70%);
            border-radius: 50%;
          }
          /* بادج موحد */
          .badge-teal   { background:#d1fae5; color:#065f46; }
          .badge-red    { background:#fee2e2; color:#991b1b; }
          .badge-amber  { background:#fef3c7; color:#92400e; }
          .badge-blue   { background:#dbeafe; color:#1e40af; }
          .badge-purple { background:#ede9fe; color:#5b21b6; }
          /* تحسين الجداول */
          .school-table thead { background: linear-gradient(135deg,#0f766e,#0d9488); color:white; }
          .school-table tbody tr:nth-child(even) { background: rgba(13,148,136,.03); }
          .school-table tbody tr:hover { background: rgba(13,148,136,.06); transition: background .15s; }
                  @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(18px,-22px) scale(1.08)} 66%{transform:translate(-12px,14px) scale(.94)} }
          @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-20px,16px) scale(1.1)} 66%{transform:translate(14px,-10px) scale(.92)} }
          @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(10px,20px) scale(1.06)} }
          @keyframes drift4 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-16px,-18px) scale(1.12)} 80%{transform:translate(12px,8px) scale(.9)} }
          @keyframes float-dot { 0%,100%{transform:translateY(0) scale(1);opacity:.7} 50%{transform:translateY(-18px) scale(1.2);opacity:.3} }
          @keyframes spray-l { 0%{transform:translateX(-100%) scaleX(0);opacity:0} 40%{opacity:.6} 100%{transform:translateX(0) scaleX(1);opacity:.08} }
          @keyframes spray-r { 0%{transform:translateX(100%) scaleX(0);opacity:0} 40%{opacity:.6} 100%{transform:translateX(0) scaleX(1);opacity:.08} }
          .blob1{animation:drift1 9s ease-in-out infinite}
          .blob2{animation:drift2 12s ease-in-out infinite}
          .blob3{animation:drift3 7s ease-in-out infinite}
          .blob4{animation:drift4 15s ease-in-out infinite}
          .fdot{animation:float-dot 4s ease-in-out infinite}
        `}</style>

        {/* blob يسار-أعلى — أخضر زمردي */}
        <div className="blob1 absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
          style={{background:"radial-gradient(circle,#2dd4bf 0%,#0d9488 40%,transparent 75%)"}} />
        {/* blob يمين-أعلى — أزرق سماوي */}
        <div className="blob2 absolute -top-16 -left-16 w-80 h-80 rounded-full opacity-15"
          style={{background:"radial-gradient(circle,#38bdf8 0%,#0284c7 40%,transparent 75%)"}} />
        {/* blob يسار-أسفل — بنفسجي */}
        <div className="blob3 absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-15"
          style={{background:"radial-gradient(circle,#a78bfa 0%,#7c3aed 40%,transparent 75%)"}} />
        {/* blob يمين-أسفل — برتقالي-ذهبي */}
        <div className="blob4 absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-15"
          style={{background:"radial-gradient(circle,#fbbf24 0%,#f59e0b 40%,transparent 75%)"}} />
        {/* blob وسط خفيف */}
        <div className="blob2 absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
          style={{background:"radial-gradient(circle,#0d9488 0%,transparent 70%)"}} />

        {/* نقاط رذاذ يمين */}
        {[...Array(12)].map((_,i) => (
          <div key={"dr"+i} className="fdot absolute rounded-full"
            style={{
              right: `${2 + (i%4)*2.5}%`,
              top:   `${8 + i*7.5}%`,
              width:  `${4 + (i%3)*3}px`,
              height: `${4 + (i%3)*3}px`,
              background: ["#0d9488","#2dd4bf","#0284c7","#38bdf8","#7c3aed","#a78bfa"][i%6],
              opacity: 0.25 + (i%4)*0.06,
              animationDelay: `${i*0.4}s`,
              animationDuration: `${3.5 + i*0.3}s`,
            }} />
        ))}
        {/* نقاط رذاذ يسار */}
        {[...Array(12)].map((_,i) => (
          <div key={"dl"+i} className="fdot absolute rounded-full"
            style={{
              left:  `${2 + (i%4)*2.5}%`,
              top:   `${5 + i*7.8}%`,
              width:  `${3 + (i%3)*4}px`,
              height: `${3 + (i%3)*4}px`,
              background: ["#f59e0b","#fbbf24","#0d9488","#34d399","#0284c7","#7dd3fc"][i%6],
              opacity: 0.2 + (i%4)*0.05,
              animationDelay: `${i*0.35 + 1}s`,
              animationDuration: `${4 + i*0.25}s`,
            }} />
        ))}

        {/* خط رذاذ أعلى يمين */}
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-10" viewBox="0 0 200 200" fill="none">
          <path d="M200 0 Q160 40 120 20 Q80 0 60 40 Q40 80 0 60" stroke="#0d9488" strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
          <path d="M200 20 Q150 60 100 40 Q60 20 20 70" stroke="#2dd4bf" strokeWidth="1" fill="none" strokeDasharray="3 6"/>
        </svg>
        {/* خط رذاذ أسفل يسار */}
        <svg className="absolute bottom-0 left-0 w-64 h-64 opacity-10" viewBox="0 0 200 200" fill="none">
          <path d="M0 200 Q40 160 80 180 Q120 200 140 160 Q160 120 200 140" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
          <path d="M0 180 Q50 140 100 160 Q140 180 180 130" stroke="#f59e0b" strokeWidth="1" fill="none" strokeDasharray="3 6"/>
        </svg>
      </div>
      <div className="relative z-10">
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-teal-100" style={{fontFamily:"'Cairo', 'Noto Naskh Arabic', sans-serif"}}>
        <div className="max-w-6xl mx-auto px-4">

          {/* - صف أول: الشعار + اسم المدرسة + بيانات المستخدم - */}
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("home")}>
              <SchoolLogo size="sm" animate={false} />
              <div>
                <h1 className="font-black text-teal-900" style={{fontSize:"15px",letterSpacing:"-0.3px"}}>مدرسة عبيدة بن الحارث</h1>
                <p className="text-gray-400 font-bold" style={{fontSize:"11px"}}>المتوسطة — ١٤٤٧ هـ</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 border border-teal-100 bg-teal-50">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-black text-sm">{user.name.charAt(0)}</div>
                <div><div className="font-black text-gray-800 text-sm">{user.name}</div><div className="text-gray-400 text-xs">{user.role}</div></div>
              </div>
              <button onClick={() => setUser(null)} className="hidden sm:flex items-center gap-1 text-xs text-red-500 font-black px-3 py-2 rounded-full border border-red-200 hover:bg-red-50 transition-all">
                🚪 خروج
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-2xl">{menuOpen ? "✕" : "☰"}</button>
            </div>
          </div>

          {/* - صف ثانٍ: أزرار التنقل (desktop) - */}
          <div className="hidden lg:block py-2">
            {/* الصف الأول من الأزرار */}
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {pages.map(p => (
                <button key={p.id} onClick={() => { navigate(p.id); setShowExtra(false); }}
                  className={`nav-pill-main ${page === p.id ? "active" : ""}`}>
                  <span className="nav-pill-icon">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
            {/* الصف الثاني: صفحات إضافية مباشرة */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-purple-300 opacity-60 flex-shrink-0">أدوات:</span>
              {extraPages.slice(0,9).map(p => (
                <button key={p.id} onClick={() => { navigate(p.id); setShowExtra(false); }}
                  className={`nav-pill-extra ${page === p.id ? "active" : ""}`}>
                  <span className="nav-pill-icon">{p.icon}</span>
                  {p.label}
                </button>
              ))}
              {extraPages.length > 9 && (
                <div className="relative">
                  <button onClick={() => setShowExtra(!showExtra)}
                    className={`nav-pill-extra ${showExtra || extraPages.slice(9).some(p=>p.id===page) ? "active" : ""}`}>
                    ✨ المزيد {showExtra ? "▴" : "▾"}
                  </button>
                  {showExtra && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 min-w-48">
                      {extraPages.slice(9).map(p => (
                        <button key={p.id} onClick={() => { navigate(p.id); setShowExtra(false); }}
                          className={`w-full text-right px-4 py-2.5 text-sm font-bold hover:bg-purple-50 transition-all flex items-center gap-2 ${page === p.id ? "text-purple-700 bg-purple-50" : "text-gray-700"}`}
                          style={{fontFamily:"'Cairo', sans-serif"}}>
                          <span>{p.icon}</span>{p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* - موبايل - */}
          {menuOpen && (
            <div className="lg:hidden py-3 space-y-1">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {pages.map(p => (
                  <button key={p.id} onClick={() => { navigate(p.id); setMenuOpen(false); }}
                    style={{
                      padding:"10px 14px", borderRadius:"999px", fontSize:"13px", fontWeight:"800",
                      fontFamily:"'Cairo',sans-serif", textAlign:"right",
                      background: page===p.id ? "linear-gradient(135deg,#0d9488,#0f766e)" : "#f1f5f9",
                      color: page===p.id ? "#fff" : "#475569",
                      border: page===p.id ? "none" : "1.5px solid #e2e8f0",
                      boxShadow: page===p.id ? "0 4px 12px rgba(13,148,136,0.3)" : "none",
                    }}>
                    <span style={{marginLeft:"5px"}}>{p.icon}</span>{p.label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-purple-500 font-black px-2 mb-1">✨ صفحات إضافية</div>
              <div className="grid grid-cols-2 gap-2">
                {extraPages.map(p => (
                  <button key={p.id} onClick={() => { navigate(p.id); setMenuOpen(false); }}
                    style={{
                      padding:"8px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:"700",
                      fontFamily:"'Cairo',sans-serif", textAlign:"right",
                      background: page===p.id ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "#faf5ff",
                      color: page===p.id ? "#fff" : "#7c3aed",
                      border: "1.5px solid #e9d5ff",
                    }}>
                    <span style={{marginLeft:"4px"}}>{p.icon}</span>{p.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between px-2">
                <span className="text-sm font-black text-gray-700">{user.name} — {user.role}</span>
                <button onClick={() => setUser(null)} className="text-xs text-red-500 font-black px-3 py-2 rounded-full bg-red-50 border border-red-100">🚪 خروج</button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {page === "home"          && <HomePage teachers={teachers} announcements={announcements} activities={activities} navigate={navigate} attendance={attendance} week={week} messages={messages} classList={classList} weekArchive={weekArchive} />}
        {page === "student-absence" && <StudentAbsencePage />}
        {page === "attendance"    && <AttendancePage teachers={teachers} setTeachers={setTeachers} saveTeachers={saveTeachers} week={week} setWeek={setWeek} saveWeek={saveWeek} attendance={attendance} setAttendance={setAttendance} saveAttendance={saveAttendance} />}
        {page === "students"      && <StudentsPage classList={classList} setClassList={setClassList} saveClass={saveClass} deleteClass={deleteClass} onSendNote={handleSendNote} messages={messages} />}
        {page === "announcements" && <AnnouncementsPage announcements={announcements} setAnnouncements={setAnnouncements} saveAnnouncements={saveAnnouncements} />}
        {page === "activities"    && <ActivitiesPage activities={activities} setActivities={setActivities} saveActivities={saveActivities} />}
        {page === "messages"      && <MessagesPage messages={messages} setMessages={setMessages} saveMessages={saveMessages} isParent={false} />}
        {page === "surveys"       && <SurveysPage surveys={surveys} setSurveys={setSurveys} saveSurveys={saveSurveys} isParent={false} />}
        {page === "sms"           && <SMSPage teachers={teachers} attendance={attendance} week={week} classList={classList} />}
        {page === "report"        && <ProgramReportPage />}
        {page === "strategies"    && <StrategiesPage />}
        {page === "calendar"      && <CalendarPage />}
        {page === "gallery"       && <GalleryPage />}
        {page === "certificates"  && <CertificatesPage teachers={teachers} attendance={attendance} week={week} classList={classList} />}
        {page === "poll"          && <PollPage teachers={teachers} />}
        {page === "raffle"        && <RafflePage />}
        {page === "broadcast"     && <BroadcastPage />}
        {page === "groupdivider"  && <GroupDividerPage />}
        {page === "quiz"          && <QuizPage />}
        {page === "classtimer"    && <ClassTimerPage />}
        {page === "luckywheel"    && <LuckyWheelPage />}
        {page === "exitticket"    && <ExitTicketPage />}
        {page === "timetable"     && <TimetablePage teachers={teachers} />}
        {page === "classvisits"   && <ClassVisitsPage teachers={teachers} />}
        {page === "honorboard"    && <HonorBoardPage classList={classList} />}
        {page === "tasks"         && <TasksPage teachers={teachers} />}
        {page === "absencestats"  && <AbsenceStatsPage teachers={teachers} attendance={attendance} week={week} weekArchive={weekArchive} />}
        {page === "monthlyreport" && <MonthlyReportPage teachers={teachers} attendance={attendance} week={week} weekArchive={weekArchive} classList={classList} announcements={announcements} activities={activities} />}
        {page === "gradeanalysis" && <GradeAnalysisPage />}
        {page === "teacherprofile" && <TeacherProfilePage teachers={teachers} attendance={attendance} week={week} weekArchive={weekArchive} classList={classList} />}
        {page === "attendancereport" && <AttendanceAnalysisPage />}
        {page === "dailyquiz"      && <DailyQuizPage classList={classList} />}
        {page === "officialforms"  && <OfficialFormsPage teachers={teachers} attendance={attendance} week={week} />}
        {page === "portfolio"      && <StudentPortfolioPage classList={classList} weekArchive={weekArchive} attendance={attendance} week={week} teachers={teachers} />}
        {page === "earlywarning"   && <EarlyWarningPage classList={classList} />}
        {page === "meetings"       && <MeetingsPage teachers={teachers} />}
        {page === "heatmap"        && <HeatmapPage teachers={teachers} attendance={attendance} week={week} weekArchive={weekArchive} announcements={announcements} activities={activities} />}
        {page === "committeemeeting" && <CommitteeMeetingPage teachers={teachers} />}
        {page === "aiteacher"      && <AITeacherPage />}
        {page === "lessonrecommend"&& <LessonRecommendPage classList={classList} />}
        {page === "settings"      && <SettingsPage teachers={teachers} setTeachers={setTeachers} saveTeachers={saveTeachers} week={week} setWeek={setWeek} saveWeek={saveWeek} users={users} siteFont={siteFont} setSiteFont={setSiteFont} saveSiteFont={saveSiteFont} weekArchive={weekArchive} archiveCurrentWeek={archiveCurrentWeek} />}
      </main>
      </div>{/* end relative z-10 */}
      <footer className="relative text-center py-6 text-xs border-t bg-white mt-8 overflow-hidden" style={{borderColor:"rgba(13,148,136,.15)"}}>
        <div className="absolute inset-0 opacity-5" style={{background:"linear-gradient(135deg,#0d9488,transparent)"}} />
        <div className="relative flex items-center justify-center gap-4 flex-wrap"><p className="text-teal-700 font-bold opacity-60">مدرسة عبيدة بن الحارث المتوسطة — بوابة الإدارة المدرسية الإلكترونية</p><VisitorCounter /></div>
        <p className="relative text-gray-400 mt-1">© ١٤٤٧ هـ — جميع الحقوق محفوظة</p>
      </footer>
    </div>

    <FloatBar openFloat={openFloat} floatingPanels={floatingPanels} />

    {floatingPanels.map(panel => (
      <FloatingPanelWindow key={panel.id} panel={panel} onClose={closeFloat} onToggleMin={toggleMin} onMove={movePanel} onBringFront={bringFront}>
        {panel.id === "classtimer"   && <ClassTimerPage />}
        {panel.id === "luckywheel"   && <LuckyWheelPage />}
        {panel.id === "exitticket"   && <ExitTicketPage />}
        {panel.id === "groupdivider" && <GroupDividerPage teachers={teachers} classList={classList} />}
        {panel.id === "raffle"       && <RafflePage classList={classList} />}
        {panel.id === "quiz"         && <QuizPage classList={classList} />}
        {panel.id === "poll"         && <PollPage />}
      </FloatingPanelWindow>
    ))}

    </>
  );
}

