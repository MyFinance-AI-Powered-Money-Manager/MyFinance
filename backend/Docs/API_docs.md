# 📑 MyFinance API Documentation v1

Dokumentasi API

## 📌 Informasi Global

- **Base URL:** `http://localhost:3000/api/v1` (Lokal) atau `https://myfinance-backend-production.up.railway.app/api/v1` (Railway)
- **Backend Check Server:** https://myfinance-backend-production.up.railway.app/api/v1/health
- **Format Data:** `JSON`
- **Autentikasi:** Header `Authorization: Bearer <JWT_TOKEN>`

---

## 🔐 1. Authentication & Users

### 1.1 Register User

`POST /auth/register`

**Request Body:**

```json
{
  "full_name": "Aditya Beckham",
  "email": "adityabeckham@example.com",
  "password": "password123",
  "confirm_password": "password123"
}
```

### 1.2 Login User

`POST /auth/login`

**Request Body:**

```json
{
  "email": "adityabeckham@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "user": { "id": "uuid-user-123", "email": "adityabeckham@example.com" },
    "token": "sqwqsmcnamniwdcw..."
  }
}
```

### 1.3 Get Profile

`GET /users/profile`

- **Auth Required:** Yes
- **Deskripsi:** Mengambil data profil pengguna yang sedang login.

### 1.4 Update Profile

`PUT /users/profile`

- **Auth Required:** Yes

**Request Body:**

```json
{
  "full_name": "Aditya Beckham (Updated)",
  "profile_picture": "https://image-url.com/photo.jpg"
}
```

### 1.5 Update Password

`PUT /users/password`

- **Auth Required:** Yes

**Request Body:**

```json
{
  "old_password": "password123",
  "new_password": "newpassword456",
  "confirm_new_password": "newpassword456"
}
```

### 1.6 Delete Account (Hapus Permanen)

`DELETE /users/profile`

- **Auth Required:** Yes
- **Deskripsi:** Menghapus akun user beserta seluruh data dompet, transaksi, dan budget yang terkait (Cascade).

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Akun dan seluruh data terkait berhasil dihapus permanen."
}
```

---

## 💳 2. Wallets (Dompet)

> **NOTE:** Pastikan pilihan Dropdown type/jenis wallet di UI sesuai dengan yang dikirim ke backend:
>
> - BANK
> - CASH
> - E-WALLET

> **NOTE:** di Frontend (saat menu Transfer Dana), Bang Robby cukup kirim data seperti ini:

- Dropdown 1: Pilih source_wallet_id (Dompet asal).
- Dropdown 2: Pilih destination_wallet_id (Dompet tujuan).
- Input: Masukkan amount.
- Jenis Transaksi: Secara implisit sistem akan mencatatnya sebagai type: 'TRANSFER'.

### Tampilan di Riwayat Transaksi (History):

- Nanti di halaman History, Bang Robby bisa bikin logika simpel:
  - Jika type == 'TRANSFER' dan description == 'Transfer Keluar', kasih icon panah merah (Keluar).
  - Jika type == 'TRANSFER' dan description == 'Transfer Masuk', kasih icon panah hijau (Masuk).

### 2.1 Get All Wallets

`GET /wallets`

- **Auth Required:** Yes

### 2.2 Create Wallet

`POST /wallets`

- **Auth Required:** Yes

**Request Body:**

```json
{
  "name": "BCA Utama",
  "type": "BANK",
  "balance": 5000000
}
```

### 2.3 Update Wallet

`PUT /wallets/:id`

- **Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Gopay",
  "type": "E-WALLET"
}
```

### 2.4 Transfer Antar Dompet

`POST /wallets/transfer`

- **Auth Required:** Yes

**Request Body:**

```json
{
  "source_wallet_id": "uuid-wallet-a",
  "destination_wallet_id": "uuid-wallet-b",
  "amount": 25000
}
```

### 2.5 Delete Wallet

`DELETE /wallets/:id`

- **Auth Required:** Yes

---

## 📈 3. Budgets (Anggaran)

### 3.1 Get All Budgets

`GET /budgets`

- **Auth Required:** Yes

### 3.2 Set Budget Bulanan

`POST /budgets`

- **Auth Required:** Yes

**Request Body:**

```json
{
  "category": "WANTS",
  "limit_amount": 1500000,
  "month_period": "2026-05"
}
```

### 3.3 Update Budget Limit

`PUT /budgets/:id`

- **Auth Required:** Yes

**Request Body:**

```json
{
  "limit_amount": 2000000
}
```

