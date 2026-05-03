# MyFinance API Documentation

Dokumentasi ini berisi daftar endpoint API backend MyFinance yang dapat digunakan oleh Frontend. Semua endpoint (kecuali Auth & Health) memerlukan Bearer Token (JWT) di header `Authorization`.

**Base URL (Local)**: `http://localhost:3000`
**Category Options**: `NEEDS`, `WANTS`, `OTHER`
**Type Transaction**: `INCOME`, `EXPENSE`, `TRANSFER`
**Type Wallets**: `CASH`, `BANK`, `E-WALLET`


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

### POST `/api/auth/register`
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

### POST `/api/auth/login`
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

### GET `/api/users/profile`
Mendapatkan data profil user yang sedang login.
- **Auth Required**: Yes

### PUT `/api/users/profile`
Memperbarui nama profil.
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "full_name": "John Doe Updated"
  }
  ```

### PUT `/api/users/password`
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

### GET `/api/wallets`
Mendapatkan semua daftar dompet milik pengguna.
- **Auth Required**: Yes

### POST `/api/wallets`
Membuat dompet baru.
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "Dompet Utama",
    "type": "cash", // atau bank, e-wallet, dll
    "balance": 1000000
  }
  ```

### PUT `/api/wallets/:id`
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

### DELETE `/api/wallets/:id`
Menghapus dompet berdasarkan ID.
- **Auth Required**: Yes

### POST `/api/wallets/transfer`
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

### GET `/api/budgets`
Mendapatkan daftar anggaran yang telah diatur.
- **Auth Required**: Yes

### POST `/api/budgets`
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

### PUT `/api/budgets/:id`
Memperbarui batas anggaran (limit_amount).
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "limit_amount": 2500000
  }
  ```

### DELETE `/api/budgets/:id`
Menghapus anggaran berdasarkan ID.
- **Auth Required**: Yes

---

## 6. Transactions

Endpoint untuk mencatat pengeluaran, pemasukan, dan scan struk.

### GET `/api/transactions`
Mendapatkan riwayat transaksi pengguna.
- **Auth Required**: Yes

### POST `/api/transactions`
Mencatat transaksi baru (juga mendukung data dari scan AI OCR).
- **Auth Required**: Yes
- **Body** (Standar):
  ```json
  {
    "wallet_id": 1,
    "type": "expense", // atau 'income'
    "total_amount": 50000,
    "category": "NEEDS",
    "subcategory": "Kebutuhan ",
    "description": "Makan siang di warteg",
    "transaction_date": "2026-05-03"
  }
  ```
- **Body** (Dengan Item Spesifik & Data Struk AI):
  ```json
  {
    "wallet_id": 1,
    "type": "expense",
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

### DELETE `/api/transactions/:id`
Menghapus transaksi berdasarkan ID, yang akan mengembalikan saldo (Reverse Balance Logic).
- **Auth Required**: Yes

---

## 7. Insights

Endpoint untuk fitur Artificial Intelligence (AI) seperti Insight Keuangan.

### GET `/api/insights`
Mendapatkan insight keuangan berdasarkan transaksi pengguna.
- **Auth Required**: Yes
