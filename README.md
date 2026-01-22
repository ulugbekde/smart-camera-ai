# 🛡️ Smart AI Camera - Intellektual Ta'lim Monitoring Tizimi

**Smart AI Camera** — bu sun'iy intellekt (Google Gemini 3) yordamida o'quvchilarning darsdagi davomati va xatti-harakatlarini real vaqt rejimida tahlil qiluvchi yuqori texnologik tizim. Loyiha dars jarayonini raqamlashtirish va ta'lim sifatini avtomatik baholash uchun mo'ljallangan.

---

## 🚀 Asosiy Imkoniyatlar

*   **Multi-Face Recognition (Ko'p yuzli tanib olish):** Kamera kadridagi bir nechta o'quvchini bir vaqtning o'zida identifikatsiya qilish.
*   **Xulq-atvor Tahlili (Behavioral Analysis):** O'quvchining holatini 5 xil toifada baholash:
    *   `Active` (Faol ishtirok etmoqda)
    *   `Attentive` (Diqqat bilan tinglamoqda)
    *   `Inactive` (Nofaol yoki chalg'igan)
    *   `Not Present` (Darsda yo'q)
    *   `Unknown` (Aniq emas)
*   **Real-time Bounding Boxes:** Har bir aniqlangan yuz atrofida rangli indikatorlar (interaktiv ramkalar) ko'rsatiladi.
*   **Analytics Dashboard:** Har bir o'quvchi uchun individual faollik foizlari va vaqt chizig'i (timeline).
*   **Precision Enrollment:** O'quvchilarni bazaga qo'shishda bir nechta rasm yordamida 99% aniqlikka erishish.

---

## 🛠 Texnologik Stek

*   **Frontend:** React 19, TypeScript
*   **AI Engine:** Google Gemini 3 Flash Preview (Eng tezkor multimodal model)
*   **Styling:** Tailwind CSS (Modern va javob beruvchi UI)
*   **Routing:** React Router 7
*   **API Interface:** @google/genai SDK

---

## 📂 Loyiha Tuzilishi

```text
├── services/
│   └── geminiService.ts    # Gemini API bilan aloqa va Prompt injeneriyasi
├── components/
│   ├── Dashboard.tsx       # Umumiy statistika va o'quvchilar ro'yxati
│   ├── Enrollment.tsx      # O'quvchilarni bazaga rasm bilan qo'shish
│   ├── LiveAnalysis.tsx    # Kamera oqimi va AI tahlili (Asosiy modul)
│   └── StudentDetailModal.tsx # Har bir o'quvchining chuqur tahlili
├── types.ts                # Ma'lumotlar modellari va interfeyslar
└── App.tsx                 # Asosiy yo'naltirish va API kalit nazorati
