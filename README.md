# DentisPro

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
git clone --branch refactor/no-google-auth-20261006 https://github.com/HAIRESP/DentisPro13.git
cd DentisPro13
```

### Configuração opcional

O login desta branch usa o servidor do DentisPro, sem Firebase. No primeiro início,
um código de instalação é exibido no terminal. Use-o na tela de ativação para
criar o primeiro administrador, com senha nova de pelo menos 12 caracteres.
As contas antigas não são importadas automaticamente e as senhas anteriores não
são reaproveitadas. Pacientes, estoque e documentos locais não são apagados.

Leia [Migração sem Google](docs/migracao-sem-google.md) antes de instalar.
A IA fica desativada por padrão; DeepSeek e Copilot são opcionais e exigem configuração.
Não envie `.env` nem a pasta `.dentispro-data` ao GitHub.
