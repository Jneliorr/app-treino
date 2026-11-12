# Acompanhamento de treinos

Aplicativo para organizar fichas por semana, registrar séries, cargas e repetições e consultar o histórico de cada atleta. O cronômetro e o rascunho permitem retomar uma sessão depois de voltar à lista de semanas ou recarregar a página.

## Rodar localmente

Instale o Node.js 22 ou mais recente e execute:

```sh
npm install
npm run dev
```

Abra `http://localhost:3000`. O aplicativo não exige chave de API nem configuração do Firebase. A tela de arquitetura do Firestore apresenta uma proposta de integração.

Os dados ficam no armazenamento local do navegador. Em **Fichas → Backup**, baixe ou restaure as semanas e os treinos concluídos do perfil ativo em JSON. A restauração mantém os registros existentes e ignora sessões já importadas.

## Verificações

```sh
npm run lint
npm test
npm run build
```
