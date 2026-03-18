import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import App from './App';

describe('App Component', () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    global.fetch = vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/products/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Electronics', 'Clothing']),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 1,
              name: 'Test Product',
              price: 29.99,
              category: 'Electronics',
              inStock: true,
              description: 'A test product',
            },
          ]),
      });
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('renders the navbar with cart button', () => {
    render(<App />);
    expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
  });

  it('renders the hero section with title', () => {
    render(<App />);
    expect(screen.getByText(/Discover Premium/i)).toBeInTheDocument();
  });

  it('renders the shop now button', () => {
    render(<App />);
    expect(screen.getByText(/Shop Now/i)).toBeInTheDocument();
  });

  it('opens cart drawer when cart button is clicked', () => {
    render(<App />);
    const cartBtn = screen.getByLabelText('Open cart');
    fireEvent.click(cartBtn);
    expect(screen.getByRole('dialog', { name: /shopping cart/i })).toBeInTheDocument();
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('renders the footer with copyright', () => {
    render(<App />);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});