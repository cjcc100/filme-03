import Image from 'next/image'
import Header from '../../components/Header'
import { config } from '@/lib/config'

async function getStreamtapeFolders() {
  try {
    const streamtapeLogin = config.streamtape.login
    const streamtapeKey = config.streamtape.key
    
    const res = await fetch(`${config.streamtape.apiUrl}/file/listfolder?login=${streamtapeLogin}&key=${streamtapeKey}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 1800 }
    })
    
    if (!res.ok) return null
    
    const data = await res.json()
    if (data.status !== 200 || !data.result?.folders) return null
    
    return data.result
  } catch (error) {
    return null
  }
}

async function getTMDBSeriesData(seriesId: string, seasonNumber: string) {
  try {
    const tmdbApiKey = config.tmdb.apiKey
    
    const seriesRes = await fetch(`${config.tmdb.baseUrl}/tv/${seriesId}?api_key=${tmdbApiKey}&language=pt-BR`, {
      next: { revalidate: 3600 }
    })
    
    const seasonRes = await fetch(`${config.tmdb.baseUrl}/tv/${seriesId}/season/${seasonNumber}?api_key=${tmdbApiKey}&language=pt-BR`, {
      next: { revalidate: 3600 }
    })
    
    if (!seriesRes.ok || !seasonRes.ok) return null
    
    const seriesData = await seriesRes.json()
    const seasonData = await seasonRes.json()
    
    return { series: seriesData, season: seasonData }
  } catch (error) {
    return null
  }
}

async function searchTMDBSeries(folderName: string) {
  try {
    const tmdbApiKey = config.tmdb.apiKey
    
    // Função para limpar o nome da pasta
    function cleanFolderName(name: string): string {
      return name
        .replace(/\d{4}/g, '') // Remover anos (2026, etc)
        .replace(/Temporada \d+/gi, '') // Remover "Temporada X"
        .replace(/:.*$/, '') // Remover tudo após dois pontos
        .replace(/\s+/g, ' ') // Remover espaços extras
        .trim()
    }
    
    const cleanName = cleanFolderName(folderName)
    
    const searchRes = await fetch(`${config.tmdb.baseUrl}/search/tv?api_key=${tmdbApiKey}&language=pt-BR&query=${encodeURIComponent(cleanName)}`, {
      next: { revalidate: 600 }
    })
    
    if (searchRes.ok) {
      const searchData = await searchRes.json()
      if (searchData.results && searchData.results.length > 0) {
        const firstResult = searchData.results[0]
        
        // Buscar dados completos da série e primeira temporada
        const seriesData = await getTMDBSeriesData(firstResult.id.toString(), '1')
        return seriesData
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

export default async function SeriesPage() {
  const streamtapeData = await getStreamtapeFolders()
  
  // Mapeamento de pastas Streamtape para IDs TMDb
  const folderMappings: Record<string, { seriesId: string; seasonNumber: string }> = {
    'Je_MCGJs5lQ': { seriesId: '4604', seasonNumber: '1' }, // Smallville Temporada 1
    'WAP4-waQ7H8': { seriesId: '45815', seasonNumber: '1' }, // Avenida Brasil Temporada 1
    'R2StpPkKoWs': { seriesId: '331061', seasonNumber: '1' }, // Voepass 2283: A Queda Temporada 1
    'HdsqTHs6H40': { seriesId: '82452', seasonNumber: '2' } // Avatar: O Último Mestre do Ar Temporada 2
  }
  
  // Enriquecer pastas com dados TMDb
  const enrichedFolders = await Promise.all(
    (streamtapeData?.folders?.slice(0, 8) || []).map(async (folder: any) => {
      // Ignorar pastas de sistema
      if (folder.name === 'Subtitles' || folder.name === 'Thumbnails') {
        return null
      }
      
      const mapping = folderMappings[folder.id]
      let tmdbData = null
      
      if (mapping) {
        // Usar mapeamento manual se existir
        tmdbData = await getTMDBSeriesData(mapping.seriesId, mapping.seasonNumber)
      } else {
        // Tentar busca automática pelo nome da pasta
        tmdbData = await searchTMDBSeries(folder.name)
      }
      
      return {
        ...folder,
        tmdbData
      }
    })
  )
  
  // Filtrar pastas nulas (sistema)
  const validFolders = enrichedFolders.filter(f => f !== null)
  
  const series = validFolders

  return (
    <>
      <Header />
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Séries</h1>
        
        {series.length === 0 ? (
          <div className="bg-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-300 text-lg">
              Nenhuma série disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {series.map((folder: any) => {
              const tmdbData = folder.tmdbData
              const seriesData = tmdbData?.series
              
              const imageUrl = seriesData?.poster_path
                ? `https://image.tmdb.org/t/p/w500${seriesData.poster_path}`
                : seriesData?.backdrop_path
                ? `https://image.tmdb.org/t/p/w500${seriesData.backdrop_path}`
                : null
              
              const title = seriesData?.name || folder.name || 'Sem título'
              const year = seriesData?.first_air_date?.split('-')[0] || 'N/A'
              const rating = seriesData?.vote_average?.toFixed(1) || 'N/A'

              return (
                <div
                  key={folder.id}
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
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      Série
                    </div>
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
      </div>
    </>
  )
}