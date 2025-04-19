/* global BigInt */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildPoseidon } from "circomlibjs";
import axios from "axios";
import { Buffer } from "buffer";
import './registration.scss';

window.Buffer = Buffer;

function Register({ setIsAuth }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const { email, firstName, lastName, password, confirmPassword } = form;
        if (!email || !firstName || !lastName || !password || !confirmPassword) {
            return "All fields are required";
        }
        if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
        if (password.length < 6) return "Password must be at least 6 characters";
        if (password !== confirmPassword) return "Passwords do not match";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) return setError(validationError);

        try {
            const poseidon = await buildPoseidon();
            const F = poseidon.F;
            const passwordBigInt = BigInt("0x" + Buffer.from(form.password).toString("hex"));
            const hash = poseidon([passwordBigInt]);
            const passwordHash = F.toObject(hash);
            const firstName = form.firstName
            const lastName = form.lastName

            await axios.post("http://localhost:3001/register", {
                email: form.email,
                firstName: firstName,
                lastName: lastName,
                passwordHash: passwordHash.toString()
            });
            localStorage.setItem("user", JSON.stringify({ email: form.email, firstName, lastName }));
            setIsAuth(true);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Registration failed. User might already exist.");
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-card">
                <h2 className="register-title">Create Account</h2>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        className="register-input"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <input
                        className="register-input"
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                    />
                    <input
                        className="register-input"
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                    />
                    <input
                        className="register-input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    <input
                        className="register-input"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />
                    <button className="register-button" type="submit">Register</button>
                </form>
            </div>
        </div>

    );
}

export default Register;
