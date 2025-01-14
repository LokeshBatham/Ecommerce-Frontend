import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [editProduct, setEditProduct] = useState(null); // For editing product
  const user = JSON.parse(localStorage.getItem('user')); // Retrieve user details from localStorage
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  const navigate = useNavigate(); // Initialize navigation hook

  const BASE_URL = process.env.REACT_APP_BASE_URL?.replace(/\/+$/, ''); // Ensure no trailing slash

  // Logout Function
  const handleLogout = () => {
    localStorage.clear(); // Clear user and token from localStorage
    toast.success('Logged out successfully!');
    navigate('/'); // Redirect to login page
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      handleApiError(err);
    }
  };

  // Add product (Admin only)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/products/add`, newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts(); // Refresh product list
      setNewProduct({ name: '', description: '', price: '' });
      toast.success('Product added successfully');
    } catch (err) {
      handleApiError(err);
    }
  };

  // Edit product (Admin only)
  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/products/edit/${editProduct._id}`, editProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts(); // Refresh product list
      setEditProduct(null); // Close the edit form
      toast.success('Product updated successfully');
    } catch (err) {
      handleApiError(err);
    }
  };

  // Delete product (Admin only)
  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts(); // Refresh product list
      toast.success('Product deleted successfully');
    } catch (err) {
      handleApiError(err);
    }
  };

  // Handle API errors
  const handleApiError = (err) => {
    if (err.response?.status === 401 || err.response?.status === 400) {
      toast.error('Session expired or unauthorized. Please log in again.');
      localStorage.clear(); // Clear local storage
      navigate('/'); // Redirect to login page
    } else {
      toast.error('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.name || 'User'}!</h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {user?.role === 'admin' && (
        <div className="mb-4">
          <h4 className="text-center mb-3">
            {editProduct ? 'Edit Product' : 'Add Product'}
          </h4>
          <div className="container p-4 shadow rounded bg-light addform">
            <form
              className="row g-3"
              onSubmit={editProduct ? handleEditProduct : handleAddProduct}
            >
              <div className="col-md-12">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="Enter product name"
                  value={editProduct ? editProduct.name : newProduct.name}
                  onChange={(e) => {
                    if (editProduct) {
                      setEditProduct({ ...editProduct, name: e.target.value });
                    } else {
                      setNewProduct({ ...newProduct, name: e.target.value });
                    }
                  }}
                  required
                />
              </div>
              <div className="col-md-12">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="4"
                  placeholder="Enter product description"
                  value={editProduct ? editProduct.description : newProduct.description}
                  onChange={(e) => {
                    if (editProduct) {
                      setEditProduct({ ...editProduct, description: e.target.value });
                    } else {
                      setNewProduct({ ...newProduct, description: e.target.value });
                    }
                  }}
                  required
                ></textarea>
              </div>
              <div className="col-md-12">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="form-control"
                  placeholder="Enter product price"
                  value={editProduct ? editProduct.price : newProduct.price}
                  onChange={(e) => {
                    if (editProduct) {
                      setEditProduct({ ...editProduct, price: e.target.value });
                    } else {
                      setNewProduct({ ...newProduct, price: e.target.value });
                    }
                  }}
                  required
                />
              </div>
              <div className="col-md-12 d-flex justify-content-between">
                <button type="submit" className="btn btn-primary w-100">
                  {editProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editProduct && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-3 w-100"
                    onClick={() => setEditProduct(null)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <h4>Products</h4>
      <div className="row">
        {products.map((product) => (
          <div className="com-12 col-sm-6 col-md-4 mb-4" key={product._id}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                <p className="card-text">Price: ₹{product.price}</p>
                {user?.role === 'admin' && (
                  <>
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => setEditProduct({ ...product })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
