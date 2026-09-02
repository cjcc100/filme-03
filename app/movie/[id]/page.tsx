import Image from 'next/image'
import Link from 'next/link'
import Header from '../../../components/Header'
import { config } from '@/lib/config'

// Mapeamento manual para filmes que dão problema na busca automática
const MANUAL_MAPPING: Record<string, number> = {
  'gigantes de aço': 39254,
  'gigantes de aco': 39254,
  'quarteto fantastico': 617126,
  'quarteto fantastico primeiros passos': 617126,
  'a ultima casa': 1284041,
  'ultima casa': 1284041,
  'avenida brasil': 45815,
}

interface MovieData {
  id: number;
  title?: string;
  original_title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  vote_average: number;
  vote_count: number;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  runtime?: number;
  tagline?: string;
  budget?: number;
  revenue?: number;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string;
  }>;
  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages?: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
}

async function getMovieData(movieId: string): Promise<MovieData | null> {
  try {
    const tmdbApiKey = config.tmdb.apiKey
    
    const res = await fetch(`${config.tmdb.baseUrl}/movie/${movieId}?api_key=${tmdbApiKey}&language=pt-BR`, {
      next: { revalidate: 3600 }
    })
    
    if (!res.ok) {
      console.error('TMDb API error:', res.status)
      return null
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching movie data:', error)
    return null
  }
}

async function searchTMDBMovie(query: string): Promise<any | null> {
  try {
    const tmdbApiKey = config.tmdb.apiKey
    
    function cleanFileName(filename: string): string {
      return filename
        .split('.')[0]
        .replace(/\d{4}/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/[._-]/g, ' ')
        .replace(/\s+/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
    }
    
    const variations = [
      query.toLowerCase(),
      query.toLowerCase().replace(/\.[^/.]+$/, ''),
      query.toLowerCase().replace(/\d{4}/g, ''),
      query.toLowerCase().replace(/[._-]/g, ' '),
    ]
    
    for (const variation of variations) {
      const trimmed = variation.trim()
      if (MANUAL_MAPPING[trimmed]) {
        const tmdbId = MANUAL_MAPPING[trimmed]
        const movieRes = await fetch(`${config.tmdb.baseUrl}/movie/${tmdbId}?api_key=${tmdbApiKey}&language=pt-BR`, {
          next: { revalidate: 3600 }
        })
        
        if (movieRes.ok) {
          return await movieRes.json()
        }
      }
    }
    
    let cleanQuery = cleanFileName(query)
    
    if (cleanQuery.length < 3) return null
    
    const searchRes = await fetch(`${config.tmdb.baseUrl}/search/movie?api_key=${tmdbApiKey}&language=pt-BR&query=${encodeURIComponent(cleanQuery)}`, {
      next: { revalidate: 600 }
    })
    
    if (searchRes.ok) {
      const searchData = await searchRes.json()
      if (searchData.results && searchData.results.length > 0) {
        return searchData.results[0]
      }
    }
    
    return null
  } catch (error) {
    console.error('Error searching TMDb:', error)
    return null
  }
}

async function getStreamtapeFileId(movieTitle: string): Promise<string | null> {
  try {
    const streamtapeLogin = config.streamtape.login
    const streamtapeKey = config.streamtape.key
    
    const res = await fetch(`${config.streamtape.apiUrl}/file/listfolder?login=${streamtapeLogin}&key=${streamtapeKey}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    })
    
    if (!res.ok) return null
    
    const data = await res.json()
    
    if (data.status !== 200 || !data.result?.files) return null
    
    function normalizeText(text: string): string {
      return text
        .toLowerCase()
        .replace(/[._-]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\d{4}/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?\)/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
    }
    
    const normalizedTitle = normalizeText(movieTitle)
    const titleWords = normalizedTitle.split(' ').filter(w => w.length > 2)
    
    let bestMatch: any = null
    let bestMatchScore = 0
    
    for (const file of data.result.files) {
      const fileName = file.name || ''
      const normalizedFileName = normalizeText(fileName)
      
      if (normalizedFileName === normalizedTitle) {
        return file.linkid
      }
      
      const fileWords = normalizedFileName.split(' ').filter(w => w.length > 2)
      let matchScore = 0
      
      for (const titleWord of titleWords) {
        if (fileWords.some(fw => fw.includes(titleWord) || titleWord.includes(fw))) {
          matchScore++
        }
      }
      
      if (normalizedFileName.includes(normalizedTitle) || normalizedTitle.includes(normalizedFileName)) {
        matchScore += 2
      }
      
      if (matchScore > bestMatchScore) {
        bestMatch = file
        bestMatchScore = matchScore
      }
    }
    
    if (bestMatch && bestMatchScore >= 2) {
      return bestMatch.linkid
    }
    
    return null
  } catch (error) {
    console.error('Error fetching Streamtape file ID:', error)
    return null
  }
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movieId = id
  
  const isTmdbId = /^\d+$/.test(movieId)
  
  let movieData: MovieData | null = null
  let streamtapeFileId: string | null = null
  
  if (isTmdbId) {
    movieData = await getMovieData(movieId)
    
    if (movieData) {
      const movieTitle = movieData.title || movieData.original_title || ''
      streamtapeFileId = await getStreamtapeFileId(movieTitle)
    }
  } else {
    // Se for file ID do Streamtape, tentar buscar dados do TMDb
    const streamtapeLogin = config.streamtape.login
    const streamtapeKey = config.streamtape.key
    
    const res = await fetch(`${config.streamtape.apiUrl}/file/info?login=${streamtapeLogin}&key=${streamtapeKey}&file=${movieId}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    })
    
    if (res.ok) {
      const data = await res.json()
      const fileData = data.result?.[movieId]
      
      if (fileData) {
        const fileName = fileData.name || ''
        const tmdbData = await searchTMDBMovie(fileName)
        if (tmdbData) {
          movieData = await getMovieData(tmdbData.id.toString())
        }
      }
    }
    
    streamtapeFileId = movieId
  }
  
  if (!movieData) {
    return (
      <>
        <Header />
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl text-white mb-4">Filme não encontrado</h1>
            <p className="text-zinc-400 mb-4">ID do filme: {movieId}</p>
            <Link href="/" className="text-red-500 hover:text-red-400 transition-colors">
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </>
    )
  }

  const title = movieData.title || movieData.original_title || 'Sem título'
  const year = movieData.release_date?.split('-')[0] || 'N/A'
  const rating = movieData.vote_average?.toFixed(1) || 'N/A'
  const duration = movieData.runtime ? `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}m` : 'N/A'
  const genres = movieData.genres?.map(g => g.name).join(', ') || 'N/A'
  const voteCount = movieData.vote_count?.toLocaleString() || '0'
  
  const backdropUrl = movieData.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
    : null
    
  const posterUrl = movieData.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    : null

  const budget = movieData.budget ? `$${movieData.budget.toLocaleString()}` : null
  const revenue = movieData.revenue ? `$${movieData.revenue.toLocaleString()}` : null

  return (
    <>
      <Header />
      
      <main className="flex-1">
        {/* Header do Filme - Netflix Style */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/30 to-transparent z-10" />
          
          {backdropUrl ? (
            <Image
              src={backdropUrl}
              alt={title}
              fill
              className="object-cover object-center"
              priority
            />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
          
          <div className="absolute bottom-0 left-0 right-0 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex gap-8 items-end">
              {posterUrl && (
                <div className="hidden md:block w-48 h-72 rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-800">
                  <Image
                    src={posterUrl}
                    alt={title}
                    width={192}
                    height={288}
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  {title}
                </h1>
                
                {movieData.tagline && (
                  <p className="text-zinc-400 text-base mb-4 italic">
                    {movieData.tagline}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold text-base">{rating}</span>
                    <span className="text-zinc-400">Avaliação</span>
                  </div>
                  
                  <span className="text-zinc-400">•</span>
                  
                  <span className="text-zinc-300">{year}</span>
                  
                  {duration !== 'N/A' && (
                    <>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-300">{duration}</span>
                    </>
                  )}
                  
                  <span className="text-zinc-400">•</span>
                  
                  <span className="text-zinc-300">{genres}</span>
                </div>
                
                <div className="flex gap-3">
                  {streamtapeFileId ? (
                    <button className="bg-orange-500 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Assistir
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="bg-zinc-600 text-zinc-400 px-6 py-2 rounded font-semibold text-sm cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Indisponível
                    </button>
                  )}
                  
                  <button className="bg-zinc-600/80 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-zinc-600 transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </svg>
                    Minha Lista
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sinopse */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Sinopse</h2>
          <p className="text-zinc-300 text-base leading-relaxed mb-8">
            {movieData.overview || 'Sinopse não disponível.'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <h3 className="text-zinc-400 text-xs mb-1">Avaliação</h3>
              <p className="text-white font-semibold">{rating} / 10</p>
              <p className="text-zinc-400 text-xs">{voteCount} votos</p>
            </div>
            
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <h3 className="text-zinc-400 text-xs mb-1">Duração</h3>
              <p className="text-white font-semibold">{duration}</p>
            </div>
            
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <h3 className="text-zinc-400 text-xs mb-1">Gêneros</h3>
              <p className="text-white font-semibold">{genres}</p>
            </div>
            
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <h3 className="text-zinc-400 text-xs mb-1">Lançamento</h3>
              <p className="text-white font-semibold">{year}</p>
            </div>
            
            {budget && (
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h3 className="text-zinc-400 text-xs mb-1">Orçamento</h3>
                <p className="text-white font-semibold">{budget}</p>
              </div>
            )}
            
            {revenue && (
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <h3 className="text-zinc-400 text-xs mb-1">Receita</h3>
                <p className="text-white font-semibold">{revenue}</p>
              </div>
            )}
          </div>
        </section>

        {/* Empresas de Produção */}
        {movieData.production_companies && movieData.production_companies.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-white mb-6">Empresas de Produção</h2>
            <div className="flex flex-wrap gap-4">
              {movieData.production_companies.map((company) => (
                <div key={company.id} className="bg-zinc-800/50 rounded-lg p-4 flex items-center gap-4">
                  {company.logo_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                      alt={company.name}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  )}
                  <span className="text-white font-medium">{company.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Países de Produção */}
        {movieData.production_countries && movieData.production_countries.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-white mb-6">Países de Produção</h2>
            <div className="flex flex-wrap gap-2">
              {movieData.production_countries.map((country, index) => (
                <span key={index} className="bg-zinc-800/50 text-zinc-300 px-3 py-1 rounded-full text-sm">
                  {country.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Idiomas */}
        {movieData.spoken_languages && movieData.spoken_languages.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-white mb-6">Idiomas</h2>
            <div className="flex flex-wrap gap-2">
              {movieData.spoken_languages.map((lang, index) => (
                <span key={index} className="bg-zinc-800/50 text-zinc-300 px-3 py-1 rounded-full text-sm">
                  {lang.english_name}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}