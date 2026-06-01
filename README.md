# MyFinance - Panduan Tim Fullstack Web Developer
**ID Tim Capstone Project:** CC26-PSU154  
**Judul Proyek:** MyFinance - Aplikasi Pencatatan Keuangan berbasis AI  
**Tema yang Dipilih:** Revolusi Teknologi Keuangan (Fintech) untuk Generasi Muda  


Selamat datang di repositori utama **MyFinance**, sebuah aplikasi manajemen keuangan komprehensif berbasis web (Fullstack) yang diperkuat dengan kecerdasan buatan (AI) untuk Analisis Insight, Sistem Peringatan *Overbudget*, Pemindai Struk Otomatis (OCR), serta Dashboard Analitik berbasis Data Science.

Repositori ini dikelola untuk mempermudah kerja sama antar-developer (Backend, Frontend, AI Engineer, dan tim Data Science).

## 💡 Ringkasan Eksekutif & Permasalahan

**MyFinance** adalah platform web pengelola keuangan pribadi yang membantu pengguna mencatat, memantau, dan mengevaluasi kondisi finansial secara lebih praktis. Permasalahan utama yang ingin diselesaikan adalah kebiasaan pengeluaran yang sering tidak terasa, terutama karena kemudahan transaksi digital seperti QRIS, *e-wallet*, dan *paylater*. Banyak pengguna memiliki pemasukan rutin, tetapi tidak memahami kemana uang mereka digunakan atau apakah kondisi keuangan mereka sedang sehat, stabil, atau memburuk.

Berbeda dari aplikasi pencatatan keuangan konvensional yang hanya menampilkan daftar pemasukan dan pengeluaran, MyFinance dirancang untuk memberikan *insight* yang lebih mudah dipahami mengenai pola pengeluaran pengguna. Sistem ini memanfaatkan AI untuk melakukan *auto-categorization* transaksi, sehingga pengguna tidak perlu mengelompokkan pengeluaran secara manual. Dengan begitu, proses pencatatan menjadi lebih efisien dan konsistensi pengguna dapat meningkat.

MyFinance juga bertujuan mengubah kebiasaan pengguna dari sekadar mencatat pengeluaran menjadi aktif memantau dan mengevaluasi keuangan. Melalui analisis kondisi finansial dan pola *spending*, pengguna dapat mengetahui apakah pengeluaran mereka masih wajar atau sudah berlebihan. Platform ini sangat relevan bagi anak muda hingga dewasa muda yang mulai mengelola uang di era ekonomi digital, terutama mereka yang familiar dengan pembayaran non-tunai dan rentan terhadap *overspending* akibat kemudahan transaksi serta pengaruh *social commerce*.

---

## 📖 Deskripsi Singkat Proyek

**MyFinance** adalah platform manajemen kekayaan dan pelacakan arus kas (cashflow) berskala produksi yang dirancang dengan estetika modern (*glassmorphism*, warna HSL *dark/light mode* khusus). 

Fitur utama aplikasi:
- **Pencatatan Keuangan Multidompet:** Mengelola transaksi dari Bank, E-Wallet, dan Uang Tunai secara terpusat.
- **Anggaran & Peringatan Dini:** Penetapan *budget* bulanan dan deteksi *overbudget* secara real-time.
- **Pindai Struk dengan AI (OCR):** Pengguna dapat memfoto struk belanja dan AI akan otomatis membaca nama barang dan harga untuk disimpan sebagai transaksi.
- **AI Financial Insights:** Ringkasan dan saran finansial cerdas yang mengidentifikasi kebocoran (*money leak*) dan menghitung skor kesehatan finansial.
- **Laporan Data Science (Streamlit):** Integrasi mulus menuju halaman *dashboard* khusus yang dikembangkan oleh tim DS untuk visualisasi data ekstensif.

---

## 🛠️ Stack Teknologi & Dependensi

- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Framer Motion, Axios.
- **Backend:** Node.js, Express, PostgreSQL (melalui Supabase), node-cron (untuk *background worker* analitik).
- **AI & Integrasi Pihak Ketiga:** Veryfi API (OCR), OpenAI API, Streamlit (Dashboard DS internal), Python API endpoints.

Pastikan untuk memeriksa berkas pendukung dependensi pada:
- `frontend/package.json`
- `backend/package.json`

---

## ⚙️ Petunjuk Setup *Environment* (Konfigurasi Lingkungan)

Aplikasi ini sangat bergantung pada berkas kredensial `.env` di kedua sisi (Frontend & Backend). Anda **wajib** menduplikasi berkas templat yang tersedia dan menyesuaikannya.

