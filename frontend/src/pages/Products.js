import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const category = searchParams.get('category');
      const [productsRes, categoriesRes] = await Promise.all([
        api.get(`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`),
        api.get('/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    const result = await addToCart(productId);
    if (result.success) {
      alert('Added to cart successfully!');
    } else {
      alert(result.error);
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
        <h1 className="text-3xl font-bold mb-8">All eBooks</h1>

        {/* Category Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.cover_image ? (
                    <img 
                      src={product.cover_image} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">${product.price}</span>
                    <div className="space-x-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No eBooks Found</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory 
                ? `No eBooks found in "${selectedCategory}" category.`
                : 'No eBooks available yet.'
              }
            </p>
            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange('')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Categories
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;