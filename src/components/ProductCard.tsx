import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Package } from 'lucide-react';
import type { Product } from '../lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    id,
    title,
    description,
    image_url,
    price,
    category,
    rating,
    artisan_name,
  } = product;

  return (
    <Link to={`/marketplace/${id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-emerald-600">
            ${price}
          </div>
          <div className="absolute bottom-4 left-4 bg-emerald-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-white">
            {category}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 line-clamp-1">
              {title}
            </h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Package className="h-4 w-4 mr-2 text-emerald-500" />
              By {artisan_name}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}