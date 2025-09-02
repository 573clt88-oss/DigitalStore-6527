import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
// Temporarily using simple text icons instead of heroicons to fix compilation
const DownloadIcon = ({ className }) => <span className={className}>⬇</span>;
const ShoppingBagIcon = ({ className }) => <span className={className}>🛍</span>;
const UserIcon = ({ className }) => <span className={className}>👤</span>;
const ClockIcon = ({ className }) => <span className={className}>🕐</span>;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="w-12 h-12" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-indigo-100 mt-2">
                Manage your digital products and track your orders from your personal dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
                <p className="text-3xl font-bold text-indigo-600">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DownloadIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Downloads</h3>
                <p className="text-3xl font-bold text-green-600">
                  {orders.reduce((total, order) => total + order.items.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">$</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ${orders.reduce((total, order) => total + order.total_amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
            <p className="text-gray-600 mt-1">Track and download your digital products</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
              <a href="/products" className="btn btn-primary">
                Browse Products
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.substring(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Items ({order.items.length}):</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Product ID: {item.product_id}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        {order.status === 'completed' && (
                          <button className="btn btn-outline btn-sm inline-flex items-center">
                            <DownloadIcon className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.status === 'pending' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Payment Processing:</strong> Your order is being processed. 
                        You'll receive download links via email once payment is confirmed.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {user?.created_at ? formatDate(user.created_at) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Need Help?</h3>
          <p className="text-indigo-700 mb-4">
            Our customer support team is here to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/contact" className="btn btn-primary btn-sm">
              Contact Support
            </a>
            <button className="btn btn-outline btn-sm">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;