import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "./../auth";
import './dashboard.scss';

function Dashboard({ setIsAuth }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = getUser();
        if (!storedUser) {
            navigate("/login");
        } else {
            setUser(storedUser);
        }
    }, []);

    const handleLogout = () => {
        logout();
        setIsAuth(false);
        navigate("/login");
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-card">
                <h2 className="dashboard-title">
                    Welcome, {user.firstName} {user.lastName}
                </h2>
                <p className="dashboard-text">
                    You are now securely logged in using a Zero-Knowledge Proof-based authentication system.
                    <br /><br />
                    This platform leverages Poseidon hashing and Circom circuits to ensure that your password remains completely private — even during verification.
                </p>
                <button className="dashboard-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>

    );
}

export default Dashboard;
