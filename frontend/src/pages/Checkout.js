import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!cart.items || cart.items.length === 0) {
      navigate('/cart');
      return;
    }
    
    fetchProductDetails();
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

  const handleCreateOrder = async () => {
    setProcessing(true);
    try {
      const response = await api.post('/orders/create');
      setOrder(response.data);
      
      // Simulate PayPal payment - In real implementation, integrate with PayPal SDK
      const paymentId = `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Complete payment
      await api.post(`/orders/${response.data.id}/complete-payment`, 
        new URLSearchParams({ payment_id: paymentId }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      
      clearCart();
      alert('Payment successful! Check your email for download links.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => {
                const product = products[item.product_id];
                if (!product) return null;

                return (
                  <div key={item.product_id} className="flex items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                      {product.cover_image ? (
                        <img 
                          src={product.cover_image} 
                          alt={product.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{product.title}</h3>
                      <p className="text-gray-600 text-xs">{product.category}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">${product.price}</p>
                      <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Tax:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            
            <div className="mb-6">
              <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">PP</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">PayPal</h3>
                    <p className="text-sm text-gray-600">Secure payment with PayPal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Billing Information</h3>
              <div className="text-gray-600">
                <p>{user.full_name}</p>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Instant Access</p>
                  <p>Your eBooks will be available for download immediately after payment confirmation.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing Payment...' : `Pay $${total.toFixed(2)} with PayPal`}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By completing your purchase, you agree to our{' '}
              <a href="/terms" className="text-blue-600 underline">Terms of Service</a>{' '}
              and{' '}
              <a href="/refund" className="text-blue-600 underline">Refund Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;