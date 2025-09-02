import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Products = ({ updateCartCount }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notification, setNotification] = useState('');
  const { user } = useAuth();

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'courses', name: 'Courses' },
    { id: 'ebooks', name: 'eBooks' },
    { id: 'planners', name: 'Planners' },
    { id: 'calendars', name: 'Calendars' },
    { id: 'coloring-books', name: 'Coloring Books' }
  ];

  useEffect(() => {
    fetchProducts();
    initializeProducts();
  }, []);

  const initializeProducts = async () => {
    try {
      await axios.post(`${API}/init-products`);
    } catch (error) {
      console.error('Error initializing products:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      setNotification('Please login to add items to cart');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    try {
      await axios.post(`${API}/cart/add`, {
        product_id: productId,
        quantity: 1
      });
      
      setNotification('Item added to cart successfully!');
      setTimeout(() => setNotification(''), 3000);
      
      if (updateCartCount) {
        updateCartCount();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification('Error adding item to cart');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : 'success'}`}>
          {notification}
        </div>
      )}

      {/* Header */}
      <section className="bg-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold text-center mb-4">Our Products</h1>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto">
            Discover our carefully curated collection of digital products designed to enhance your personal and professional life.
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-indigo-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card group">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/400x250?text=Product+Image'}
                    alt={product.name}
                    className="product-image group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full capitalize">
                      {product.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="product-content">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-description line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-green-600 mb-1">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      <span>Instant Download</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      <span>30-Day Money Back Guarantee</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="btn btn-primary btn-sm inline-flex items-center"
                    >
                      <ShoppingCartIcon className="w-4 h-4 mr-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <section className="bg-white py-12 mt-12">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Digital Products?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Instant Access</h3>
              <p className="text-sm text-gray-600">Download immediately after purchase</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-gray-600">Premium content from expert creators</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Secure Purchase</h3>
              <p className="text-sm text-gray-600">Safe and encrypted transactions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Customer Support</h3>
              <p className="text-sm text-gray-600">24/7 help when you need it</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;