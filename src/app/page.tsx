
"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  const handleClick = () => {
    setMessage("Assessment frontend is working!");
  };

  return (
    <main className="home-container">
      <div className="home-card">
        <h1>Assessment Management</h1>

        <p>
          Welcome to the Assessment Management System
        </p>

        <button onClick={handleClick}>
          Get Started
        </button>

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
