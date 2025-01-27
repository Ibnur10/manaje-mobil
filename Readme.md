## Teknologi yang Digunakan:
- **Backend**: Node.js, Express.js
- **Frontend**: EJS
- **Database**: MongoDB
- **Autentikasi**: JWT (JSON Web Tokens)


## Daftar Username dan Password
- **User**
  - Username: `sales`
  - Password: `123456`
  - Username: `Marketing`
  - Password: `123456`
  - Username: `Accounting`
  - Password: `123456`
  
- **Approver Level 1**
  - Username: `DepHRD`
  - Password: `123456`

- **Approver Level 2 (opsional)**
  - Username: `Manager`
  - Password: `123456`

## Versi Database
- MongoDB: `4.4`

## Versi Node
- Node: `18.x`

## Framework
- Backend: Node.js `14.x`, Express `4.x`
- Frontend: EJS `3.x`


### Instalasi
1. Clone repository ini

2. Install dependencies:
   ```sh
   npm install
   ```

3. Konfigurasi environment variables:
   Buat file `.env` di root directory dengan konten sebagai berikut:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/vehicle_booking
   SECRET=your_secret
   ```

### Menjalankan Aplikasi
1. Jalankan server:
   ```sh
   npm start
   ```

2. Akses aplikasi di browser:
   ```
   http://localhost:5000
   ```