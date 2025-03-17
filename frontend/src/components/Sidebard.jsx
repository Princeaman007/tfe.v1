import React, { useState } from "react";
import { Link } from "react-router-dom";
import ""; // Pour les styles CSS

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <nav className={`sidebar d-flex flex-column flex-shrink-0 position-fixed ${collapsed ? "collapsed" : ""}`}>
        <button className="toggle-btn" onClick={toggleSidebar}>
          <i className={`fas ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
        </button>

        <div className="p-4">
          <h4 className="logo-text fw-bold mb-0">NexusFlow</h4>
          {!collapsed && <p className="text-muted small">Dashboard</p>}
        </div>

        {/* Navigation */}
        <div className="nav flex-column">
          <Link to="/" className="sidebar-link active text-decoration-none p-3">
            <i className="fas fa-home me-3"></i>
            {!collapsed && <span>Dashboard</span>}
          </Link>
          <Link to="/analytics" className="sidebar-link text-decoration-none p-3">
            <i className="fas fa-chart-bar me-3"></i>
            {!collapsed && <span>Analytics</span>}
          </Link>
          <Link to="/customers" className="sidebar-link text-decoration-none p-3">
            <i className="fas fa-users me-3"></i>
            {!collapsed && <span>Customers</span>}
          </Link>
          <Link to="/products" className="sidebar-link text-decoration-none p-3">
            <i className="fas fa-box me-3"></i>
            {!collapsed && <span>Products</span>}
          </Link>
          <Link to="/settings" className="sidebar-link text-decoration-none p-3">
            <i className="fas fa-gear me-3"></i>
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>

        {/* Profile Section */}
        <div className="profile-section mt-auto p-4">
          <div className="d-flex align-items-center">
            <img src="https://randomuser.me/api/portraits/women/70.jpg" style={{ height: "60px" }} className="rounded-circle" alt="Profile" />
            {!collapsed && (
              <div className="ms-3 profile-info">
                <h6 className="text-white mb-0">Alex Morgan</h6>
                <small className="text-muted">Admin</small>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className={`content ${collapsed ? "expanded" : ""}`}>
        <h1 className="p-4">Dashboard Content</h1>
      </div>
    </div>
  );
};

export default Sidebar;
