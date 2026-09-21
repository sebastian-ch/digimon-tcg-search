import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from './SearchBar';

const respond = (body: unknown, ok = true, status = 200) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok,
        status,
        statusText: ok ? 'OK' : 'Internal Server Error',
        text: async () => JSON.stringify(body)
    } as Response);

const search = async (term = 'agumon') => {
    const user = userEvent.setup();
    render(<SearchBar />);
    await user.type(screen.getByLabelText(/card name/i), term);
    await user.click(screen.getByRole('button', { name: /search/i }));
};

afterEach(() => vi.restoreAllMocks());

describe('SearchBar', () => {
    it('renders a card image derived from the card id', async () => {
        respond([{ id: 'BT3-007', name: 'Agumon' }]);
        await search();

        await waitFor(() => {
            expect(screen.getByAltText('Agumon')).toHaveAttribute(
                'src',
                'https://images.digimoncard.io/images/cards/BT3-007.jpg'
            );
        });
    });

    it('reports an empty result set', async () => {
        respond([]);
        await search();
        await waitFor(() => expect(screen.getByText(/no cards found/i)).toBeInTheDocument());
    });

    it('surfaces a failed request', async () => {
        respond({}, false, 500);
        await search();
        await waitFor(() => expect(screen.getByText(/API returned 500/i)).toBeInTheDocument());
    });

    it('surfaces a non-JSON response', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: async () => '<html>nope</html>'
        } as Response);
        await search();
        await waitFor(() => expect(screen.getByText(/did not return JSON/i)).toBeInTheDocument());
    });
});
