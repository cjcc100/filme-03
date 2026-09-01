# CJCCHUB - Plataforma de Streaming

Projeto de streaming de filmes utilizando Next.js 15, integrado com TMDb e Streamtape.

## 🚀 Tecnologias

- Next.js 15.1.6
- React 19
- TypeScript
- Tailwind CSS 4
- TMDb API
- Streamtape API

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/filmes-03.git
cd filmes-03
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse http://localhost:3000

## 🚀 Deploy na Vercel

### 1. Criar o repositório no GitHub
- Acesse https://github.com/new
- Nome do repositório: `filmes-03`
- Clique em "Create repository"
- Suba os arquivos do projeto local

### 2. Conectar na Vercel
- Acesse https://vercel.com/new
- Importe o repositório `filmes-03` do GitHub
- Configure as variáveis de ambiente (veja abaixo)
- Clique em "Deploy"

### 3. Configurar Variáveis de Ambiente na Vercel

No painel da Vercel, vá em Settings > Environment Variables e adicione:

```
TMDB_API_KEY=07c1396db17afadc024cbb5f0c3701c2
TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2MxMzk2ZGIxN2FmYWRjMDI0Y2JiNWYwYzM3MDFjMiIsIm5iZiI6MTc4NjEyNDk5Ni40MDIsInN1YiI6IjZhNzYxYWM0ZjYyNmIzMWI1YTQxZjk4ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.M3CJ1j7zAQD24Nebt5_PddqLAHQwlhvyZvm2EU1dd40
STREAMTAPE_LOGIN=4db68bae5deec46b3a4b
STREAMTAPE_KEY=a7azDDb68ACx8dP
BUNNY_VIDEO_LIBRARY_ID=722927
BUNNY_CDN_HOSTNAME=vz-c3b5c7e8-b89.b-cdn.net
BUNNY_API_KEY=1b6e3939-400b-40eb-98d3945f90fe-85f3-4570
BUNNY_READ_ONLY_API_KEY=079f4583-e0ea-47dd-bfbeed8904de-2671-47af
NEXT_PUBLIC_BASE_URL=https://seu-projeto.vercel.app
```

**Importante:** Substitua `https://seu-projeto.vercel.app` pela URL real do seu projeto na Vercel.

### 4. Redeploy
Após configurar as variáveis, vá em Deployments e clique em "Redeploy"

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## 🎯 Funcionalidades

- Catálogo de filmes com capas do TMDb
- Player de vídeo integrado
- Busca automática de metadados
- Design responsivo
- Cache otimizado

## 👨‍💻 Autor

- **CJCCHUB** - juniorclaudinei350@gmail.com

## 📄 Licença

Este projeto é para uso educacional.
