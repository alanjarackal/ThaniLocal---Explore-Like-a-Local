import { MapPin, Users, ShoppingBag, ChevronDown, ArrowRight, Calendar, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import wavesBackground from './waves.jpg';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }
};

const features = [
  {
    name: 'Local Experiences',
    description: 'Discover authentic activities hosted by local community members.',
    icon: MapPin,
    stats: '100+ Experiences'
  },
  {
    name: 'Community-Driven',
    description: 'Join a growing community of conscious travelers and hosts.',
    icon: Users,
    stats: '500+ Members'
  },
  {
    name: 'Local Products',
    description: 'Shop sustainable, locally-made products from artisans.',
    icon: ShoppingBag,
    stats: '50+ Artisans'
  },
];

const popularExperiences = [
  {
    title: 'Kerala Backwaters Tour',
    rating: 4.9,
    reviews: 128,
    price: '₹2,999',
    image: 'https://images.unsplash.com/photo-1623679421264-8c931dd2c5c0?q=80&w=2070'
  },
  {
    title: 'Traditional Cooking Class',
    rating: 4.8,
    reviews: 96,
    price: '₹1,499',
    image: 'https://images.unsplash.com/photo-1605197161470-d0261cac6767?q=80&w=2070'
  },
  {
    title: 'Munnar Tea Plantation Visit',
    rating: 4.9,
    reviews: 156,
    price: '₹1,999',
    image: 'https://images.unsplash.com/photo-1582100627138-528deb78ce8b?q=80&w=2069'
  },
  {
    title: 'Theyyam Ritual Experience',
    rating: 4.9,
    reviews: 84,
    price: '₹2,499',
    image: 'https://images.unsplash.com/photo-1582550740000-e8f7dab43a63?q=80&w=2070'
  }
];

export function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        setShowScrollTop(window.scrollY > 500);
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Hero Section with Parallax Background */}
      <div 
        className="relative min-h-screen bg-cover bg-center flex items-center overflow-hidden"
        style={{
          backgroundImage: `url(${wavesBackground})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * 0.3}px)`,
          transition: 'transform 0.1s cubic-bezier(0.33, 1, 0.68, 1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <AnimatePresence>
            <motion.div 
              className="max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-lg"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 1, delay: 0.2 }}
              >
                Discover Local
                <motion.span 
                  className="block text-emerald-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                >
                  Adventures
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white max-w-xl mb-10 leading-relaxed drop-shadow-lg font-medium"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 1, delay: 0.6 }}
              >
                Experience authentic local culture while supporting sustainable tourism
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 1, delay: 0.8 }}
              >
                <Link
                  to="/experiences"
                  className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium inline-flex items-center justify-center transition-all duration-500 ease-out hover:scale-105 shadow-lg hover:shadow-emerald-500/50"
                >
                  Browse Experiences
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/marketplace"
                  className="group px-8 py-4 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium backdrop-blur-md inline-flex items-center justify-center transition-all duration-500 ease-out hover:scale-105 shadow-lg hover:shadow-white/30 border border-white/30"
                >
                  Visit Marketplace
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown className="w-8 h-8 text-white drop-shadow-lg hover:text-emerald-300 transition-colors duration-300" />
        </motion.div>
      </div>

      {/* Popular Experiences Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Popular Experiences
            </h2>
            <p className="text-xl text-gray-500">
              Discover the most loved experiences by our community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularExperiences.map((experience, index) => (
              <motion.div
                key={experience.title}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={experience.image} 
                    alt={experience.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <motion.button
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart className="w-5 h-5 text-white hover:text-red-500 transition-colors duration-300" />
                  </motion.button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{experience.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">{experience.rating}</span>
                    <span className="text-gray-500">({experience.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-emerald-600">{experience.price}</span>
                    <motion.button
                      className="flex items-center gap-1 text-emerald-600 font-medium"
                      whileHover={{ x: 5 }}
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Why ThaniLocal</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Travel sustainably, experience authentically
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Join our community of conscious travelers and local hosts to create meaningful connections and sustainable experiences.
            </p>
          </motion.div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.name}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
                >
                  <div className="group p-6 bg-white rounded-xl hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500 text-white shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-500"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <feature.icon className="h-6 w-6" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                        <p className="mt-1 text-sm text-emerald-500 font-medium">{feature.stats}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-base text-gray-500">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="fixed bottom-8 right-8 p-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors duration-300"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronDown className="w-6 h-6 transform rotate-180" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}