import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Headphones, Watch, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../hooks/useProducts';

const HomePage = () => {
  const { featuredProducts, loading } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      image: "https://images.pexels.com/photos/1294886/pexels-photo-1294886.jpeg?auto=compress&cs=tinysrgb&w=1600",
      title: "Next-Gen Electronics",
      description: "Discover the latest in technology innovations",
      button: "Shop Now",
    },
    {
      image: "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=1600",
      title: "Premium Audio Experience",
      description: "Immerse yourself in exceptional sound quality",
      button: "Explore Audio",
    },
    {
      image: "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=1600",
      title: "Work & Play Devices",
      description: "Elevate your productivity and entertainment",
      button: "View Laptops",
    },
  ];
  
  // Categories with icons
  const categories = [
    { name: "Smartphones", icon: <Smartphone size={32} />, path: "/products?category=smartphones" },
    { name: "Laptops", icon: <Laptop size={32} />, path: "/products?category=laptops" },
    { name: "Audio", icon: <Headphones size={32} />, path: "/products?category=audio" },
    { name: "Wearables", icon: <Watch size={32} />, path: "/products?category=wearables" },
  ];
  
  // Auto slide the hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroSlides.length]);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>
            <div className="relative h-full container-custom flex flex-col justify-center text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">{slide.title}</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-xl animate-fade-in">{slide.description}</p>
              <div className="animate-fade-in">
                <Link 
                  to="/products" 
                  className="btn-accent inline-flex items-center"
                >
                  {slide.button}
                  <ChevronRight size={18} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-10 text-center">Shop By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="bg-gray-50 p-6 rounded-lg text-center transition-transform duration-300 hover:scale-105 hover:shadow-md"
              >
                <div className="flex justify-center mb-4 text-blue-600">
                  {category.icon}
                </div>
                <h3 className="text-lg font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-10 text-center">Featured Products</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="card h-64 animate-pulse">
                  <div className="h-3/4 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <div key={product.id} className="animate-fade-in">
                  <ProductCard product={product} featured />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No featured products available at the moment.</p>
          )}
          
          <div className="mt-12 text-center">
            <Link to="/products" className="btn-primary inline-flex items-center">
              View All Products
              <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8">
              <h2 className="text-3xl font-bold mb-4">Special Offer</h2>
              <p className="text-xl mb-6">Get up to 30% off on all accessories</p>
              <Link to="/products?category=accessories" className="btn bg-white text-blue-700 hover:bg-gray-100 inline-flex items-center">
                Shop Accessories
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3">
              <img 
                src="https://images.pexels.com/photos/3471259/pexels-photo-3471259.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Electronics accessories"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Raushan Electronic</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-50 border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
              <p className="text-gray-600">We offer only the highest quality products, thoroughly tested and inspected for reliability.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-gray-50 border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Enjoy quick and reliable shipping with real-time tracking for all your orders.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-gray-50 border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
              <p className="text-gray-600">Our team of tech experts is available 24/7 to assist you with any questions or issues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-100">
        <div className="container-custom">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">Subscribe to our newsletter to receive updates on new products, special offers, and tech news.</p>
            
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap py-3"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              By subscribing, you agree to our <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;