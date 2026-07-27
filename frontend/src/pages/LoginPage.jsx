import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import authService from "../services/authService";
import cartService from "../services/cartService";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ✅ Clear form on mount to remove autofill
  useEffect(() => {
    setFormData({ email: "", password: "" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );

      if (response && response.success) {
        const pendingItem = localStorage.getItem("pendingCartItem");

        if (pendingItem) {
          try {
            const item = JSON.parse(pendingItem);
            cartService.addToCart(item.product, item.quantity);
            localStorage.removeItem("pendingCartItem");
            navigate("/cart");
          } catch (cartError) {
            console.error("Error adding pending item to cart:", cartError);
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } else {
        setServerError(
          response?.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />

      <main className="container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Login to your wholesale account</p>
            </div>

            {serverError && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                {serverError}
              </div>
            )}

            {/* ✅ Added autoComplete="off" to form */}
            <form
              onSubmit={handleSubmit}
              className="auth-form"
              autoComplete="off"
            >
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="business@example.com"
                  className={errors.email ? "error" : ""}
                  disabled={loading}
                  autoComplete="off"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={errors.password ? "error" : ""}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" disabled={loading} /> Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner-small"></span>
                ) : (
                  "Login"
                )}
              </button>

              <div className="auth-footer">
                <p>
                  Don't have an account?{" "}
                  <Link to="/register">Register as Business</Link>
                </p>
              </div>
            </form>

            <div className="auth-divider">
              <span>Or login with</span>
            </div>

            <div className="social-login">
              <button className="social-btn google" disabled={loading}>
                <span>G</span> Google
              </button>
              <button className="social-btn linkedin" disabled={loading}>
                <span>in</span> LinkedIn
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
