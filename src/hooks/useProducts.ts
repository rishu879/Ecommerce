import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product, ProductFilter } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (filters?: ProductFilter) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*');
      
      // Apply filters if provided
      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }
        
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }
        
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setProducts(data as Product[]);
    } catch (err: any) {
      console.error('Error fetching products:', err.message);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(4);
      
      if (error) throw error;
      
      setFeaturedProducts(data as Product[]);
    } catch (err: any) {
      console.error('Error fetching featured products:', err.message);
    }
  }, []);

  const fetchProductById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Product;
    } catch (err: any) {
      console.error('Error fetching product:', err.message);
      setError('Failed to fetch product');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize with all products
  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
  }, [fetchProducts, fetchFeaturedProducts]);

  return {
    products,
    featuredProducts,
    loading,
    error,
    fetchProducts,
    fetchProductById
  };
};