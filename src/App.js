import { ToastContainer } from "react-toastify";
import React from "react";
import Employees from "./components/employees";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <React.Fragment>
      <ToastContainer />
      <main className="container">
        <Employees />
      </main>
    </React.Fragment>
  );
}

export default App;
