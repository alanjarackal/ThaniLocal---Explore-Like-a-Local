import React from 'react';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import type { Experience } from '../lib/types';

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const {
    id,
    title,
    description,
    image_url,
    location,
    price,
    date,
    max_participants,
    current_participants,
    rating,
  } = experience;

  const availableSpots = max_participants - current_participants;
  const formattedDate = format(parseISO(date), 'MMM d, yyyy');

  return (
    <Link to={`/experiences/${id}`} className="group">
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
          {availableSpots < 5 && (
            <div className="absolute bottom-4 left-4 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-white">
              Only {availableSpots} spots left!
            </div>
          )}
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
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
              {location}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
              {formattedDate}
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2 text-emerald-500" />
              {availableSpots} spots available
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}