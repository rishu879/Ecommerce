import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { toast } from '../components/ui/Toaster';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    
    const product = cart.find(item => item.id === productId);
    if (!product) return;
    
    if (quantity > product.stock) {
      toast.error(`Sorry, only ${product.stock} items in stock`);
      return;
    }
    
    updateQuantity(productId, quantity);
  };
  
  const handleRemoveFromCart = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.info(`${productName} removed from cart`);
  };
  
  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    // In a real app, validate promo code with backend
    setPromoError('Invalid or expired promo code');
  };
  
  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom max-w-4xl mx-auto text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center">
            <ArrowLeft size={18} className="mr-2" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="hidden sm:grid sm:grid-cols-12 bg-gray-50 p-4 text-gray-600 font-medium">
                <div className="sm:col-span-6">Product</div>
                <div className="sm:col-span-2 text-center">Price</div>
                <div className="sm:col-span-2 text-center">Quantity</div>
                <div className="sm:col-span-2 text-center">Total</div>
              </div>
              
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="border-t border-gray-200 first:border-t-0 p-4 sm:grid sm:grid-cols-12 sm:items-center gap-4"
                >
                  {/* Product */}
                  <div className="sm:col-span-6 flex items-center mb-4 sm:mb-0">
                    <div className="w-20 h-20 mr-4 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div>
                      <Link 
                        to={`/products/${item.id}`}
                        className="font-medium text-gray-800 hover:text-blue-600 line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 capitalize mt-1">{item.category}</p>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="sm:col-span-2 text-center flex items-center justify-between sm:block mb-4 sm:mb-0">
                    <span className="sm:hidden text-gray-600">Price:</span>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                  
                  {/* Quantity */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-center mb-4 sm:mb-0">
                    <span className="sm:hidden text-gray-600">Quantity:</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1) {
                            handleQuantityChange(item.id, val);
                          }
                        }}
                        className="w-12 py-1 px-2 mx-1 text-center border border-gray-200 rounded"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="sm:col-span-2 text-center flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-gray-600">Total:</span>
                    <div className="flex items-center">
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => handleRemoveFromCart(item.id, item.name)}
                        className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <Link to="/products" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
                <ArrowLeft size={18} className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="w-full xl:w-96">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Promo Code */}
              <div className="mb-6">
                <label htmlFor="promoCode" className="block text-gray-700 font-medium mb-2">
                  Promo Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="promoCode"
                    className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError(null);
                    }}
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 rounded-r-md"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-500 text-sm mt-1">{promoError}</p>
                )}
              </div>
              
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-3 flex items-center justify-center"
              >
                Proceed to Checkout
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;