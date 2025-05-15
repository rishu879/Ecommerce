import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { toast } from './Toaster';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, featured = false }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };
  
  return (
    <Link 
      to={`/products/${product.id}`}
      className={`group card h-full ${featured ? 'border-2 border-yellow-400' : ''}`}
    >
      <div className="relative overflow-hidden">
        {featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            Featured
          </div>
        )}
        
        {product.stock <= 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            Out of Stock
          </div>
        )}
        
        <div className="relative pt-[75%]">
          <img 
            src={product.image} 
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover object-center p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`p-3 rounded-full ${
                product.stock > 0 
                  ? 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } shadow-md transition-colors duration-300`}
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-800 font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center ml-2">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-semibold">${product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-500 capitalize">{product.category}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;