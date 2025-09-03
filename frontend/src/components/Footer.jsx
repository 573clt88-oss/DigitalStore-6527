import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Stay Updated with Our Latest Deals</h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and never miss out on exclusive offers, new arrivals, and special promotions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white text-gray-900"
            />
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DigitalHub
              </h1>
              <p className="text-gray-300 leading-relaxed">
                Your one-stop destination for amazing products across electronics, fashion, gaming, and more. 
                Quality guaranteed, fast shipping, unbeatable prices.
              </p>
              <div className="flex space-x-4">
                <div className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  <Facebook className="h-5 w-5" />
                </div>
                <div className="bg-blue-400 p-2 rounded-lg hover:bg-blue-500 cursor-pointer transition-colors">
                  <Twitter className="h-5 w-5" />
                </div>
                <div className="bg-pink-600 p-2 rounded-lg hover:bg-pink-700 cursor-pointer transition-colors">
                  <Instagram className="h-5 w-5" />
                </div>
                <div className="bg-red-600 p-2 rounded-lg hover:bg-red-700 cursor-pointer transition-colors">
                  <Youtube className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <div className="space-y-2">
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">About Us</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Contact</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">FAQ</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Shipping Info</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Returns</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Size Guide</div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Categories</h4>
              <div className="space-y-2">
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Electronics</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Fashion</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Gaming</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Home & Garden</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Sports</div>
                <div className="text-gray-300 hover:text-white cursor-pointer transition-colors">Books</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">1-800-DIGITAL</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">support@digitalhub.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">123 Digital Street, NY 10001</span>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div className="pt-4">
                <h5 className="text-sm font-semibold text-gray-300 mb-2">We Accept</h5>
                <div className="flex space-x-2">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">VISA</div>
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">MC</div>
                  <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">AMEX</div>
                  <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">PayPal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 DigitalHub. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Cookie Policy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;