import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from './ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    category: 'Electronics',
    inStock: true,
    description: 'A great test product with amazing features.',
    _rating: 4.5,
  };

  it('renders product name, category, and price', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('29.99')).toBeInTheDocument();
  });

  it('renders product description', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);
    expect(screen.getByText(/A great test product/)).toBeInTheDocument();
  });

  it('renders in-stock badge for available products', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);
    expect(screen.getByText('✓ In Stock')).toBeInTheDocument();
  });

  it('renders sold out badge for out-of-stock products', () => {
    const outOfStock = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStock} onAddToCart={() => {}} />);
    expect(screen.getByText('Sold Out', { selector: '.product-card__badge' })).toBeInTheDocument();
  });

  it('calls onAddToCart when add button clicked', () => {
    const handleAdd = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAdd} />);
    const btn = screen.getByLabelText(/Add Test Product to cart/i);
    fireEvent.click(btn);
    expect(handleAdd).toHaveBeenCalledWith(mockProduct);
  });

  it('disables add button when out of stock', () => {
    const outOfStock = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStock} onAddToCart={() => {}} />);
    const btn = screen.getByLabelText(/Out of stock/i);
    expect(btn).toBeDisabled();
  });

  it('calls onViewDetails when card is clicked', () => {
    const handleView = vi.fn();
    render(
      <ProductCard product={mockProduct} onAddToCart={() => {}} onViewDetails={handleView} />
    );
    fireEvent.click(screen.getByTestId('product-card-1'));
    expect(handleView).toHaveBeenCalledWith(mockProduct);
  });
});