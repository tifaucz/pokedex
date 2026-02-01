import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pokemonApi } from '../api/pokemon';
import type { PokemonDetail as PokemonDetailType } from '../types';
import PokeballIcon from '../components/PokeballIcon';

// Type color mapping
const typeColors: Record<string, string> = {
  normal: '#AAA67F',
  fighting: '#C12239',
  flying: '#A891EC',
  poison: '#A43E9E',
  ground: '#DEC16B',
  rock: '#B69E31',
  bug: '#A7B723',
  ghost: '#70559B',
  steel: '#B7B9D0',
  fire: '#F57D31',
  water: '#6493EB',
  grass: '#74CB48',
  electric: '#F9CF30',
  psychic: '#FB5584',
  ice: '#9AD6DF',
  dragon: '#7037FF',
  dark: '#75574C',
  fairy: '#E69EAC',
  stellar: '#7CC7B2',
  unknown: '#68A090',
};

// Back Arrow Icon
const BackArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    <path d="M26.6667 14.6667H9.21874L16.9467 6.93869L14.6667 4.66669L2.66669 16.6667L14.6667 28.6667L16.9467 26.3947L9.21874 18.6667H26.6667V14.6667Z" />
  </svg>
);

// Chevron Left Icon
const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

// Chevron Right Icon
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

// Weight Icon
const WeightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M4.79999 4.79999C4.79999 3.47451 5.87451 2.39999 7.19999 2.39999H8.79999C10.1255 2.39999 11.2 3.47451 11.2 4.79999H12.8C12.8 2.59085 11.0091 0.799988 8.79999 0.799988H7.19999C4.99085 0.799988 3.19999 2.59085 3.19999 4.79999H4.79999ZM14.4 6.39999H1.59999L2.39999 15.2H13.6L14.4 6.39999Z" />
  </svg>
);

// Height Icon (ruler)
const HeightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M3.2 0.799988V15.2H6.4V13.6H4.8V12H6.4V10.4H4.8V8.79999H6.4V7.19999H4.8V5.59999H6.4V3.99999H4.8V2.39999H6.4V0.799988H3.2ZM8 0.799988V15.2H12.8V0.799988H8Z" />
  </svg>
);

// Pokeball watermark wrapper
const PokeballWatermark: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className} style={{ opacity: 0.1 }}>
    <PokeballIcon className="w-full h-full" />
  </div>
);

// Type Chip component
const TypeChip: React.FC<{ type: string }> = ({ type }) => {
  const bgColor = typeColors[type] || typeColors.unknown;
  return (
    <span
      className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold text-white capitalize leading-4"
      style={{ backgroundColor: bgColor }}
    >
      {type}
    </span>
  );
};

// Stat Bar component
const StatBar: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => {
  const maxStat = 255;
  const percentage = Math.min((value / maxStat) * 100, 100);

  return (
    <div className="flex items-center gap-2 h-4">
      <span
        className="w-[27px] text-[10px] font-bold text-right leading-4"
        style={{ color }}
      >
        {label}
      </span>
      <div className="w-px h-4 bg-grayscale-light" />
      <span className="w-[19px] text-[10px] text-grayscale-dark leading-4">
        {value.toString().padStart(3, '0')}
      </span>
      <div className="flex-1 h-1 rounded-full relative" style={{ backgroundColor: `${color}33` }}>
        <div
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const FADE_OUT_MS = 200;

type FadeState = 'idle' | 'in' | 'out';

const PokemonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fadeState, setFadeState] = useState<FadeState>('idle');
  const navigate = useNavigate();

  const currentId = id ? parseInt(id) : 1;

  // Trigger fade-in once data is loaded
  useEffect(() => {
    if (!loading && pokemon) setFadeState('in');
  }, [loading, pokemon]);

  // Reset to idle when navigating between pokemon (id changes)
  useEffect(() => {
    setFadeState('idle');
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPokemon(parseInt(id));
    }
  }, [id]);

  const navigateWithFadeOut = (path: string) => {
    setFadeState('out');
    setTimeout(() => navigate(path), FADE_OUT_MS);
  };

  const fetchPokemon = async (pokemonId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await pokemonApi.getById(pokemonId);
      setPokemon(data);
    } catch (err) {
      setError('Failed to load Pokemon details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevPokemon = () => {
    if (currentId > 1) {
      navigateWithFadeOut(`/pokemon/${currentId - 1}`);
    }
  };

  const goToNextPokemon = () => {
    navigateWithFadeOut(`/pokemon/${currentId + 1}`);
  };

  const primaryType = pokemon?.types?.[0] || 'normal';
  const typeColor = typeColors[primaryType] || typeColors.normal;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-grayscale-background flex items-center justify-center font-poppins">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-grayscale-medium text-sm">Loading Pokemon...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !pokemon) {
    return (
      <div className="min-h-screen bg-grayscale-background flex items-center justify-center font-poppins">
        <div className="text-center">
          <p className="text-primary mb-4">{error || 'Pokemon not found'}</p>
          <button
            onClick={() => navigateWithFadeOut('/')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full text-sm font-medium transition"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-1 font-poppins relative ${fadeState === 'in' ? 'animate-page-fade-in' : fadeState === 'out' ? 'animate-page-fade-out' : ''}`}
      style={{ backgroundColor: typeColor }}
    >
      {/* Pokeball watermark - top right */}
      <PokeballWatermark className="absolute w-[208px] h-[208px] top-2 right-2 text-white pointer-events-none" />

      <div className="flex flex-col h-screen max-w-[360px] mx-auto">
        {/* Header */}
        <header className="flex items-center px-5 pt-5 pb-6 gap-2 relative z-10">
          <button
            onClick={() => navigateWithFadeOut('/')}
            className="w-8 h-8 flex items-center justify-center text-white"
          >
            <BackArrowIcon className="w-8 h-8" />
          </button>
          <h1 className="flex-1 text-2xl font-bold text-white capitalize leading-8">
            {pokemon.name}
          </h1>
          <span className="text-xs font-bold text-white leading-4">
            #{pokemon.number.toString().padStart(3, '0')}
          </span>
        </header>

        {/* Image area with navigation */}
        <div className="relative flex items-end justify-between px-5 pb-4 flex-shrink-0 z-10" style={{ height: '144px' }}>
          {/* Left chevron */}
          <button
            onClick={goToPrevPokemon}
            disabled={currentId <= 1}
            className={`w-6 h-6 flex items-center justify-center text-white ${currentId <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          {/* Pokemon image - positioned to overlap the card */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-60px] w-[200px] h-[200px] z-20 flex items-center justify-center">
            {pokemon.image ? (
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full ${pokemon.image ? 'hidden' : ''}`} style={{ opacity: 0.5 }}>
              <PokeballIcon className="w-full h-full text-white" />
            </div>
          </div>

          {/* Right chevron */}
          <button
            onClick={goToNextPokemon}
            className="w-6 h-6 flex items-center justify-center text-white"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>

        {/* White card with details */}
        <main className="flex-1 bg-grayscale-white rounded-lg shadow-inner-2dp mx-1 mb-1 overflow-hidden z-0">
          <div className="h-full overflow-y-auto px-5 pt-14 pb-5">
            {/* Type chips */}
            <div className="flex justify-center gap-4 mb-4">
              {pokemon.types.map((type) => (
                <TypeChip key={type} type={type} />
              ))}
            </div>

            {/* About section */}
            <h2
              className="text-sm font-bold text-center mb-4 leading-4"
              style={{ color: typeColor }}
            >
              About
            </h2>

            {/* Attributes row */}
            <div className="flex items-start mb-4">
              {/* Weight */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center justify-center gap-2 h-8">
                  <WeightIcon className="w-4 h-4 text-grayscale-dark" />
                  <span className="text-[10px] text-grayscale-dark leading-4">
                    {pokemon.weight.toFixed(1)} kg
                  </span>
                </div>
                <span className="text-[8px] text-grayscale-medium leading-3">Weight</span>
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-grayscale-light" />

              {/* Height */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center justify-center gap-2 h-8">
                  <HeightIcon className="w-4 h-4 text-grayscale-dark" />
                  <span className="text-[10px] text-grayscale-dark leading-4">
                    {pokemon.height.toFixed(1)} m
                  </span>
                </div>
                <span className="text-[8px] text-grayscale-medium leading-3">Height</span>
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-grayscale-light" />

              {/* Moves/Abilities */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center justify-center h-8">
                  <span className="text-[10px] text-grayscale-dark leading-4 text-center">
                    {pokemon.abilities.slice(0, 2).map((ability) => (
                      <span key={ability} className="capitalize block">
                        {ability.replace('-', ' ')}
                      </span>
                    ))}
                  </span>
                </div>
                <span className="text-[8px] text-grayscale-medium leading-3">Moves</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-[10px] text-grayscale-dark leading-4 text-justify mb-4">
              {pokemon.description || 'No description available.'}
            </p>

            {/* Base Stats section */}
            <h2
              className="text-sm font-bold text-center mb-4 leading-4"
              style={{ color: typeColor }}
            >
              Base Stats
            </h2>

            {/* Stats */}
            <div className="space-y-1">
              <StatBar label="HP" value={pokemon.stats.hp} color={typeColor} />
              <StatBar label="ATK" value={pokemon.stats.atk} color={typeColor} />
              <StatBar label="DEF" value={pokemon.stats.def} color={typeColor} />
              <StatBar label="SATK" value={pokemon.stats.satk} color={typeColor} />
              <StatBar label="SDEF" value={pokemon.stats.sdef} color={typeColor} />
              <StatBar label="SPD" value={pokemon.stats.spd} color={typeColor} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PokemonDetail;
