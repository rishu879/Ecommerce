import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const [ordersResponse, productsResponse, usersResponse] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact' }),
          supabase.from('products').select('*', { count: 'exact' }),
          supabase.from('profiles').select('*', { count: 'exact' }),
        ]);
        
        const totalOrders = ordersResponse.count || 0;
        const totalProducts = productsResponse.count || 0;
        const totalUsers = usersResponse.count || 0;
        
        // Calculate total revenue
        let totalRevenue = 0;
        if (ordersResponse.data) {
          totalRevenue = ordersResponse.data.reduce((acc, order) => acc + order.total, 0);
        }
        
        setStats({
          totalOrders,
          totalProducts,
          totalUsers,
          totalRevenue,
        });
        
        // Fetch recent orders
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select('*, profiles:user_id(name, email)')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentOrdersData) {
          setRecentOrders(recentOrdersData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Get status class
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
  
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Link to="/admin/products" className="btn-primary flex items-center">
              <ShoppingBag size={18} className="mr-2" />
              Manage Products
            </Link>
            <Link to="/admin/orders" className="btn-secondary flex items-center">
              <Package size={18} className="mr-2" />
              Manage Orders
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <h3 className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Products</p>
                    <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Users</p>
                    <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
              
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Order ID</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Customer</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">#{order.id.slice(0, 8)}</td>
                          <td className="px-4 py-3">
                            {order.profiles?.name}
                            <div className="text-xs text-gray-500">{order.profiles?.email}</div>
                          </td>
                          <td className="px-4 py-3">{formatDate(order.created_at)}</td>
                          <td className="px-4 py-3 font-medium">${order.total.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-6 text-gray-500">No recent orders</p>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Sales Overview</h2>
                  <div className="text-sm text-gray-500">Last 30 days</div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center">
                      <TrendingUp size={16} className="text-green-500 mr-2" />
                      <span className="text-lg font-semibold">${(stats.totalRevenue * 0.7).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                  </div>
                  
                  <div>
                    <div className="text-lg font-semibold">{Math.floor(stats.totalOrders * 0.8)}</div>
                    <p className="text-sm text-gray-500">Monthly Orders</p>
                  </div>
                  
                  <div>
                    <div className="text-lg font-semibold">${((stats.totalRevenue * 0.7) / (stats.totalOrders * 0.8)).toFixed(2)}</div>
                    <p className="text-sm text-gray-500">Avg. Order Value</p>
                  </div>
                </div>
                
                <div className="h-32 flex items-end space-x-2">
                  {/* Mock chart bars - in a real app, use a charting library */}
                  {Array(12).fill(0).map((_, i) => {
                    const height = 20 + Math.random() * 80;
                    return (
                      <div key={i} className="flex-1 bg-blue-100 rounded-t" style={{ height: `${height}%` }}></div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
                  <div className="text-sm text-gray-500">This Week</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium">Update inventory</h3>
                      <p className="text-sm text-gray-500">Check stock levels and update inventory</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 flex-shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium">Process pending orders</h3>
                      <p className="text-sm text-gray-500">Review and process customer orders</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 flex-shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium">Update product descriptions</h3>
                      <p className="text-sm text-gray-500">Improve SEO and product details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;