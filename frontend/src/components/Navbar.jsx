import React, { useState } from 'react';
import { ShoppingCart, Search, User, Menu, Heart, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Navbar = ({ cartItems = 0, onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Deliver to New York 10001
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Customer Service</span>
            <span>Track Your Order</span>
            <span>Sign In</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DigitalHub
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products, brands and more..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button className="absolute right-1 top-1 bottom-1 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden md:flex items-center space-x-1">
              <User className="h-5 w-5" />
              <span>Account</span>
            </Button>
            
            <Button variant="ghost" className="hidden md:flex items-center space-x-1">
              <Heart className="h-5 w-5" />
              <span>Wishlist</span>
            </Button>

            <Button 
              variant="ghost" 
              className="flex items-center space-x-1 relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden md:inline">Cart</span>
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="hidden md:flex items-center space-x-8 mt-4 pb-2">
          <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">
            Electronics
          </span>
          <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">
            Fashion
          </span>
          <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">
            Gaming
          </span>
          <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">
            Home & Garden
          </span>
          <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">
            Sports
          </span>
          <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">
            Books
          </span>
          <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">
            Toys
          </span>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center space-x-2 py-2">
              <User className="h-5 w-5" />
              <span>Account</span>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <Heart className="h-5 w-5" />
              <span>Wishlist</span>
            </div>
            <div className="border-t pt-2 space-y-2">
              <div className="py-1">Electronics</div>
              <div className="py-1">Fashion</div>
              <div className="py-1">Gaming</div>
              <div className="py-1">Home & Garden</div>
              <div className="py-1">Sports</div>
              <div className="py-1">Books</div>
              <div className="py-1">Toys</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;