import { useState } from 'react';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import ProductList from './components/ProductList';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import { useToast, ToastContainer } from './components/Toast';

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toasts, addToast } = useToast();

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    addToast(`${product.name} added to cart!`, 'success');
  };

  const handleUpdateQty = (id, newQty) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    addToast('Item removed from cart', 'info');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <NavBar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />

      <HeroSection onShopNow={scrollToProducts} />

      <ProductList
        onAddToCart={handleAddToCart}
        onViewDetails={(product) => setSelectedProduct(product)}
      />

      <Footer />

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemoveFromCart}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product) => {
            handleAddToCart(product);
            setSelectedProduct(null);
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  );
}

export default App;