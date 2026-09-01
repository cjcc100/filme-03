import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || 'trending/movie/day';
  const page = searchParams.get('page') || '1';

  const tmdbApiKey = process.env.TMDB_API_KEY || '07c1396db17afadc024cbb5f0c3701c2';

  try {
    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    url.searchParams.append('api_key', tmdbApiKey);
    url.searchParams.append('language', 'pt-BR');

    if (page) {
      url.searchParams.append('page', page);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from TMDb:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from TMDb' },
      { status: 500 }
    );
  }
}
