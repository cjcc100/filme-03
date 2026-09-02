import Image from 'next/image'

async function getPopularMovies() {
  try {
    const res = await fetch('https://api.themoviedb.org/3/movie/popular?api_key=07c1396db17afadc024cbb5f0c3701c2&language=pt-BR&page=1', {
      next: { revalidate: 3600 } // Cache de 1 hora
    })
    
    if (!res.ok) return []
    
    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching movies:', error)
    return []
  }
}

export default async function Home() {
  const movies = await getPopularMovies()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon">C</div>
            <span className="logo-text">CJCCHUB</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Filmes Populares</h1>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie: any) => (
              <div 
                key={movie.id}
                className="bg-zinc-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="relative aspect-[2/3]">
                  {movie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                      <span className="text-zinc-500 text-sm">Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-2 py-1 rounded">
                    {movie.vote_average?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                    {movie.title}
                  </h3>
                  <p className="text-zinc-400 text-xs">
                    {movie.release_date?.split('-')[0] || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">© 2024 CJCCHUB. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
