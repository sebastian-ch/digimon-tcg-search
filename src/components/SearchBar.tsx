import React, { useState } from 'react';

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

export default function SearchBar() {

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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (searchInput) {
            fetchData(searchInput);
        }
    };

    return (
        <div className="mx-auto max-w-6xl">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end justify-center gap-3">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="card-name" className="text-sm font-medium text-slate-700">
                        Card name
                    </label>
                    <input
                        id="card-name"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Agumon"
                        className="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!searchInput || loading}
                    className="rounded-md bg-sky-600 px-5 py-2 font-medium text-white transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && (
                <p role="alert" className="mt-6 text-center text-red-600">
                    {error}
                </p>
            )}

            <div className="mt-10 flex flex-wrap items-start justify-center gap-2">
                {results.map((card) => (
                    <img
                        key={card.id}
                        alt={card.name}
                        src={`${IMAGE_BASE}/${card.id}.jpg`}
                        loading="lazy"
                        className="w-40 rounded-lg shadow-sm transition-transform hover:scale-105"
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                ))}
            </div>
        </div>
    );
}
