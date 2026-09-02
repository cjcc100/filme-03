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

  const backdropUrl = movieData.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
    : null

  const posterUrl = movieData.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    : null

  const title = movieData.title || movieData.original_title || 'Sem título'
  const year = movieData.release_date?.split('-')[0] || 'N/A'
  const rating = movieData.vote_average?.toFixed(1) || 'N/A'
  const runtime = movieData.runtime ? `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}m` : 'N/A'
  const genres = movieData.genres?.map(g => g.name).join(', ') || 'N/A'

  return (
    <>
      <Header />
      
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative h-[50vh] min-h-[400px]">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        </div>
      )}

      <div className="container py-12">
        <div className="movie-detail-grid">
          {/* Poster */}
          <div className="movie-detail-poster">
            {posterUrl ? (
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[2/3] bg-zinc-800 rounded-xl flex items-center justify-center">
                <span className="text-zinc-500">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="movie-detail-info">
            <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="text-zinc-300">
                <span className="text-zinc-500">Ano:</span> {year}
              </div>
              <div className="text-zinc-300">
                <span className="text-zinc-500">Avaliação:</span> {rating}/10
              </div>
              <div className="text-zinc-300">
                <span className="text-zinc-500">Duração:</span> {runtime}
              </div>
              <div className="text-zinc-300">
                <span className="text-zinc-500">Gêneros:</span> {genres}
              </div>
            </div>

            {movieData.tagline && (
              <p className="text-zinc-400 italic mb-6">"{movieData.tagline}"</p>
            )}

            <h2 className="text-xl font-semibold text-white mb-3">Sinopse</h2>
            <p className="text-zinc-300 leading-relaxed mb-8">
              {movieData.overview || 'Sinopse não disponível.'}
            </p>

            {streamtapeFileId && (
              <div className="bg-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Assistir Agora</h3>
                <p className="text-zinc-400 mb-4">
                  Este filme está disponível para streaming.
                </p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Reproduzir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}