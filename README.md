# DentisPro

> Esta branch contém o atendimento protegido em revisão. Não substituir a instalação clínica em uso antes da homologação. Leia [estado da revisão e ativação](docs/security/REVISAO-E-ATIVACAO.md). O login abre uma verificação de infraestrutura; a configuração abaixo não basta para liberar prontuários.

## Instalação local

Use **Node.js 24.x e npm 11.x**. O Docker e o arquivo `.nvmrc` usam a mesma versão principal do Node. Dependências atuais, incluindo o leitor de PDF, não são compatíveis com Node 20.

No terminal do VS Code, dentro da pasta do projeto:

```sh
node --version
npm --version
npm ci
npm run dev
```

Abra http://localhost:3000 no navegador. Para encerrar, pressione `Ctrl+C` no terminal. Se usar nvm, execute `nvm install` e `nvm use` antes da instalação.

Se ainda não tiver o código:

```sh
git clone https://github.com/HAIRESP/DentisPro13.git
cd DentisPro13
```

### Configuração opcional

Para usar as funções de inteligência artificial, copie `.env.example` para `.env` e substitua `GEMINI_API_KEY` por sua chave. No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Linux ou macOS, use `cp .env.example .env`. Não envie o arquivo `.env` ao GitHub. A interface pode iniciar sem essa chave; as rotas de IA exigem uma chave válida. A instalação local não configura nem publica regras do Firebase.

## Verificação e execução compilada

```sh
npm run lint
npm run build
npm start
```

`lint` verifica os tipos TypeScript. `build` gera a aplicação em `dist`; `start` executa o servidor compilado na porta 3000. Encerre o servidor de desenvolvimento antes de executar `npm start`.

Pendência conhecida: a verificação `npm run lint` ainda aponta inconsistências nos módulos da aplicação, como campos obrigatórios ausentes. A compilação do Vite não verifica tipos, por isso seu sucesso não significa que essas inconsistências foram corrigidas.

Para servir somente os arquivos compilados, defina `NODE_ENV=production` antes de `npm start`. No PowerShell, use `$env:NODE_ENV = "production"`; no Linux/macOS, execute `NODE_ENV=production npm start`. O Docker já define essa variável.

`npm run clean` remove apenas os arquivos gerados (`dist` e `server.js`) e funciona também no Windows.

## Dependências

Use `npm ci` nas instalações normais: ele respeita o `package-lock.json`. Ao alterar dependências intencionalmente, atualize e envie juntos `package.json` e `package-lock.json`. Não exclua o arquivo de versões para contornar erros de instalação.

## Docker

```sh
docker build -t dentispro .
docker run --rm -p 3000:3000 dentispro
```

Para passar as variáveis configuradas, acrescente `--env-file .env` antes de `dentispro` no comando de execução.
