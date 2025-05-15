import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, User, ShoppingBag, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useStore from '../store';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/Toaster';
import { Order } from '../types';

const ProfilePage = () => {
  const { signOut } = useAuth();
  const { user } = useStore();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // For editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // Check for order placed message
  useEffect(() => {
    if (location.state?.orderPlaced) {
      toast.success('Your order has been placed successfully!');
      setActiveTab('orders');
    }
  }, [location.state]);
  
  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setOrders(data as Order[]);
      } catch (err: any) {
        console.error('Error fetching orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  // Handle profile form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Check if new password is being set
    if (profileData.newPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        setProfileError('New passwords do not match');
        return;
      }
      
      if (profileData.newPassword.length < 8) {
        setProfileError('New password must be at least 8 characters long');
        return;
      }
      
      if (!profileData.currentPassword) {
        setProfileError('Current password is required to change password');
        return;
      }
    }
    
    try {
      setLoading(true);
      setProfileError('');
      setProfileSuccess('');
      
      // Update name in profiles table
      if (profileData.name !== user.name) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ name: profileData.name })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
      }
      
      // Update password if provided
      if (profileData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileData.newPassword,
        });
        
        if (passwordError) throw passwordError;
      }
      
      // Update global state
      useStore.setState({
        user: {
          ...user,
          name: profileData.name,
        },
      });
      
      setProfileSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Clear sensitive fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
    } catch (err: any) {
      console.error('Error updating profile:', err.message);
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Get order status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold">{user?.name}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User size={18} className="mr-3" />
                  Profile
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                    activeTab === 'orders' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package size={18} className="mr-3" />
                  Orders
                </button>
                
                <button
                  onClick={signOut}
                  className="w-full flex items-center px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} className="mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Profile Information</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} className="mr-1" />
                        Edit
                      </button>
                    )}
                  </div>
                  
                  {profileError && (
                    <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-md">
                      {profileError}
                    </div>
                  )}
                  
                  {profileSuccess && (
                    <div className="mb-6 p-3 bg-green-100 text-green-800 rounded-md">
                      {profileSuccess}
                    </div>
                  )}
                  
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          className="w-full border border-gray-300 rounded-md p-2 bg-gray-50"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                      
                      {isEditing && (
                        <>
                          <div className="md:col-span-2">
                            <h3 className="font-medium mb-3">Change Password</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Leave blank if you don't want to change your password
                            </p>
                          </div>
                          
                          <div>
                            <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              value={profileData.currentPassword}
                              onChange={handleProfileChange}
                              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={profileData.newPassword}
                                onChange={handleProfileChange}
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={profileData.confirmPassword}
                                onChange={handleProfileChange}
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileError('');
                            setProfileSuccess('');
                            setProfileData({
                              ...profileData,
                              name: user?.name || '',
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary flex items-center"
                        >
                          {loading ? (
                            <>
                              <span>Saving</span>
                              <div className="ml-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">My Orders</h2>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                      <p>Loading your orders...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="divide-y">
                      {orders.map((order) => (
                        <div key={order.id} className="py-6 first:pt-0 last:pb-0">
                          <div className="flex flex-col sm:flex-row justify-between mb-4">
                            <div>
                              <div className="flex items-center mb-2">
                                <span className="font-medium mr-2">Order ID:</span>
                                <span className="text-gray-600">{order.id.slice(0, 8)}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Placed on {formatDate(order.created_at)}
                              </div>
                            </div>
                            <div className="mt-2 sm:mt-0">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="border rounded-md overflow-hidden">
                            <div className="divide-y">
                              {order.items.map((item, index) => (
                                <div key={index} className="p-3 flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{item.product_name}</div>
                                    <div className="text-sm text-gray-500">
                                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="font-medium">
                                    ${(item.quantity * item.price).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="bg-gray-50 p-3 flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-bold">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-6">
                        When you place an order, it will appear here.
                      </p>
                      <a href="/products" className="btn-primary">
                        Start Shopping
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;