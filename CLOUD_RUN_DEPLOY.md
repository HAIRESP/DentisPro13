# Guia de Implantação no Google Cloud Run (Outra Conta Gmail / GCP)

Este documento descreve os passos exatos para enviar este sistema (PlanetOdonto) para implantação no **Google Cloud Run** em qualquer outra conta de e-mail do Google (Gmail / Google Workspace).

---

## 🚀 Requisitos Prévios
1. Ter acesso ao console da nova conta no **Google Cloud Platform (GCP)**: [https://console.cloud.google.com](https://console.cloud.google.com)
2. Criar ou ter um **Projeto GCP** ativo com o faturamento (Billing) habilitado.
3. Ter o **Google Cloud SDK (`gcloud` CLI)** instalado na sua máquina local ou utilizar o **Google Cloud Shell** diretamente no navegador.

---

## 🛠️ Passo a Passo Rápido de Implantação (Opção Recomendada: Cloud Shell)

### Passo 1: Abrir o Google Cloud Shell
Acesse o console da sua nova conta do Gmail/GCP e clique no ícone do **Cloud Shell** (no canto superior direito do navegador `>_`).

### Passo 2: Clonar ou Fazer Upload do Código
Você pode enviar os arquivos do projeto em um arquivo `.zip` ou repositório GitHub para a sua máquina ou Cloud Shell.

### Passo 3: Definir o ID do seu Projeto GCP
```bash
gcloud config set project NOME_DO_SEU_PROJETO_GCP
```

### Passo 4: Habilitar os Serviços Necessários no GCP
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### Passo 5: Executar o Comando de Implantação (Single Command Deploy)
Na pasta raiz do projeto onde está o `Dockerfile`, execute:

```bash
gcloud run deploy planetodonto-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

> **Nota:** O Cloud Build irá compilar a imagem Docker automaticamente na nuvem e gerar o link HTTPS seguro da sua aplicação pronta para uso público!

---

## 🔒 Variáveis de Ambiente e Firebase
Para conectar a nova instância do Cloud Run com as permissões e parâmetros do Firebase:
1. No console do Cloud Run, selecione o serviço `planetodonto-app`.
2. Clique em **"Editar e implantar nova revisão"** -> **Variáveis de Ambiente**.
3. Defina a variável `GEMINI_API_KEY` e as chaves do Firebase se desejar sobrepor.

---

## 📌 Suporte a Múltiplos Usuários e Permissões
- O sistema já vem equipado com sessões de login para **Administrador**, **Dentista** e **Recepcionista**.
- Todas as alterações de parâmetros da clínica e permissões de acesso são salvas e sincronizadas automaticamente por usuário e salvas no Firestore.
