import React from "react";
import TopNavBar from "./header";
import Sidebar from "./sidebar";
import "./style.css"; // for container styles

const Layout = ({ children }) => {
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

export default Layout;
