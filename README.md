# Friends

Página única com um clipe em tela cheia e, ao rolar, os cards dos membros do
servidor: foto, apelido, @ e os selos que cada um carrega. Os dados não ficam
escritos no código — são puxados da API do Discord a cada minuto, então trocar
o avatar ou o apelido lá já reflete aqui.

Quem aparece no site é decidido de dentro do próprio Discord, pelo comando
`/addpessoa`, restrito a administradores.

## Como funciona

O site não lê o servidor inteiro. Ele mantém uma lista de IDs liberados e
consulta um por um:

```
/addpessoa (no Discord)
  -> POST /api/discord/interactions   valida a assinatura e grava o ID
  -> data/allowed-members.json        lista de liberados + selos de cada um
  -> src/lib/discord.ts               GET /guilds/{id}/members/{userId}
  -> página                           cards renderizados no servidor
```

Buscar membro a membro em vez da lista toda evita depender da intent
privilegiada "Server Members Intent", que o Discord só libera mediante
verificação. O bot precisa apenas estar no servidor.

A resposta do Discord fica em cache por 60 segundos (`next: { revalidate: 60 }`),
e a página é regerada no mesmo intervalo. Ou seja: no pior caso a informação
está um minuto atrasada, e uma enxurrada de acessos não vira uma enxurrada de
chamadas na API do Discord.

### O clipe e o som

Navegador nenhum deixa um vídeo tocar com áudio sem o usuário ter clicado em
algo antes. Daí o portão de entrada: a tela escura com "clique aqui" existe
para capturar esse gesto. O clique tira o mudo dentro do próprio handler
(precisa ser síncrono, senão o navegador não considera gesto do usuário) e
sobe o volume de 0 a 1 numa rampa de quase um segundo, para não estourar no
ouvido de ninguém.

Dois detalhes que deram trabalho e estão comentados no código:

- `play()` costuma ser rejeitado com `AbortError` quando se dá F5 várias vezes
  seguidas, porque um novo `load` cancela o anterior. É transitório, então há
  três tentativas antes de desistir e cair para o mudo.
- O elemento `<video>` fica isolado em `memo`. Sem isso, qualquer re-render do
  componente pai faria o React reaplicar o atributo `muted` e mutar o vídeo do
  nada no meio da navegação.

Rolar a página não dispara JavaScript de animação: um listener publica o
progresso do scroll na variável CSS `--scroll`, e o desfoque, o zoom e o
escurecimento do fundo são só CSS lendo essa variável.

### Contador de visitas

Conta IPs distintos, mas não guarda IP nenhum: o que vai para o disco é um
hash SHA-256 truncado, com sal configurável em `VIEW_SALT`. Serve para contar
sem virar um registro de quem entrou. Trocar o sal zera a contagem, porque os
hashes antigos deixam de bater.

## Stack

