import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Badge,
  Pagination,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import { API_BASE_URL } from "../../config.js";

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [csvData, setCsvData] = useState([]);

  const fetchRentals = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/rentals/admin/all`, {
        params: { page, limit: 10 },
        withCredentials: true,
      });

      setRentals(res.data.rentals);
      setTotalPages(res.data.totalPages);
      setCurrentPage(Number(res.data.currentPage));

      const exportData = res.data.rentals.map((r) => ({
        Titre: r.book?.title || "N/A",
        Auteur: r.book?.author || "N/A",
        Utilisateur: r.user?.name || "N/A",
        Email: r.user?.email || "N/A",
        "Date emprunt": new Date(r.borrowedAt).toLocaleDateString(),
        "Date retour prévue": new Date(r.dueDate).toLocaleDateString(),
        "Date retourné":
          r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : "—",
        Statut: r.status === "returned" ? "Retourné" : "Loué",
      }));

      setCsvData(exportData);
    } catch (error) {
      toast.error("Erreur lors du chargement des locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals(currentPage);
  }, [currentPage]);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">Livres Loués & Retournés</h3>
        <CSVLink data={csvData} filename={"locations.csv"} className="btn btn-outline-success">
          <i className="fas fa-file-csv me-2"></i>Exporter CSV
        </CSVLink>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Table bordered hover responsive className="align-middle">
            <thead className="table-light text-center">
              <tr>
                <th>Livre</th>
                <th>Auteur</th>
                <th>Utilisateur</th>
                <th>Date emprunt</th>
                <th>Retour prévu</th>
                <th>Date retourné</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r._id} className="text-center">
                  <td>{r.book?.title || "N/A"}</td>
                  <td>{r.book?.author || "N/A"}</td>
                  <td>{r.user?.name} <br /><small className="text-muted">{r.user?.email}</small></td>
                  <td>{new Date(r.borrowedAt).toLocaleDateString()}</td>
                  <td>{new Date(r.dueDate).toLocaleDateString()}</td>
                  <td>{r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <Badge bg={r.status === "returned" ? "success" : "warning"}>
                      {r.status === "returned" ? "Retourné" : "Loué"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                />
                <Pagination.Item active>{currentPage}</Pagination.Item>
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminRentals;
