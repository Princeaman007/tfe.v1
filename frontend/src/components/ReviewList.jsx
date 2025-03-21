import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Row, Col, Spinner, Button } from "react-bootstrap";

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/reviews/me", {
                withCredentials: true,
            });
            console.log("🧾 Avis reçus depuis l'API :", res.data);
            setReviews(res.data);
        } catch (err) {
            console.error("Erreur lors du chargement des avis :", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4 fw-bold text-primary">📝 Mes Avis</h2>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : reviews.length === 0 ? (
                <p className="text-center text-muted">Tu n’as pas encore posté d’avis.</p>
            ) : (
                <Row className="gy-4">
                    {reviews.map((review) => (
                        <Col md={6} key={review._id}>
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <Card.Title>{review.book?.title || "Livre inconnu"}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        Note : {review.rating}/5
                                    </Card.Subtitle>
                                    <Card.Text>{review.comment}</Card.Text>
                                    <div className="text-muted small">
                                        Posté le{" "}
                                        {review.createdAt
                                            ? new Date(review.createdAt).toLocaleDateString()
                                            : "date inconnue"}
                                    </div>

                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default ReviewList;
