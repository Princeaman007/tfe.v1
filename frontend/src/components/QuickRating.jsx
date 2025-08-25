
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickRatingSchema } from "../schemas/reviewSchema";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../config.js";
import { useAuth } from '../context/AuthContext';

const QuickRating = ({ bookId, currentRating = 0, onRatingChange, disabled = false }) => {
  const { getAuthHeaders } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(currentRating);

  const {
    setValue,
    handleSubmit
  } = useForm({
    resolver: zodResolver(quickRatingSchema),
    defaultValues: {
      bookId: bookId,
      rating: 0
    }
  });

  const onRatingSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      console.log("⭐ Notation rapide:", data);

      const response = await axios.post(
  `${API_BASE_URL}/api/reviews/quick-rating`,
  {
    bookId: data.bookId,
    rating: data.rating
  },
  {
    timeout: 5000,
    headers: getAuthHeaders()
  }
);

      console.log("✅ Note enregistrée:", response.data);
      toast.success(`Note de ${data.rating}/5 enregistrée !`);
      
      setUserRating(data.rating);
      
      // Callback pour mettre à jour le parent
      if (onRatingChange) {
        onRatingChange(data.rating);
      }
      
    } catch (error) {
      console.error("❌ Erreur notation:", error);
      
      if (error.response?.status === 409) {
        toast.error("Vous avez déjà noté ce livre. Modifiez votre avis existant.");
      } else if (error.response?.status === 403) {
        toast.error("Vous devez avoir emprunté ce livre pour le noter.");
      } else {
        toast.error("Erreur lors de l'enregistrement de votre note.");
      }
      
      setUserRating(currentRating); // Reset sur erreur
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating) => {
    if (disabled || isSubmitting) return;
    
    setValue("bookId", bookId);
    setValue("rating", rating);
    setUserRating(rating);
    
    // Soumettre automatiquement
    handleSubmit(onRatingSubmit)();
  };

  const handleStarHover = (rating) => {
    if (disabled || isSubmitting) return;
    setUserRating(rating);
  };

  const handleMouseLeave = () => {
    if (disabled || isSubmitting) return;
    setUserRating(currentRating);
  };

  return (
    <div 
      className="d-flex align-items-center gap-1"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <FaStar
          key={rating}
          className={`${
            rating <= userRating ? "text-warning" : "text-muted"
          } ${disabled || isSubmitting ? "" : "cursor-pointer"}`}
          style={{ 
            cursor: disabled || isSubmitting ? "default" : "pointer",
            fontSize: "1.1rem",
            opacity: disabled ? 0.5 : 1
          }}
          onClick={() => handleStarClick(rating)}
          onMouseEnter={() => handleStarHover(rating)}
          title={disabled ? "Notation désactivée" : `Noter ${rating}/5`}
        />
      ))}
      
      {isSubmitting && (
        <Spinner animation="border" size="sm" className="ms-2" />
      )}
      
      {userRating > 0 && !isSubmitting && (
        <span className="small text-muted ms-2">
          {userRating}/5
        </span>
      )}
    </div>
  );
};

export default QuickRating;