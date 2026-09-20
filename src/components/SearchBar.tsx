import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const API_URL = 'https://digimoncard.io/api-public/search.php';

export default function BasicTextFields() {

    const [searchInput, setSearchInput] = useState<string>('');
    const [results, setResults] = useState<string[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = async (input: string) => {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({ series: 'Digimon Card Game', n: input });

        try {
            const response = await fetch(`${API_URL}?${params}`);

            if (!response.ok) {
                throw new Error(`API returned ${response.status} ${response.statusText}`);
            }

            const body = await response.text();

            let cards: unknown;
            try {
                cards = JSON.parse(body);
            } catch {
                throw new Error(`API did not return JSON: ${body.slice(0, 120)}`);
            }

            if (!Array.isArray(cards)) {
                const message = (cards as any)?.error ?? JSON.stringify(cards).slice(0, 120);
                setResults([]);
                setError(`No results: ${message}`);
                return;
            }

            const images = cards
                .map((card: any) => card.image_url)
                .filter((src: unknown): src is string => typeof src === 'string');

            if (images.length === 0) {
                setError(`Got ${cards.length} card(s) but no image_url field. Keys: ${Object.keys(cards[0] ?? {}).join(', ')}`);
            }

            setResults(images);
        } catch (e) {
            setResults([]);
            setError(e instanceof Error ? e.message : 'Request failed');
        } finally {
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
                noValidate
                autoComplete="off"
                display='flex'
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
                minHeight='70%'
                justifyContent='center'
                alignItems='center'
                flexWrap='wrap'
            >
                {
                    results.map((src: string) => <img key={src} style={{ padding: '5px' }} alt='card' src={src} />)
                }
            </Box>
        </Box>
    );
}
