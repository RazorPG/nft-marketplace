# 🎨 NFT Marketplace (DApp)

Selamat datang di repositori **NFT Marketplace**! Proyek ini adalah sebuah Decentralized Application (DApp) di mana pengguna dapat mencetak (mint), menjual, dan membeli NFT.

Proyek ini dibangun menggunakan arsitektur **Monorepo** yang memisahkan antara _Smart Contract_, _Backend_, dan _Frontend_ namun tetap dalam satu repositori agar mudah dikelola.

---

## 🏗️ Arsitektur Proyek

Proyek ini terdiri dari 3 bagian utama:

1. **Smart Contracts (`/contracts`)**

   - Ditulis menggunakan **Solidity** dan dikelola dengan **Hardhat**.
   - Terdiri dari kontrak `NFT.sol` (ERC-721) untuk kepemilikan aset dan `Marketplace.sol` untuk logika jual-beli.
   - Dideploy ke jaringan **Ethereum Sepolia Testnet**.

2. **Backend API & Indexer (`/backend`)**

   - Dibangun dengan **Node.js, Express, dan TypeScript**.
   - Menggunakan **Prisma** dan **PostgreSQL (Supabase)** sebagai database.
   - Memiliki **Indexer** (berbasis `ethers.js`) yang berjalan di latar belakang untuk memantau event dari blockchain secara otomatis dan menyimpan datanya ke database. Ini membuat aplikasi web menjadi sangat cepat karena tidak perlu membaca data langsung dari blockchain setiap saat.
   - Integrasi **IPFS (Pinata)** untuk menyimpan gambar dan metadata NFT secara terdesentralisasi.

3. **Frontend (`/frontend`)**
   - Dibangun dengan **React, Vite, TypeScript, dan Tailwind CSS**.
   - Desain antarmuka yang modern, responsif, dan mudah digunakan (UI/UX).
   - Terhubung ke wallet pengguna menggunakan dompet Web3 seperti **MetaMask**.

---

## ✨ Fitur Utama

- **Mint NFT**: Pengguna dapat mengunggah gambar dan mencetak NFT baru langsung ke blockchain. Gambar akan disimpan secara aman di IPFS.
- **Jelajah (Explore)**: Melihat semua NFT yang tersedia di marketplace beserta fitur pencarian pintar berdasarkan nama atau deskripsi.
- **Jual & Beli (Marketplace)**: Pengguna dapat mendaftarkan NFT mereka untuk dijual (Listing), membatalkan penjualan (Cancel), atau membeli NFT milik orang lain menggunakan koin kripto (ETH).
- **Koleksi Pribadi (My NFTs)**: Halaman khusus untuk melihat semua NFT yang dimiliki oleh dompet pengguna yang sedang terhubung.

---

## 🚀 Panduan Menjalankan di Komputer Lokal

### Persiapan

Pastikan Anda sudah menginstal:

- [Node.js](https://nodejs.org/) (versi 18 atau ke atas)
- [Git](https://git-scm.com/)
- Ekstensi browser [MetaMask](https://metamask.io/)

### Langkah Instalasi

**1. Clone Repositori**

```bash
git clone https://github.com/username/nft-marketplace.git
cd nft-marketplace
```

**2. Instalasi Dependensi**
Karena ini monorepo, instal dependencies di root, backend, dan frontend:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

**3. Konfigurasi Environment Variables (`.env`)**
Ada 3 file `.env` yang perlu disiapkan:

- **Root `.env`**: Salin `.env.example` ke `.env` dan isi RPC URL Alchemy serta Private Key MetaMask Anda (jika ingin deploy kontrak).
- **Backend (`/backend/.env`)**: Salin `backend/.env.example` ke `backend/.env`. Anda perlu menyiapkan URL Supabase, API Key Pinata, dan Alamat Kontrak.
- **Frontend (`/frontend/.env`)**: Salin `frontend/.env.example` ke `frontend/.env`. Sesuaikan Alamat Kontrak dan RPC URL.

**4. Migrasi Database**
Di dalam folder `backend`, jalankan perintah migrasi Prisma untuk menyiapkan tabel di Supabase:

```bash
cd backend
npx prisma migrate dev --name init
```

**5. Menjalankan Aplikasi**
Kembali ke folder root (utama), jalankan perintah ini untuk menghidupkan Backend dan Frontend secara bersamaan:

```bash
npm run dev
```

Aplikasi sekarang dapat diakses di:

- **Frontend Web**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

---

## 🛠️ Teknologi yang Digunakan

- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database & Storage**: PostgreSQL (Supabase), IPFS (Pinata)