### 1. Setup Environment Backend
1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Salin *template environment*:
   ```bash
   cp .env.example .env
   ```
3. Buka `.env` dan isikan kredensial yang sesungguhnya (Hubungi Tech Lead untuk mendapatkan *Supabase Key*, *Veryfi API*, dan *OpenAI Key*):
   - `DB_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   - `OPENAI_API_KEY`, `VERYFI_API_KEY`, dsb.
   - `JWT_SECRET_KEY` dan `CRON_SECRET_KEY`

### 2. Setup Environment Frontend
1. Masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Salin *template environment*:
   ```bash
   cp .env.example .env
   ```
3. Buka `.env` dan sesuaikan *base URL* lokal atau URL *staging*. Jika hanya menjalankan lokal, Anda bisa menggunakan `VITE_API_URL=http://localhost:3000/api/v1`.

---

## 🚀 Cara Menjalankan Aplikasi (Lokal)

Setelah melakukan *setup environment* dan memastikan kredensial database sudah benar, ikuti langkah-langkah di bawah ini untuk memulai server lokal.

### 1. Menjalankan Backend (Node.js/Express)
Buka terminal baru:
```bash
cd backend
npm install
npm run dev
```
Server backend akan berjalan secara lokal, umumnya pada alamat: `http://localhost:3000`.

### 2. Menjalankan Frontend (Vite/React)
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Aplikasi frontend akan berjalan dan dapat diakses di browser melalui alamat: `http://localhost:5173`.

---

## 🔗 Tautan Penting Proyek

- 📊 **Dataset Proyek:** [Kaggle Dataset](https://www.kaggle.com/datasets/hafizhkamaluddin/myfinance)
- 🚀 **Deployment Produk:** [Vercel Deployment](https://myfinance-eight-psi.vercel.app/)
- 💻 **Tautan Repository Github:**
  - **Fullstack Web (FS):** [MyFinance](https://github.com/MyFinance-AI-Powered-Money-Manager/MyFinance)
  - **AI Backend Server (AI):** [my-finance-AI-backend](https://github.com/MyFinance-AI-Powered-Money-Manager/my-finance-AI-backend)
  - **Data Science (DS):** [MyFinance-Data](https://github.com/MyFinance-AI-Powered-Money-Manager/MyFinance-Data) & [MyFinance-Dashboard](https://github.com/MyFinance-AI-Powered-Money-Manager/MyFinance-Dashboard)

---

## 🤖 Integrasi AI & Data Science


MyFinance terhubung secara dinamis dengan beberapa arsitektur *Machine Learning* dan *Data Science* terpisah:
- **API Model Prediksi & Insight (Python):** URL dasar disetel melalui parameter `PYTHON_API_URL` dan `VITE_AI_API_URL`. Layanan ini bertanggung jawab atas klasifikasi transaksi (*budget calculator*) dan deteksi kebocoran uang (*money leak*).
- **Dashboard Analitik Streamlit (Tim DS):** 
  Aplikasi ini melempar parameter tanggal reaktif melalui URL (`?USERID=...&START=...&END=...`). Tautan aplikasi web yang telah dibangun oleh tim DS terhubung via konfigurasi `VITE_STREAMLIT_URL`. (Contoh implementasi production: *https://myfinance-dashboard-cp.streamlit.app/*).

*(Catatan: Model ML spesifik dihosting dan di-serve pada server Python terpisah. Kami berinteraksi dengan model tersebut sepenuhnya via arsitektur REST API terpisah).*

---

## 👥 Anggota Tim MyFinance (Project Team Members)

| No | Nama Lengkap | Student ID | Peran (Role) | Universitas |
|:--:|---|:---:|---|---|
| 1 | Aditya Beckham Firmansyah | CFCC764D6Y0639 | Full-Stack Web Developer | Universitas Teknologi Bandung |
| 2 | Robby Riandi | CFCC764D6Y2450 | Full-Stack Web Developer | Universitas Teknologi Bandung |
| 3 | Nabiel Alfallah Herdiana | CDCC011D6Y2246 | Data Scientist | Universitas Padjadjaran |
| 4 | Pascal Zufar Hanif | CDCC011D6Y2151 | Data Scientist | Universitas Padjadjaran |
| 5 | Fikri Fauzi | CACC012D6Y1568 | AI Engineer | Telkom University |
| 6 | Hafizh Kamaluddin Abdillah | CACC012D6Y0485 | AI Engineer | Telkom University |

---



