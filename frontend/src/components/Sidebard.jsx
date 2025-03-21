import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* Sidebar */}
        <div className={`col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark min-vh-100 d-flex flex-column justify-content-between ${collapsed ? "collapsed" : ""}`}>
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white">
            <button
              className="btn btn-outline-light w-100 mb-3"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <i className="fas fa-chevron-right"></i>
              ) : (
                <i className="fas fa-chevron-left"></i>
              )}
            </button>

            <Link
              to="/"
              className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-4 d-none d-sm-inline fw-bold">NexusFlow</span>
            </Link>
            <span className="text-muted d-none d-sm-inline small mb-3">Dashboard</span>

            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100">
              <li className="nav-item w-100">
                <Link to="/" className="nav-link text-white px-0 align-middle">
                  <i className="fas fa-home me-2"></i>
                  <span className="d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>
              <li className="nav-item w-100">
                <Link to="/analytics" className="nav-link text-white px-0 align-middle">
                  <i className="fas fa-chart-bar me-2"></i>
                  <span className="d-none d-sm-inline">Analytics</span>
                </Link>
              </li>
              <li className="nav-item w-100">
                <Link to="/customers" className="nav-link text-white px-0 align-middle">
                  <i className="fas fa-users me-2"></i>
                  <span className="d-none d-sm-inline">Customers</span>
                </Link>
              </li>
              <li className="nav-item w-100">
                <Link to="/products" className="nav-link text-white px-0 align-middle">
                  <i className="fas fa-box me-2"></i>
                  <span className="d-none d-sm-inline">Products</span>
                </Link>
              </li>
              <li className="nav-item w-100">
                <Link to="/settings" className="nav-link text-white px-0 align-middle">
                  <i className="fas fa-gear me-2"></i>
                  <span className="d-none d-sm-inline">Settings</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Profile Section */}
          <div className="d-flex align-items-center p-3 text-white border-top">
            <img
              src="https://randomuser.me/api/portraits/women/70.jpg"
              alt="Profile"
              className="rounded-circle me-2"
              width="40"
              height="40"
            />
            <div className="d-none d-sm-block">
              <h6 className="mb-0">Alex Morgan</h6>
              <small className="text-muted">Admin</small>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="col py-3">
          <h1>📊 Dashboard Content</h1>
          <p>Contenu principal ici...</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
