# Instruções de Instalação e Teste

## 1. Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Se der erro de permissão do PowerShell, tente:

```bash
powershell -ExecutionPolicy Bypass -Command "npm install"
```

## 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
copy .env.example .env.local
```

As variáveis de ambiente incluem:
- `TMDB_API_KEY` - Chave da API do TMDb
- `TMDB_READ_ACCESS_TOKEN` - Token de acesso do TMDb
- `STREAMTAPE_LOGIN` - Login da API do Streamtape
- `STREAMTAPE_KEY` - Chave da API do Streamtape

## 3. Testar Localmente

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

O site estará disponível em: `http://localhost:3000`

## 4. Verificar Build

Para testar o build de produção:

```bash
npm run build
npm start
```

## Estrutura do Projeto

- `app/page.tsx` - Página principal com carrossel e listagem de filmes
- `app/layout.tsx` - Layout principal com header e navegação
- `components/HeroCarousel.tsx` - Componente de carrossel de filmes em destaque
- `app/api/tmdb/route.ts` - API route para consultas ao TMDb
- `app/api/streamtape/route.ts` - API route para buscar arquivos do Streamtape
- `lib/config.ts` - Configuração das APIs (TMDb e Streamtape)
- `.env.example` - Exemplo de variáveis de ambiente

## Funcionalidades Implementadas

✅ **Navegação** - Header com links para Início, Filmes e Séries
✅ **Carrossel Hero** - Destaque dos 5 primeiros filmes com slideshow automático
✅ **Integração TMDb** - Busca automática de informações dos filmes (poster, título, descrição)
✅ **Integração Streamtape** - Busca de arquivos disponíveis para streaming
✅ **Grid Responsivo** - Listagem de filmes em grid adaptável (2-5 colunas)
✅ **Mapeamento Manual** - Backup para filmes que falham na busca automática

## Próximos Passos

Após testar localmente e confirmar que está funcionando, podemos:
1. Adicionar página de detalhes do filme
2. Implementar player de vídeo com Bunny CDN
3. Adicionar páginas de Filmes e Séries separadas
4. Implementar busca de filmes
5. Adicionar sistema de favoritos/minha lista
