import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const API_URL = 'https://digimoncard.io/api-public/search';
const IMAGE_BASE = 'https://images.digimoncard.io/images/cards';
const REQUEST_TIMEOUT = 10000;

type Card = {
    id: string;
    name: string;
};

const toCard = (value: any): Card | null =>
    value && typeof value.id === 'string'
        ? { id: value.id, name: typeof value.name === 'string' ? value.name : value.id }
        : null;

export default function BasicTextFields() {

    const [searchInput, setSearchInput] = useState<string>('');
    const [results, setResults] = useState<Card[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = async (input: string) => {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({ series: 'Digimon Card Game', n: input });
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const response = await fetch(`${API_URL}?${params}`, { signal: controller.signal });

            if (!response.ok) {
                throw new Error(`API returned ${response.status} ${response.statusText}`);
            }

            const body = await response.text();

            let payload: unknown;
            try {
                payload = JSON.parse(body);
            } catch {
                throw new Error(`API did not return JSON: ${body.slice(0, 120)}`);
            }

            if (!Array.isArray(payload)) {
                const message = (payload as any)?.error ?? JSON.stringify(payload).slice(0, 120);
                setResults([]);
                setError(`No results: ${message}`);
                return;
            }

            const cards = payload
                .map(toCard)
                .filter((card): card is Card => card !== null);

            setResults(cards);

            if (cards.length === 0) {
                setError(`No cards found for "${input}"`);
            }
        } catch (e) {
            setResults([]);
            if (e instanceof Error && e.name === 'AbortError') {
                setError('Request timed out. Please try again.');
            } else {
                setError(e instanceof Error ? e.message : 'Request failed');
            }
        } finally {
            clearTimeout(timer);
            setLoading(false);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (searchInput) {
            fetchData(searchInput);
        }
    };

    return (
        <Box>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                    paddingBottom: '40px'
                }}
                display='flex'
                width='100%'
                alignItems='center'
                justifyContent='center'

            >
                <TextField id="outlined-basic" label="Card name" variant="outlined" value={searchInput} onChange={handleChange} />
                <Button type='submit' variant='contained' disabled={!searchInput || loading}>
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </Box>

            {error && (
                <Box display='flex' justifyContent='center' paddingBottom='20px'>
                    <Typography color='error'>{error}</Typography>
                </Box>
            )}

            <Box
                display='flex'
                width='100%'
                alignItems='center'
                justifyContent='center'
                paddingBottom='40px'
                flexWrap='wrap'
            >
                {
                    results.map((card) => (
                        <img
                            key={card.id}
                            style={{ padding: '5px' }}
                            alt={card.name}
                            src={`${IMAGE_BASE}/${card.id}.jpg`}
                            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                        />
                    ))
                }
            </Box>
        </Box>
    );
}
