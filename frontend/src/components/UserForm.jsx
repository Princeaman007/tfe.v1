import React from "react";
import { Form, Row, Col, Alert } from "react-bootstrap";

const UserForm = ({ 
  formData, 
  setFormData, 
  isEditing = false, 
  currentUserRole = "admin",
  errors = {},
  showPassword = true 
}) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleOptions = () => {
    const baseOptions = [
      { value: "user", label: "Utilisateur", description: "Accès standard à la bibliothèque" },
      { value: "admin", label: "Administrateur", description: "Gestion des livres et utilisateurs" }
    ];

    if (currentUserRole === "superAdmin") {
      baseOptions.push({
        value: "superAdmin",
        label: "Super Administrateur",
        description: "Accès complet au système"
      });
    }

    return baseOptions;
  };

  return (
    <>
      {/* Informations de base */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Nom complet <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isInvalid={!!errors.name}
              placeholder="Ex: Jean Dupont"
              required
            />
            {errors.name && (
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Adresse email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              isInvalid={!!errors.email}
              placeholder="Ex: jean.dupont@email.com"
              required
            />
            {errors.email && (
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            )}
            {isEditing && (
              <Form.Text className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Attention : Changer l'email nécessitera une nouvelle vérification
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Mot de passe (uniquement pour la création) */}
      {showPassword && !isEditing && (
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>
                Mot de passe <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                value={formData.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                isInvalid={!!errors.password}
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
              {errors.password && (
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted">
                <i className="fas fa-shield-alt me-1"></i>
                Le mot de passe doit contenir au moins 6 caractères
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      )}

      {/* Rôle et statut */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Rôle <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.role || "user"}
              onChange={(e) => handleInputChange("role", e.target.value)}
              isInvalid={!!errors.role}
              disabled={isEditing && formData.role === "superAdmin" && currentUserRole !== "superAdmin"}
            >
              {getRoleOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            {errors.role && (
              <Form.Control.Feedback type="invalid">
                {errors.role}
              </Form.Control.Feedback>
            )}
            
            {/* Description du rôle sélectionné */}
            {formData.role && (
              <Form.Text className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                {getRoleOptions().find(opt => opt.value === formData.role)?.description}
              </Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Statut du compte</Form.Label>
            <div className="mt-2">
              <Form.Check
                type="checkbox"
                id="isVerified"
                label="Compte vérifié"
                checked={formData.isVerified || false}
                onChange={(e) => handleInputChange("isVerified", e.target.checked)}
                className="mb-2"
              />
              <Form.Text className="text-muted d-block">
                <i className="fas fa-check-circle me-1"></i>
                Un compte vérifié peut se connecter immédiatement
              </Form.Text>
            </div>
          </Form.Group>
        </Col>
      </Row>

      {/* Alertes informatives */}
      {formData.role === "superAdmin" && (
        <Alert variant="warning" className="mb-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Super Administrateur :</strong> Ce rôle donne un accès complet au système, 
          y compris la gestion des autres administrateurs. Utilisez avec précaution.
        </Alert>
      )}

      {formData.role === "admin" && (
        <Alert variant="info" className="mb-3">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Administrateur :</strong> Ce rôle permet de gérer les livres, les locations, 
          et les utilisateurs standards.
        </Alert>
      )}

      {!formData.isVerified && (
        <Alert variant="warning" className="mb-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Compte non vérifié :</strong> L'utilisateur devra vérifier son email 
          avant de pouvoir se connecter.
        </Alert>
      )}
    </>
  );
};

export default UserForm;