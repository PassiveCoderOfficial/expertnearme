'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    };

    const debounce = setTimeout(fetchSuggestions, 300); // debounce typing
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Search Providers</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, or category"
        className="border p-2 w-full max-w-md"
      />

      {results.length > 0 && (
        <ul className="border mt-2 max-w-md bg-white shadow-md">
          {results.map((p) => (
            <li
              key={p.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              <Link href={`/providers/${p.id}`}>
                {p.name} — {p.email} ({p.category?.name})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
