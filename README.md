<div align="center">
 🎓 Campus‑Go
 
**Your campus, in your pocket.**
 
The official mobile companion for the CSBM Student Enrollment System — enroll, pay, check in, and carry your student life on your phone.
 
</div>

 
## 📖 About
 
Campus-Go turns the whole enrollment-to-graduation journey into something you can do from a bus queue. No more standing in line to submit a form, hunting for a payment slip, or fumbling for a physical ID at a workshop door — it's all one tap away.
 
Built as a lightweight, native-feeling companion to the CSBM Student Enrollment System, it keeps students connected to their program, their documents, and their campus events in real time.
 
## ✨ Features
 
| | |
|---|---|
| 🔐 **Authentication** | Secure student login & signup |
| 🎓 **Program Enrollment** | Apply and track enrollment status end-to-end |
| 📄 **Document Upload** | Submit NIC / birth certificate straight from your camera roll |
| 💳 **Payments** | Stripe-powered, secure fee payment |
| 🎟️ **QR Check-ins** | Scan into workshops and events in seconds |
| 📱 **Digital Student Wallet** | Your student identity, digitized |
| 📅 **Event Management** | Never miss a workshop or campus event again |
| ⚡ **Real-time Sync** | Firebase-backed, always up to date |
 
## 🛠️ Tech Stack
 
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Routing:** Expo Router (file-based)
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Payments:** Stripe API
## 📂 Project Structure
 
```
Campus-Go/
├── app/               # App screens (Expo Router — file-based routing)
├── components/        # Reusable UI components
├── assets/
│   └── images/        # Images & static files
├── config/            # Firebase & app configuration
├── constants/         # Global constants
├── hooks/             # Custom React hooks
├── scripts/           # Utility scripts
├── app.json           # Expo configuration
└── package.json       # Dependencies
```
 
## 🚀 Getting Started
 
### Prerequisites
- Node.js & npm
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project
- A Stripe account
### 1. Clone & Install
 
```bash
git clone https://github.com/your-username/Campus-Go.git
cd Campus-Go
npm install
```
 
### 2. Configure Firebase
 
Create a Firebase project and enable:
- Authentication
- Firestore Database
- Storage
Then drop your config into `config/firebaseConfig.ts`.
 
### 3. Configure Stripe
 
Add your Stripe **publishable key** to your environment variables, and set up your backend webhook if you're running a Node.js payment backend.
 
### 4. Run It
 
```bash
npx expo start
```
 
Open it in:
- 📲 Expo Go (physical device)
- 🤖 Android Emulator
- 🍎 iOS Simulator
## 🧪 Development Notes
 
- File-based routing via Expo Router — add a screen, get a route
- Modular, reusable component structure
- Keep API keys in environment variables, never hardcoded
## 📌 Roadmap
 
- [ ] Push notifications
- [ ] Admin dashboard
- [ ] Standalone Node.js backend API
- [ ] AI-based recommendations
## 👨‍💻 Author
 
**Imalka Dev Hub**
 
## 📄 License
 
Licensed under the [MIT License](LICENSE).
 
---
 
<div align="center">
If Campus-Go made your campus life easier, consider giving it a ⭐
 
</div>
 
