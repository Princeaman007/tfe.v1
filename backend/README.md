# 📚 Bibliothèque en Ligne - API Backend

API REST Node.js pour système de bibliothèque en ligne avec emprunts payants, gestion des utilisateurs et intégration Stripe.

## ✨ Fonctionnalités

- 🔐 **Auth complète** : JWT, vérification email, rôles (User/Admin/SuperAdmin)
- 📖 **Gestion livres** : CRUD, recherche, stock automatique, likes/favoris
- 💳 **Emprunts payants** : Intégration Stripe, calcul amendes, notifications
- ⭐ **Système d'avis** : Reviews avec modération
- 📊 **Dashboard admin** : Statistiques, gestion utilisateurs
- ⏰ **Tâches auto** : Vérification retards, emails de rappel

## 🚀 Installation

```bash
# Cloner et installer
git clone [URL_REPO]
cd backend
npm install

# Configuration .env
cp .env.example .env
# Éditer .env avec vos clés

# Démarrage
npm run dev  # Développement
npm start    # Production
```

## ⚙️ Variables d'environnement

```env
MONGO_URI=mongodb://localhost:27017/bibliotheque
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
```

## 🔗 API Endpoints

### Auth `/api/auth`
- `POST /register` - Inscription
- `POST /login` - Connexion  
- `GET /verify-email/:token` - Vérification email
- `POST /forgot-password` - Reset mot de passe

### Livres `/api/books`
- `GET /` - Liste des livres (filtres)
- `POST /` - Ajouter livre (admin)
- `GET /:id` - Détails livre
- `POST /:id/like` - Like/unlike

### Emprunts `/api/rentals`
- `POST /borrow` - Emprunter
- `POST /return` - Retourner
- `GET /` - Mes emprunts
- `GET /admin/all` - Tous emprunts (admin)

### Paiements `/api/payment`
- `POST /create-checkout-session` - Session Stripe
- `POST /verify-payment` - Vérifier paiement
- `POST /webhook` - Webhook Stripe

## 🛠️ Stack Technique

- **Backend** : Node.js, Express.js
- **Base** : MongoDB, Mongoose
- **Auth** : JWT, bcryptjs
- **Paiement** : Stripe
- **Email** : Nodemailer
- **Validation** : express-validator
- **Jobs** : node-cron

## 📁 Structure

```
backend/
├── controllers/    # Logique métier
├── models/        # Modèles MongoDB
├── routes/        # Routes API
├── middleware/    # Auth & validation
├── validators/    # Validation données
└── server.js      # Point d'entrée
```

## Authentification

**Rôles** : `user` → `admin` → `superAdmin`

**JWT Tokens** :
- Access token : 24h (cookies httpOnly)
- Refresh token : 7 jours

##  Stripe Integration

1. Créer compte Stripe
2. Configurer webhook : `POST /api/payment/webhook`
3. Ajouter clés dans `.env`

**Flux** : Sélection livre → Session Stripe → Paiement → Emprunt créé

##  Emails Automatiques

- Vérification inscription
- Reset mot de passe  
- Rappels échéances
- Notifications amendes

##  Cron Jobs

- **00:00** - Vérification retards
- **08:00** - Envoi emails amendes

##  Déploiement

```bash
# Variables prod
NODE_ENV=production
MONGO_URI=mongodb+srv://...
FRONTEND_URL=https://your-app.com

# Recommandations
- MongoDB Atlas
- SSL/HTTPS obligatoire
- Logs monitoring
```

## 📄 Licence

MIT License

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit et push
4. Ouvrir une Pull Request