import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pokemonApi } from '../api/pokemon';
import type { Pokemon } from '../types';
import PokeballIcon from '../components/PokeballIcon';
import SortModal from '../components/SortModal';

const PAGE_SIZE = 50;

type SortField = 'name' | 'number';

// Search icon component
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
  </svg>
);

// Tag/Sort icon component (# symbol) - for sorting by number
const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 2L4.5 14M11.5 2L10 14M14 4.5H2M13.5 11.5H1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

// Text/Sort icon component (A with underline) - for sorting by name
const TextSortIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text x="8" y="11" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor">A</text>
    <line x1="3" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Placeholder for missing Pokemon images
const PlaceholderImage: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <PokeballIcon className="w-full h-full text-grayscale-light" />
  </div>
);

// Pokemon Card component
const PokemonCard: React.FC<{
  pokemon: Pokemon;
  index: number;
  onClick: () => void;
}> = ({ pokemon, index, onClick }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      onClick={onClick}
      className="animate-fade-in relative flex flex-col items-center bg-grayscale-white rounded-lg shadow-drop-2dp cursor-pointer hover:shadow-lg transition-shadow"
      style={{ height: '108px', animationDelay: `${Math.min(index % 50, 20) * 30}ms` }}
    >
      {/* Number in top-right */}
      <span className="absolute top-1 right-2 text-[8px] text-grayscale-medium">
        #{pokemon.number.toString().padStart(3, '0')}
      </span>

      {/* Pokemon image - positioned to overlap the name bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[72px] h-[72px] z-10 flex items-center justify-center">
        {imgError ? (
          <PlaceholderImage className="w-full h-full" />
        ) : (
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Name bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-grayscale-background rounded-b-[7px] pt-6 pb-1 px-2">
        <p className="text-[10px] text-grayscale-dark text-center capitalize truncate leading-4">
          {pokemon.name}
        </p>
      </div>
    </div>
  );
};

const FADE_OUT_MS = 200;

const PokemonList: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [sortField, setSortField] = useState<SortField>('number');
  const [showSortModal, setShowSortModal] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch first page whenever debounced search or sort changes
  useEffect(() => {
    setPokemons([]);
    setOffset(0);
    setHasMore(true);
    fetchPokemons(0, debouncedSearch || undefined, sortField);
  }, [debouncedSearch, sortField]);

  const fetchPokemons = async (currentOffset: number, search?: string, sort?: SortField) => {
    try {
      if (currentOffset === 0) setLoading(true);
      else setLoadingMore(true);

      const data = await pokemonApi.getAll(currentOffset, PAGE_SIZE, search, sort);
      setPokemons((prev) => (currentOffset === 0 ? data.pokemons : [...prev, ...data.pokemons]));
      setHasMore(data.has_more);
      setOffset(currentOffset + PAGE_SIZE);
    } catch (err) {
      setError('Failed to load Pokemon. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // IntersectionObserver: trigger next page when sentinel comes into view
  const handleSentinel = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
      fetchPokemons(offset, debouncedSearch || undefined, sortField);
    }
  }, [hasMore, loadingMore, loading, offset, debouncedSearch, sortField]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleSentinel, {
      root: scrollContainerRef.current,
      rootMargin: '0px 0px 800px 0px',
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleSentinel]);

  const handleSortSelect = (field: SortField) => {
    setSortField(field);
    setShowSortModal(false);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-primary p-1 font-poppins">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-4 mb-2">
              <PokeballIcon className="w-6 h-6 text-white" />
              <h1 className="text-2xl font-bold text-white leading-8">Pokédex</h1>
            </div>
          </header>

          {/* List container with error */}
          <main className="flex-1 bg-grayscale-white rounded-lg shadow-inner-2dp mx-1 mb-1 p-3 pt-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-primary mb-4">{error}</p>
                <button
                  onClick={() => { setError(''); fetchPokemons(0, debouncedSearch || undefined); }}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full text-sm font-medium transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-1 font-poppins animate-page-fade-in">
      <div className="flex flex-col h-screen">
        {/* Header section */}
        <header className="px-3 pt-3 pb-2 flex-shrink-0">
          {/* Title row */}
          <div className="flex items-center gap-4 mb-2">
            <PokeballIcon className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold text-white leading-8">Pokédex</h1>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-4">
            {/* Search bar */}
            <div className="flex-1 flex items-center gap-2 bg-grayscale-white rounded-full shadow-inner-2dp px-3 py-2">
              <SearchIcon className="w-4 h-4 text-primary flex-shrink-0" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-[10px] text-grayscale-dark placeholder-grayscale-medium bg-transparent outline-none leading-4"
              />
            </div>

            {/* Sort button */}
            <button
              onClick={() => setShowSortModal(true)}
              className="w-8 h-8 flex items-center justify-center bg-grayscale-white rounded-full shadow-inner-2dp flex-shrink-0"
              title="Sort"
            >
              {sortField === 'number' ? (
                <TagIcon className="w-4 h-4 text-primary" />
              ) : (
                <TextSortIcon className="w-4 h-4 text-primary" />
              )}
            </button>
          </div>
        </header>

        {/* Pokemon list container */}
        <main className="flex-1 bg-grayscale-white rounded-lg shadow-inner-2dp mx-1 mb-1 overflow-hidden">
          <div ref={scrollContainerRef} className="h-full overflow-y-auto px-3 pt-6 pb-3">
            {loading && pokemons.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-grayscale-medium text-sm">Loading Pokemon...</p>
                </div>
              </div>
            ) : pokemons.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-grayscale-medium text-sm">No Pokemon found matching your search.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
                  {pokemons.map((pokemon, index) => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      index={index}
                      onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                    />
                  ))}
                </div>

                {/* Sentinel for infinite scroll trigger */}
                <div ref={sentinelRef} className="h-4" />

                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Sort modal */}
      {showSortModal && (
        <SortModal
          current={sortField}
          onSelect={handleSortSelect}
          onClose={() => setShowSortModal(false)}
        />
      )}
    </div>
  );
};

export default PokemonList;
