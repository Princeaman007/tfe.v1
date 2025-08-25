import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"]
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Format d'email invalide"]
    },
    password: { 
      type: String, 
      required: true,
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"]
    },
    role: { 
      type: String, 
      enum: {
        values: ["user", "admin", "superAdmin"],
        message: "Le rôle doit être user, admin ou superAdmin"
      }, 
      default: "user" 
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    favorites: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Book" 
    }],
    // Nouveaux champs pour la gestion avancée
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    profileImage: {
      type: String, // URL de l'image de profil
      default: null
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[+]?[0-9\s\-\(\)]{10,15}$/, "Format de téléphone invalide"]
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "France" }
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      language: { type: String, default: "fr", enum: ["fr", "en", "es"] },
      theme: { type: String, default: "light", enum: ["light", "dark"] }
    },
    
    stats: {
      totalRentals: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      totalFines: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      joinedAt: { type: Date, default: Date.now }
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null 
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    notes: {
      type: String, 
      trim: true,
      maxlength: [500, "Les notes ne peuvent pas dépasser 500 caractères"]
    }
  },
  { 
    timestamps: true,
    
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ "stats.totalRentals": -1 });

// Propriétés virtuelles
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('fullAddress').get(function() {
  if (!this.address?.street) return null;
  return `${this.address.street}, ${this.address.city} ${this.address.postalCode}, ${this.address.country}`;
});

userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

userSchema.virtual('initials').get(function() {
  if (!this.name) return this.email.charAt(0).toUpperCase();
  return this.name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
});


userSchema.methods.updateLoginInfo = function() {
  this.lastLoginAt = new Date();
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

userSchema.methods.incLoginAttempts = function() {
  
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000;
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.updateStats = function(statType, value = 1) {
  const updateField = `stats.${statType}`;
  return this.updateOne({ $inc: { [updateField]: value } });
};

userSchema.methods.canPerformAction = function(action) {
  if (!this.isActive || !this.isVerified) return false;
  if (this.isLocked) return false;
  
  const permissions = {
    user: ['read', 'rent', 'review', 'favorite'],
    admin: ['read', 'rent', 'review', 'favorite', 'manage_books', 'manage_users'],
    superAdmin: ['all']
  };
  
  if (this.role === 'superAdmin') return true;
  return permissions[this.role]?.includes(action) || false;
};


userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isVerified: true });
};

userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

userSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        superAdminUsers: { $sum: { $cond: [{ $eq: ['$role', 'superAdmin'] }, 1, 0] } }
      }
    }
  ]);
};

// Middleware pre-save
userSchema.pre('save', function(next) {
  
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  
  // Validation additionnelle pour les rôles
  if (this.isModified('role')) {
    if (this.role === 'superAdmin') {
      
      console.log(` Création/modification d'un superAdmin: ${this.email}`);
    }
  }
  
  next();
});

// Middleware post-save
userSchema.post('save', function(doc) {
  console.log(` Utilisateur sauvegardé: ${doc.email} (${doc.role})`);
});

// Middleware pre-remove
userSchema.pre('remove', function(next) {
  console.log(` Suppression de l'utilisateur: ${this.email}`);
  
  next();
});

export default mongoose.model("User", userSchema);