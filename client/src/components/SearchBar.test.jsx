import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  it('renders input and search button', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'phone' } });
    expect(input.value).toBe('phone');
  });

  it('calls onSearch with term when form submitted', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'laptop' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(handleSearch).toHaveBeenCalledWith('laptop');
  });

  it('shows clear button when input has text', () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'test' } });
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('clears input and calls onSearch with empty string when cleared', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(input.value).toBe('');
    expect(handleSearch).toHaveBeenCalledWith('');
  });
});