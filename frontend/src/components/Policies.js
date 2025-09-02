import React, { useState } from 'react';

// Temporary icon replacements
const ShieldCheckIcon = ({ className }) => <span className={className}>🛡️</span>;
const ArrowPathIcon = ({ className }) => <span className={className}>🔄</span>;
const DocumentTextIcon = ({ className }) => <span className={className}>📄</span>;

const Policies = () => {
  const [activeTab, setActiveTab] = useState('refund');

  const tabs = [
    { id: 'refund', name: 'Refund Policy', icon: ArrowPathIcon },
    { id: 'privacy', name: 'Privacy Policy', icon: ShieldCheckIcon },
    { id: 'terms', name: 'Terms of Service', icon: DocumentTextIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4">Store Policies</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Learn about our commitment to customer satisfaction, privacy, and fair business practices.
          </p>
        </div>
      </section>

      <div className="container py-12">
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg shadow-sm p-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {activeTab === 'refund' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Refund & Cancellation Policy</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">30-Day Money-Back Guarantee</h3>
                  <p className="text-gray-700 mb-4">
                    We stand behind the quality of our digital products. If you're not completely satisfied 
                    with your purchase, you can request a full refund within 30 days of your purchase date.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Full refund available for 30 days from purchase date</li>
                    <li>No questions asked policy for first-time customers</li>
                    <li>Refunds processed within 5-7 business days</li>
                    <li>Original payment method will be credited</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">How to Request a Refund</h3>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2">
                    <li>Contact our support team via email or chat</li>
                    <li>Provide your order number and reason for refund</li>
                    <li>Our team will process your request within 24 hours</li>
                    <li>Refund will be issued to your original payment method</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Refund Exceptions</h3>
                  <p className="text-gray-700 mb-4">
                    While we offer generous refund terms, the following situations may not qualify:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Requests made after 30 days from purchase</li>
                    <li>Products that have been shared or distributed</li>
                    <li>Customers with multiple refund requests (abuse prevention)</li>
                    <li>Products purchased with promotional codes over 50% discount</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Cancellation Policy</h3>
                  <p className="text-gray-700">
                    Since our products are digital and delivered immediately, orders cannot be cancelled 
                    after purchase completion. However, you can request a refund using our 30-day guarantee.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Privacy Policy</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Information We Collect</h3>
                  <p className="text-gray-700 mb-4">
                    We collect information you provide directly to us, such as when you create an account, 
                    make a purchase, or contact us for support.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li><strong>Personal Information:</strong> Name, email address, billing information</li>
                    <li><strong>Purchase History:</strong> Products purchased, payment information, order details</li>
                    <li><strong>Usage Information:</strong> How you interact with our website and products</li>
                    <li><strong>Device Information:</strong> Browser type, IP address, device identifiers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">How We Use Your Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Process and fulfill your orders</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Send important updates about your purchases</li>
                    <li>Improve our products and services</li>
                    <li>Prevent fraud and enhance security</li>
                    <li>Send marketing communications (with your consent)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Information Sharing</h3>
                  <p className="text-gray-700 mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We may share 
                    your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>With payment processors to complete transactions</li>
                    <li>With service providers who assist in our operations</li>
                    <li>When required by law or to protect our rights</li>
                    <li>With your explicit consent</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Data Security</h3>
                  <p className="text-gray-700">
                    We implement appropriate security measures to protect your personal information against 
                    unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
                    secure servers, and regular security audits.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Your Rights</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request a copy of your data</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Terms of Service</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Acceptance of Terms</h3>
                  <p className="text-gray-700">
                    By accessing and using our website and services, you agree to be bound by these Terms of Service 
                    and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                    prohibited from using our services.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Digital Product License</h3>
                  <p className="text-gray-700 mb-4">
                    When you purchase our digital products, you receive a personal, non-exclusive, non-transferable 
                    license to use the product for your personal or business purposes.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Products are for personal use only</li>
                    <li>You may not share, distribute, or resell our products</li>
                    <li>You may use products for commercial purposes within your own business</li>
                    <li>Reverse engineering or modification is prohibited</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Prohibited Uses</h3>
                  <p className="text-gray-700 mb-4">You agree not to use our services for any unlawful purpose or any purpose prohibited by these terms:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Violating any applicable laws or regulations</li>
                    <li>Sharing or distributing purchased products</li>
                    <li>Attempting to gain unauthorized access to our systems</li>
                    <li>Using our products to create competing products</li>
                    <li>Engaging in fraudulent activities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Account Responsibilities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Provide accurate and current information</li>
                    <li>Notify us immediately of any unauthorized use</li>
                    <li>You are responsible for all activities under your account</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Disclaimer of Warranties</h3>
                  <p className="text-gray-700">
                    Our products are provided "as is" without any warranties, express or implied. While we strive 
                    for accuracy and quality, we cannot guarantee that our products will meet your specific needs 
                    or be error-free.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Limitation of Liability</h3>
                  <p className="text-gray-700">
                    In no event shall our company be liable for any indirect, incidental, special, or consequential 
                    damages arising out of or in connection with your use of our products or services.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Changes to Terms</h3>
                  <p className="text-gray-700">
                    We reserve the right to modify these terms at any time. Changes will be effective immediately 
                    upon posting. Your continued use of our services constitutes acceptance of the modified terms.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-12 bg-indigo-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Questions About Our Policies?</h3>
          <p className="text-gray-700 mb-6">
            If you have any questions about these policies or need clarification on any terms, 
            we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@digitalstore.com" className="btn btn-primary">
              Email Support
            </a>
            <a href="#" className="btn btn-outline">
              Live Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;