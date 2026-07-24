const CART_KEY = 'cart';

const cartService = {
  // Get cart from localStorage
  getCart: () => {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },

  // Save cart to localStorage
  saveCart: (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Dispatch event for header to update
    window.dispatchEvent(new Event('cartUpdated'));
  },

  // Add item to cart
  addToCart: (product, quantity) => {
    const cart = cartService.getCart();
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
        category: product.category
      });
    }
    
    cartService.saveCart(cart);
    return cart;
  },

  // Update item quantity
  updateQuantity: (productId, newQuantity) => {
    const cart = cartService.getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      item.quantity = newQuantity;
      cartService.saveCart(cart);
    }
    
    return cart;
  },

  // Remove item from cart
  removeItem: (productId) => {
    const cart = cartService.getCart();
    const newCart = cart.filter(item => item.id !== productId);
    cartService.saveCart(newCart);
    return newCart;
  },

  // Clear cart
  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
    return [];
  },

  // Get cart count
  getCartCount: () => {
    const cart = cartService.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Calculate total
  getCartTotal: () => {
    const cart = cartService.getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  }
};

export default cartService;