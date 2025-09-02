import React, { useState } from 'react';
import axios from 'axios';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      setNotification('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setNotification('Error sending message. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : 'success'}`}>
          {notification}
        </div>
      )}

      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Have questions about our products or need support? We're here to help you succeed.
          </p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="form-input"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="form-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="form-label">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="form-input"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="">Choose a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Product Support">Product Support</option>
                    <option value="Order Issue">Order Issue</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Partnership">Partnership Opportunity</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="form-label">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="form-textarea"
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-indigo-600 mt-1" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">Phone Support</h3>
                    <p className="text-gray-600">Available 24/7 for urgent issues</p>
                    <p className="text-indigo-600 font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="w-6 h-6 text-indigo-600 mt-1" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">Email Support</h3>
                    <p className="text-gray-600">We typically respond within 24 hours</p>
                    <p className="text-indigo-600 font-medium">support@digitalstore.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPinIcon className="w-6 h-6 text-indigo-600 mt-1" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">Office Location</h3>
                    <p className="text-gray-600">
                      123 Digital Avenue<br />
                      Suite 456<br />
                      San Francisco, CA 94107
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How do I download my purchased products?</h3>
                  <p className="text-gray-600 text-sm">
                    After purchase, you'll receive an email with download links. You can also access your products from your dashboard.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">What's your refund policy?</h3>
                  <p className="text-gray-600 text-sm">
                    We offer a 30-day money-back guarantee on all digital products. See our policies page for details.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Can I share products with others?</h3>
                  <p className="text-gray-600 text-sm">
                    Our products are for personal use only. Sharing or distributing is prohibited by our terms of service.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Do you offer bulk discounts?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes! Contact us for educational institutions, corporate training, or bulk purchases.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Monday - Friday</span>
                  <span className="text-gray-600">9:00 AM - 6:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Saturday</span>
                  <span className="text-gray-600">10:00 AM - 4:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sunday</span>
                  <span className="text-gray-600">Closed</span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-800">
                  <strong>Need immediate help?</strong> Our AI customer support is available 24/7 
                  through the chat widget on the bottom right of your screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;