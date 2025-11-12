# Admin Panel

This is the standalone Admin Panel application for MaterialMatrix.

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
The admin panel will run on `http://localhost:3002`

### Build
```bash
npm run build
```

## 📂 Project Structure
```
admin-panel/
├── src/
│   ├── AdminLogin.tsx      # Admin login page
│   ├── AdminDashboard.tsx  # Admin dashboard
│   ├── components/         # UI components
│   ├── hooks/              # React hooks
│   ├── lib/                # Utilities
│   └── App.tsx             # Main app component
├── public/
└── package.json
```

## 🔗 Backend Connection
The admin panel connects to the backend API at `http://localhost:5000/api`

## 📄 Available Routes
- `/login` - Admin login
- `/dashboard` - Admin dashboard (manage suppliers, applications, etc.)

## 🔑 Features
- Supplier application management
- Review and approve/reject supplier registrations
- View supplier documents (PAN, GST, CIN, etc.)
- Document preview and download functionality
