// Mock data for the digital store

export const mockProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Electronics",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    isNew: true,
    discount: 20,
    featured: true,
    inStock: true,
    freeShipping: true,
    description: "High-quality wireless headphones with noise cancellation and premium sound quality."
  },
  {
    id: 2,
    name: "Smart Watch Series X",
    category: "Electronics",
    price: 399.99,
    originalPrice: 499.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    isNew: false,
    discount: 20,
    featured: true,
    inStock: true,
    freeShipping: true,
    description: "Advanced smartwatch with health monitoring, GPS, and long battery life."
  },
  {
    id: 3,
    name: "Gaming Mechanical Keyboard",
    category: "Gaming",
    price: 129.99,
    originalPrice: null,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=500&fit=crop",
    isNew: true,
    discount: null,
    featured: false,
    inStock: true,
    freeShipping: true,
    description: "RGB mechanical gaming keyboard with Cherry MX switches and customizable lighting."
  },
  {
    id: 4,
    name: "Vintage Denim Jacket",
    category: "Fashion",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
    isNew: false,
    discount: 25,
    featured: false,
    inStock: true,
    freeShipping: false,
    description: "Classic vintage-style denim jacket perfect for casual wear."
  },
  {
    id: 5,
    name: "Professional Camera Lens",
    category: "Electronics",
    price: 899.99,
    originalPrice: null,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&h=500&fit=crop",
    isNew: false,
    discount: null,
    featured: true,
    inStock: true,
    freeShipping: true,
    description: "High-performance camera lens for professional photography."
  },
  {
    id: 6,
    name: "Colorful Sneakers",
    category: "Fashion",
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop",
    isNew: true,
    discount: 17,
    featured: false,
    inStock: true,
    freeShipping: true,
    description: "Comfortable and stylish sneakers with vibrant colors."
  },
  {
    id: 7,
    name: "Gaming Controller Pro",
    category: "Gaming",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&h=500&fit=crop",
    isNew: false,
    discount: 20,
    featured: false,
    inStock: true,
    freeShipping: true,
    description: "Professional gaming controller with precision controls and customizable buttons."
  },
  {
    id: 8,
    name: "Smartphone 5G Ultra",
    category: "Electronics",
    price: 999.99,
    originalPrice: 1199.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
    isNew: true,
    discount: 17,
    featured: true,
    inStock: true,
    freeShipping: true,
    description: "Latest smartphone with 5G connectivity, advanced camera system, and premium design."
  },
  {
    id: 9,
    name: "Artisan Coffee Maker",
    category: "Home & Kitchen",
    price: 299.99,
    originalPrice: null,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop",
    isNew: false,
    discount: null,
    featured: false,
    inStock: true,
    freeShipping: true,
    description: "Professional-grade coffee maker for the perfect brew every time."
  },
  {
    id: 10,
    name: "Luxury Designer Bag",
    category: "Fashion",
    price: 599.99,
    originalPrice: 799.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    isNew: false,
    discount: 25,
    featured: true,
    inStock: true,
    freeShipping: true,
    description: "Elegant designer handbag crafted from premium materials."
  },
  {
    id: 11,
    name: "Fitness Tracker Band",
    category: "Electronics",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop",
    isNew: true,
    discount: 25,
    featured: false,
    inStock: true,
    freeShipping: true,
    description: "Advanced fitness tracker with heart rate monitoring and sleep tracking."
  },
  {
    id: 12,
    name: "Premium Yoga Mat",
    category: "Sports & Fitness",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop",
    isNew: false,
    discount: 29,
    featured: false,
    inStock: true,
    freeShipping: false,
    description: "High-quality yoga mat with superior grip and cushioning."
  }
];

export const mockCategories = [
  {
    id: 1,
    name: "Electronics",
    icon: "smartphone",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop",
    productCount: 150
  },
  {
    id: 2,
    name: "Fashion",
    icon: "shirt",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop",
    productCount: 89
  },
  {
    id: 3,
    name: "Gaming",
    icon: "gamepad-2",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=300&fit=crop",
    productCount: 67
  },
  {
    id: 4,
    name: "Home & Kitchen",
    icon: "home",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
    productCount: 134
  },
  {
    id: 5,
    name: "Sports & Fitness",
    icon: "dumbbell",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
    productCount: 78
  },
  {
    id: 6,
    name: "Books",
    icon: "book",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop",
    productCount: 203
  }
];

export const mockCart = [];

export const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
};

export const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "Delivered",
    total: 299.99,
    items: [
      { name: "Premium Wireless Headphones", quantity: 1, price: 199.99 },
      { name: "Phone Case", quantity: 1, price: 29.99 }
    ]
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    status: "Shipped",
    total: 899.99,
    items: [
      { name: "Smartphone 5G Ultra", quantity: 1, price: 899.99 }
    ]
  }
];

export const mockReviews = [
  {
    id: 1,
    productId: 1,
    userName: "Sarah Johnson",
    rating: 5,
    comment: "Excellent sound quality and very comfortable to wear!",
    date: "2024-01-12"
  },
  {
    id: 2,
    productId: 1,
    userName: "Mike Chen",
    rating: 4,
    comment: "Great headphones, battery life could be better.",
    date: "2024-01-08"
  }
];