### 3.4 Delete Budget

`DELETE /budgets/:id`

- **Auth Required:** Yes

---

## 💸 4. Transactions (Core Business Logic)

### 🛠️ Panduan UI/UX Frontend (Dropdown Menu)

Berikut adalah struktur hirarki yang **WAJIB** diterapkan pada form input di Frontend:

#### A. Tipe: INCOME (Pemasukan)

| Category (Dropdown 1) | Subcategory (Dropdown 2)                                                    |
| :-------------------- | :-------------------------------------------------------------------------- |
| **GAJI**              | Gaji Utama, Tunjangan / Allowances, Uang Saku Bulanan                       |
| **FREELANCE**         | Proyek / Project, Part-Time / Shift, Hasil Usaha / Jualan                   |
| **BONUS**             | THR / Bonus Tahunan, Hadiah / Uang Kaget, Cashback / Promo                  |
| **LAINNYA**           | Hasil Investasi / Bunga, Pencairan Tabungan, Utang Dibayar Teman, Lain-lain |

#### B. Tipe: EXPENSE (Pengeluaran)

| Category (Dropdown 1) | Subcategory (Dropdown 2)                                                                     |
| :-------------------- | :------------------------------------------------------------------------------------------- |
| **NEEDS**             | Makan & Minum Harian, Kebutuhan Rumah & Mandi, Transportasi & Rutinitas, Tagihan & Kewajiban |
| **WANTS**             | Jajan & Nongkrong, Hobi & Self-Reward                                                        |
| **OTHER**             | Lain-lain & Darurat                                                                          |

> [💡Frontend Note]: Hanya panggil endpoint ini saat:

- **(1) User baru login/buka apps**
- **(2) User selesai input transaksi**
- **(3) User melakukan pull-to-refresh.**

> Jika transaksi spesifik pengguna tidak tersedia di subkategori, arahkan pengguna memilih opsi terdekat atau "Lain-lain",
> lalu minta pengguna menuliskan rinciannya di kolom Description (teks bebas).

### 4.1 Get All Transactions

`GET /transactions`

- **Auth Required:** Yes

### 4.2 Catat Transaksi Tipe INCOME

`POST /transactions`

- **Auth Required:** Yes

**Request Body (Manual Income):**

```json
{
  "wallet_id": "uuid-wallet-bca",
  "type": "INCOME",
  "total_amount": 1000000,
  "category": "GAJI",
  "subcategory": "Gaji Utama",
  "description": "Gaji Bulan ini Mei",
  "transaction_date": "2026-05-11T15:00:00Z"
}
```

### 4.3 Catat Manual Expense

`POST /transactions`

- **Auth Required:** Yes

**Request Body (Manual Expense):**

```json
{
  "wallet_id": "uuid-wallet-bca",
  "type": "EXPENSE",
  "total_amount": 50000,
  "category": "WANTS",
  "subcategory": "Jajan & Nongkrong",
  "description": "Beli Kopi Americcano sama Nongkrong",
  "transaction_date": "2026-05-11T15:00:00Z"
}
```

### 4.4 Catat via OCR (Hasil Scan AI)

`POST /transactions`

- **Auth Required:** Yes
- **Deskripsi:** Digunakan setelah Frontend menerima JSON dari Python AI Service.

**Request Body (OCR Data):**

```json
{
  "wallet_id": "uuid-wallet-cash",
  "type": "EXPENSE",
  "total_amount": 105000,
  "category": "NEEDS",
  "description": "Belanja Mingguan Indomaret",
  "transaction_date": "2026-05-11T10:00:00Z",
  "image_url": "https://supabase-storage.com/struk/001.jpg",
  "items": [
    {
      "item_name": "Sabun Mandi",
      "price": 25000,
      "category": "NEEDS",
      "subcategory": "Kebutuhan Rumah & Mandi"
    },
    {
      "item_name": "Beras 5kg",
      "price": 80000,
      "category": "NEEDS",
      "subcategory": "Kebutuhan Rumah & Mandi"
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "is_overbudget": true,
  "data": { "transaction_id": "uuid-trx-999" }
}
```

> [!NOTE]
> Deskripsi: Field ini adalah hasil prediksi real-time dari model ML (BiLSTM) Bang Pascal. Frontend bisa menggunakan flag ini untuk menampilkan pop-up peringatan ke user jika transaksi tersebut membuat anggaran jebol.

### 4.5 Delete Transaction

`DELETE /transactions/:id`

