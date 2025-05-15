import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, User } from '../types';

interface StoreState {
  // User state
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  
  // Cart state
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      
      // Cart state
      cart: [],
      setCart: (cart) => set((state) => ({ 
        cart: typeof cart === 'function' ? cart(state.cart) : cart 
      })),
    }),
    {
      name: 'raushan-electronic-store',
      partialize: (state) => ({ 
        cart: state.cart,
        // Don't persist user state as that should come from auth
      }),
    }
  )
);

export default useStore;