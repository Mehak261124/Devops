import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

const BACKEND_URL = 'http://localhost:5001';

describe('App Integration (Mocked Backend)', () => {
    const originalFetch = global.fetch;

    beforeAll(() => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ 
                    status: 'ok', 
                    message: 'Mocked Backend Message', 
                    timestamp: new Date().toISOString() 
                }),
            })
        );
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    it('successfully connects to the backend and renders data', async () => {
        render(<App />);

        // Verify "Loading..." appears initially
        expect(screen.getByText(/Loading backend status/i)).toBeInTheDocument();

        // Wait for the backend data to appear (indicating backend is UP)
        await waitFor(() => {
            expect(screen.getByText(/Status:/i)).toBeInTheDocument();
            expect(screen.getByText(/Mocked Backend Message/i)).toBeInTheDocument();
        });
    });
});