# 📚 Bibliothèque en Ligne

Application web de gestion de bibliothèque avec système de location payant.

## ✨ Fonctionnalités

- 🔐 **Authentification** (JWT, rôles: User/Admin/SuperAdmin)
- 📖 **Catalogue** avec recherche, filtres et favoris
- 💳 **Locations payantes** via Stripe
- ⭐ **Avis et notes** sur les livres
- 📊 **Dashboard admin** avec statistiques

## 🛠 Technologies

**Frontend:** React, Bootstrap, React Hook Form, Zod  
**Backend:** Node.js, Express, MongoDB, Stripe  
**Auth:** JWT tokens avec refresh automatique

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/username/library-management.git
cd library-management

# Frontend
cd frontend
npm install
cp .env.example .env  # Configurer les variables
npm run dev

# Backend (nouveau terminal)
cd backend
npm install
cp .env.example .env  # Configurer MongoDB, Stripe, etc.
npm run dev
```

## ⚙️ Configuration

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FORMSPREE_URL=https://formspree.io/f/your-id
```

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/library
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
```

## 📡 API Principales

```
POST /api/auth/login              # Connexion
GET  /api/books                   # Liste des livres
POST /api/rentals                 # Créer une location
POST /api/payment/create-session  # Paiement Stripe
GET  /api/users                   # Gestion users (Admin)
```

## 👤 Rôles

- **User:** Louer, favoris, avis
- **Admin:** + Gérer catalogue, analytics
- **SuperAdmin:** + Gérer utilisateurs

## 🚀 Déploiement

```bash
# Build frontend
cd frontend && npm run build

# Variables prod: MongoDB Atlas, Stripe prod, SMTP
# Deploy: Vercel/Netlify (frontend) + Railway/Render (backend)
```

## 📦 Structure

```
├── frontend/          # React app
│   ├── src/components # Composants UI
│   ├── src/pages     # Pages principales
│   └── src/schemas   # Validation Zod
└── backend/          # Express API
    ├── models        # MongoDB schemas
    └── routes        # API endpoints
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/feature-name`)
3. Commit (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/feature-name`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir [LICENSE](LICENSE) pour les détails.