
import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminCreateUserSchema, adminUpdateUserSchema } from "../schemas/userSchema";
import UserForm from "./UserForm";

const UserFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData = null,
  title,
  mode = "create", // "create" ou "edit"
  currentUserRole = "admin" // Rôle de l'utilisateur connecté
}) => {
  const [submitError, setSubmitError] = useState("");

  // Choisir le bon schéma selon le mode
  const schema = mode === "edit" ? adminUpdateUserSchema : adminCreateUserSchema;
  const isEditMode = mode === "edit" && initialData;

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid },
    trigger
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      isVerified: false
    }
  });

  // Observer tous les champs pour les passer à UserForm
  const watchedFields = watch();

  // Fonction pour mettre à jour les données du formulaire
  const setFormData = (updateFn) => {
    const newData = typeof updateFn === 'function' ? updateFn(watchedFields) : updateFn;

    Object.keys(newData).forEach(key => {
      if (newData[key] !== undefined) {
        setValue(key, newData[key], { shouldValidate: true, shouldDirty: true });
      }
    });
  };

  // Populate form with initial data
  useEffect(() => {
    if (show) {
      if (initialData) {
        // Mode édition - populate avec les données existantes
        reset({
          name: initialData.name || "",
          email: initialData.email || "",
          role: initialData.role || "user",
          isVerified: initialData.isVerified || false,
          // Ne pas inclure les mots de passe en mode édition
          password: "",
          confirmPassword: ""
        });
      } else {
        // Mode création - formulaire vide
        reset({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
          isVerified: false
        });
      }
      setSubmitError("");
    }
  }, [initialData, show, reset]);

  // Reset error when modal closes
  useEffect(() => {
    if (!show) {
      setSubmitError("");
    }
  }, [show]);

  const onFormSubmit = async (data) => {
    try {
      setSubmitError("");

      let preparedData;

      if (isEditMode) {
        // Mode édition - préparer seulement les champs modifiés
        preparedData = {};

        if (data.name !== initialData.name) preparedData.name = data.name;
        if (data.email !== initialData.email) preparedData.email = data.email;
        if (data.role !== initialData.role) preparedData.role = data.role;
        if (data.isVerified !== initialData.isVerified) preparedData.isVerified = data.isVerified;

        // Vérifier qu'il y a des modifications
        if (Object.keys(preparedData).length === 0) {
          setSubmitError("Aucune modification détectée");
          return;
        }
      } else {
        // Mode création - préparer toutes les données (sans confirmPassword)
        const { confirmPassword, ...dataWithoutConfirm } = data;
        preparedData = dataWithoutConfirm;
      }

      await onSubmit(preparedData);

      // Si succès, le parent fermera le modal
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setSubmitError(
        error.response?.data?.message ||
        "Une erreur est survenue lors de l'opération"
      );
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onHide();
    }
  };

  // Déterminer si le bouton submit doit être actif
  const isSubmitDisabled = () => {
    if (isSubmitting) return true;
    if (mode === "create") return !isValid;
    if (mode === "edit") return !isDirty;
    return false;
  };

  // Convertir les erreurs de React Hook Form au format attendu par UserForm
  const formatErrors = (rhfErrors) => {
    const formattedErrors = {};
    Object.keys(rhfErrors).forEach(key => {
      if (rhfErrors[key]?.message) {
        formattedErrors[key] = rhfErrors[key].message;
      }
    });
    return formattedErrors;
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop={isSubmitting ? "static" : true}
      size="lg"
      centered
    >
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>
          <i className={`fas ${isEditMode ? 'fa-user-edit' : 'fa-user-plus'} me-2`}></i>
          {title}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              <i className="fas fa-exclamation-circle me-2"></i>
              {submitError}
            </Alert>
          )}

          {/* Contexte pour le mode édition */}
          {isEditMode && (
            <div className="bg-light p-3 rounded mb-4">
              <h6 className="text-primary mb-2">
                <i className="fas fa-user me-2"></i>
                Utilisateur en cours de modification
              </h6>
              <div className="row">
                <div className="col-md-8">
                  <strong>{initialData.name}</strong>
                  <br />
                  <span className="text-muted">{initialData.email}</span>
                </div>
                <div className="col-md-4 text-end">
                  <span className={`badge bg-${initialData.role === 'admin' ? 'warning' : initialData.role === 'superAdmin' ? 'danger' : 'primary'}`}>
                    {initialData.role === 'admin' ? 'Admin' : initialData.role === 'superAdmin' ? 'Super Admin' : 'Utilisateur'}
                  </span>
                  {initialData.isVerified && (
                    <>
                      <br />
                      <small className="text-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Vérifié
                      </small>
                    </>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* Utilisation du composant UserForm existant */}
          <UserForm
            formData={watchedFields}
            setFormData={setFormData}
            isEditing={isEditMode}
            currentUserRole={currentUserRole}
            errors={formatErrors(errors)}
            showPassword={!isEditMode} // Masquer le mot de passe en mode édition
          />

          {/* Indicateur de modifications pour le mode édition */}
          {isEditMode && isDirty && (
            <div className="alert alert-info mt-3">
              <i className="fas fa-info-circle me-2"></i>
              Des modifications ont été détectées
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <i className="fas fa-times me-2"></i>
            Annuler
          </Button>
          <Button
            variant={isEditMode ? "warning" : "primary"}
            type="submit"
            disabled={isSubmitDisabled()}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {isEditMode ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              <>
                <i className={`fas ${isEditMode ? 'fa-save' : 'fa-user-plus'} me-2`}></i>
                {isEditMode ? "Mettre à jour" : "Créer l'utilisateur"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UserFormModal;