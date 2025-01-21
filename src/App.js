// src/App.js
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserContext, UserProvider } from './components/UserContext';
import Auth from './components/Auth';
import Employee from './components/Employee';
import Manager from './components/Manager';
import Report from './components/Report';
import Reviewer from './components/Reviewer';
import Invite from './components/Invite';
import LandingPage from './components/LandingPage';

import './styles.css';

const AppContent = () => {
    const { user, setUser } = useContext(UserContext);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    useEffect(() => {
        // You can handle automatic logout or other effects here if needed.
    }, []);

    return (
        <Router>
            <div>
                <nav className="navbar fixed-top">
                    <h2>Our Product Suite</h2>
                    {user && (
                        <button className="button" onClick={handleLogout}>
                            Logout
                        </button>
                    )}
                </nav>
                <div className="container my-4">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />  {/* Landing page route */}
                        <Route path="/auth" element={<Auth />} />
                        {/* Check if user is logged in and then route accordingly */}
                        {user ? (
                            <>
                                <Route path="/employee" element={<Employee user={user} />} />
                                <Route path="/manager" element={<Manager user={user} />} />
                                <Route path="/reviewer" element={<Reviewer user={user} />} />
                                <Route path="/report" element={<Report user={user} />} />
                                <Route path="/invite" element={(user.role === 'manager' || user.role === 'reviewer') ? <Invite /> : <Navigate to={`/${user.role}`} />} />
                            </>
                        ) : (
                            <Route path="*" element={<Navigate to="/auth" />} />
                        )}
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

const App = () => {
    return (
        <UserProvider>
            <AppContent />
        </UserProvider>
    );
};

export default App;
