export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type Category = {
  id: number;
  name: string;
  icon: string;
};

export type Product = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  imageUrl: string | null;
  imageAlt: string | null;
  rating: number | null;
  ratingCount: number | null;
  badge: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  addedAt: string;
};

export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type Order = {
  id: number;
  userId: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export type Address = {
  id: number;
  userId: number;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

export type AccessibilitySettings = {
  userId: number;
  fontScale: number;
  highContrast: boolean;
  largeButtons: boolean;
};

// Navigation param lists
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  Carrinho: undefined;
  Pedidos: undefined;
  Perfil: undefined;
};

export type AppStackParamList = {
  Main: undefined;
  ProductDetail: { productId: number };
  AddProduct: undefined;
  EditProduct: { productId: number };
  ProductManagement: undefined;
};
