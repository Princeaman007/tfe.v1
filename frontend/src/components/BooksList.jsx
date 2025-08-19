// frontend/src/components/BooksList.jsx - Mise à jour avec favoris
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Row, Col, Card, Button, Form, Spinner, Pagination, Badge
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from '../../config.js';;

const BooksList = () => {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sortByPrice, setSortByPrice] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [favoriteStates, setFavoriteStates] = useState({}); // Pour gérer l'état individuel de chaque livre

  useEffect(() => {
    fetchBooks(1, true);
  }, [search, genre, sortByPrice]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserFavorites();
    }
  }, [isAuthenticated]);

  const fetchBooks = async (pageNumber = 1, reset = false) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/books`, {
        params: { page: pageNumber, limit: 8, search, genre, sortByPrice },
      });
      const { books: fetchedBooks, totalPages: serverTotalPages } = response.data;
      setBooks(reset ? fetchedBooks : [...books, ...fetchedBooks]);
      setTotalPages(serverTotalPages || 1);
    } catch (err) {
      console.error("Erreur lors du chargement des livres :", err);
      toast.error("Erreur lors du chargement des livres");
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async (bookId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/favorites/check/${bookId}`, {
        withCredentials: true
      });
      return res.data.isFavorite;
    } catch (err) {
      console.error("Erreur lors de la vérification du statut favori:", err);
      return false;
    }
  };

  const fetchUserFavorites = async () => {
    try {
      console.log(" Récupération des favoris...");
      const res = await axios.get(`${API_BASE_URL}/api/favorites`, {
        withCredentials: true
      });
      
      console.log(" Réponse favoris:", res.data);
      
      // Vérifier que res.data.favorites existe et est un tableau
      if (res.data.favorites && Array.isArray(res.data.favorites)) {
        const favoriteIds = new Set(res.data.favorites.map(book => book._id));
        setFavorites(favoriteIds);
        
        // Créer un objet avec l'état de chaque favori
        const favStates = {};
        res.data.favorites.forEach(book => {
          favStates[book._id] = true;
        });
        setFavoriteStates(favStates);
        
        console.log(" Favoris IDs:", Array.from(favoriteIds));
      } else {
        console.log("⚠️ Aucun favori trouvé ou format incorrect");
        setFavorites(new Set());
        setFavoriteStates({});
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des favoris:", error);
      console.error("❌ Détails de l'erreur:", error.response?.data);
      
      // Ne pas afficher d'erreur si l'utilisateur n'a simplement pas de favoris
      if (error.response?.status !== 404) {
        toast.error("Erreur lors de la récupération des favoris");
      }
      // En cas d'erreur, initialiser avec un Set vide
      setFavorites(new Set());
      setFavoriteStates({});
    }
  };

  const handleLike = async (bookId) => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour liker un livre");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/books/${bookId}/like`, {}, { withCredentials: true });
      fetchBooks(page, true);
      toast.success("Like mis à jour!");
    } catch (error) {
      console.error("Erreur lors du like :", error);
      toast.error("Erreur lors du like");
    }
  };

  const handleFavorite = async (bookId) => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour ajouter aux favoris");
      return;
    }

    // Loading individuel pour chaque livre
    setFavoriteStates(prev => ({ ...prev, [`${bookId}_loading`]: true }));
    
    try {
      console.log("🔍 Toggle favori pour bookId:", bookId);
      
      // 1. Toggle favori
      const favoriteRes = await axios.post(`${API_BASE_URL}/api/favorites/toggle`, 
        { bookId }, 
        { withCredentials: true }
      );
      
      console.log("✅ Réponse toggle favori:", favoriteRes.data);

      // 2. Like automatique en même temps
      await axios.post(`${API_BASE_URL}/api/books/${bookId}/like`, {}, { 
        withCredentials: true 
      });
      
      console.log("✅ Like automatique appliqué");

      // Mettre à jour l'état favori
      setFavoriteStates(prev => ({ 
        ...prev, 
        [bookId]: favoriteRes.data.isFavorite,
        [`${bookId}_loading`]: false 
      }));

      // Mettre à jour aussi le Set pour la compatibilité
      const newFavorites = new Set(favorites);
      if (favoriteRes.data.isFavorite) {
        newFavorites.add(bookId);
        console.log("➕ Livre ajouté aux favoris + liké");
      } else {
        newFavorites.delete(bookId);
        console.log("➖ Livre retiré des favoris + like retiré");
      }
      setFavorites(newFavorites);

      // Recharger les livres pour mettre à jour le compteur de likes
      fetchBooks(page, true);

      // Toast de succès
      toast.success(favoriteRes.data.message, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Erreur de favori :", err);
      toast.error("Erreur lors de la mise à jour des favoris");
      setFavoriteStates(prev => ({ ...prev, [`${bookId}_loading`]: false }));
    }
  };

  const handleRent = async (bookId) => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour louer un livre");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/payment/create-checkout-session`,
        { bookId },
        { withCredentials: true }
      );
      const { url } = res.data;
      window.location.href = url;
    } catch (err) {
      console.error("❌ Erreur Stripe BooksList:", err);
      toast.error(err.response?.data?.message || "Erreur lors de la création du paiement");
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4 fw-bold text-primary">
         Nos Livres Disponibles à la Location
      </h2>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Control
            placeholder="Recherche par titre, auteur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="">Tous les genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="science">Science</option>
            <option value="fantasy">Fantasy</option>
            <option value="romance">Romance</option>
            <option value="thriller">Thriller</option>
            <option value="biography">Biographie</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select value={sortByPrice} onChange={e => setSortByPrice(e.target.value)}>
            <option value="">Trier par prix</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </Form.Select>
        </Col>
      </Row>

      <Row className="gy-4">
        {books.map(book => (
          <Col key={book._id} lg={3} md={4} sm={6}>
            <Card className="shadow-sm h-100 position-relative">
              {/* Badge de disponibilité */}
              <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 2 }}>
                <Badge bg={book.availableCopies > 0 ? "success" : "danger"}>
                  {book.availableCopies > 0 ? "Disponible" : "Indisponible"}
                </Badge>
              </div>

              {/* Bouton favori + like - VERSION CŒUR PRO */}
              {isAuthenticated && (
                <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 10 }}>
                  <div
                    className="heart-button shadow-lg"
                    onClick={() => handleFavorite(book._id)}
                    title={favoriteStates[book._id] ? "Retirer des favoris & unlike" : "Ajouter aux favoris & liker"}
                    style={{
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: favoriteStates[book._id] ? '#e74c3c' : 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '50%',
                      cursor: favoriteStates[`${book._id}_loading`] ? 'wait' : 'pointer',
                      border: favoriteStates[book._id] ? '2px solid #c0392b' : '2px solid rgba(231, 76, 60, 0.3)',
                      backdropFilter: 'blur(15px)',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: favoriteStates[`${book._id}_loading`] ? 'scale(0.85)' : 'scale(1)',
                      boxShadow: favoriteStates[book._id] 
                        ? '0 8px 25px rgba(231, 76, 60, 0.4), 0 0 0 3px rgba(231, 76, 60, 0.1)' 
                        : '0 4px 15px rgba(0, 0, 0, 0.1)',
                      opacity: favoriteStates[`${book._id}_loading`] ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!favoriteStates[`${book._id}_loading`]) {
                        e.target.style.transform = 'scale(1.15)';
                        e.target.style.boxShadow = favoriteStates[book._id]
                          ? '0 12px 35px rgba(231, 76, 60, 0.5), 0 0 0 4px rgba(231, 76, 60, 0.2)'
                          : '0 8px 25px rgba(231, 76, 60, 0.3), 0 0 0 3px rgba(231, 76, 60, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!favoriteStates[`${book._id}_loading`]) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = favoriteStates[book._id]
                          ? '0 8px 25px rgba(231, 76, 60, 0.4), 0 0 0 3px rgba(231, 76, 60, 0.1)'
                          : '0 4px 15px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!favoriteStates[`${book._id}_loading`]) {
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!favoriteStates[`${book._id}_loading`]) {
                        e.target.style.transform = 'scale(1.15)';
                      }
                    }}
                  >
                    {favoriteStates[`${book._id}_loading`] ? (
                      <div style={{ 
                        width: '20px', 
                        height: '20px',
                        border: '2px solid transparent',
                        borderTop: '2px solid #e74c3c',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    ) : (
                      <i 
                        className="fas fa-heart"
                        style={{
                          fontSize: '20px',
                          color: favoriteStates[book._id] ? 'white' : '#e74c3c',
                          filter: favoriteStates[book._id] ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
                          transition: 'all 0.3s ease',
                          textShadow: favoriteStates[book._id] ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                        }}
                      ></i>
                    )}
                  </div>
                  
                  {/* Indicateur visuel pour guider l'utilisateur */}
                  {!favoriteStates[book._id] && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#f39c12',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        animation: 'pulse 2s infinite',
                        boxShadow: '0 2px 8px rgba(243, 156, 18, 0.4)'
                      }}
                      title="Cliquez pour liker !"
                    >
                      👆
                    </div>
                  )}
                </div>
              )}

              <Card.Img
                variant="top"
                src={book.coverImage || "https://via.placeholder.com/300x400"}
                style={{ height: "250px", objectFit: "cover" }}
              />
              
              <Card.Body className="d-flex flex-column p-3">
                <Card.Title style={{ fontSize: "1rem", height: "2.4em", overflow: "hidden" }} title={book.title}>
                  {book.title}
                </Card.Title>
                
                <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: "0.85rem" }}>
                  {book.author}
                </Card.Subtitle>
                
                <div className="mb-2">
                  <Badge bg="secondary" className="me-1">{book.genre}</Badge>
                  {book.publishedYear && (
                    <Badge bg="light" text="dark">{book.publishedYear}</Badge>
                  )}
                </div>

                <Card.Text className="fw-bold text-success mb-2" style={{ fontSize: "0.9rem" }}>
                  {typeof book.price === "number" 
                    ? `${book.price.toFixed(2)}€` 
                    : <span className="text-danger">Prix non défini</span>
                  }
                </Card.Text>

                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">
                      <i className="fas fa-heart text-danger me-1"></i>
                      {book.likes?.length || 0} likes
                    </small>
                    <small className="text-muted">
                      {book.availableCopies} dispo.
                    </small>
                  </div>

                  <div className="d-grid gap-2">
                    <div className="d-flex gap-1">
                      {/* Bouton like - JUSTE POUR AFFICHAGE */}
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="flex-fill"
                        disabled
                        style={{ cursor: 'default' }}
                      >
                        <i className="fas fa-thumbs-up me-1"></i>
                        {book.likes?.length || 0} likes
                      </Button>
                      
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleRent(book._id)}
                        disabled={!book.price || book.availableCopies === 0}
                        className="flex-fill"
                      >
                        <i className="fas fa-shopping-cart me-1"></i>
                        Louer
                      </Button>
                    </div>
                    
                    <Link to={`/books/${book._id}`} className="btn btn-info btn-sm">
                      <i className="fas fa-eye me-1"></i>
                      Détails
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!loading && books.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-search text-muted mb-3" style={{ fontSize: "3rem" }}></i>
          <h4 className="text-muted">Aucun livre trouvé</h4>
          <p className="text-muted">Essayez de modifier vos filtres de recherche.</p>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center my-4">
          <Pagination>
            <Pagination.First
              disabled={page === 1}
              onClick={() => {
                setPage(1);
                fetchBooks(1, true);
              }}
            />
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => {
                setPage(prev => prev - 1);
                fetchBooks(page - 1, true);
              }}
            />

            {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
              const pageNumber = idx + Math.max(1, page - 2);
              if (pageNumber > totalPages) return null;
              
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === page}
                  onClick={() => {
                    setPage(pageNumber);
                    fetchBooks(pageNumber, true);
                  }}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            })}

            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => {
                setPage(prev => prev + 1);
                fetchBooks(page + 1, true);
              }}
            />
            <Pagination.Last
              disabled={page === totalPages}
              onClick={() => {
                setPage(totalPages);
                fetchBooks(totalPages, true);
              }}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default BooksList;