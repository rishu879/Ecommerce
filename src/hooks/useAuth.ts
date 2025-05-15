import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useStore from '../store';

type SignInCredentials = {
  email: string;
  password: string;
};

type SignUpCredentials = SignInCredentials & {
  name: string;
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser, clearUser } = useStore();

  const checkAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      
      setUser({
        id: data.session.user.id,
        email: data.session.user.email!,
        name: profile?.name || 'User',
        role: profile?.role || 'customer',
      });
    }
  }, [setUser]);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: profile?.name || 'User',
          role: profile?.role || 'customer',
        });
        
        navigate('/');
      }
    } catch (err: any) {
      console.error('Error signing in:', err.message);
      setError(err.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, name }: SignUpCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create a profile for the user
        await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          email,
          role: 'customer',
        });
        
        navigate('/login', { state: { message: 'Account created! Please sign in.' } });
      }
    } catch (err: any) {
      console.error('Error signing up:', err.message);
      setError(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      clearUser();
      navigate('/');
    } catch (err: any) {
      console.error('Error signing out:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    signIn,
    signUp,
    signOut,
    checkAuth,
  };
};