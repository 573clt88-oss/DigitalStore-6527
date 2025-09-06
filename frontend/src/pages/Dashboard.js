import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
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
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name}!</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{user?.full_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Member since:</span>
                <span className="ml-2 font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Purchase Summary</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Total Orders:</span>
                <span className="ml-2 font-medium">{orders.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Completed Orders:</span>
                <span className="ml-2 font-medium">
                  {orders.filter(order => order.payment_status === 'completed').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Spent:</span>
                <span className="ml-2 font-medium text-green-600">
                  ${orders
                    .filter(order => order.payment_status === 'completed')
                    .reduce((sum, order) => sum + order.total_amount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Browse eBooks
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Order History</h2>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Items</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.title} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.payment_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {order.payment_status === 'completed' && order.download_links ? (
                          <div className="space-y-1">
                            {Object.entries(order.download_links).map(([productId, downloadUrl]) => {
                              const item = order.items.find(i => i.product_id === productId);
                              return (
                                <a
                                  key={productId}
                                  href={`${process.env.REACT_APP_BACKEND_URL}${downloadUrl}`}
                                  className="text-blue-600 hover:text-blue-800 text-sm block"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download {item?.title || 'eBook'}
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">Start shopping to see your order history here.</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse eBooks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;