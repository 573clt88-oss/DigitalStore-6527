import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRightIcon, StarIcon, CheckIcon } from '@heroicons/react/24/solid';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setFeaturedProducts(response.data.slice(0, 3)); // Show first 3 products
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="mb-6">Premium Digital Products for Success</h1>
          <p className="mb-8 max-w-2xl mx-auto">
            Discover our curated collection of courses, ebooks, planners, and creative resources 
            designed to help you learn, organize, and thrive in the digital age.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn btn-primary btn-lg inline-flex items-center">
              Browse Products
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
              Get Support
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="section-title">Why Choose Our Digital Store?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Download</h3>
              <p className="text-gray-600">
                Get immediate access to your digital products after purchase. No waiting, no shipping delays.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
              <p className="text-gray-600">
                Carefully curated products from expert creators. Every item is designed for maximum value and impact.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">30-Day Guarantee</h3>
              <p className="text-gray-600">
                Not satisfied? Get a full refund within 30 days. Your satisfaction is our priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-gray-50">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/400x200?text=Product+Image'}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-content">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="product-price">${product.price}</span>
                      <Link 
                        to="/products" 
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/products" className="btn btn-outline btn-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "The digital marketing course transformed my business. Within 3 months, 
                I doubled my online sales. Highly recommended!"
              </blockquote>
              <cite className="font-semibold text-gray-800">- Sarah Johnson</cite>
            </div>
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "The productivity planner has completely changed how I organize my life. 
                I'm more focused and accomplish way more each day."
              </blockquote>
              <cite className="font-semibold text-gray-800">- Michael Chen</cite>
            </div>
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "Amazing quality and instant delivery. My kids love the coloring books, 
                and I love the peace of mind they bring."
              </blockquote>
              <cite className="font-semibold text-gray-800">- Emily Rodriguez</cite>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Life?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who have already started their journey to success.
          </p>
          <Link to="/products" className="btn btn-secondary btn-lg">
            Start Shopping Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;