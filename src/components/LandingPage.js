// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="container landing-page">
            <header className="header">
                <h1>Welcome to Our Product Suite</h1>
                <p>Explore our featured products designed to help you manage tasks efficiently.</p>
            </header>

            <section className="product-section">
                <div className="product-card">
                    <h2>TED System</h2>
                    <p>
                        The TED System is a Task and Effort Dashboard designed to streamline task management,
                        track efforts, and generate comprehensive reports for employees and managers.
                    </p>
                    <Link to="/ted" className="button">
                        Learn More
                    </Link>
                </div>
                
            </section>

            <footer className="footer">
                <p>&copy; 2024 Our Product Suite. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
