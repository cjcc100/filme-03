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

- `app/page.tsx` - Página principal com listagem de filmes do TMDb
- `app/api/tmdb/route.ts` - API route para consultas ao TMDb
- `lib/config.ts` - Configuração das APIs (TMDb)
- `.env.example` - Exemplo de variáveis de ambiente

## Próximos Passos

Após testar localmente e confirmar que está funcionando, podemos:
1. Adicionar página de detalhes do filme
2. Integrar com Streamtape para streaming
3. Adicionar Bunny CDN para vídeos
4. Implementar busca de filmes
