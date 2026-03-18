import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProductList from './ProductList';

describe('ProductList Integration', () => {
  const mockProducts = [
    { id: 1, name: 'Phone', category: 'Electronics', price: 499.99, inStock: true, description: 'A great phone' },
    { id: 2, name: 'Shirt', category: 'Clothing', price: 29.99, inStock: true, description: 'A nice shirt' },
  ];

  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    vi.restoreAllMocks();
  });

  function mockFetchWith(productData) {
    global.fetch = vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Electronics', 'Clothing']),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(productData),
      });
    });
  }

  it('fetches and displays products on mount', async () => {
    mockFetchWith(mockProducts);
    render(<ProductList onAddToCart={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Shirt')).toBeInTheDocument();
    });
  });

  it('handles search interaction', async () => {
    mockFetchWith([mockProducts[0]]);
    render(<ProductList onAddToCart={() => {}} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Phone')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'phone' } });
    fireEvent.submit(screen.getByRole('search'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('q=phone'));
    });
  });

  it('displays error message when fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    render(<ProductList onAddToCart={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no products found', async () => {
    mockFetchWith([]);
    render(<ProductList onAddToCart={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/No products found/i)).toBeInTheDocument();
    });
  });
});