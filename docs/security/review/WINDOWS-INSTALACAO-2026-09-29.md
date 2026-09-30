# Falhas encontradas na instalação de teste do Windows

O terminal enviado pelo usuário (Node 24.12.0, commit c3cf07b) mostrou 67 testes aprovados e duas falhas; o arquivo secureHttp não conseguiu carregar, portanto a contagem ficou menor que a suíte completa. TypeScript e build passaram. O comando digitado como lintnpm foi corrigido pelo próprio usuário e não é defeito do código.

## Correções

1. O gerador comparava o JSON caractere por caractere, incluindo quebras de linha. Checkouts CRLF produziam falso aviso de contrato desatualizado. A comparação agora normaliza somente CRLF para LF. Conteúdo divergente continua bloqueado; o arquivo não é regenerado silenciosamente.
2. O carregamento de Firestore falhou por ausência de @opentelemetry/api. A dependência já constava no lock como opcional/transitiva. Agora é dependência direta de produção, na mesma versão 1.9.1 já travada no lock, sem atualização geral de pacotes. A causa da omissão na máquina do usuário não foi determinada.

Foi acrescentado teste que executa o gerador sobre cópias CRLF dos modelos e contrato e depois confirma a rejeição de conteúdo alterado. Outro teste verifica declaração obrigatória no manifesto/lock e importação de telemetry e Firestore sem conexão com dados reais.

A validação no ambiente Linux não substitui executar novamente a suíte no Windows. A PR continua em rascunho; esta mudança não resolve as outras pendências clínicas nem publica configurações Firebase.

Verificação local após a correção: npm ci executado do zero, 73 testes aprovados, npm run lint e npm run build aprovados. Permanece aviso de tamanho do bundle. Instalação offline inicialmente não foi possível por falta de pacotes no cache; a instalação com acesso ao registro foi concluída.
