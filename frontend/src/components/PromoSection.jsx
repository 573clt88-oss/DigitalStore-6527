import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Zap, Gift, Clock } from 'lucide-react';

const PromoSection = () => {
  const promos = [
    {
      id: 1,
      title: "Flash Sale",
      subtitle: "24 Hours Only",
      description: "Up to 70% off on selected electronics",
      image: "https://images.unsplash.com/photo-1715049953874-8fe5ccab9cfb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDB8fHx8MTc1Njg1ODA2OHww&ixlib=rb-4.1.0&q=85",
      icon: Zap,
      color: "from-red-500 to-pink-500",
      discount: "70%"
    },
    {
      id: 2,
      title: "New Arrivals",
      subtitle: "Fresh Collections",
      description: "Discover the latest trends in fashion",
      image: "https://images.unsplash.com/photo-1513884923967-4b182ef167ab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxzaG9wcGluZyUyMGJhZ3N8ZW58MHx8fHwxNzU2ODU4MDYyfDA&ixlib=rb-4.1.0&q=85",
      icon: Gift,
      color: "from-blue-500 to-purple-500",
      discount: "NEW"
    },
    {
      id: 3,
      title: "Limited Time",
      subtitle: "Weekend Special",
      description: "Free shipping on orders over $50",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMGJhZ3N8ZW58MHx8fHwxNzU2ODU4MDYyfDA&ixlib=rb-4.1.0&q=85",
      icon: Clock,
      color: "from-green-500 to-teal-500",
      discount: "FREE"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Special Offers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't miss out on these amazing deals and limited-time offers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {promos.map((promo) => {
            const IconComponent = promo.icon;
            return (
              <Card key={promo.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${promo.color} opacity-80`}></div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white text-gray-900 font-bold px-3 py-1">
                      {promo.discount}
                    </Badge>
                  </div>

                  {/* Icon */}
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                    <p className="text-white/90 mb-1 font-semibold">{promo.subtitle}</p>
                    <p className="text-white/80 mb-4">{promo.description}</p>
                    
                    <Button 
                      variant="secondary" 
                      className="bg-white text-gray-900 hover:bg-gray-100 font-semibold group-hover:shadow-lg transition-all duration-300"
                    >
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional Promo Bar */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              🎉 Grand Opening Sale - 50% Off Everything!
            </h3>
            <p className="text-yellow-100 text-lg mb-6">
              Celebrate our launch with massive savings across all categories. Limited time only!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg"
              >
                Shop All Categories
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-3 text-lg"
              >
                View Deals
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoSection;