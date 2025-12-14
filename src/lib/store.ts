export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart: CartItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i._id === item._id);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  
  saveCart(cart);
  return cart;
}

export function removeFromCart(id: string) {
  const cart = getCart().filter(item => item._id !== id);
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(id: string, quantity: number) {
  const cart = getCart();
  const index = cart.findIndex(item => item._id === id);
  
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
  }
  
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
  return [];
}

export function getCartTotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function saveUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function removeUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

export function logout() {
  removeToken();
  removeUser();
  clearCart();
}
