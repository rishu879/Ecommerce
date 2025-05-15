import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Star, ChevronRight, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { toast } from '../components/ui/Toaster';
import ProductCard from '../components/ui/ProductCard';
import { Product } from '../types';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchProductById, products } = useProducts();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Fetch product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      const productData = await fetchProductById(id);
      
      if (productData) {
        setProduct(productData);
        
        // Get related products from the same category
        const related = products
          .filter(p => p.category === productData.category && p.id !== productData.id)
          .slice(0, 4);
        
        setRelatedProducts(related);
      }
      
      setLoading(false);
    };
    
    loadProduct();
  }, [id, fetchProductById, products]);
  
  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [id]);
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && (!product || newQuantity <= product.stock)) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };
  
  // Mock image gallery (in a real app, the product would have multiple images)
  const productImages = product ? [
    product.image,
    product.image,
    product.image,
  ] : [];
  
  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            <div className="w-full md:w-1/2">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="flex mt-4 space-x-2">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="h-20 w-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="btn-primary inline-flex items-center">
            <ArrowLeft size={18} className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <nav className="flex mb-6 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-gray-400">/</span>
              <Link to="/products" className="text-gray-500 hover:text-blue-600">Products</Link>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-gray-400">/</span>
              <Link 
                to={`/products?category=${product.category}`} 
                className="text-gray-500 hover:text-blue-600 capitalize"
              >
                {product.category}
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-medium truncate max-w-[150px]">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>
        
        {/* Product Details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="w-full lg:w-1/2">
            <div className="rounded-lg overflow-hidden mb-4">
              <img 
                src={productImages[activeImage]} 
                alt={product.name}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="flex space-x-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-20 h-20 rounded overflow-hidden border-2 ${
                    activeImage === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={`${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    } mr-1`} 
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">{product.rating} rating</span>
              </div>
              <span className="text-sm text-gray-500 mx-3">|</span>
              <span className={`text-sm ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.stock > 0 
                  ? `${product.stock} in stock` 
                  : 'Out of stock'}
              </span>
            </div>
            
            <p className="text-2xl font-bold text-blue-600 mb-6">
              ${product.price.toFixed(2)}
            </p>
            
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
            
            {/* Specifications */}
            {product.specifications && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex py-2 border-b border-gray-200 last:border-b-0">
                      <span className="font-medium w-1/3 text-gray-600">{key}</span>
                      <span className="w-2/3">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity selector */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Quantity</h3>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className={`p-2 rounded-l-md ${
                    quantity <= 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= product.stock) {
                      setQuantity(val);
                    }
                  }}
                  className="w-16 py-2 px-3 text-center border-t border-b border-gray-200"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className={`p-2 rounded-r-md ${
                    quantity >= product.stock 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-3 rounded-md flex items-center justify-center ${
                product.stock > 0 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } transition-colors mb-6`}
            >
              <ShoppingCart size={20} className="mr-2" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            
            {/* Shipping & Returns */}
            <div className="space-y-4">
              <div className="flex items-start">
                <Truck size={20} className="text-blue-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium">Free Shipping</h4>
                  <p className="text-sm text-gray-600">Free shipping on orders over $50</p>
                </div>
              </div>
              <div className="flex items-start">
                <ShieldCheck size={20} className="text-blue-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium">30-Day Returns</h4>
                  <p className="text-sm text-gray-600">Return or exchange within 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <Link 
                to={`/products?category=${product.category}`}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                View All
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;