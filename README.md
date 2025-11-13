# 🛡️ SIMS - Security Incident Management System

A modern, real-time web application for security departments to log, track, and analyze security incidents.

## ✨ Features

- 📊 Real-time Dashboard with Analytics
- 🚨 Incident Management & Tracking
- 🗺️ Interactive Hotspot Map
- 📈 Reports & Trends Analysis
- 🔔 Notifications & Alerts
- 👥 Role-Based Access Control
- 📱 Responsive Design

## 🚀 Quick Start

### Installation



2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 📦 Dependencies

### Core Dependencies
- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Recharts** - Data Visualization
- **Lucide React** - Icons
- **GSAP** - Animations
- **Axios** - HTTP Client
- **React Router DOM** - Routing

### Development Dependencies
- **ESLint** - Code Linting
- **PostCSS** - CSS Processing
- **Autoprefixer** - CSS Vendor Prefixes

## 🏗️ Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── IncidentCard.jsx
│   │   ├── MapView.jsx
│   │   └── Chart.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── IncidentForm.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── animations/
│   │   └── gsapAnimations.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 🎨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Demo Credentials

- **Email:** admin@SIMS.com
- **Password:** any password
- **Roles:** Administrator, Security Officer, Viewer

## 🌐 Environment Variables

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎯 Future Enhancements

- [ ] Real-time WebSocket notifications
- [ ] Advanced filtering and search
- [ ] AI-powered incident classification
- [ ] Mobile app (React Native)
- [ ] Email/SMS integration
- [ ] Multi-language support
- [ ] Dark mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Anthropic Claude for AI assistance
- React Team for amazing framework
- Tailwind CSS for utility-first styling
- Recharts for beautiful charts