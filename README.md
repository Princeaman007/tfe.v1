# 📚 Bibliothèque en Ligne

Application web complète de gestion de bibliothèque avec système de location payant, développée avec React et Node.js.

## ✨ Fonctionnalités

- 🔐 **Authentification complète** (JWT, rôles: User/Admin/SuperAdmin)
- 📖 **Catalogue interactif** avec recherche avancée, filtres et favoris
- 💳 **Locations payantes** sécurisées via Stripe
- ⭐ **Système d'avis** et notation des livres
- 📊 **Dashboard administrateur** avec analytics détaillées
- 📧 **Notifications email** automatiques
- 📱 **Interface responsive** Bootstrap

## 🛠️ Technologies

**Frontend:** React 18, Bootstrap 5, React Hook Form, Zod, React Router  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Paiement:** Stripe Integration  
**Auth:** JWT tokens avec refresh automatique  
**Email:** Nodemailer avec templates

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/Princeaman007/tfe.v1.git
cd tfe.v1

# Installation Frontend
cd frontend
npm install
cp .env.example .env
npm run dev

# Installation Backend (nouveau terminal)
cd ../backend
npm install
cp .env.example .env
npm run dev
```

L'application sera accessible sur :
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## ⚙️ Configuration

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_APP_NAME=Bibliothèque en Ligne
```

### Backend (.env)
```env
# Base de données
MONGO_URI=mongodb://localhost:27017/bibliotheque

# Authentification
JWT_SECRET=your-super-secure-jwt-secret
REFRESH_SECRET=your-refresh-token-secret

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📡 API Principales

```http
# Authentification
POST /api/auth/register           # Inscription
POST /api/auth/login              # Connexion
GET  /api/auth/verify-email/:token # Vérification email

# Catalogue
GET  /api/books                   # Liste des livres
GET  /api/books/:id               # Détails d'un livre
POST /api/books                   # Ajouter livre (Admin)

# Locations
POST /api/rentals/borrow          # Emprunter un livre
POST /api/rentals/return          # Retourner un livre
GET  /api/rentals                 # Historique personnel

# Paiements
POST /api/payment/create-checkout-session  # Session Stripe
POST /api/payment/verify-payment           # Vérifier paiement

# Administration
GET  /api/users                   # Gestion utilisateurs (Admin)
GET  /api/rentals/admin/all       # Toutes les locations (Admin)
```

## 👤 Système de Rôles

- **👤 User:** Consulter catalogue, emprunter livres, gérer favoris, laisser avis
- **👨‍💼 Admin:** + Gérer catalogue, voir statistiques, modérer avis
- **⚡ SuperAdmin:** + Gérer utilisateurs, configuration système

## 📦 Structure du Projet

```
library-management/
├── frontend/                 # Application React
│   ├── public/              # Assets statiques
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/          # Pages principales
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── services/       # API calls
│   │   ├── schemas/        # Validation Zod
│   │   └── utils/          # Utilitaires
│   └── package.json
│
└── backend/                 # API Express
    ├── controllers/         # Logique métier
    ├── models/             # Schémas MongoDB
    ├── routes/             # Endpoints API
    ├── middleware/         # Auth & validation
    ├── validators/         # Validation données
    └── server.js           # Point d'entrée
```

## 🔐 Sécurité

- ✅ Tokens JWT avec expiration
- ✅ Refresh tokens automatiques
- ✅ Cookies httpOnly sécurisés
- ✅ Validation stricte des données
- ✅ Protection CORS
- ✅ Helmet.js pour sécuriser les headers
- ✅ Mots de passe chiffrés (bcrypt)

## 💳 Intégration Stripe

1. Créer un compte [Stripe](https://stripe.com)
2. Récupérer les clés API (test/production)
3. Configurer le webhook endpoint : `POST /api/payment/webhook`
4. Tester avec les cartes de test Stripe

## 🚀 Déploiement

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy sur Vercel ou Netlify
```

### Backend (Railway/Render)
```bash
# Variables d'environnement production
NODE_ENV=production
MONGO_URI=mongodb+srv://...
FRONTEND_URL=https://your-app.vercel.app
```

### Recommandations Production
- MongoDB Atlas pour la base de données
- Variables Stripe en mode production
- Certificats SSL obligatoires
- Monitoring des logs
- Sauvegardes automatiques

## 🧪 Fonctionnalités Principales

### Pour les Utilisateurs
- 📚 Navigation fluide du catalogue
- 🔍 Recherche et filtres avancés
- ❤️ Système de favoris
- 💳 Paiement sécurisé en un clic
- 📧 Notifications par email
- 📱 Interface mobile-friendly

### Pour les Administrateurs
- 📊 Dashboard avec métriques temps réel
- 📈 Graphiques d'activité
- 👥 Gestion complète des utilisateurs
- 📚 CRUD complet sur le catalogue
- 💰 Suivi des paiements et amendes

## 📱 Captures d'Écran

*Ajoutez ici des captures d'écran de votre application*

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** vos changements (`git commit -m 'Ajout: nouvelle fonctionnalité'`)
4. **Push** sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Guidelines de Contribution
- Suivre les conventions de code existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les changements importants
- Vérifier que tous les tests passent

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support & FAQ

### Problèmes Courants

**Q: Erreur de connexion MongoDB**  
R: Vérifiez que MongoDB est lancé localement ou que votre URI Atlas est correcte

**Q: Paiements Stripe qui échouent**  
R: Utilisez les cartes de test Stripe et vérifiez vos clés API

**Q: Emails non reçus**  
R: Configurez un mot de passe d'application Gmail et vérifiez les spams

### Contact
- 📧 Email: info@princeaman.dev
- 🐛 Issues: https://github.com/Princeaman007/tfe.v1.git


---

**Développé avec par Aman Prince**

⭐ **N'hésitez pas à donner une étoile si ce projet vous aide !**