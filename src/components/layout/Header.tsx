import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, User as UserIcon } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store';
import Logo from '../ui/Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, getTotalItems } = useCart();
  const { signOut } = useAuth();
  const { user } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const totalItems = getTotalItems();
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-800 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link to="/products" className="text-gray-800 hover:text-blue-600 font-medium">
              Products
            </Link>
            <div className="relative group">
              <button className="text-gray-800 hover:text-blue-600 font-medium">
                Categories
              </button>
              <div className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-left z-50">
                <Link to="/products?category=smartphones" className="block px-4 py-2 hover:bg-gray-100">
                  Smartphones
                </Link>
                <Link to="/products?category=laptops" className="block px-4 py-2 hover:bg-gray-100">
                  Laptops
                </Link>
                <Link to="/products?category=accessories" className="block px-4 py-2 hover:bg-gray-100">
                  Accessories
                </Link>
                <Link to="/products?category=audio" className="block px-4 py-2 hover:bg-gray-100">
                  Audio
                </Link>
                <Link to="/products?category=wearables" className="block px-4 py-2 hover:bg-gray-100">
                  Wearables
                </Link>
              </div>
            </div>
          </nav>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search products..."
              className="px-4 py-2 rounded-full bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none w-56 lg:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 text-gray-500">
              <Search size={18} />
            </button>
          </form>
          
          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="relative group">
                <button className="flex items-center text-gray-800 hover:text-blue-600">
                  <UserIcon size={20} className="mr-1" />
                  <span className="font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-right z-50">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    My Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center text-gray-800 hover:text-blue-600">
                <UserIcon size={20} className="mr-1" />
                <span className="font-medium">Sign In</span>
              </Link>
            )}
            
            <Link to="/cart" className="relative">
              <ShoppingCart size={22} className="text-gray-800 hover:text-blue-600" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link to="/cart" className="relative">
              <ShoppingCart size={22} className="text-gray-800" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="container-custom py-4">
            <form onSubmit={handleSearch} className="flex items-center relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="px-4 py-2 rounded-full bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 text-gray-500">
                <Search size={18} />
              </button>
            </form>
            
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="py-2 text-gray-800 font-medium">
                Home
              </Link>
              <Link to="/products" className="py-2 text-gray-800 font-medium">
                Products
              </Link>
              <details className="group">
                <summary className="py-2 text-gray-800 font-medium list-none flex justify-between cursor-pointer">
                  Categories
                  <span className="transform group-open:rotate-180 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </summary>
                <div className="pl-4 mt-2 space-y-2">
                  <Link to="/products?category=smartphones" className="block py-2">
                    Smartphones
                  </Link>
                  <Link to="/products?category=laptops" className="block py-2">
                    Laptops
                  </Link>
                  <Link to="/products?category=accessories" className="block py-2">
                    Accessories
                  </Link>
                  <Link to="/products?category=audio" className="block py-2">
                    Audio
                  </Link>
                  <Link to="/products?category=wearables" className="block py-2">
                    Wearables
                  </Link>
                </div>
              </details>
              {user ? (
                <>
                  <Link to="/profile" className="py-2 text-gray-800 font-medium">
                    My Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="py-2 text-gray-800 font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={signOut}
                    className="py-2 text-left text-red-600 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="py-2 text-gray-800 font-medium">
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;