# 🚀 Promptzy - Cross-Platform Prompt Management App

**Organize, manage, and sync your prompts across all devices**

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.82-green.svg)](https://reactnative.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-orange.svg)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

---

## 📱 Platforms

- ✅ **Web** - Progressive Web App (Desktop & Mobile browsers)
- ✅ **Android** - Native Android app
- 🔄 **iOS** - Coming soon
- 🔄 **Windows Desktop** - Electron (optional)

---

## ✨ Features

### **Core Features:**
- 📝 **Markdown Editor** with live preview
- 📁 **Project Organization** with multi-level folders
- 🏷️ **Tag System** for easy categorization
- ⭐ **Favorites** to mark important prompts
- 🔍 **Full-text Search** across all prompts
- 📊 **Statistics** - Word, character, and token count
- 🔄 **Version History** - Track changes to your prompts
- 📤 **Share & Export** - JSON, Markdown, PDF, TXT formats
- 🔗 **Prompt Chaining** - Link related prompts together
- 📝 **Quick Notes** - Attach notes to prompts
- 🌓 **Dark Mode** - Easy on the eyes
- 🔐 **Secure** - Row Level Security with Supabase

### **Advanced Features:**
- ☁️ **Cloud Sync** - Access from any device
- 📴 **Offline Mode** - Work without internet
- 🔄 **Conflict Resolution** - Smart merge on sync
- 🎨 **Customization** - Themes, fonts, layouts
- 🔒 **Password Protection** - Secure sensitive projects
- 📦 **Backup & Restore** - Never lose your data
- 🔗 **QR Code Sharing** - Quick prompt sharing
- 📊 **Archive** - Keep old prompts organized

---

## 🏗️ Architecture

### **Monorepo Structure:**
```
Promptzy/
├── packages/
│   ├── shared/          # 95% shared code
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Helpers
│   │   └── lib/         # Supabase client
│   ├── web/             # React web app
│   ├── mobile/          # React Native (Android)
│   └── desktop/         # Electron (optional)
├── backend/
│   └── supabase/        # Database schema
└── docs/                # Documentation
```

### **Tech Stack:**

**Frontend:**
- React 18 (Web)
- React Native 0.82 (Mobile)
- TypeScript
- Tailwind CSS (Web)
- React Navigation (Mobile)
- Zustand (State Management)

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- Row Level Security (RLS)
- Real-time subscriptions

**Development:**
- Vite (Web bundler)
- Metro (React Native bundler)
- ESLint + Prettier

---

## 🚀 Quick Start

### **Prerequisites:**
- Node.js 20+
- npm or yarn
- Android Studio (for mobile)
- Git

### **1. Clone Repository:**
```bash
git clone https://github.com/bipash25/Promptzy.git
cd promptzy
```

### **2. Install Dependencies:**
```bash
# Install shared package
cd packages/shared
npm install

# Install web
cd ../web
npm install

# Install mobile  
cd ../mobile
npm install
```

### **3. Setup Supabase:**

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL from `backend/supabase/schema.sql` in SQL Editor
4. Get Project URL and Anon Key from Settings → API

### **4. Configure Environment:**

**Web** (`packages/web/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Mobile** (`packages/mobile/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **5. Run Applications:**

**Web:**
```bash
cd packages/web
npm run dev
# Open http://localhost:3000
```

**Android:**
```bash
cd packages/mobile

# Terminal 1 - Metro bundler
npx react-native start

# Terminal 2 - Run on device
npx react-native run-android
```

---

## 📚 Documentation

- [Web Build Instructions](packages/web/BUILD_INSTRUCTIONS.md)
- [Android Build Instructions](packages/mobile/BUILD_INSTRUCTIONS.md)
- [Database Schema](backend/supabase/schema.sql)
- [API Documentation](docs/API.md) *(coming soon)*

---

## 🎯 Roadmap

### **v1.0 (Current)** ✅
- [x] Core prompt management
- [x] Markdown editor
- [x] Cloud sync
- [x] Multi-platform support
- [x] Authentication
- [x] Project organization

### **v1.1 (Planned)**
- [ ] iOS app
- [ ] Browser extension
- [ ] Template marketplace
- [ ] Collaboration features
- [ ] Advanced search filters
- [ ] Prompt analytics

### **v2.0 (Future)**
- [ ] AI-powered suggestions
- [ ] Voice input
- [ ] Desktop apps (Windows, macOS, Linux)
- [ ] Team workspaces
- [ ] API access
- [ ] Integrations (Notion, Slack, etc.)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [React](https://reactjs.org/) - UI framework
- [React Native](https://reactnative.dev/) - Mobile framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

---

## 📧 Contact

- **Website:** [promptzy.com](https://promptzy.com)
- **Email:** support@promptzy.com
- **Twitter:** [@promptzy](https://twitter.com/promptzy)
- **Discord:** [Join our community](https://discord.gg/promptzy)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=bipash25/promptzy&type=Date)](https://star-history.com/#bipash25/promptzy&Date)

---

## 📊 Project Stats

- **Lines of Code:** ~15,000+
- **Components:** 50+
- **Database Tables:** 11
- **API Endpoints:** Serverless (Supabase)
- **Code Sharing:** 95% between platforms
- **Test Coverage:** Coming soon

---

## 🎨 Screenshots

### **Web Application**
![Dashboard](docs/screenshots/web-dashboard.png)
![Editor](docs/screenshots/web-editor.png)

### **Mobile Application**
![Mobile Dashboard](docs/screenshots/mobile-dashboard.png)
![Mobile Editor](docs/screenshots/mobile-editor.png)

---

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Secure authentication via Supabase Auth
- HTTPS only in production
- Environment variables for sensitive data
- Regular security audits

For security issues, please email: security@promptzy.com

---

## 💰 Support the Project

If you find Promptzy useful, consider supporting its development:

- ⭐ Star this repository
- 🐦 Follow us on Twitter
- 💬 Join our Discord community
- ☕ [Buy me a coffee](https://buymeacoffee.com/promptzy)

---

**Built with ❤️ by developers, for developers**

*Organize your prompts. Boost your productivity. Stay creative.*

---

## 📅 Changelog

### v1.0.0 (2025-11-16)
- Initial release
- Web and Android apps
- Core features implemented
- Supabase backend integration
- Markdown editor with preview
- Cloud sync functionality
- Project organization
- Authentication system

---

Made with 💙 using React, React Native, and Supabase