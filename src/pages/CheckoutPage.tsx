import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, Truck, Lock } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { toast } from '../components/ui/Toaster';
import useStore from '../store';
import { supabase } from '../lib/supabase';

type PaymentMethod = 'credit_card' | 'paypal';
type CheckoutStep = 'shipping' | 'payment' | 'review';

const CheckoutPage = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useStore();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });
  
  // Credit card form state
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  // Handle shipping form changes
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle credit card form changes
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value && key !== 'address2') {
        toast.error(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    // Proceed to payment step
    setCurrentStep('payment');
    window.scrollTo(0, 0);
  };
  
  // Handle payment form submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'credit_card') {
      // Basic credit card validation
      for (const [key, value] of Object.entries(cardInfo)) {
        if (!value) {
          toast.error(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return;
        }
      }
    }
    
    // Proceed to review step
    setCurrentStep('review');
    window.scrollTo(0, 0);
  };
  
  // Handle order submission
  const handlePlaceOrder = async () => {
    if (!user) return;
    
    try {
      setIsProcessing(true);
      
      // Calculate values
      const subtotal = getTotalPrice();
      const shipping = subtotal > 50 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      
      // In a real app, process payment here
      
      // Create order in database
      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: orderItems,
          total: total,
          status: 'pending',
          shipping_address: {
            name: shippingInfo.fullName,
            street: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            postalCode: shippingInfo.zipCode,
            country: shippingInfo.country,
            phone: shippingInfo.phone,
          },
          payment_method: paymentMethod,
        })
        .select();
      
      if (error) throw error;
      
      // Clear cart
      clearCart();
      
      // Show success toast
      toast.success('Order placed successfully!');
      
      // Redirect to order confirmation page
      navigate('/profile', { state: { orderPlaced: true } });
    } catch (err: any) {
      console.error('Error placing order:', err.message);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Calculate totals
  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className={`flex flex-col items-center ${currentStep === 'shipping' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                currentStep === 'shipping' ? 'bg-blue-600 text-white' : 
                currentStep === 'payment' || currentStep === 'review' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {currentStep === 'payment' || currentStep === 'review' ? <Check size={20} /> : 1}
              </div>
              <span className="text-sm font-medium">Shipping</span>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${
              currentStep === 'shipping' ? 'bg-gray-200' : 'bg-green-500'
            }`} />
            
            <div className={`flex flex-col items-center ${currentStep === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                currentStep === 'payment' ? 'bg-blue-600 text-white' : 
                currentStep === 'review' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {currentStep === 'review' ? <Check size={20} /> : 2}
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${
              currentStep === 'review' ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            
            <div className={`flex flex-col items-center ${currentStep === 'review' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                currentStep === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main checkout form */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Shipping Information Step */}
              {currentStep === 'shipping' && (
                <form onSubmit={handleShippingSubmit}>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Truck size={20} className="mr-2 text-blue-600" />
                    Shipping Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-gray-700 font-medium mb-2">
                        State / Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-gray-700 font-medium mb-2">
                        ZIP / Postal Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Japan">Japan</option>
                        <option value="China">China</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary py-3 px-6"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              )}
              
              {/* Payment Information Step */}
              {currentStep === 'payment' && (
                <form onSubmit={handlePaymentSubmit}>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <CreditCard size={20} className="mr-2 text-blue-600" />
                    Payment Method
                  </h2>
                  
                  <div className="mb-6">
                    <div className="flex space-x-4 mb-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={paymentMethod === 'credit_card'}
                          onChange={() => setPaymentMethod('credit_card')}
                          className="mr-2"
                        />
                        <span>Credit Card</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={() => setPaymentMethod('paypal')}
                          className="mr-2"
                        />
                        <span>PayPal</span>
                      </label>
                    </div>
                    
                    {paymentMethod === 'credit_card' && (
                      <div className="border border-gray-200 rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                          <div className="md:col-span-2">
                            <label htmlFor="cardNumber" className="block text-gray-700 font-medium mb-2">
                              Card Number
                            </label>
                            <input
                              type="text"
                              id="cardNumber"
                              name="cardNumber"
                              value={cardInfo.cardNumber}
                              onChange={handleCardChange}
                              placeholder="1234 5678 9012 3456"
                              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label htmlFor="cardName" className="block text-gray-700 font-medium mb-2">
                              Name on Card
                            </label>
                            <input
                              type="text"
                              id="cardName"
                              name="cardName"
                              value={cardInfo.cardName}
                              onChange={handleCardChange}
                              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="expiryDate" className="block text-gray-700 font-medium mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              name="expiryDate"
                              value={cardInfo.expiryDate}
                              onChange={handleCardChange}
                              placeholder="MM/YY"
                              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="cvv" className="block text-gray-700 font-medium mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              value={cardInfo.cvv}
                              onChange={handleCardChange}
                              placeholder="123"
                              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mt-4">
                          <Lock size={16} className="mr-2" />
                          <span>Your payment information is secured with SSL encryption</span>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === 'paypal' && (
                      <div className="border border-gray-200 rounded-md p-4 text-center">
                        <p className="mb-4">You will be redirected to PayPal to complete your payment.</p>
                        <img 
                          src="https://www.paypalobjects.com/webstatic/mktg/logo/PP_AcceptanceMarkTray-NoDiscover_243x40.jpg" 
                          alt="PayPal acceptance mark"
                          className="h-8 mx-auto"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('shipping')}
                      className="btn-secondary py-3 px-6"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary py-3 px-6"
                    >
                      Continue to Review
                    </button>
                  </div>
                </form>
              )}
              
              {/* Order Review Step */}
              {currentStep === 'review' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Order Review</h2>
                  
                  {/* Order summary */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Items ({cart.length})</h3>
                    <div className="border border-gray-200 rounded-md divide-y">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center py-3 px-4">
                          <div className="w-12 h-12 mr-4">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Shipping and Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <Truck size={16} className="mr-2 text-blue-600" />
                        Shipping Information
                      </h3>
                      <div className="border border-gray-200 rounded-md p-4">
                        <p className="font-medium">{shippingInfo.fullName}</p>
                        <p>{shippingInfo.address}</p>
                        <p>
                          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                        </p>
                        <p>{shippingInfo.country}</p>
                        <p className="mt-2">{shippingInfo.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <CreditCard size={16} className="mr-2 text-blue-600" />
                        Payment Method
                      </h3>
                      <div className="border border-gray-200 rounded-md p-4">
                        {paymentMethod === 'credit_card' ? (
                          <>
                            <p className="font-medium">Credit Card</p>
                            <p>
                              **** **** **** {cardInfo.cardNumber.slice(-4)}
                            </p>
                            <p>{cardInfo.cardName}</p>
                            <p>Expires: {cardInfo.expiryDate}</p>
                          </>
                        ) : (
                          <p className="font-medium">PayPal</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('payment')}
                      className="btn-secondary py-3 px-6"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="btn-primary py-3 px-6 flex items-center"
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                      {isProcessing && (
                        <div className="ml-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.length} items)</span>
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
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Truck size={16} className="mr-2 text-green-500" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Lock size={16} className="mr-2 text-green-500" />
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;