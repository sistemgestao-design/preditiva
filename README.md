# Top World Premium - Inteligencia Preditiva

Dashboard de inteligencia artificial para apostas esportivas e loterias.

## Funcionalidades

- Painel VIP com Modo Escuro Premium
- Analise de odds e value bets por IA
- Comparacao de odds entre 10 casas brasileiras
- Otimizador Quantico de Loterias
- Feed de alertas em tempo real
- Deteccao de surebets e arbitragem

## Casas de Apostas

Superbet, Betano, Bet365, Stake, Sportingbet, KTO, Betfair, Pixbet, Estrela Bet, Novibet

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Lucide React Icons
- Vercel Serverless Functions (back-end `/api`)
- Vercel Postgres (histórico de jogos)

## Desenvolvimento

```bash
npm install
npm run dev
```

## Back-end / Dados em tempo real

O back-end roda como funções serverless na Vercel (pasta `/api`) e segue a
estratégia **live → cache → fallback**: se a API externa falhar ou não houver
chaves configuradas, a interface continua funcionando com dados de demonstração
(nunca quebra nem mostra valores zerados).

### Endpoints

| Endpoint            | Descrição                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `GET /api/matches`  | Lista de jogos (DB se fresco, senão API ao vivo, senão mock).    |
| `GET /api/live`     | Polling curto: placar/minuto/odds dos jogos ao vivo.            |
| `GET /api/odds`     | Comparação de odds (`?id=<matchId>` para um jogo específico).    |
| `GET /api/cron/refresh` | Cron job: busca jogos do dia, salva no DB e expira finalizados. |

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `API_FOOTBALL_KEY` — https://dashboard.api-sports.io/profile (grátis: 100 req/dia)
- `ODDS_API_KEY` — https://the-odds-api.com/#get-access (grátis: 500 req/mês)
- `POSTGRES_URL` — injetada pela Vercel ao criar o banco (Storage > Postgres)
- `CRON_SECRET` — segredo opcional para proteger o endpoint do cron

### Cron / atualização

`vercel.json` agenda o cron `/api/cron/refresh` 1x/dia (limite do plano Hobby).
A atualização intradiária acontece sob demanda: `/api/matches` revalida o cache
quando ele passa de 15 min, e o front faz short polling em `/api/live` a cada
30s enquanto houver jogo ao vivo.

> **Limites do plano grátis:** o "minuto a minuto" real depende do limite de
> requisições das APIs. No plano grátis priorizamos o cache + polling leve. Para
> tempo real de verdade, basta subir o plano da API-Football/The Odds API.
