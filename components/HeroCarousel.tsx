'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Movie {
  id?: number;
  guid?: string;
  title?: string;
  name?: string;
  originalFilename?: string;
  overview?: string;
  description?: string;
  backdrop_path?: string;
  poster_path?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  posterUrl?: string;
  tmdbData?: {
    id?: number;
    title?: string;
    name?: string;
    overview?: string;
    backdrop_path?: string;
    poster_path?: string;
  };
}

interface HeroCarouselProps {
  movies: Movie[];
}

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  const currentMovie = movies[currentIndex];
  const tmdbData = currentMovie?.tmdbData;
  
  // Prioridade: TMDb backdrop -> TMDb poster -> Cor sólida se não tiver
  const imageUrl = tmdbData?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`
    : tmdbData?.poster_path
    ? `https://image.tmdb.org/t/p/original${tmdbData.poster_path}`
    : null;

  const title = tmdbData?.title || tmdbData?.name || currentMovie?.title || currentMovie?.name || currentMovie?.originalFilename || 'Sem título';
  const overview = tmdbData?.overview || currentMovie?.description || currentMovie?.overview || 'Filme disponível para assistir';

  return (
    <section className="hero-carousel">
      <div className="hero-carousel-overlay" />
      
      {/* Carousel Slides */}
      <div className="hero-carousel-slides">
        {movies.map((movie, index) => {
          const isActive = index === currentIndex;
          const movieTmdbData = movie.tmdbData;
          
          const movieImageUrl = movieTmdbData?.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movieTmdbData.backdrop_path}`
            : movieTmdbData?.poster_path
            ? `https://image.tmdb.org/t/p/original${movieTmdbData.poster_path}`
            : null;

          return (
            <div
              key={movie.guid || movie.id}
              className={`hero-carousel-slide ${isActive ? 'active' : ''}`}
            >
              {movieImageUrl ? (
                <Image
                  src={movieImageUrl}
                  alt={movieTmdbData?.title || movieTmdbData?.name || movie.title || movie.name || movie.originalFilename || 'Filme'}
                  fill
                  className="hero-carousel-image"
                  priority={isActive}
                />
              ) : (
                <div className="hero-carousel-placeholder" />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="hero-carousel-nav-btn hero-carousel-nav-btn-prev"
      >
        <svg className="hero-carousel-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="hero-carousel-nav-btn hero-carousel-nav-btn-next"
      >
        <svg className="hero-carousel-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="hero-carousel-dots">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`hero-carousel-dot ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Movie Info */}
      <div className="hero-carousel-info">
        <div className="hero-carousel-info-content">
          <span className="hero-carousel-badge">Destaque</span>
          <h1 className="hero-carousel-title">{title}</h1>
          <p className="hero-carousel-description">{overview}</p>
          <div className="hero-carousel-buttons">
            {tmdbData?.id ? (
              <Link 
                href={`/movie/${tmdbData.id}`}
                className="hero-carousel-btn hero-carousel-btn-primary"
              >
                <svg className="hero-carousel-btn-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Assistir
              </Link>
            ) : currentMovie?.linkid ? (
              <Link 
                href={`/movie/${currentMovie.linkid}`}
                className="hero-carousel-btn hero-carousel-btn-primary"
              >
                <svg className="hero-carousel-btn-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Assistir
              </Link>
            ) : (
              <button className="hero-carousel-btn hero-carousel-btn-primary">
                <svg className="hero-carousel-btn-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Assistir
              </button>
            )}
            <button className="hero-carousel-btn hero-carousel-btn-secondary">
              <svg className="hero-carousel-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Minha Lista
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
