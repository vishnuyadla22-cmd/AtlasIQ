import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchInputProps {
  placeholder?: string;
  size?: 'md' | 'lg';
  autoNavigate?: boolean;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  className?: string;
  initialValue?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Enter a city, region, or country (e.g., Hyderabad, India)...',
  size = 'lg',
  autoNavigate = true,
  onSearch,
  isLoading = false,
  className = '',
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      setError('Please enter a location name, coordinate, or region.');
      return;
    }

    if (trimmed.length < 2) {
      setError('Location query must be at least 2 characters long.');
      return;
    }

    setError(null);

    if (onSearch) {
      onSearch(trimmed);
    }

    if (autoNavigate) {
      navigate(`/explorer?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setError(null);
  };

  const isLarge = size === 'lg';

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`relative flex items-center bg-white rounded-xl border transition-all duration-200 shadow-sm ${
            error
              ? 'border-rose-400 ring-2 ring-rose-100'
              : 'border-slate-300 hover:border-slate-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100'
          }`}
        >
          <div className="pl-4 pr-2 text-slate-400 flex items-center pointer-events-none">
            <Search className={isLarge ? 'w-5 h-5 text-brand-600' : 'w-4 h-4 text-brand-600'} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            aria-label="Location search"
            disabled={isLoading}
            className={`w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60 ${
              isLarge ? 'py-3.5 text-sm sm:text-base' : 'py-2.5 text-sm'
            }`}
          />

          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear location search"
              className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="pr-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center gap-1.5 font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 shrink-0 disabled:opacity-75 ${
                isLarge ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium px-1 flex items-center gap-1">
            <span>•</span> {error}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>Example queries: <span className="font-mono text-slate-700">Hyderabad, India</span> · <span className="font-mono text-slate-700">Valencia, Spain</span> · <span className="font-mono text-slate-700">Nairobi, Kenya</span></span>
          </div>
          <span className="text-slate-400">Powered by OSM Nominatim & Open-Meteo</span>
        </div>
      </form>
    </div>
  );
};
