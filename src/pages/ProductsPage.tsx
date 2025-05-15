import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { ProductFilter } from '../types';

const ProductsPage = () => {
  const location = useLocation();
  const { products, loading, fetchProducts } = useProducts();
  
  const [filters, setFilters] = useState<ProductFilter>({
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    search: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    
    const newFilters: ProductFilter = { ...filters };
    
    if (categoryParam) {
      newFilters.category = categoryParam;
    }
    
    if (searchParam) {
      newFilters.search = searchParam;
    }
    
    setFilters(newFilters);
    
    // Fetch products with filters
    fetchProducts(newFilters);
  }, [location.search]);
  
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFilters((prev) => ({
      ...prev,
      [name]: name === 'minPrice' || name === 'maxPrice' ? 
        value ? parseFloat(value) : undefined : 
        value,
    }));
  };
  
  const applyFilters = () => {
    fetchProducts(filters);
  };
  
  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      search: '',
    });
    
    fetchProducts({});
  };
  
  const categories = [
    'All Categories',
    'Smartphones',
    'Laptops',
    'Accessories',
    'Audio',
    'Wearables',
  ];
  
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Mobile filter toggle */}
          <div className="w-full md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors"
            >
              <Filter size={18} />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
          
          {/* Filters sidebar */}
          <aside className={`w-full md:w-64 md:sticky md:top-24 ${
            showFilters ? 'block' : 'hidden md:block'
          }`}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-gray-800 font-medium mb-3">Category</h3>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option 
                      key={category} 
                      value={category === 'All Categories' ? '' : category.toLowerCase()}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-gray-800 font-medium mb-3">Price Range</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Search */}
              <div className="mb-6">
                <h3 className="text-gray-800 font-medium mb-3">Search</h3>
                <input
                  type="text"
                  name="search"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={applyFilters}
                className="btn-primary w-full"
              >
                Apply Filters
              </button>
            </div>
          </aside>
          
          {/* Product Grid */}
          <div className="flex-1">
            {/* Active filters */}
            {(filters.category || filters.minPrice || filters.maxPrice || filters.search) && (
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="text-gray-600 py-2">Active filters:</span>
                
                {filters.category && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                    <span>Category: {filters.category}</span>
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                    <span>
                      Price: 
                      {filters.minPrice !== undefined ? ` $${filters.minPrice}` : ' $0'} 
                      {' - '} 
                      {filters.maxPrice !== undefined ? `$${filters.maxPrice}` : 'Any'}
                    </span>
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, minPrice: undefined, maxPrice: undefined }))}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {filters.search && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                    <span>Search: {filters.search}</span>
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {loading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="card h-80 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                <button 
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;