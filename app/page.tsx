import Image from 'next/image'
import HeroCarousel from '../components/HeroCarousel'
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

async function searchTMDBMovie(query: string) {
  try {
    const tmdbApiKey = config.tmdb.apiKey
    
    // Função de limpeza de nome
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
    
    // Verificar mapeamento manual primeiro
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
    
    // Busca automática
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

async function getStreamtapeFiles() {
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
    
    return data.result
  } catch (error) {
    console.error('Error fetching Streamtape files:', error)
    return null
  }
}

export default async function Home() {
  const streamtapeData = await getStreamtapeFiles()
  
  // Usar arquivos do Streamtape
  const files = streamtapeData?.files || []
    
  // Enriquecer arquivos com dados TMDb
  const enrichedFiles = await Promise.all(
    files.map(async (file: any) => {
      const fileName = file.name || ''
      const tmdbData = fileName ? await searchTMDBMovie(fileName) : null
      
      return {
        ...file,
        tmdbData,
        title: tmdbData?.title || tmdbData?.name || file.name || 'Sem título',
        description: tmdbData?.overview || 'Sem descrição',
        linkid: file.linkid
      }
    })
  )
  
  const movies = enrichedFiles
  const featuredMovies = movies.slice(0, 5)

  return (
    <>
      <HeroCarousel movies={featuredMovies} />

      <section className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Filmes Disponíveis</h1>
        
        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">Nenhum filme disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie: any) => {
              const tmdbData = movie.tmdbData
              
              const imageUrl = tmdbData?.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                : tmdbData?.backdrop_path
                ? `https://image.tmdb.org/t/p/w500${tmdbData.backdrop_path}`
                : null
              
              const title = tmdbData?.title || tmdbData?.name || movie.title || movie.name || 'Sem título'
              const year = tmdbData?.release_date?.split('-')[0] || tmdbData?.first_air_date?.split('-')[0] || 'N/A'
              const rating = tmdbData?.vote_average?.toFixed(1) || 'N/A'

              return (
                <div 
                  key={movie.linkid || movie.id}
                  className="bg-zinc-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  <div className="relative aspect-[2/3]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                        <span className="text-zinc-500 text-sm">Sem imagem</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-2 py-1 rounded">
                      {rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                      {title}
                    </h3>
                    <p className="text-zinc-400 text-xs">{year}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
