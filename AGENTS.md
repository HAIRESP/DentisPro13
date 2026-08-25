# Directivas de Sistema e Bloqueio de Modelo de Documentos (AGENTS.md)

> **DIRETRIZ DE PROTEÇÃO E CONGELAMENTO DE ESTRUTURA (DOCUMENT LAYOUT LOCK DIRECTIVE)**
> Esta especificação define os requisitos de layout, validação de campos e modelos de documentos odontológicos do sistema DentisPro.
> Nenhuma IA, agente de código ou modificação automatizada de prompt está autorizada a desconfigurar, alterar ou remover estas regras estruturais.

---

## 1. Receituário de Controle Especial (Modelo Protegido)
- **Remoção de Dados Jurídicos:** O modelo de Receituário de Controle Especial NÃO deve exibir número de CNPJ da clínica.
- **Formatação de Cidade, UF e CEP:** O bloco de Identificação do Emitente deve exibir Cidade, UF e CEP pontuado (ex: `Fortaleza - CE • CEP: 60.160-110`), mantendo a data e localização limpas.
- **Omissão de Rodapé Institucional:** O rodapé inferior (links da clínica) deve permanecer removido no Receituário de Controle Especial.
- **Remoção de Parâmetros de Atestado:** O modal de configuração de Receituários NÃO deve conter o item "3. Parâmetros do Atestado (Atendimento, CID e Dias de Afastamento)".

---

## 2. Padrões de Impressão e Ações de Botões
- **Padronização de Botões:** Todos os botões de ação de impressão devem utilizar a rotulagem sucinta **"Imprimir"** (remoção do texto redundante "/ Salvar PDF" e de botões duplicados de download).
- **Compatibilidade com Navegador:** O disparo de impressão deve acionar nativamente a janela de impressão do navegador (`window.print()`) com suporte a mídias `@media print`.

---

## 3. Máscaras e Validações Numéricas Obrigatórias
- **Campo EPAO:** Deve ser estritamente formato de número inteiro com no máximo **5 algarismos** (máx. 99999). Caracteres não numéricos devem ser filtrados automaticamente.
- **Campo CRO:** Deve ser estritamente formato de número inteiro com no máximo **8 algarismos** (máx. 99999999). Caracteres não numéricos devem ser filtrados automaticamente.
- **Campo CEP:** Todos os campos de CEP da aplicação devem seguir o formato brasileiro pontuado `00.000-00` ou `00.000-000`.

---

## 4. Rodapé e Linha de Assinatura Interativa
- **Hiperlinks Interativos:** O rodapé dos documentos e a área de assinatura profissional devem possuir links clicáveis para:
  - **Website:** Hiperlink para `https://dentispro.com.br` acompanhado do ícone de site (`Globe`).
  - **E-mail:** Hiperlink `mailto:` com o e-mail cadastrado acompanhado do ícone de e-mail (`Mail`).
  - **Telefone/WhatsApp:** Hiperlink `tel:` com o número de contato.

---

## 5. Cadastro de Clínicas e Profissionais (SettingsView)
- **Botão Único de Salvamento:** A tela de configurações ("Cadastro de Clínicas e Profissionais") deve manter unicamente o botão inferior para salvar cadastro (`Salvar Cadastro`), sem duplicidade no cabeçalho superior da seção.