- Next.js 16 (App Router) com React 19 e TypeScript
- Tailwind CSS v4
- Fonte [Sora](https://fonts.google.com/specimen/Sora) via `next/font`
- `discord-interactions` para validar a assinatura Ed25519 dos webhooks
- Sem banco de dados: o estado mora em dois arquivos JSON

## Estrutura

```
src/
  app/
    page.tsx                        home: clipe + grade de cards
    layout.tsx                      fonte, metadados, tema escuro
    globals.css                     estilos do portão, do HUD e das animações
    api/
      members/route.ts              GET  a lista pronta, em JSON
      views/route.ts                GET/POST contador de visitas
      discord/interactions/route.ts POST webhook do Discord (/addpessoa)
  components/
    BackgroundVideo.tsx             clipe de fundo e portão de entrada
    VolumeControl.tsx               ícone + slider de volume
    VideoContext.tsx                compartilha o <video> entre os dois acima
    ViewCounter.tsx                 contador no canto superior direito
    MemberGrid.tsx / MemberCard.tsx grade e card individual
    Reveal.tsx                      entrada dos cards via IntersectionObserver
    ScrollProgress.tsx              publica --scroll no <html>
  lib/
    discord.ts                      chamadas à API do Discord e montagem do card
    badges.ts                       catálogo de selos e ordem de exibição
    memberStore.ts                  lista de liberados (leitura e escrita)
    viewStore.ts                    contagem de visitas
    storage.ts                      onde os JSONs são lidos e gravados
  types/discord.ts                  formatos da API e das interações

scripts/register-commands.mjs       registra o /addpessoa no servidor
public/assets/                      ícones dos selos
public/video/background.mp4         clipe de fundo
data/                               estado em runtime (fora do versionamento)
```

## Rodando local

Precisa de Node 20 ou mais novo.

```bash
npm install
cp .env.example .env    # e preencha, veja abaixo
npm run dev
```

O site sobe em http://localhost:3000. Sem as variáveis do Discord ele carrega
normalmente, só que sem cards.

## Configurando o bot

1. Crie uma aplicação em https://discord.com/developers/applications.
2. Em **General Information**, copie o Application ID e a Public Key.
3. Na aba **Bot**, clique em Reset Token e copie o token. Ele aparece uma vez
   só; se perder, é só gerar outro.
4. Em **OAuth2 > URL Generator**, marque os escopos `bot` e
   `applications.commands`, dê a permissão View Channels e use o link gerado
   para convidar o bot.
5. No Discord, ligue o Modo Desenvolvedor em Configurações > Avançado. Aí é
   botão direito no servidor > Copiar ID do Servidor.

Com isso o `.env` fica assim:

```
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
DISCORD_APPLICATION_ID=...
DISCORD_PUBLIC_KEY=...
```

### Registrando o comando

```bash
npm run register-commands
```

Registra o `/addpessoa` só no seu servidor. Comando de guilda aparece na hora;
comando global demoraria até uma hora para propagar. Rode de novo sempre que
mexer na lista de selos.

### Apontando o webhook

O Discord manda as interações por HTTP, então precisa alcançar o site de fora.
Em produção é a URL do deploy; em desenvolvimento, um túnel resolve:

```bash
npx cloudflared tunnel --url http://localhost:3000
```

Cole a URL em General Information > Interactions Endpoint URL, com
`/api/discord/interactions` no fim, e salve. O Discord dispara um `PING` na
hora e só aceita se a assinatura bater com a Public Key. Se der erro ao salvar,
quase sempre é `DISCORD_PUBLIC_KEY` errada ou o servidor não reiniciado depois
de mexer no `.env`.

### Usando

Qualquer administrador roda `/addpessoa` e escolhe a pessoa no seletor. Os
outros campos são opcionais:

| Campo | O que é |
| --- | --- |
| `pessoa` | quem entra no site (obrigatório) |
| `nivel` | impulso do servidor, de 1 a 9 |
| `nitro` | Nitro por tempo de assinatura, de bronze a opala |
| `badge`, `badge2`, `badge3` | até três selos de perfil |

A resposta é efêmera, só quem rodou vê. Rodar de novo na mesma pessoa atualiza:
os campos preenchidos sobrescrevem, os deixados em branco ficam como estavam.
Para tirar alguém, apague o ID de `data/allowed-members.json`.

## Os selos

O catálogo inteiro está em `src/lib/badges.ts`, dividido em três grupos: selos
de perfil, Nitro e impulso. Cada um tem um `order`, e os selos do card são
sempre reordenados por esse número, não pela ordem em que foram digitados no
comando. A sequência segue a do próprio Discord:

```
staff > parceiro > moderador > HypeSquad > caçador de bugs > devs >
Nitro > apoiador inicial > impulso > cosméticos
```

Para adicionar um selo novo: jogue o ícone em `public/assets/`, acrescente a
linha em `PROFILE_BADGE_SOURCE`, repita a entrada em `profileChoices` dentro de
`scripts/register-commands.mjs` e rode `npm run register-commands`. As duas
listas são mantidas em sincronia na mão de propósito, porque o script roda
fora do bundle do Next. O Discord aceita no máximo 25 opções por campo.

## Deploy na Vercel

1. Suba o repositório no GitHub e importe em https://vercel.com/new. O preset
   de Next.js é detectado sozinho, não precisa mexer em build command nem em
   output directory.
2. Em Environment Variables, cadastre as quatro variáveis do Discord.
3. Cadastre também `ALLOWED_MEMBERS` com a lista de membros em JSON, tudo numa
   linha só. O formato é o de `data/allowed-members.example.json`:

   ```
   [{"id":"1234","nitro":"nitro-ouro","badges":["apoiador"]}]
   ```

4. Depois do primeiro deploy, volte ao Developer Portal e troque a Interactions
   Endpoint URL para
   `https://SEU-DOMINIO.vercel.app/api/discord/interactions`.

### Sobre a persistência

A lista de membros e a contagem de visitas vivem em arquivos JSON. Num servidor
comum (VPS, `npm run build && npm start`) isso funciona sem ressalva: o que o
`/addpessoa` grava fica gravado.

Em serverless é diferente. A pasta do deploy é somente leitura e a temporária
some quando a instância recicla. Por isso o `memberStore` aceita
`ALLOWED_MEMBERS`: a lista entra por variável de ambiente e o site renderiza
normalmente. O que muda é que uma pessoa adicionada pelo `/addpessoa` vale
enquanto aquela instância viver — para valer de vez, é atualizar a variável e
redeployar. A contagem de visitas também reinicia junto.

Quem quiser as duas coisas persistentes na Vercel precisa trocar a leitura e a
escrita de `src/lib/storage.ts` por um banco (Postgres, Redis, KV). Toda a
manipulação de arquivo está concentrada nesse módulo justamente para essa troca
ser localizada.

## Variáveis de ambiente

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `DISCORD_BOT_TOKEN` | sim | autentica as chamadas à API do Discord |
| `DISCORD_GUILD_ID` | sim | de qual servidor os membros são buscados |
| `DISCORD_APPLICATION_ID` | sim | usado no registro do comando |
| `DISCORD_PUBLIC_KEY` | sim | valida a assinatura dos webhooks |
| `ALLOWED_MEMBERS` | não | lista inicial em JSON, para onde não há disco |
| `DATA_DIR` | não | pasta dos JSONs; o padrão é `data/` |
| `VIEW_SALT` | não | sal do hash de IP do contador |

O `.env` está no `.gitignore` junto com `data/*.json`, então nem os segredos
nem os IDs dos membros vão para o repositório.

## Trocando o clipe

Substitua `public/video/background.mp4` mantendo o nome. Vale comprimir antes:
o arquivo é servido inteiro no primeiro acesso e o atual já tem 23 MB.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | sobe o build |
| `npm run lint` | ESLint |
| `npm run register-commands` | registra o `/addpessoa` no servidor |
