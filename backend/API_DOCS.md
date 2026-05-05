# MyFinance API Documentation

Dokumentasi ini berisi daftar endpoint API backend MyFinance yang dapat digunakan oleh Frontend. Semua endpoint (kecuali Auth & Health) memerlukan Bearer Token (JWT) di header `Authorization`.

Cek API Server Backend status di [Health Check](https://myfinance-backend-staging.up.railway.app/api/v1/health)

| Key | Value |
|---|---|
| **Base URL (Local)** | `http://localhost:3000` |
| **Base URL (Staging)** | `https://myfinance-backend-staging.up.railway.app` |
| **API Prefix** | `/api/v1` |
| **Category Options** | `NEEDS`, `WANTS`, `OTHER` |
| **Type Transaction** | `INCOME`, `EXPENSE`, `TRANSFER` |
| **Type Wallets** | `CASH`, `BANK`, `E-WALLET` |


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
    "full_name": "John Doe",
    "email": "john@example.com",
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
    "email": "john@example.com",
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
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "profile_picture": "https://example.com/photo.jpg",
      "created_at": "2026-05-03T12:00:00.000Z"
    }
  }
  ```

### PUT `/api/v1/users/profile`
Memperbarui nama dan/atau foto profil. Menggunakan `COALESCE` sehingga field yang tidak dikirim tidak akan di-overwrite.
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "full_name": "John Doe Updated",
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
  > **Type options**: `CASH`, `BANK`, `E-WALLET`

### PUT `/api/v1/wallets/:id`
Memperbarui data dompet yang ada berdasarkan ID.
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "Dompet Utama Updated",
    "type": "bank",
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
    "source_wallet_id": 1,
    "destination_wallet_id": 2,
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
    "month_period": "2026-05-01" // Format tanggal atau bulan yang disepakati (misal hari pertama bulan tersebut)
  }
  ```

### PUT `/api/v1/budgets/:id`
Memperbarui batas anggaran (limit_amount).
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

### GET `/api/v1/transactions`
Mendapatkan riwayat transaksi pengguna.
- **Auth Required**: Yes

### POST `/api/v1/transactions`
Mencatat transaksi baru (juga mendukung data dari scan AI OCR).
- **Auth Required**: Yes
- **Body** (Catat Manual — Income / Expense):
  ```json
  {
    "wallet_id": 1,
    "type": "EXPENSE",
    "total_amount": 50000,
    "category": "NEEDS",
    "subcategory": "Kebutuhan",
    "description": "Makan siang di warteg",
    "transaction_date": "2026-05-03"
  }
  ```
  > **Type options**: `INCOME`, `EXPENSE`

- **Body** (Dari AI OCR Scan Struk — dengan items & receipt_data):
  ```json
  {
    "wallet_id": 1,
    "type": "EXPENSE",
    "total_amount": 100000,
    "category": "NEEDS",
    "subcategory": "Kebutuhan Rumah",
    "description": "Belanja di minimarket",
    "transaction_date": "2026-05-03",
    "items": [
      {
        "name": "Sabun Mandi",
        "price": 20000,
        "category": "NEEDS",
        "subcategory": "Kebutuhan Rumah"
      },
      {
        "name": "Beras 5kg",
        "price": 80000,
        "category": "NEEDS",
        "subcategory": "Kebutuhan Rumah"
      }
    ],
    "receipt_data": {
      "image_url": "https://url-gambar-struk.com/img.jpg",
      "raw_ai_output": "{\"total\": 100000, \"items\": [...]}"
    }
  }
  ```

### DELETE `/api/v1/transactions/:id`
Menghapus transaksi berdasarkan ID, yang akan mengembalikan saldo (Reverse Balance Logic).
- **Auth Required**: Yes

---

## 7. Financial Insights (Express)

Mendapatkan laporan dan insight keuangan hasil agregasi data pengguna.

### GET `/api/v1/insights`
Mengambil ringkasan kondisi keuangan (Health Score, Money Leak, dll). Data ini diolah melalui integrasi dengan Python AI Service.
- **Auth Required**: Yes
- **Query Params**: `?period=monthly` atau `?period=weekly`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "health_score": 85,
      "money_leak": "Pengeluaran kopi terlalu tinggi di minggu ini.",
      "ai_insight": "Anda bisa menabung 10% lebih banyak jika mengurangi WANTS sebesar Rp 200.000",
      "predicted_cashflow": 1500000
    }
  }
  ```

---

## 8. AI & Data Science Services (Python API)

Endpoint khusus yang mengarah ke server Python untuk pemrosesan berbasis Machine Learning dan Computer Vision. Frontend dapat menembak endpoint ini secara langsung atau melalui proxy Express backend.

### POST `/api/v1/ai/scan`
Melakukan ekstraksi OCR dari gambar struk belanja.
- **Base URL**: Python Service
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Body**: `image` — File gambar struk (JPG/PNG)
- **Response**: Mengembalikan array objek item belanja yang nantinya dikirim oleh Frontend ke endpoint `POST /api/v1/transactions`.

### POST `/api/v1/ai/overbudget/check`
Memprediksi status risiko overbudget menggunakan Model BiLSTM sebelum transaksi benar-benar disimpan.
- **Base URL**: Python Service
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