# MyFinance API Documentation

Dokumentasi ini berisi daftar endpoint API backend MyFinance yang dapat digunakan oleh Frontend. Semua endpoint (kecuali Auth & Health) memerlukan Bearer Token (JWT) di header `Authorization`.

Cek API Server Backend status di [Health Check](https://myfinance-backend.up.railway.app/api/v1/health)

| Key                       | Value                                             |
| ------------------------- | ------------------------------------------------- |
| **Base URL (Local)**      | `http://localhost:3000/api/v1`                    |
| **Base URL (Production)** | `https://myfinance-backend.up.railway.app/api/v1` |
| **API Prefix**            | `/api/v1`                                         |
| **Category Options**      | `NEEDS`, `WANTS`, `OTHER`                         |
| **Type Transaction**      | `INCOME`, `EXPENSE`, `TRANSFER`                   |
| **Type Wallets**          | `CASH`, `BANK`, `E-WALLET`                        |

---

## 1. Health Check

Digunakan untuk mengecek status server.

### GET `/api/v1/health`

- **Auth Required**: No
- **Response**:
  ```json
  {
    "status": "success",
    "message": "MyFinance Express Server is running optimally.",
    "timestamp": "2026-05-03T12:00:00.000Z"
  }
  ```

---

## 2. Authentication (Auth)

Endpoint terkait registrasi dan login user.

### POST `/api/v1/auth/register`

Mendaftarkan akun baru.

- **Auth Required**: No
- **Body**:
  ```json
  {
    "full_name": "Aditya Beckham",
    "email": "aditya@example.com",
    "password": "password123",
    "confirm_password": "password123"
  }
  ```

### POST `/api/v1/auth/login`

Masuk ke dalam sistem dan mendapatkan JWT token.

- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "aditya@example.com",
    "password": "password123"
  }
  ```

---

## 3. Users

Endpoint terkait manajemen profil pengguna.

### GET `/api/v1/users/profile`

Mendapatkan data profil user yang sedang login.

- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid-1234",
      "full_name": "Aditya Beckham",
      "email": "aditya@example.com",
      "profile_picture": "https://example.com/photo.jpg",
      "created_at": "2026-05-09T12:00:00.000Z"
    }
  }
  ```

### PUT `/api/v1/users/profile`

Memperbarui nama dan/atau foto profil. Menggunakan COALESCE sehingga field yang tidak dikirim tidak akan di-overwrite.

- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "full_name": "Aditya Beckham Updated",
    "profile_picture": "https://example.com/new-photo.jpg"
  }
  ```

### PUT `/api/v1/users/password`

Memperbarui password user.

- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "old_password": "password123",
    "new_password": "newpassword123",
    "confirm_new_password": "newpassword123"
  }
  ```

---

## 4. Wallets (Dompet)

Endpoint untuk manajemen dompet pengguna.

### GET `/api/v1/wallets`

Mendapatkan semua daftar dompet milik pengguna.

- **Auth Required**: Yes

### POST `/api/v1/wallets`

Membuat dompet baru.

- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "Dompet Utama",
    "type": "CASH",
    "balance": 1000000
  }
  ```
  Type options: `CASH`, `BANK`, `E-WALLET`

### PUT `/api/v1/wallets/:id`

Memperbarui data dompet yang ada berdasarkan ID.

- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "Dompet Utama Updated",
    "type": "BANK",
    "balance": 1500000
  }
  ```

### DELETE `/api/v1/wallets/:id`

Menghapus dompet berdasarkan ID.

- **Auth Required**: Yes

### POST `/api/v1/wallets/transfer`

Melakukan transfer saldo antar dompet milik pengguna.

- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "source_wallet_id": "uuid-wallet-1",
    "destination_wallet_id": "uuid-wallet-2",
    "amount": 50000
  }
  ```

---

## 5. Budgets (Anggaran)

Endpoint untuk manajemen batas anggaran bulanan.

### GET `/api/v1/budgets`

Mendapatkan daftar anggaran yang telah diatur.

- **Auth Required**: Yes

### POST `/api/v1/budgets`

Membuat anggaran baru untuk kategori tertentu.

- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "category": "WANTS",
    "limit_amount": 2000000,
    "month_period": "2026-05"
  }
  ```

### PUT `/api/v1/budgets/:id`

Memperbarui batas anggaran (`limit_amount`).

- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "limit_amount": 2500000
  }
  ```

### DELETE `/api/v1/budgets/:id`

Menghapus anggaran berdasarkan ID.

- **Auth Required**: Yes

---

## 6. Transactions

Endpoint untuk mencatat pengeluaran, pemasukan, dan scan struk.

### POST `/api/v1/transactions`

Mencatat transaksi baru. Untuk menjaga integritas data analitik, `subcategory` wajib menggunakan nilai dari daftar dropdown berikut:

**Mapping Pemasukan (INCOME):**
- `GAJI`: Gaji Utama, Tunjangan / Allowances, Uang Saku Bulanan
- `FREELANCE`: Proyek / Project, Part-Time / Shift, Hasil Usaha / Jualan
- `BONUS`: THR / Bonus Tahunan, Hadiah / Uang Kaget, Cashback / Promo
- `LAINNYA`: Hasil Investasi / Bunga, Pencairan Tabungan, Utang Dibayar Teman, Lain-lain

**Mapping Pengeluaran (EXPENSE):**
- `NEEDS`: Makan & Minum Harian, Kebutuhan Rumah & Mandi, Transportasi & Rutinitas, Tagihan & Kewajiban
- `WANTS`: Jajan & Nongkrong, Hobi & Self-Reward
- `OTHER`: Lain-lain & Darurat

- **Auth Required**: Yes

**Body (Contoh Catat Pemasukan Manual):**
```json
{
  "wallet_id": "uuid-wallet-1",
  "type": "INCOME",
  "total_amount": 2500000,
  "category": "GAJI",
  "subcategory": "Uang Saku Bulanan",
  "description": "Kiriman bulanan dari orang tua",
  "transaction_date": "2026-05-01T08:00:00Z"
}
```

**Body (Contoh Catat Pengeluaran Manual):**
```json
{
  "wallet_id": "uuid-wallet-1",
  "type": "EXPENSE",
  "total_amount": 45000,
  "category": "WANTS",
  "subcategory": "Jajan & Nongkrong",
  "description": "Kopi susu dan camilan sore",
  "transaction_date": "2026-05-03T16:20:00Z"
}
```

**Body (Contoh Hasil Scan AI OCR):**
```json
{
  "wallet_id": "uuid-wallet-1",
  "type": "EXPENSE",
  "total_amount": 100000,
  "category": "NEEDS",
  "subcategory": "Kebutuhan Rumah & Mandi",
  "description": "Belanja kebutuhan mandi",
  "transaction_date": "2026-05-03T10:00:00Z",
  "items": [
    {
      "item_name": "Sabun Mandi Liquid",
      "price": 35000,
      "category": "NEEDS",
      "subcategory": "Kebutuhan Rumah & Mandi"
    }
  ],
  "receipt_data": {
    "image_url": "https://url-gambar-struk.com/img.jpg",
    "raw_ai_output": {"confidence": 0.98}
  }
}
```

### GET `/api/v1/transactions`

Mendapatkan riwayat transaksi pengguna.

- **Auth Required**: Yes

### DELETE `/api/v1/transactions/:id`

Menghapus transaksi berdasarkan ID, yang akan mengembalikan saldo dompet (Reverse Balance Logic) dan menghapus items secara cascade.

- **Auth Required**: Yes

---

## 7. Financial Insights (Express)

Mendapatkan laporan dan insight keuangan hasil agregasi data pengguna dari Database.

### GET `/api/v1/insights`

Mengambil ringkasan kondisi keuangan per dompet (Health Score, Money Leak, dll). Data ini telah dihitung oleh Cron Job bulanan.

- **Auth Required**: Yes
- **Query Params**: `?wallet_id=uuid-wallet-1&period=2026-05`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "health_score": 85,
      "predicted_cashflow": 1500000,
      "overbudget_risk": "low",
      "money_leak": "Jajan & Nongkrong",
      "ai_insight": "Anda bisa menabung 10% lebih banyak jika mengurangi pengeluaran WANTS.",
      "total_spent": 82800,
      "total_budget": 2000000,
      "categories": [
        {
          "subcategory": "Makan & Minum Harian",
          "limit": 1500000,
          "spent": 73200,
          "remaining": 1426800,
          "percentage_used": 4.88
        }
      ]
    }
  }
  ```

---

## 8. AI & Data Science Services (Python API)

Endpoint khusus yang mengarah ke server Python untuk pemrosesan

### POST `/api/v1/ai/scan`

Melakukan ekstraksi OCR dari gambar struk belanja.

- **Base URL**: Python Service (`http://localhost:8000`)
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Body**: `image` — File gambar struk (JPG/PNG)
- **Response**: Mengembalikan array objek item belanja beserta tebakan kategori/subkategori yang nantinya direview user di Frontend sebelum dikirim ke endpoint `POST /api/v1/transactions`.

### POST `/api/v1/ai/overbudget/check`

Memprediksi status risiko overbudget menggunakan Model BiLSTM sebelum transaksi benar-benar disimpan.

- **Base URL**: Python Service (`http://localhost:8000`)
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "user_id": "uuid-user-123",
    "amount": 150000,
    "category": "WANTS"
  }
  ```
- **Response**:
  ```json
  {
    "is_overbudget": true,
    "confidence_score": 0.88,
    "alert_message": "Peringatan: Transaksi ini berisiko membuat anggaran WANTS Anda jebol bulan ini!"
  }
  ```
