import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const streamtapeLogin = config.streamtape.login;
    const streamtapeKey = config.streamtape.key;
    
    const url = `${config.streamtape.apiUrl}/file/listfolder?login=${streamtapeLogin}&key=${streamtapeKey}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 } // Cache de 5 minutos
    });

    if (!response.ok) {
      throw new Error(`Streamtape API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 200 || !data.result?.files) {
      return NextResponse.json(
        { error: 'No files found or invalid response' },
        { status: 404 }
      );
    }

    return NextResponse.json(data.result);
  } catch (error) {
    console.error('Error fetching from Streamtape:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Streamtape' },
      { status: 500 }
    );
  }
}
