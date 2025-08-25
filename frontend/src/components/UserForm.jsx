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
  mode = "create", 
  currentUserRole = "admin" 
}) => {
  const [submitError, setSubmitError] = useState("");

  
  const schema = mode === "edit" ? adminUpdateUserSchema : adminCreateUserSchema;
  const isEditMode = mode === "edit" && initialData;

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
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

  
  const watchedFields = watch();

  
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
        
        reset({
          name: initialData.name || "",
          email: initialData.email || "",
          role: initialData.role || "user",
          isVerified: initialData.isVerified || false,
          
          password: "",
          confirmPassword: ""
        });
      } else {
        
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
    console.log("🔍 Données du formulaire:", data);
    console.log("🔍 Données initiales:", initialData);

    let preparedData;

    if (isEditMode) {
      
      preparedData = {};

      console.log("🔍 Comparaison role:", {
        formRole: data.role,
        initialRole: initialData.role,
        different: data.role !== initialData.role
      });

      if (data.name !== initialData.name) preparedData.name = data.name;
      if (data.email !== initialData.email) preparedData.email = data.email;
      if (data.role !== initialData.role) preparedData.role = data.role;
      if (data.isVerified !== initialData.isVerified) preparedData.isVerified = data.isVerified;

      console.log("🔍 Données préparées:", preparedData);

      
      if (Object.keys(preparedData).length === 0) {
        setSubmitError("Aucune modification détectée");
        return;
      }
    } else {
  preparedData = {
    name: data.name,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword, 
    role: data.role,
    isVerified: data.isVerified
  };
}

    
    console.log("🔍 preparedData final:", preparedData);

    await onSubmit(preparedData);

    
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

  
  const isSubmitDisabled = () => {
    if (isSubmitting) return true;
    if (mode === "create") return !isValid;
    if (mode === "edit") return !isDirty;
    return false;
  };

  
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

          
          <div>
            <div className="mb-3">
              <label className="form-label">Nom</label>
              <input
                type="text"
                className="form-control"
                {...register('name')}
              />
              {errors.name && (
                <div className="text-danger small mt-1">
                  {errors.name.message}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                {...register('email')}
              />
              {errors.email && (
                <div className="text-danger small mt-1">
                  {errors.email.message}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Rôle</label>
              <select
                className="form-select"
                {...register('role')}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
                <option value="superAdmin">Super Admin</option>
              </select>
              {errors.role && (
                <div className="text-danger small mt-1">
                  {errors.role.message}
                </div>
              )}
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  {...register('isVerified')}
                />
                <label className="form-check-label">Compte vérifié</label>
              </div>
              {errors.isVerified && (
                <div className="text-danger small mt-1">
                  {errors.isVerified.message}
                </div>
              )}
            </div>

            
            {!isEditMode && (
              <>
                <div className="mb-3">
                  <label className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    {...register('password')}
                  />
                  {errors.password && (
                    <div className="text-danger small mt-1">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <div className="text-danger small mt-1">
                      {errors.confirmPassword.message}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          
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