- **Auth Required:** Yes
- **Deskripsi:** Menghapus transaksi dan me-reverse (mengembalikan) saldo dompet secara otomatis.

### 4.6 Upload Receipt Image (Supabase)

`POST /transactions/upload-receipt`

- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Deskripsi:** Mengunggah gambar struk langsung ke Supabase Storage (Bucket: `receipt-scan`). Digunakan sebagai fallback jika Server AI tidak memberikan URL gambar.

**Request Body (Form Data):**
- `file`: File gambar (jpg/png)

**Response (200 OK):**
```json
{
  "status": "success",
  "image_url": "https://xvlwcuhnowmlxxypoqeb.supabase.co/storage/v1/object/public/receipt-scan/user-123-171589000.jpg"
}
```

---

## 🧠 5. Integrasi Data Science & AI

### 5.1 Real-time Dashboard Summary

`GET /dashboard/summary`

- **Auth Required:** Yes
- **Deskripsi:** Backend Node.js mengumpulkan data dan memanggil API Python untuk `ds_metrics`.

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "current_balance": 4850000,
    "total_income": 5000000,
    "total_expense": 150000,
    "ds_metrics": {
      "health_score": 88,
      "predicted_cashflow": 1200000,
      "overbudget_risk": "low",
      "money_leak": "Nongkrong Malam"
    }
  }
}
```

### 5.2 AI Monthly Insight

`GET /insights?month_period=2026-05`

- **Auth Required:** Yes
- **Deskripsi:** Mengambil hasil analisis AI (Cron Job).

**Response (200 OK):**

```json
{
  "health_score": 75,
  "predicted_cashflow": 450000,
  "overbudget_risk": "medium",
  "money_leak": "Subscription Apps",
  "ai_insight": "Halo Aditya! Bulan ini pengeluaranmu cukup stabil, namun ada 'bocor halus' di langganan aplikasi. Coba cek kembali mana yang benar-benar digunakan.",
  "total_spent": 3500000,
  "total_budget": 4000000,
  "categories": [
    { "name": "NEEDS", "amount": 2500000 },
    { "name": "WANTS", "amount": 1000000 }
  ]
}
```

### 5.3 Data Export for DS Streamlit

`GET /export/streamlit?USERID=uuid-123&START=2026_05_01&END=2026_05_19`

- **Auth Required:** No
- **Deskripsi:** Endpoint untuk menyediakan data transaksi dan anggaran secara mentah bagi aplikasi Streamlit eksternal Tim Data Science. Dapat dipanggil langsung dari Streamlit.

**Query Parameters:**
- `USERID` / `user_id`: UUID User
- `START` / `start`: Tanggal mulai dalam format `YYYY_MM_DD`
- `END` / `end`: Tanggal selesai dalam format `YYYY_MM_DD`

**Response (200 OK):**

```json
{
  "user_id": "uuid-123",
  "start_date": "2026-05-01",
  "end_date": "2026-05-19",
  "transactions": [
    {
      "id": "trx-001",
      "wallet_id": "wallet-123",
      "type": "EXPENSE",
      "total_amount": 50000,
      "category": "NEEDS",
      "subcategory": "Makan & Minum Harian",
      "description": "Makan Siang",
      "transaction_date": "2026-05-05"
    }
  ],
  "transaction_items": [
    {
      "id": "ti-001",
      "transaction_id": "trx-001",
      "item_name": "Ayam Bakar",
      "price": 50000,
      "category": "NEEDS",
      "subcategory": "Makan & Minum Harian"
    }
  ],
  "budgets": [
    {
      "id": "bdg-001",
      "category": "NEEDS",
      "limit_amount": 2000000,
      "month_period": "2026-05"
    }
  ]
}
```

---

## ⚙️ 6. Cron & Automation

### 6.1 Trigger Manual Insight

`POST /insights/trigger`

- **Auth Required:** Custom Token
- **Header:** `Authorization: Bearer <CRON_SECRET_KEY>`
- **Response:** `200 OK` - "Cron job manual berhasil dipicu."

---

## ⚠️ 7. Error Codes Standar

| Code    | Status         | Deskripsi                            |
| :------ | :------------- | :----------------------------------- |
| **400** | Bad Request    | Input tidak valid atau kurang.       |
| **401** | Unauthorized   | Token JWT hilang atau salah.         |
| **403** | Forbidden      | Token expired atau Secret key salah. |
| **404** | Not Found      | Data tidak ditemukan di database.    |
| **500** | Internal Error | Masalah pada sistem/server.          |
