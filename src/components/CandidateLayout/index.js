import React from "react";
import TopNavBar from "./Header";
import Sidebar from "./Sidebar";
import "./styles.css";

const CandidateLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <TopNavBar />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default CandidateLayout;
