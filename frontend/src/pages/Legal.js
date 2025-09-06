import React from 'react';
import { useParams } from 'react-router-dom';

const Legal = ({ type }) => {
  const renderPrivacyPolicy = () => (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <p className="mb-4">
        <strong>Last updated:</strong> {new Date().toLocaleDateString()}
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
      <p className="mb-4">
        We collect information you provide directly to us, such as when you create an account, 
        make a purchase, or contact us for support. This may include:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Name and email address</li>
        <li>Payment information (processed securely through PayPal)</li>
        <li>Purchase history and download records</li>
        <li>Communication preferences</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
      <p className="mb-4">We use the information we collect to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Process your orders and provide customer service</li>
        <li>Send you order confirmations and updates</li>
        <li>Improve our products and services</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
      <p className="mb-4">
        We do not sell, trade, or otherwise transfer your personal information to third parties 
        except as described in this policy. We may share information with:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Service providers who assist in our operations</li>
        <li>Law enforcement when required by law</li>
        <li>Business partners with your consent</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
      <p className="mb-4">
        We implement appropriate security measures to protect your personal information 
        against unauthorized access, alteration, disclosure, or destruction.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
      <p className="mb-4">You have the right to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Access and update your personal information</li>
        <li>Request deletion of your account</li>
        <li>Opt out of marketing communications</li>
        <li>Request a copy of your data</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
      <p className="mb-4">
        If you have questions about this Privacy Policy, please contact us at:
        <br />
        Email: privacy@ebookstore.com
      </p>
    </div>
  );

  const renderTermsOfService = () => (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <p className="mb-4">
        <strong>Last updated:</strong> {new Date().toLocaleDateString()}
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing and using this eBook marketplace, you accept and agree to be bound by 
        the terms and provision of this agreement.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Digital Products</h2>
      <p className="mb-4">
        All products sold on this platform are digital eBooks delivered electronically. 
        By purchasing, you agree that:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Products are for personal use only</li>
        <li>You will not redistribute or resell our eBooks</li>
        <li>Copyright remains with the original authors/publishers</li>
        <li>Downloads are limited and expire after 30 days</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">User Accounts</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account credentials 
        and for all activities that occur under your account.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Uses</h2>
      <p className="mb-4">You may not use our service:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>For any unlawful purpose or to solicit others to act unlawfully</li>
        <li>To violate any international, federal, provincial, or state regulations or laws</li>
        <li>To transmit malicious code or interfere with the service</li>
        <li>To infringe upon or violate our intellectual property rights</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
      <p className="mb-4">
        In no case shall eBookStore, our directors, officers, employees, affiliates, agents, 
        contractors, interns, suppliers, service providers, or licensors be liable for any 
        injury, loss, claim, or any direct, indirect, incidental, punitive, special, or 
        consequential damages of any kind.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Governing Law</h2>
      <p className="mb-4">
        These terms shall be governed and construed in accordance with the laws of [Your State/Country], 
        without regard to its conflict of law provisions.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
      <p className="mb-4">
        Questions about the Terms of Service should be sent to us at:
        <br />
        Email: legal@ebookstore.com
      </p>
    </div>
  );

  const renderRefundPolicy = () => (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
      
      <p className="mb-4">
        <strong>Last updated:</strong> {new Date().toLocaleDateString()}
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Digital Product Returns</h2>
      <p className="mb-4">
        Due to the nature of digital products, all sales are final. However, we want you to be 
        satisfied with your purchase. We offer refunds in the following circumstances:
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Eligible for Refund</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Technical issues preventing download within 48 hours of purchase</li>
        <li>Corrupted or unreadable files</li>
        <li>Significant discrepancy between product description and actual content</li>
        <li>Duplicate purchases made in error</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Not Eligible for Refund</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Change of mind after successful download</li>
        <li>Compatibility issues with your device (check requirements before purchase)</li>
        <li>Requests made more than 7 days after purchase</li>
        <li>Products that have been fully downloaded and accessed</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Refund Process</h2>
      <p className="mb-4">To request a refund:</p>
      <ol className="list-decimal pl-6 mb-4">
        <li>Contact our support team within 7 days of purchase</li>
        <li>Provide your order number and reason for refund request</li>
        <li>Allow 3-5 business days for review</li>
        <li>If approved, refunds will be processed to your original payment method</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Processing Time</h2>
      <p className="mb-4">
        Approved refunds typically take 5-10 business days to appear on your statement, 
        depending on your payment provider.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Contact for Refunds</h2>
      <p className="mb-4">
        For refund requests or questions about this policy, contact us at:
        <br />
        Email: refunds@ebookstore.com
        <br />
        Response time: Within 24 hours
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Partial Refunds</h2>
      <p className="mb-4">
        In some cases, we may offer partial refunds for bundle purchases where only some 
        items are defective or not as described.
      </p>
    </div>
  );

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return renderPrivacyPolicy();
      case 'terms':
        return renderTermsOfService();
      case 'refund':
        return renderRefundPolicy();
      default:
        return renderPrivacyPolicy();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          {getContent()}
        </div>
      </div>
    </div>
  );
};

export default Legal;