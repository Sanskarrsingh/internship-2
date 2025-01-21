import React, { useState } from 'react';
import axios from 'axios';
import '../styles.css';

const Invite = () => {
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('employee');
    const [message, setMessage] = useState('');

    const sendInvitation = async () => {
        try {
            const response = await axios.post('http://localhost:5000/invite', {
                email,
                user_id: userId,
                role
            });
            setMessage(response.data.message);
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else if (error.request) {
                setMessage('No response received from the server.');
            } else {
                setMessage('Error in setting up the request: ' + error.message);
            }
        }
    };

    return (
        <div className='invitecontainer'>
            <h2>Invite User</h2>
            <div className='invite'>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className='invite'>
                <input
                    type="text"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />
            </div>
            <div className='invite'>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="reviewer">Reviewer</option>
                </select>
            </div>
            <button className='invite' onClick={sendInvitation}>Send Invitation</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Invite;