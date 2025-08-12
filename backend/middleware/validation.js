import { validationResult } from 'express-validator';


export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Formatage des erreurs pour une réponse claire
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: formattedErrors,
      errorCount: formattedErrors.length
    });
  }

  // Si pas d'erreurs, passer au middleware/controller suivant
  next();
};

/**
 * Middleware de validation conditionnel
 * Permet de continuer même avec des erreurs (utile pour certains cas)
 */
export const handleValidationWarnings = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Ajouter les erreurs à la requête pour que le controller puisse les traiter
    req.validationWarnings = errors.array();
  }
  
  next();
};

/**
 * Middleware pour extraire seulement les champs validés
 * Supprime les champs non autorisés de req.body
 */
export const sanitizeValidatedFields = (allowedFields) => {
  return (req, res, next) => {
    const sanitizedBody = {};
    
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        // Support pour les champs imbriqués (ex: address.street)
        if (field.includes('.')) {
          const keys = field.split('.');
          let current = req.body;
          let target = sanitizedBody;
          
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current[key] !== undefined) {
              if (!target[key]) target[key] = {};
              target = target[key];
              current = current[key];
            } else {
              break;
            }
          }
          
          const lastKey = keys[keys.length - 1];
          if (current && current[lastKey] !== undefined) {
            target[lastKey] = current[lastKey];
          }
        } else {
          sanitizedBody[field] = req.body[field];
        }
      }
    });
    
    req.body = sanitizedBody;
    next();
  };
};

/**
 * Middleware pour logger les validations (développement)
 */
export const logValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Validation pour ${req.method} ${req.path}:`);
    console.log(`   Body:`, JSON.stringify(req.body, null, 2));
    
    if (!errors.isEmpty()) {
      console.log(`   ❌ Erreurs:`, errors.array());
    } else {
      console.log(`   ✅ Validation réussie`);
    }
  }
  
  next();
};

/**
 * Middleware pour valider les fichiers uploadés
 */
export const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(); // Pas de fichier, continuer
    }

    const errors = [];
    
    Object.keys(req.files).forEach(fieldName => {
      const file = req.files[fieldName];
      
      // Vérifier le type de fichier
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        errors.push({
          field: fieldName,
          message: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`,
          value: file.mimetype
        });
      }
      
      // Vérifier la taille
      if (file.size > maxSize) {
        errors.push({
          field: fieldName,
          message: `Fichier trop volumineux. Taille maximum: ${maxSize / (1024 * 1024)}MB`,
          value: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation des fichiers',
        errors,
        errorCount: errors.length
      });
    }

    next();
  };
};

/**
 * Factory pour créer des validateurs personnalisés réutilisables
 */
export const createCustomValidator = (validationFn, errorMessage) => {
  return (req, res, next) => {
    try {
      const isValid = validationFn(req.body, req.params, req.query, req);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: errorMessage || 'Validation personnalisée échouée',
          errors: [{ message: errorMessage }]
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la validation personnalisée',
        error: error.message
      });
    }
  };
};