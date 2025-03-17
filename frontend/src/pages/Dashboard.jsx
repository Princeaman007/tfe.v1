import React from "react";

const Dashboard = () => {
  return (
    <div style={styles.container}>
      <h2>Welcome to your Dashboard</h2>
      <p>This is your secure area.</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    fontFamily: "Arial, sans-serif",
  },
};

export default Dashboard;
