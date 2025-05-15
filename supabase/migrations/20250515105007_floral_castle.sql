/*
  # Initial Schema Creation
  
  1. Tables
    - `profiles`
      - Stores user profile information
      - Links to auth.users via id
    - `products`
      - Stores product information including name, price, descriptions
    - `orders`
      - Stores order information including items, totals, and status
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anon users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 1) DEFAULT 0.0,
  specifications JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profile security policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Product security policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Order security policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Insert sample data for products
INSERT INTO products (name, description, price, category, image, featured, stock, rating, specifications)
VALUES
  (
    'iPhone 13 Pro', 
    'The iPhone 13 Pro features a stunning Super Retina XDR display with ProMotion, A15 Bionic chip, and advanced camera system.', 
    999.99, 
    'smartphones', 
    'https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    true, 
    50, 
    4.8,
    '{"display": "6.1-inch Super Retina XDR", "processor": "A15 Bionic", "camera": "Pro camera system", "storage": "128GB", "battery": "Up to 22 hours"}'
  ),
  (
    'Samsung Galaxy S21', 
    'The Samsung Galaxy S21 features a Dynamic AMOLED display, powerful processor, and versatile camera system.', 
    799.99, 
    'smartphones', 
    'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    false, 
    35, 
    4.7,
    '{"display": "6.2-inch Dynamic AMOLED", "processor": "Snapdragon 888", "camera": "64MP triple camera", "storage": "128GB", "battery": "4000mAh"}'
  ),
  (
    'MacBook Pro M1', 
    'The MacBook Pro with M1 chip delivers breakthrough performance with up to 20 hours of battery life.', 
    1299.99, 
    'laptops', 
    'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    true, 
    20, 
    4.9,
    '{"display": "13.3-inch Retina", "processor": "Apple M1", "ram": "8GB unified memory", "storage": "256GB SSD", "battery": "Up to 20 hours"}'
  ),
  (
    'Dell XPS 13', 
    'The Dell XPS 13 features a stunning InfinityEdge display, 11th Gen Intel processor, and premium design.', 
    999.99, 
    'laptops', 
    'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    false, 
    15, 
    4.6,
    '{"display": "13.4-inch UHD+ InfinityEdge", "processor": "11th Gen Intel Core i7", "ram": "16GB", "storage": "512GB SSD", "battery": "Up to 12 hours"}'
  ),
  (
    'Sony WH-1000XM4', 
    'Industry-leading noise canceling wireless headphones with premium sound quality and long battery life.', 
    349.99, 
    'audio', 
    'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    true, 
    40, 
    4.8,
    '{"type": "Over-ear wireless", "noise canceling": "Yes", "battery": "30 hours", "bluetooth": "5.0", "weight": "254g"}'
  ),
  (
    'Apple AirPods Pro', 
    'Active Noise Cancellation, Transparency mode, and spatial audio deliver an immersive sound experience.', 
    249.99, 
    'audio', 
    'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    false, 
    30, 
    4.7,
    '{"type": "In-ear wireless", "noise canceling": "Yes", "battery": "4.5 hours (24 hours with case)", "water resistance": "IPX4", "weight": "5.4g each"}'
  ),
  (
    'Apple Watch Series 7', 
    'The Apple Watch Series 7 features a larger, more advanced display, faster charging, and enhanced durability.', 
    399.99, 
    'wearables', 
    'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    true, 
    25, 
    4.8,
    '{"display": "Always-On Retina", "case size": "45mm", "connectivity": "GPS + Cellular", "water resistance": "50m", "battery": "Up to 18 hours"}'
  ),
  (
    'Fitbit Charge 5', 
    'Advanced health and fitness tracker with built-in GPS, heart rate monitoring, and stress management tools.', 
    179.99, 
    'wearables', 
    'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    false, 
    35, 
    4.5,
    '{"display": "AMOLED color", "battery": "Up to 7 days", "water resistance": "50m", "sensors": "ECG, EDA", "gps": "Built-in"}'
  ),
  (
    'Samsung 65" QLED 4K TV', 
    'Experience stunning 4K resolution, vibrant colors, and smart features for all your entertainment needs.', 
    1299.99, 
    'electronics', 
    'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    true, 
    10, 
    4.7,
    '{"display": "65-inch QLED 4K", "resolution": "3840 x 2160", "refresh rate": "120Hz", "smart tv": "Yes", "hdr": "HDR10+"}'
  ),
  (
    'Logitech MX Master 3', 
    'Advanced wireless mouse with ultra-fast scrolling, ergonomic design, and customizable buttons.', 
    99.99, 
    'accessories', 
    'https://images.pexels.com/photos/3915912/pexels-photo-3915912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    false, 
    45, 
    4.9,
    '{"connectivity": "Bluetooth, USB", "battery": "Up to 70 days", "buttons": "7", "dpi": "4000", "weight": "141g"}'
  ),
  (
    'iPad Air', 
    'The powerful iPad Air features a 10.9-inch Liquid Retina display, A14 Bionic chip, and versatile capabilities.', 
    599.99, 
    'tablets', 
    'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    false, 
    30, 
    4.8,
    '{"display": "10.9-inch Liquid Retina", "processor": "A14 Bionic", "storage": "64GB", "camera": "12MP", "battery": "Up to 10 hours"}'
  ),
  (
    'Sony PlayStation 5', 
    'Next-generation gaming console with ultra-high-speed SSD, 3D audio, and haptic feedback controller.', 
    499.99, 
    'electronics', 
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    false, 
    5, 
    4.9,
    '{"storage": "825GB SSD", "resolution": "4K", "frame rate": "Up to 120fps", "ray tracing": "Yes", "backwards compatibility": "PS4 games"}'
  );