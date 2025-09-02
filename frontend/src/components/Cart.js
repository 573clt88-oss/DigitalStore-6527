import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Cart = ({ setCartCount }) => {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart`);
      setCart(response.data.cart);
      setItems(response.data.items);
      if (setCartCount) {
        setCartCount(response.data.items.length);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API}/cart/remove/${productId}`);
      setNotification('Item removed from cart');
      setTimeout(() => setNotification(''), 3000);
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Error removing from cart:', error);
      setNotification('Error removing item from cart');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const proceedToCheckout = async () => {
    try {
      const response = await axios.post(`${API}/orders`);
      setNotification('Order created successfully! Check your email for download links.');
      setTimeout(() => setNotification(''), 5000);
      fetchCart(); // Refresh cart (should be empty now)
    } catch (error) {
      console.error('Error creating order:', error);
      setNotification('Error processing checkout');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : 'success'}`}>
          {notification}
        </div>
      )}

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
                </div>
                
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.product.id} className="p-6 flex items-center space-x-4">
                      <img
                        src={item.product.image_url || 'https://via.placeholder.com/100x100?text=Product'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {item.product.description}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-indigo-600">
                            ${item.product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={proceedToCheckout}
                    className="btn btn-primary w-full"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <Link to="/products" className="btn btn-secondary w-full">
                    Continue Shopping
                  </Link>
                </div>
                
                {/* Benefits */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">What you get:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Instant download access
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      30-day money-back guarantee
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      24/7 customer support
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;