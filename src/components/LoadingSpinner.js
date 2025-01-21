// LoadingSpinner.js
import React from 'react';
import '../styles.css';  // Ensure this file contains necessary styling for the spinner

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
        </div>
    );
};

export default LoadingSpinner;
