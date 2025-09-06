import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Cart = () => {
  const { cart, removeFromCart, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (cart.items?.length > 0) {
      fetchProductDetails();
    } else {
      setLoading(false);
    }
  }, [cart, user, navigate]);

  const fetchProductDetails = async () => {
    try {
      const productPromises = cart.items.map(item => 
        api.get(`/products/${item.product_id}`)
      );
      const responses = await Promise.all(productPromises);
      
      const productMap = {};
      responses.forEach(response => {
        productMap[response.data.id] = response.data;
      });
      
      setProducts(productMap);
      calculateTotal(productMap);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (productMap) => {
    const cartTotal = cart.items.reduce((sum, item) => {
      const product = productMap[item.product_id];
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    setTotal(cartTotal);
  };

  const handleRemoveItem = async (productId) => {
    const result = await removeFromCart(productId);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h-.01M16 16a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any eBooks to your cart yet.</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse eBooks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {cart.items.map((item) => {
              const product = products[item.product_id];
              if (!product) return null;

              return (
                <div key={item.product_id} className="flex items-center py-4 border-b border-gray-200 last:border-b-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                    {product.cover_image ? (
                      <img 
                        src={product.cover_image} 
                        alt={product.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.title}</h3>
                    <p className="text-gray-600 text-sm">{product.category}</p>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">{product.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg">${product.price}</p>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="text-red-600 hover:text-red-800 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-center hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </Link>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;