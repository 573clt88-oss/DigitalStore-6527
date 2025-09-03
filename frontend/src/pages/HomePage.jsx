import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProductGrid from '../components/ProductGrid';
import { mockProducts, mockCart } from '../data/mockData';
import { toast } from '../hooks/use-toast';

const HomePage = () => {
  const [cartItems, setCartItems] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Simulate loading products
    setProducts(mockProducts);
    // Load cart count from localStorage
    const savedCart = localStorage.getItem('digitalstore_cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart.length);
    }
  }, []);

  const handleAddToCart = (product) => {
    // Get existing cart or initialize empty array
    const existingCart = JSON.parse(localStorage.getItem('digitalstore_cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      existingCart.push({ ...product, quantity: 1 });
    }
    
    // Save to localStorage
    localStorage.setItem('digitalstore_cart', JSON.stringify(existingCart));
    
    // Update cart count
    setCartItems(existingCart.reduce((total, item) => total + item.quantity, 0));
    
    // Show success message
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleProductClick = (product) => {
    // For now, just show product details in a toast
    // In a real app, this would navigate to a product detail page
    toast({
      title: product.name,
      description: product.description,
    });
  };

  const handleCartClick = () => {
    // For now, just show cart summary
    // In a real app, this would open cart sidebar or navigate to cart page
    const cart = JSON.parse(localStorage.getItem('digitalstore_cart') || '[]');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    toast({
      title: "Shopping Cart",
      description: `You have ${cartItems} items totaling $${total.toFixed(2)}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        cartItems={cartItems} 
        onCartClick={handleCartClick}
      />
      <HeroSection />
      <ProductGrid 
        products={products}
        onAddToCart={handleAddToCart}
        onProductClick={handleProductClick}
      />
    </div>
  );
};

export default HomePage;