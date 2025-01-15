import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "react-google-login";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    contactNumber: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const baseUrl = import.meta.env.VITE_API_URL;
        try {
          const res = await axios.post(
            `${baseUrl}/api/auth/validate`,
            {},
            {
              headers: { Authorization: token },
            }
          );
          if (res.data.success) {
            navigate("/dashboard");
          }
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    };
    validateToken();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loader
    const baseUrl = import.meta.env.VITE_API_URL;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const contactRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(formData.email)) {
      setMessage("Invalid email format.");
      setIsLoading(false); // Hide loader
      return;
    }

    if (!isLogin && !contactRegex.test(formData.contactNumber)) {
      setMessage("Invalid contact number. Must be 10 digits starting with 6-9.");
      setIsLoading(false); // Hide loader
      return;
    }

    try {
      const endpoint = isLogin
        ? `${baseUrl}/api/auth/login`
        : `${baseUrl}/api/auth/signup`;

      const res = await axios.post(endpoint, formData);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setMessage("Login successful!");
        navigate("/dashboard");
      } else {
        setMessage("Signup successful! You can now log in.");
        setFormData({
          email: "",
          password: "",
          name: "",
          contactNumber: "",
        });
        setIsLogin(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h4>{isLogin ? "Login" : "Signup"}</h4>
            </div>
            <div className="card-body">
              {message && <div className="alert alert-info">{message}</div>}
              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="contactNumber" className="form-label">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading} // Disable button when loading
                >
                  {isLoading ? "Processing..." : isLogin ? "Login" : "Signup"}
                </button>
              </form>
              {isLoading && (
                <div className="text-center mt-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="card-footer text-center">
              <p>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage("");
                  }}
                >
                  {isLogin ? "Signup" : "Login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
