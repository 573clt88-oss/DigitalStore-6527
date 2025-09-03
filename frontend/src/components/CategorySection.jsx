import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { mockCategories } from '../data/mockData';

const CategorySection = ({ onCategoryClick }) => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of categories and find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {mockCategories.map((category) => (
            <Card 
              key={category.id} 
              className="group hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => onCategoryClick && onCategoryClick(category)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {category.productCount} items
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;