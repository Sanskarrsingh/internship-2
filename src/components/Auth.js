// src/components/Auth.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';
import { useNavigate, Link } from 'react-router-dom';  // Import Link from react-router-dom
import '../styles.css';

const Auth = () => {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee');
    const [invitation, setInvitation] = useState('');
    const [specialUsers, setSpecialUsers] = useState({ managers: [], reviewers: [] });

    useEffect(() => {
        const fetchSpecialUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/special_users');
                setSpecialUsers(response.data);
            } catch (error) {
                console.error('Error fetching special users:', error);
            }
        };

        fetchSpecialUsers();
    }, []);

    const handleAuth = async () => {
        const url = isLogin ? 'http://localhost:5000/login' : 'http://localhost:5000/register';
        const data = { user_id: userId, password };
        if (!isLogin) {
            data.email = email; // Add email to the registration data
            data.role = role;
            if (!(specialUsers[role] && specialUsers[role].includes(userId))) {
                data.invitation = invitation;
            }
        }
        try {
            const response = await axios.post(url, data);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate(`/${response.data.role}`);
        } catch (error) {
            console.error('Error during authentication:', error);
            alert(error.response ? error.response.data.message : 'Error occurred during authentication');
        }
    };

    return (
        <div className="container">
            <div id='logincontainer' className="card">
                <h2 className="card-title">{isLogin ? 'Login' : 'Register'}</h2>
                <div className="form-group">
                    <label>User ID</label>
                    <input
                        type="text"
                        placeholder="Enter user ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </div>
                {!isLogin && (
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                )}
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {!isLogin && (
                    <>
                        <div className="form-group">
                            <label>Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="reviewer">Reviewer</option>
                            </select>
                        </div>
                        {!(specialUsers[role] && specialUsers[role].includes(userId)) && (
                            <div className="form-group">
                                <label>Invitation Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter invitation code"
                                    value={invitation}
                                    onChange={(e) => setInvitation(e.target.value)}
                                />
                            </div>
                        )}
                    </>
                )}
                <div className='loginbutton'>
                    <button id='loginbutton' className="button" onClick={handleAuth}>
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                    <button id='loginbutton' className="button-link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Switch to Register' : 'Switch to Login'}
                    </button>
                </div>
                <div className="home-button-container">
                    <Link to="/" className="button">
                        Go to Home Page
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Auth;
