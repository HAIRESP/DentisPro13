// Snapshot do modelo de dados para análise. Nenhum cadastro é criado por esta referência.
export const ENTITY_REFERENCES = [
  {
    "id": "laboratories",
    "title": "Laboratórios — proposta de cadastro",
    "description": "O código atual contém catálogo de exames laboratoriais, mas não foi localizado cadastro próprio de laboratórios prestadores. Abaixo está a proposta para análise, sem criação de registros.",
    "fields": [
      {
        "key": "id",
        "label": "Identificador",
        "description": "Chave única do laboratório",
        "example": "lab-exemplo-001",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "name",
        "label": "Nome",
        "description": "Nome do laboratório prestador",
        "example": "Laboratório de exemplo",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "type",
        "label": "Tipo de serviço",
        "description": "Análises clínicas, imagem ou prótese, conforme o cadastro futuro",
        "example": "Imagem",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "cnpj",
        "label": "CNPJ",
        "description": "Identificação fiscal do prestador",
        "example": "Não fornecido",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "contact",
        "label": "Contato",
        "description": "Pessoa responsável pelo contato",
        "example": "Não fornecido",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "phone",
        "label": "Telefone",
        "description": "Telefone comercial",
        "example": "Não fornecido",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "email",
        "label": "E-mail",
        "description": "Endereço eletrônico comercial",
        "example": "Não fornecido",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "address",
        "label": "Endereço",
        "description": "Endereço de atendimento ou entrega",
        "example": "Não fornecido",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "services",
        "label": "Serviços",
        "description": "Lista de serviços prestados e vínculos com procedimentos",
        "example": "Não fornecido",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "prices",
        "label": "Preços e prazos",
        "description": "Valores contratados e prazo de entrega por serviço",
        "example": "Não fornecido",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      },
      {
        "key": "attachments",
        "label": "Arquivos e contratos",
        "description": "Referências aos documentos do prestador",
        "example": "Não fornecido",
        "category": "Laboratórios",
        "path": "A definir",
        "status": "Proposta — não implementado",
        "note": ""
      }
    ]
  },
  {
    "id": "Appointment",
    "title": "Agenda",
    "description": "Referência extraída de src/types/index.ts, estrutura Appointment. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "stockDeduction",
        "category": "Agenda",
        "label": "stockDeduction",
        "description": "Campo opcional; formato: {\n    completedAt: string;\n    items: Array<{\n      itemId: string;\n      qty: number; // Quantidade descontada na unidade do estoque\n      stockUnit?: string;\n      unitsPerStockUnit?: number;\n      consumptionUnit?: string;\n      consumptions?: Array<{ quantity: number; unit: string }>;\n    }>;\n  }.",
        "example": "",
        "path": "Appointment.stockDeduction",
        "status": "Definido no código atual",
        "note": "Opcional · {\n    completedAt: string;\n    items: Array<{\n      itemId: string;\n      qty: number; // Quantidade descontada na unidade do estoque\n      stockUnit?: string;\n      unitsPerStockUnit?: number;\n      consumptionUnit?: string;\n      consumptions?: Array<{ quantity: number; unit: string }>;\n    }>;\n  }"
      },
      {
        "key": "id",
        "category": "Agenda",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "Appointment.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientId",
        "category": "Agenda",
        "label": "Paciente",
        "description": "Vincula o registro ao paciente selecionado. Não selecionar automaticamente outro paciente.",
        "example": "Texto ilustrativo",
        "path": "Appointment.patientId",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientName",
        "category": "Agenda",
        "label": "patientName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Appointment.patientName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientPhone",
        "category": "Agenda",
        "label": "patientPhone",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Appointment.patientPhone",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "dentistName",
        "category": "Agenda",
        "label": "dentistName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Appointment.dentistName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "professionalId",
        "category": "Agenda",
        "label": "Profissional",
        "description": "Vincula o registro ao profissional cadastrado.",
        "example": "Texto ilustrativo",
        "path": "Appointment.professionalId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "clinicId",
        "category": "Agenda",
        "label": "Clínica",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Appointment.clinicId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "clinicName",
        "category": "Agenda",
        "label": "clinicName",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Appointment.clinicName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "date",
        "category": "Agenda",
        "label": "Data",
        "description": "YYYY-MM-DD",
        "example": "2026-10-20",
        "path": "Appointment.date",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "time",
        "category": "Agenda",
        "label": "time",
        "description": "HH:mm",
        "example": "Texto ilustrativo",
        "path": "Appointment.time",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "durationMinutes",
        "category": "Agenda",
        "label": "durationMinutes",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "Appointment.durationMinutes",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "procedure",
        "category": "Agenda",
        "label": "procedure",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Appointment.procedure",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "tussCode",
        "category": "Agenda",
        "label": "tussCode",
        "description": "Código TUSS do procedimento agendado",
        "example": "Texto ilustrativo",
        "path": "Appointment.tussCode",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "status",
        "category": "Agenda",
        "label": "Situação",
        "description": "Campo obrigatório no tipo de dados; formato: AppointmentStatus.",
        "example": "",
        "path": "Appointment.status",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · AppointmentStatus"
      },
      {
        "key": "notes",
        "category": "Agenda",
        "label": "notes",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Appointment.notes",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "value",
        "category": "Agenda",
        "label": "value",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "Appointment.value",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "whatsappSentAt",
        "category": "Agenda",
        "label": "whatsappSentAt",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Appointment.whatsappSentAt",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "customRequiredMaterials",
        "category": "Agenda",
        "label": "customRequiredMaterials",
        "description": "Materiais específicos/personalizados para este atendimento",
        "example": "Lista de registros vinculados",
        "path": "Appointment.customRequiredMaterials",
        "status": "Definido no código atual",
        "note": "Opcional · ProcedureMaterialRequirement[]"
      }
    ]
  },
  {
    "id": "PatientFile",
    "title": "Arquivos do paciente",
    "description": "Referência extraída de src/types/index.ts, estrutura PatientFile. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Arquivos do paciente",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "PatientFile.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "name",
        "category": "Arquivos do paciente",
        "label": "Nome",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientFile.name",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "fileUrl",
        "category": "Arquivos do paciente",
        "label": "fileUrl",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientFile.fileUrl",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "fileType",
        "category": "Arquivos do paciente",
        "label": "fileType",
        "description": "Campo obrigatório no tipo de dados; formato: 'pdf'.",
        "example": "",
        "path": "PatientFile.fileType",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'pdf'"
      },
      {
        "key": "uploadedAt",
        "category": "Arquivos do paciente",
        "label": "uploadedAt",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientFile.uploadedAt",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "sourceDocumentId",
        "category": "Arquivos do paciente",
        "label": "sourceDocumentId",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientFile.sourceDocumentId",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "sourceEvolutionId",
        "category": "Arquivos do paciente",
        "label": "sourceEvolutionId",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientFile.sourceEvolutionId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "examDate",
        "category": "Arquivos do paciente",
        "label": "Data do exame",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "PatientFile.examDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "ClinicUnit",
    "title": "Clínicas",
    "description": "Referência extraída de src/types/index.ts, estrutura ClinicUnit. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Clínicas",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "ClinicUnit.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "name",
        "category": "Clínicas",
        "label": "Nome",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.name",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "address",
        "category": "Clínicas",
        "label": "Endereço",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.address",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "phone",
        "category": "Clínicas",
        "label": "Telefone",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.phone",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "city",
        "category": "Clínicas",
        "label": "city",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.city",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "email",
        "category": "Clínicas",
        "label": "E-mail",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.email",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "cep",
        "category": "Clínicas",
        "label": "cep",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.cep",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "street",
        "category": "Clínicas",
        "label": "street",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.street",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "number",
        "category": "Clínicas",
        "label": "number",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.number",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "complement",
        "category": "Clínicas",
        "label": "complement",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.complement",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "neighborhood",
        "category": "Clínicas",
        "label": "neighborhood",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.neighborhood",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "state",
        "category": "Clínicas",
        "label": "state",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.state",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "cnpj",
        "category": "Clínicas",
        "label": "CNPJ",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.cnpj",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "technicalManager",
        "category": "Clínicas",
        "label": "technicalManager",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.technicalManager",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "croTechnicalManager",
        "category": "Clínicas",
        "label": "croTechnicalManager",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.croTechnicalManager",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "epaoNumber",
        "category": "Clínicas",
        "label": "epaoNumber",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.epaoNumber",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "epaoUf",
        "category": "Clínicas",
        "label": "epaoUf",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicUnit.epaoUf",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "PriceTable",
    "title": "Convênios e tabelas de preços",
    "description": "Referência extraída de src/types/index.ts, estrutura PriceTable. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Convênios e tabelas de preços",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "PriceTable.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "name",
        "category": "Convênios e tabelas de preços",
        "label": "Nome",
        "description": "e.g. 'Particular', 'Convênio 1 (Bradesco)', 'Convênio 2 (Unimed)'",
        "example": "Texto ilustrativo",
        "path": "PriceTable.name",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "description",
        "category": "Convênios e tabelas de preços",
        "label": "Descrição",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PriceTable.description",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "isDefault",
        "category": "Convênios e tabelas de preços",
        "label": "isDefault",
        "description": "Campo opcional; formato: boolean.",
        "example": "true / false",
        "path": "PriceTable.isDefault",
        "status": "Definido no código atual",
        "note": "Opcional · boolean"
      }
    ]
  },
  {
    "id": "SavedClinicDocument",
    "title": "Documentos gerados",
    "description": "Referência extraída de src/types/index.ts, estrutura SavedClinicDocument. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "createdBy",
        "category": "Documentos gerados",
        "label": "createdBy",
        "description": "Campo opcional; formato: {accountUid:string;professionalId:string;professionalName:string;at:string}.",
        "example": "",
        "path": "SavedClinicDocument.createdBy",
        "status": "Definido no código atual",
        "note": "Opcional · {accountUid:string;professionalId:string;professionalName:string;at:string}"
      },
      {
        "key": "id",
        "category": "Documentos gerados",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "SavedClinicDocument.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "createdAt",
        "category": "Documentos gerados",
        "label": "Data de criação",
        "description": "Data e hora em que o registro foi criado.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.createdAt",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "formattedDateStr",
        "category": "Documentos gerados",
        "label": "formattedDateStr",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "2026-10-20",
        "path": "SavedClinicDocument.formattedDateStr",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "title",
        "category": "Documentos gerados",
        "label": "Título",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.title",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "subtitle",
        "category": "Documentos gerados",
        "label": "subtitle",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.subtitle",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "category",
        "category": "Documentos gerados",
        "label": "Categoria",
        "description": "Campo obrigatório no tipo de dados; formato: 'atestado' | 'declaracao' | 'solicitacao' | 'receita' | 'termo' | 'prontuario' | 'outro'.",
        "example": "",
        "path": "SavedClinicDocument.category",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'atestado' | 'declaracao' | 'solicitacao' | 'receita' | 'termo' | 'prontuario' | 'outro'"
      },
      {
        "key": "patientId",
        "category": "Documentos gerados",
        "label": "Paciente",
        "description": "Vincula o registro ao paciente selecionado. Não selecionar automaticamente outro paciente.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.patientId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "patientName",
        "category": "Documentos gerados",
        "label": "patientName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.patientName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "professionalName",
        "category": "Documentos gerados",
        "label": "Nome do profissional",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.professionalName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "cidCode",
        "category": "Documentos gerados",
        "label": "cidCode",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.cidCode",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "summary",
        "category": "Documentos gerados",
        "label": "Resumo",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.summary",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "status",
        "category": "Documentos gerados",
        "label": "Situação",
        "description": "Campo obrigatório no tipo de dados; formato: 'gerado' | 'impresso'.",
        "example": "",
        "path": "SavedClinicDocument.status",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'gerado' | 'impresso'"
      },
      {
        "key": "templateId",
        "category": "Documentos gerados",
        "label": "templateId",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.templateId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "templateData",
        "category": "Documentos gerados",
        "label": "templateData",
        "description": "Campo opcional; formato: Record<string, any>.",
        "example": "",
        "path": "SavedClinicDocument.templateData",
        "status": "Definido no código atual",
        "note": "Opcional · Record<string, any>"
      },
      {
        "key": "htmlSnapshot",
        "category": "Documentos gerados",
        "label": "htmlSnapshot",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.htmlSnapshot",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "patientCpf",
        "category": "Documentos gerados",
        "label": "patientCpf",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.patientCpf",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "patientPhone",
        "category": "Documentos gerados",
        "label": "patientPhone",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.patientPhone",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "professionalCro",
        "category": "Documentos gerados",
        "label": "professionalCro",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.professionalCro",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "date",
        "category": "Documentos gerados",
        "label": "Data",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "SavedClinicDocument.date",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "content",
        "category": "Documentos gerados",
        "label": "content",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.content",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "patientSnapshot",
        "category": "Documentos gerados",
        "label": "patientSnapshot",
        "description": "Campo opcional; formato: Partial<Patient>.",
        "example": "",
        "path": "SavedClinicDocument.patientSnapshot",
        "status": "Definido no código atual",
        "note": "Opcional · Partial<Patient>"
      },
      {
        "key": "patientFileId",
        "category": "Documentos gerados",
        "label": "patientFileId",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "SavedClinicDocument.patientFileId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "InventoryItem",
    "title": "Estoque e materiais",
    "description": "Referência extraída de src/types/index.ts, estrutura InventoryItem. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Estoque e materiais",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "InventoryItem.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "itemCode",
        "category": "Estoque e materiais",
        "label": "itemCode",
        "description": "Código/Número do Item de Material Odontológico (Ref. Catálogo)",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.itemCode",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "name",
        "category": "Estoque e materiais",
        "label": "Nome",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.name",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "category",
        "category": "Estoque e materiais",
        "label": "Categoria",
        "description": "Campo obrigatório no tipo de dados; formato: 'Anestésicos' | 'Descartáveis' | 'Resinas & Adesivos' | 'Endodontia' | 'Cirurgia' | 'Ortodontia' | 'Higiene' | 'Equipamentos' | 'Instrumentais' | 'Outros' | string.",
        "example": "",
        "path": "InventoryItem.category",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'Anestésicos' | 'Descartáveis' | 'Resinas & Adesivos' | 'Endodontia' | 'Cirurgia' | 'Ortodontia' | 'Higiene' | 'Equipamentos' | 'Instrumentais' | 'Outros' | string"
      },
      {
        "key": "itemType",
        "category": "Estoque e materiais",
        "label": "itemType",
        "description": "Campo opcional; formato: InventoryItemType.",
        "example": "",
        "path": "InventoryItem.itemType",
        "status": "Definido no código atual",
        "note": "Opcional · InventoryItemType"
      },
      {
        "key": "quantity",
        "category": "Estoque e materiais",
        "label": "Quantidade",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "InventoryItem.quantity",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "minQuantity",
        "category": "Estoque e materiais",
        "label": "minQuantity",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "InventoryItem.minQuantity",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "unit",
        "category": "Estoque e materiais",
        "label": "Unidade",
        "description": "Campo obrigatório no tipo de dados; formato: 'caixa' | 'unidade' | 'frasco' | 'pacote' | 'tubete' | 'kit' | 'peça' | 'conjunto' | string.",
        "example": "",
        "path": "InventoryItem.unit",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'caixa' | 'unidade' | 'frasco' | 'pacote' | 'tubete' | 'kit' | 'peça' | 'conjunto' | string"
      },
      {
        "key": "consumptionUnit",
        "category": "Estoque e materiais",
        "label": "consumptionUnit",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.consumptionUnit",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "unitsPerStockUnit",
        "category": "Estoque e materiais",
        "label": "unitsPerStockUnit",
        "description": "Campo opcional; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "InventoryItem.unitsPerStockUnit",
        "status": "Definido no código atual",
        "note": "Opcional · number"
      },
      {
        "key": "unitCost",
        "category": "Estoque e materiais",
        "label": "unitCost",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "InventoryItem.unitCost",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "manufacturingDate",
        "category": "Estoque e materiais",
        "label": "manufacturingDate",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "InventoryItem.manufacturingDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "expirationDate",
        "category": "Estoque e materiais",
        "label": "expirationDate",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "InventoryItem.expirationDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "supplier",
        "category": "Estoque e materiais",
        "label": "supplier",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.supplier",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "notes",
        "category": "Estoque e materiais",
        "label": "notes",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.notes",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "lastUpdated",
        "category": "Estoque e materiais",
        "label": "lastUpdated",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "2026-10-20",
        "path": "InventoryItem.lastUpdated",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "imageUrl",
        "category": "Estoque e materiais",
        "label": "imageUrl",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.imageUrl",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "photoUrl",
        "category": "Estoque e materiais",
        "label": "photoUrl",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.photoUrl",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "images",
        "category": "Estoque e materiais",
        "label": "images",
        "description": "Multiple identification images for material / equipment",
        "example": "Lista de registros vinculados",
        "path": "InventoryItem.images",
        "status": "Definido no código atual",
        "note": "Opcional · string[]"
      },
      {
        "key": "serialNumber",
        "category": "Estoque e materiais",
        "label": "serialNumber",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.serialNumber",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "isSterilized",
        "category": "Estoque e materiais",
        "label": "isSterilized",
        "description": "Se o material/instrumental está esterilizado e pronto para uso",
        "example": "true / false",
        "path": "InventoryItem.isSterilized",
        "status": "Definido no código atual",
        "note": "Opcional · boolean"
      },
      {
        "key": "sterilizationDate",
        "category": "Estoque e materiais",
        "label": "sterilizationDate",
        "description": "Data do último ciclo de autoclave / esterilização",
        "example": "2026-10-20",
        "path": "InventoryItem.sterilizationDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "sterilizationCycleId",
        "category": "Estoque e materiais",
        "label": "sterilizationCycleId",
        "description": "Ciclo rastreável que liberou este item",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.sterilizationCycleId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "sterilizationReleasedAt",
        "category": "Estoque e materiais",
        "label": "sterilizationReleasedAt",
        "description": "Momento em que a quarentena foi encerrada",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.sterilizationReleasedAt",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "requiresSterilization",
        "category": "Estoque e materiais",
        "label": "requiresSterilization",
        "description": "Controle ativado/desativado se o material necessita de autoclave",
        "example": "true / false",
        "path": "InventoryItem.requiresSterilization",
        "status": "Definido no código atual",
        "note": "Opcional · boolean"
      },
      {
        "key": "sterilizedBy",
        "category": "Estoque e materiais",
        "label": "sterilizedBy",
        "description": "Nome da pessoa / profissional / atendente responsável que esterilizou e acompanhou o ciclo",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.sterilizedBy",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "autoclaveModel",
        "category": "Estoque e materiais",
        "label": "autoclaveModel",
        "description": "Modelo da autoclave utilizada (ex: Autoclave Cristófoli Vitale Class 12L)",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.autoclaveModel",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "autoclaveWaterVolume",
        "category": "Estoque e materiais",
        "label": "autoclaveWaterVolume",
        "description": "Consumo de água destilada do ciclo (ex: 150 ml)",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.autoclaveWaterVolume",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "autoclaveTemperature",
        "category": "Estoque e materiais",
        "label": "autoclaveTemperature",
        "description": "Temperatura de operação (ex: 129°C – 132°C)",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.autoclaveTemperature",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "autoclavePressure",
        "category": "Estoque e materiais",
        "label": "autoclavePressure",
        "description": "Pressão de operação (ex: 1,7 a 1,9 kgf/cm²)",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.autoclavePressure",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "autoclaveSterilizationTime",
        "category": "Estoque e materiais",
        "label": "autoclaveSterilizationTime",
        "description": "Tempo de esterilização (ex: 16 minutos)",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.autoclaveSterilizationTime",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "autoclaveDryingMode",
        "category": "Estoque e materiais",
        "label": "autoclaveDryingMode",
        "description": "Etapa de secagem (ex: Secagem com a porta entreaberta)",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.autoclaveDryingMode",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "autoclaveCycleType",
        "category": "Estoque e materiais",
        "label": "autoclaveCycleType",
        "description": "Tipo de ciclo (ex: Automático - Programa Único)",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.autoclaveCycleType",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "maintenanceDate",
        "category": "Estoque e materiais",
        "label": "maintenanceDate",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "InventoryItem.maintenanceDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "requiresMaintenance",
        "category": "Estoque e materiais",
        "label": "requiresMaintenance",
        "description": "Campo opcional; formato: boolean.",
        "example": "true / false",
        "path": "InventoryItem.requiresMaintenance",
        "status": "Definido no código atual",
        "note": "Opcional · boolean"
      },
      {
        "key": "maintenanceFrequencyDays",
        "category": "Estoque e materiais",
        "label": "maintenanceFrequencyDays",
        "description": "Campo opcional; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "InventoryItem.maintenanceFrequencyDays",
        "status": "Definido no código atual",
        "note": "Opcional · number"
      },
      {
        "key": "lastMaintenanceDate",
        "category": "Estoque e materiais",
        "label": "lastMaintenanceDate",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "InventoryItem.lastMaintenanceDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "nextMaintenanceDate",
        "category": "Estoque e materiais",
        "label": "nextMaintenanceDate",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "InventoryItem.nextMaintenanceDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "maintenanceNotes",
        "category": "Estoque e materiais",
        "label": "maintenanceNotes",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.maintenanceNotes",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "maintenanceHistory",
        "category": "Estoque e materiais",
        "label": "maintenanceHistory",
        "description": "Campo opcional; formato: Array<{\n    id: string;\n    date: string;\n    description: string;\n    cost?: number;\n    technician?: string;\n  }>.",
        "example": "",
        "path": "InventoryItem.maintenanceHistory",
        "status": "Definido no código atual",
        "note": "Opcional · Array<{\n    id: string;\n    date: string;\n    description: string;\n    cost?: number;\n    technician?: string;\n  }>"
      },
      {
        "key": "ownerScope",
        "category": "Estoque e materiais",
        "label": "ownerScope",
        "description": "'clinica' | 'profissional' | 'compartilhado'",
        "example": "",
        "path": "InventoryItem.ownerScope",
        "status": "Definido no código atual",
        "note": "Opcional · InventoryOwnerScope"
      },
      {
        "key": "clinicId",
        "category": "Estoque e materiais",
        "label": "Clínica",
        "description": "ID da unidade de clínica proprietária",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.clinicId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "clinicName",
        "category": "Estoque e materiais",
        "label": "clinicName",
        "description": "Nome da clínica proprietária",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.clinicName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "professionalId",
        "category": "Estoque e materiais",
        "label": "Profissional",
        "description": "Vincula o registro ao profissional cadastrado.",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.professionalId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "professionalName",
        "category": "Estoque e materiais",
        "label": "Nome do profissional",
        "description": "Nome do profissional proprietário",
        "example": "Texto ilustrativo",
        "path": "InventoryItem.professionalName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "ClinicalEvolutionEntry",
    "title": "Evoluções clínicas",
    "description": "Referência extraída de src/types/index.ts, estrutura ClinicalEvolutionEntry. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "modifiedBy",
        "category": "Evoluções clínicas",
        "label": "Autoria da alteração",
        "description": "Identificação da conta que realizou a alteração e a data do registro.",
        "example": "",
        "path": "ClinicalEvolutionEntry.modifiedBy",
        "status": "Definido no código atual",
        "note": "Opcional · {accountUid:string;professionalId:string;professionalName:string;at:string}"
      },
      {
        "key": "documentFingerprint",
        "category": "Evoluções clínicas",
        "label": "documentFingerprint",
        "description": "SHA-256 do conteúdo clínico e identidade do exame.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.documentFingerprint",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "sourcePanel",
        "category": "Evoluções clínicas",
        "label": "sourcePanel",
        "description": "Campo opcional; formato: ClinicalPanelKind.",
        "example": "",
        "path": "ClinicalEvolutionEntry.sourcePanel",
        "status": "Definido no código atual",
        "note": "Opcional · ClinicalPanelKind"
      },
      {
        "key": "pdfFileId",
        "category": "Evoluções clínicas",
        "label": "pdfFileId",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.pdfFileId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "savedAt",
        "category": "Evoluções clínicas",
        "label": "savedAt",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.savedAt",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "id",
        "category": "Evoluções clínicas",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "ClinicalEvolutionEntry.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientId",
        "category": "Evoluções clínicas",
        "label": "Paciente",
        "description": "Vincula o registro ao paciente selecionado. Não selecionar automaticamente outro paciente.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.patientId",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "date",
        "category": "Evoluções clínicas",
        "label": "Data",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "2026-10-20",
        "path": "ClinicalEvolutionEntry.date",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "dentistName",
        "category": "Evoluções clínicas",
        "label": "dentistName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.dentistName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "clinicName",
        "category": "Evoluções clínicas",
        "label": "clinicName",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.clinicName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "toothNumber",
        "category": "Evoluções clínicas",
        "label": "toothNumber",
        "description": "Campo opcional; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "ClinicalEvolutionEntry.toothNumber",
        "status": "Definido no código atual",
        "note": "Opcional · number"
      },
      {
        "key": "procedure",
        "category": "Evoluções clínicas",
        "label": "procedure",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.procedure",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "description",
        "category": "Evoluções clínicas",
        "label": "Descrição",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.description",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "cost",
        "category": "Evoluções clínicas",
        "label": "cost",
        "description": "Campo opcional; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "ClinicalEvolutionEntry.cost",
        "status": "Definido no código atual",
        "note": "Opcional · number"
      },
      {
        "key": "images",
        "category": "Evoluções clínicas",
        "label": "images",
        "description": "URLs or base64 data for photos/radiographs",
        "example": "Lista de registros vinculados",
        "path": "ClinicalEvolutionEntry.images",
        "status": "Definido no código atual",
        "note": "Opcional · string[]"
      },
      {
        "key": "status",
        "category": "Evoluções clínicas",
        "label": "Situação",
        "description": "Campo opcional; formato: 'pendente' | 'em_andamento' | 'concluido' | 'encaminhado'.",
        "example": "",
        "path": "ClinicalEvolutionEntry.status",
        "status": "Definido no código atual",
        "note": "Opcional · 'pendente' | 'em_andamento' | 'concluido' | 'encaminhado'"
      },
      {
        "key": "treatmentPlanId",
        "category": "Evoluções clínicas",
        "label": "treatmentPlanId",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.treatmentPlanId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "treatmentItemId",
        "category": "Evoluções clínicas",
        "label": "treatmentItemId",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalEvolutionEntry.treatmentItemId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "ClinicalExam",
    "title": "Exames clínicos",
    "description": "Referência extraída de src/types/index.ts, estrutura ClinicalExam. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "modifiedBy",
        "category": "Exames clínicos",
        "label": "Autoria da alteração",
        "description": "Identificação da conta que realizou a alteração e a data do registro.",
        "example": "",
        "path": "ClinicalExam.modifiedBy",
        "status": "Definido no código atual",
        "note": "Opcional · {accountUid:string;professionalId:string;professionalName:string;at:string}"
      },
      {
        "key": "odontogramVitalSigns",
        "category": "Exames clínicos",
        "label": "odontogramVitalSigns",
        "description": "Campo opcional; formato: ExamVitalSigns.",
        "example": "",
        "path": "ClinicalExam.odontogramVitalSigns",
        "status": "Definido no código atual",
        "note": "Opcional · ExamVitalSigns"
      },
      {
        "key": "odontogramDate",
        "category": "Exames clínicos",
        "label": "odontogramDate",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "ClinicalExam.odontogramDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "odontogramExamDate",
        "category": "Exames clínicos",
        "label": "odontogramExamDate",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "ClinicalExam.odontogramExamDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "patientId",
        "category": "Exames clínicos",
        "label": "Paciente",
        "description": "Vincula o registro ao paciente selecionado. Não selecionar automaticamente outro paciente.",
        "example": "Texto ilustrativo",
        "path": "ClinicalExam.patientId",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "updatedAt",
        "category": "Exames clínicos",
        "label": "Data de atualização",
        "description": "Data e hora da última atualização.",
        "example": "2026-10-20",
        "path": "ClinicalExam.updatedAt",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "extraoral",
        "category": "Exames clínicos",
        "label": "extraoral",
        "description": "Campo obrigatório no tipo de dados; formato: ExtraoralExam.",
        "example": "",
        "path": "ClinicalExam.extraoral",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · ExtraoralExam"
      },
      {
        "key": "intraoral",
        "category": "Exames clínicos",
        "label": "intraoral",
        "description": "Campo obrigatório no tipo de dados; formato: IntraoralExam.",
        "example": "",
        "path": "ClinicalExam.intraoral",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · IntraoralExam"
      },
      {
        "key": "painExam",
        "category": "Exames clínicos",
        "label": "painExam",
        "description": "Campo opcional; formato: PainEvaluationExam.",
        "example": "",
        "path": "ClinicalExam.painExam",
        "status": "Definido no código atual",
        "note": "Opcional · PainEvaluationExam"
      },
      {
        "key": "odontogramImages",
        "category": "Exames clínicos",
        "label": "odontogramImages",
        "description": "Campo opcional; formato: string[].",
        "example": "Lista de registros vinculados",
        "path": "ClinicalExam.odontogramImages",
        "status": "Definido no código atual",
        "note": "Opcional · string[]"
      },
      {
        "key": "generalNotes",
        "category": "Exames clínicos",
        "label": "generalNotes",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "ClinicalExam.generalNotes",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "LabExamItem",
    "title": "Exames laboratoriais — catálogo",
    "description": "Referência extraída de src/data/labExamsCatalog.ts, estrutura LabExamItem. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Exames laboratoriais — catálogo",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "LabExamItem.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "name",
        "category": "Exames laboratoriais — catálogo",
        "label": "Nome",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamItem.name",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "category",
        "category": "Exames laboratoriais — catálogo",
        "label": "Categoria",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamItem.category",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "subtitle",
        "category": "Exames laboratoriais — catálogo",
        "label": "subtitle",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamItem.subtitle",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "subItems",
        "category": "Exames laboratoriais — catálogo",
        "label": "subItems",
        "description": "Campo opcional; formato: string[].",
        "example": "Lista de registros vinculados",
        "path": "LabExamItem.subItems",
        "status": "Definido no código atual",
        "note": "Opcional · string[]"
      },
      {
        "key": "description",
        "category": "Exames laboratoriais — catálogo",
        "label": "Descrição",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamItem.description",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "defaultChecked",
        "category": "Exames laboratoriais — catálogo",
        "label": "defaultChecked",
        "description": "Campo opcional; formato: boolean.",
        "example": "true / false",
        "path": "LabExamItem.defaultChecked",
        "status": "Definido no código atual",
        "note": "Opcional · boolean"
      },
      {
        "key": "isCustom",
        "category": "Exames laboratoriais — catálogo",
        "label": "isCustom",
        "description": "Campo opcional; formato: boolean.",
        "example": "true / false",
        "path": "LabExamItem.isCustom",
        "status": "Definido no código atual",
        "note": "Opcional · boolean"
      },
      {
        "key": "preparation",
        "category": "Exames laboratoriais — catálogo",
        "label": "preparation",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamItem.preparation",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "LabExamCategoryGroup",
    "title": "Exames laboratoriais — categorias",
    "description": "Referência extraída de src/data/labExamsCatalog.ts, estrutura LabExamCategoryGroup. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Exames laboratoriais — categorias",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "LabExamCategoryGroup.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "title",
        "category": "Exames laboratoriais — categorias",
        "label": "Título",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamCategoryGroup.title",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "iconName",
        "category": "Exames laboratoriais — categorias",
        "label": "iconName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamCategoryGroup.iconName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "description",
        "category": "Exames laboratoriais — categorias",
        "label": "Descrição",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamCategoryGroup.description",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "badge",
        "category": "Exames laboratoriais — categorias",
        "label": "badge",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "LabExamCategoryGroup.badge",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "items",
        "category": "Exames laboratoriais — categorias",
        "label": "items",
        "description": "Campo obrigatório no tipo de dados; formato: LabExamItem[].",
        "example": "Lista de registros vinculados",
        "path": "LabExamCategoryGroup.items",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · LabExamItem[]"
      }
    ]
  },
  {
    "id": "InsuranceGuide",
    "title": "Guias de convênio",
    "description": "Referência extraída de src/types/index.ts, estrutura InsuranceGuide. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Guias de convênio",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "InsuranceGuide.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "guideNumber",
        "category": "Guias de convênio",
        "label": "guideNumber",
        "description": "Número da Guia TISS",
        "example": "Texto ilustrativo",
        "path": "InsuranceGuide.guideNumber",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "insuranceName",
        "category": "Guias de convênio",
        "label": "insuranceName",
        "description": "e.g. 'Unimed Odonto', 'Amil Dental', 'Bradesco Dental', 'SulAmérica', 'OdontoPrev'",
        "example": "Texto ilustrativo",
        "path": "InsuranceGuide.insuranceName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientName",
        "category": "Guias de convênio",
        "label": "patientName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InsuranceGuide.patientName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "procedureName",
        "category": "Guias de convênio",
        "label": "procedureName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InsuranceGuide.procedureName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "tussCode",
        "category": "Guias de convênio",
        "label": "tussCode",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InsuranceGuide.tussCode",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "submissionDate",
        "category": "Guias de convênio",
        "label": "submissionDate",
        "description": "YYYY-MM-DD",
        "example": "2026-10-20",
        "path": "InsuranceGuide.submissionDate",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "valueClaimed",
        "category": "Guias de convênio",
        "label": "valueClaimed",
        "description": "Valor Solicitado",
        "example": "0 (apenas exemplo de formato)",
        "path": "InsuranceGuide.valueClaimed",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "valueApproved",
        "category": "Guias de convênio",
        "label": "valueApproved",
        "description": "Valor Aprovado",
        "example": "0 (apenas exemplo de formato)",
        "path": "InsuranceGuide.valueApproved",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "disallowanceValue",
        "category": "Guias de convênio",
        "label": "disallowanceValue",
        "description": "Valor Glosado",
        "example": "0 (apenas exemplo de formato)",
        "path": "InsuranceGuide.disallowanceValue",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "status",
        "category": "Guias de convênio",
        "label": "Situação",
        "description": "Campo obrigatório no tipo de dados; formato: 'enviada' | 'aprovada' | 'glosada' | 'paga'.",
        "example": "",
        "path": "InsuranceGuide.status",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'enviada' | 'aprovada' | 'glosada' | 'paga'"
      },
      {
        "key": "disallowanceReason",
        "category": "Guias de convênio",
        "label": "disallowanceReason",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InsuranceGuide.disallowanceReason",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "notes",
        "category": "Guias de convênio",
        "label": "notes",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "InsuranceGuide.notes",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "CustomDocumentTemplate",
    "title": "Modelos de documentos",
    "description": "Referência extraída de src/types/index.ts, estrutura CustomDocumentTemplate. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Modelos de documentos",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "CustomDocumentTemplate.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "category",
        "category": "Modelos de documentos",
        "label": "Categoria",
        "description": "Campo obrigatório no tipo de dados; formato: 'declaracao' | 'atestado' | 'solicitacao' | 'receita' | 'termo' | 'outro'.",
        "example": "",
        "path": "CustomDocumentTemplate.category",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'declaracao' | 'atestado' | 'solicitacao' | 'receita' | 'termo' | 'outro'"
      },
      {
        "key": "title",
        "category": "Modelos de documentos",
        "label": "Título",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "CustomDocumentTemplate.title",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "subtitle",
        "category": "Modelos de documentos",
        "label": "subtitle",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "CustomDocumentTemplate.subtitle",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "description",
        "category": "Modelos de documentos",
        "label": "Descrição",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "CustomDocumentTemplate.description",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "templateText",
        "category": "Modelos de documentos",
        "label": "Texto do modelo",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "CustomDocumentTemplate.templateText",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "fieldReplacements",
        "category": "Modelos de documentos",
        "label": "fieldReplacements",
        "description": "Manual overrides for placeholders",
        "example": "",
        "path": "CustomDocumentTemplate.fieldReplacements",
        "status": "Definido no código atual",
        "note": "Opcional · Record<string, string>"
      },
      {
        "key": "updatedAt",
        "category": "Modelos de documentos",
        "label": "Data de atualização",
        "description": "Data e hora da última atualização.",
        "example": "2026-10-20",
        "path": "CustomDocumentTemplate.updatedAt",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "FinancialTransaction",
    "title": "Movimentações financeiras",
    "description": "Referência extraída de src/types/index.ts, estrutura FinancialTransaction. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Movimentações financeiras",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "FinancialTransaction.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "type",
        "category": "Movimentações financeiras",
        "label": "type",
        "description": "Campo obrigatório no tipo de dados; formato: 'receita' | 'despesa'.",
        "example": "",
        "path": "FinancialTransaction.type",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'receita' | 'despesa'"
      },
      {
        "key": "category",
        "category": "Movimentações financeiras",
        "label": "Categoria",
        "description": "Ex: 'Atendimento', 'Material', 'Aluguel', 'Salários', 'Comissões', 'Manutenção'",
        "example": "Texto ilustrativo",
        "path": "FinancialTransaction.category",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "description",
        "category": "Movimentações financeiras",
        "label": "Descrição",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "FinancialTransaction.description",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "amount",
        "category": "Movimentações financeiras",
        "label": "amount",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "FinancialTransaction.amount",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "date",
        "category": "Movimentações financeiras",
        "label": "Data",
        "description": "YYYY-MM-DD",
        "example": "2026-10-20",
        "path": "FinancialTransaction.date",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientId",
        "category": "Movimentações financeiras",
        "label": "Paciente",
        "description": "Vincula o registro ao paciente selecionado. Não selecionar automaticamente outro paciente.",
        "example": "Texto ilustrativo",
        "path": "FinancialTransaction.patientId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "clinicId",
        "category": "Movimentações financeiras",
        "label": "Clínica",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "FinancialTransaction.clinicId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "clinicName",
        "category": "Movimentações financeiras",
        "label": "clinicName",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "FinancialTransaction.clinicName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "paymentMethod",
        "category": "Movimentações financeiras",
        "label": "paymentMethod",
        "description": "Campo obrigatório no tipo de dados; formato: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'convenio'.",
        "example": "",
        "path": "FinancialTransaction.paymentMethod",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'convenio'"
      },
      {
        "key": "status",
        "category": "Movimentações financeiras",
        "label": "Situação",
        "description": "Campo obrigatório no tipo de dados; formato: 'pago' | 'pendente'.",
        "example": "",
        "path": "FinancialTransaction.status",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'pago' | 'pendente'"
      }
    ]
  },
  {
    "id": "Patient",
    "title": "Pacientes",
    "description": "Referência extraída de src/types/index.ts, estrutura Patient. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "modifiedBy",
        "category": "Pacientes",
        "label": "Autoria da alteração",
        "description": "Identificação da conta que realizou a alteração e a data do registro.",
        "example": "",
        "path": "Patient.modifiedBy",
        "status": "Definido no código atual",
        "note": "Opcional · {accountUid:string;professionalId:string;professionalName:string;at:string}"
      },
      {
        "key": "medicalExamDate",
        "category": "Pacientes",
        "label": "medicalExamDate",
        "description": "Campo opcional; formato: string.",
        "example": "2026-10-20",
        "path": "Patient.medicalExamDate",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "medicalVitalSigns",
        "category": "Pacientes",
        "label": "Sinais vitais do prontuário",
        "description": "Medições do prontuário médico. A reinicialização do rascunho preserva os exames arquivados.",
        "example": "",
        "path": "Patient.medicalVitalSigns",
        "status": "Definido no código atual",
        "note": "Opcional · ExamVitalSigns"
      },
      {
        "key": "clinicalReports",
        "category": "Pacientes",
        "label": "clinicalReports",
        "description": "Campo opcional; formato: ClinicalPanelReport[].",
        "example": "Lista de registros vinculados",
        "path": "Patient.clinicalReports",
        "status": "Definido no código atual",
        "note": "Opcional · ClinicalPanelReport[]"
      },
      {
        "key": "id",
        "category": "Pacientes",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "Patient.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "name",
        "category": "Pacientes",
        "label": "Nome",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.name",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "cpf",
        "category": "Pacientes",
        "label": "CPF",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.cpf",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "rg",
        "category": "Pacientes",
        "label": "rg",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.rg",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "birthDate",
        "category": "Pacientes",
        "label": "Data de nascimento",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "2026-10-20",
        "path": "Patient.birthDate",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "gender",
        "category": "Pacientes",
        "label": "gender",
        "description": "Campo obrigatório no tipo de dados; formato: Gender.",
        "example": "",
        "path": "Patient.gender",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · Gender"
      },
      {
        "key": "phone",
        "category": "Pacientes",
        "label": "Telefone",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.phone",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "email",
        "category": "Pacientes",
        "label": "E-mail",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.email",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "profession",
        "category": "Pacientes",
        "label": "profession",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.profession",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "ethnicity",
        "category": "Pacientes",
        "label": "ethnicity",
        "description": "Campo opcional; formato: 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena' | 'outra'.",
        "example": "",
        "path": "Patient.ethnicity",
        "status": "Definido no código atual",
        "note": "Opcional · 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena' | 'outra'"
      },
      {
        "key": "previousResidence",
        "category": "Pacientes",
        "label": "previousResidence",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.previousResidence",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "address",
        "category": "Pacientes",
        "label": "Endereço",
        "description": "Campo obrigatório no tipo de dados; formato: {\n    street: string;\n    number: string;\n    neighborhood: string;\n    city: string;\n    state: string;\n    cep: string;\n    complement?: string;\n  }.",
        "example": "",
        "path": "Patient.address",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · {\n    street: string;\n    number: string;\n    neighborhood: string;\n    city: string;\n    state: string;\n    cep: string;\n    complement?: string;\n  }"
      },
      {
        "key": "healthInsurance",
        "category": "Pacientes",
        "label": "Convênio",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.healthInsurance",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "insuranceNumber",
        "category": "Pacientes",
        "label": "Carteira do convênio",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.insuranceNumber",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "anamnesis",
        "category": "Pacientes",
        "label": "anamnesis",
        "description": "Campo obrigatório no tipo de dados; formato: Anamnesis.",
        "example": "",
        "path": "Patient.anamnesis",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · Anamnesis"
      },
      {
        "key": "status",
        "category": "Pacientes",
        "label": "Situação",
        "description": "Campo obrigatório no tipo de dados; formato: 'ativo' | 'inativo'.",
        "example": "",
        "path": "Patient.status",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'ativo' | 'inativo'"
      },
      {
        "key": "createdAt",
        "category": "Pacientes",
        "label": "Data de criação",
        "description": "Data e hora em que o registro foi criado.",
        "example": "Texto ilustrativo",
        "path": "Patient.createdAt",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "avatarUrl",
        "category": "Pacientes",
        "label": "avatarUrl",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.avatarUrl",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "photoUrl",
        "category": "Pacientes",
        "label": "photoUrl",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.photoUrl",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "files",
        "category": "Pacientes",
        "label": "Arquivos",
        "description": "Referências aos arquivos anexados ao paciente.",
        "example": "Lista de registros vinculados",
        "path": "Patient.files",
        "status": "Definido no código atual",
        "note": "Opcional · PatientFile[]"
      },
      {
        "key": "images",
        "category": "Pacientes",
        "label": "images",
        "description": "Galeria unificada de mídia do prontuário (radiografias, fotos clínicas, exames)",
        "example": "Lista de registros vinculados",
        "path": "Patient.images",
        "status": "Definido no código atual",
        "note": "Opcional · string[]"
      },
      {
        "key": "preferredClinicId",
        "category": "Pacientes",
        "label": "preferredClinicId",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.preferredClinicId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "preferredClinicName",
        "category": "Pacientes",
        "label": "preferredClinicName",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.preferredClinicName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "preferredDentistName",
        "category": "Pacientes",
        "label": "preferredDentistName",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Patient.preferredDentistName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "PatientPayment",
    "title": "Pagamentos do paciente",
    "description": "Referência extraída de src/types/index.ts, estrutura PatientPayment. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Pagamentos do paciente",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "PatientPayment.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientId",
        "category": "Pagamentos do paciente",
        "label": "Paciente",
        "description": "Vincula o registro ao paciente selecionado. Não selecionar automaticamente outro paciente.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.patientId",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientName",
        "category": "Pagamentos do paciente",
        "label": "patientName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.patientName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "date",
        "category": "Pagamentos do paciente",
        "label": "Data",
        "description": "YYYY-MM-DD",
        "example": "2026-10-20",
        "path": "PatientPayment.date",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "amount",
        "category": "Pagamentos do paciente",
        "label": "amount",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "PatientPayment.amount",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "paymentMethod",
        "category": "Pagamentos do paciente",
        "label": "paymentMethod",
        "description": "Campo obrigatório no tipo de dados; formato: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'convenio'.",
        "example": "",
        "path": "PatientPayment.paymentMethod",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'convenio'"
      },
      {
        "key": "description",
        "category": "Pagamentos do paciente",
        "label": "Descrição",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.description",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "treatmentPlanId",
        "category": "Pagamentos do paciente",
        "label": "treatmentPlanId",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.treatmentPlanId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "treatmentPlanTitle",
        "category": "Pagamentos do paciente",
        "label": "treatmentPlanTitle",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.treatmentPlanTitle",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "receiptNumber",
        "category": "Pagamentos do paciente",
        "label": "receiptNumber",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.receiptNumber",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "clinicId",
        "category": "Pagamentos do paciente",
        "label": "Clínica",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.clinicId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "clinicName",
        "category": "Pagamentos do paciente",
        "label": "clinicName",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.clinicName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "notes",
        "category": "Pagamentos do paciente",
        "label": "notes",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "PatientPayment.notes",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  },
  {
    "id": "TreatmentPlan",
    "title": "Planos de tratamento",
    "description": "Referência extraída de src/types/index.ts, estrutura TreatmentPlan. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "modifiedBy",
        "category": "Planos de tratamento",
        "label": "Autoria da alteração",
        "description": "Identificação da conta que realizou a alteração e a data do registro.",
        "example": "",
        "path": "TreatmentPlan.modifiedBy",
        "status": "Definido no código atual",
        "note": "Opcional · {accountUid:string;professionalId:string;professionalName:string;at:string}"
      },
      {
        "key": "id",
        "category": "Planos de tratamento",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "TreatmentPlan.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientId",
        "category": "Planos de tratamento",
        "label": "Paciente",
        "description": "Vincula o registro ao paciente selecionado. Não selecionar automaticamente outro paciente.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.patientId",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "patientName",
        "category": "Planos de tratamento",
        "label": "patientName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.patientName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "title",
        "category": "Planos de tratamento",
        "label": "Título",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.title",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "date",
        "category": "Planos de tratamento",
        "label": "Data",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "2026-10-20",
        "path": "TreatmentPlan.date",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "dentistName",
        "category": "Planos de tratamento",
        "label": "dentistName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.dentistName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "clinicId",
        "category": "Planos de tratamento",
        "label": "Clínica",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.clinicId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "clinicName",
        "category": "Planos de tratamento",
        "label": "clinicName",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.clinicName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "priceTableId",
        "category": "Planos de tratamento",
        "label": "Convênio / tabela de preços",
        "description": "Identifica a tabela de preços aplicada ao plano.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.priceTableId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "priceTableName",
        "category": "Planos de tratamento",
        "label": "priceTableName",
        "description": "e.g. 'Particular', 'Convênio 1', 'Convênio 2'",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.priceTableName",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "status",
        "category": "Planos de tratamento",
        "label": "Situação",
        "description": "Campo obrigatório no tipo de dados; formato: TreatmentPlanStatus.",
        "example": "",
        "path": "TreatmentPlan.status",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · TreatmentPlanStatus"
      },
      {
        "key": "items",
        "category": "Planos de tratamento",
        "label": "items",
        "description": "Campo obrigatório no tipo de dados; formato: TreatmentPlanItem[].",
        "example": "Lista de registros vinculados",
        "path": "TreatmentPlan.items",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · TreatmentPlanItem[]"
      },
      {
        "key": "totalValue",
        "category": "Planos de tratamento",
        "label": "totalValue",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "TreatmentPlan.totalValue",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "discountValue",
        "category": "Planos de tratamento",
        "label": "discountValue",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "TreatmentPlan.discountValue",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "finalValue",
        "category": "Planos de tratamento",
        "label": "finalValue",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "TreatmentPlan.finalValue",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "paymentConditions",
        "category": "Planos de tratamento",
        "label": "paymentConditions",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.paymentConditions",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "notes",
        "category": "Planos de tratamento",
        "label": "notes",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.notes",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "consentAccepted",
        "category": "Planos de tratamento",
        "label": "consentAccepted",
        "description": "Campo opcional; formato: boolean.",
        "example": "true / false",
        "path": "TreatmentPlan.consentAccepted",
        "status": "Definido no código atual",
        "note": "Opcional · boolean"
      },
      {
        "key": "consentAcceptedAt",
        "category": "Planos de tratamento",
        "label": "consentAcceptedAt",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.consentAcceptedAt",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "consentSignatureType",
        "category": "Planos de tratamento",
        "label": "consentSignatureType",
        "description": "Campo opcional; formato: 'digital' | 'manual_upload' | 'presencial'.",
        "example": "",
        "path": "TreatmentPlan.consentSignatureType",
        "status": "Definido no código atual",
        "note": "Opcional · 'digital' | 'manual_upload' | 'presencial'"
      },
      {
        "key": "consentSignedDocumentUrl",
        "category": "Planos de tratamento",
        "label": "consentSignedDocumentUrl",
        "description": "Attached photo / document with patient signature",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.consentSignedDocumentUrl",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "consentAttachments",
        "category": "Planos de tratamento",
        "label": "consentAttachments",
        "description": "Campo opcional; formato: TreatmentConsentAttachment[].",
        "example": "Lista de registros vinculados",
        "path": "TreatmentPlan.consentAttachments",
        "status": "Definido no código atual",
        "note": "Opcional · TreatmentConsentAttachment[]"
      },
      {
        "key": "consentSelectedOptionTitle",
        "category": "Planos de tratamento",
        "label": "consentSelectedOptionTitle",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlan.consentSelectedOptionTitle",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "consentFinancialSummary",
        "category": "Planos de tratamento",
        "label": "consentFinancialSummary",
        "description": "Campo opcional; formato: {\n    totalBudget: number;\n    discount: number;\n    finalAgreed: number;\n    paymentMethod: string;\n    installments?: number;\n    installmentValue?: number;\n    notes?: string;\n  }.",
        "example": "",
        "path": "TreatmentPlan.consentFinancialSummary",
        "status": "Definido no código atual",
        "note": "Opcional · {\n    totalBudget: number;\n    discount: number;\n    finalAgreed: number;\n    paymentMethod: string;\n    installments?: number;\n    installmentValue?: number;\n    notes?: string;\n  }"
      }
    ]
  },
  {
    "id": "TreatmentPlanItem",
    "title": "Procedimentos do paciente",
    "description": "Referência extraída de src/types/index.ts, estrutura TreatmentPlanItem. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "encounterParameters",
        "category": "Procedimentos do paciente",
        "label": "encounterParameters",
        "description": "Campo opcional; formato: Record<string,string>.",
        "example": "",
        "path": "TreatmentPlanItem.encounterParameters",
        "status": "Definido no código atual",
        "note": "Opcional · Record<string,string>"
      },
      {
        "key": "id",
        "category": "Procedimentos do paciente",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "TreatmentPlanItem.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "tussCode",
        "category": "Procedimentos do paciente",
        "label": "tussCode",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlanItem.tussCode",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "procedureName",
        "category": "Procedimentos do paciente",
        "label": "procedureName",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlanItem.procedureName",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "specialty",
        "category": "Procedimentos do paciente",
        "label": "Especialidade",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlanItem.specialty",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "toothNumber",
        "category": "Procedimentos do paciente",
        "label": "toothNumber",
        "description": "Campo opcional; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "TreatmentPlanItem.toothNumber",
        "status": "Definido no código atual",
        "note": "Opcional · number"
      },
      {
        "key": "toothSurface",
        "category": "Procedimentos do paciente",
        "label": "toothSurface",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlanItem.toothSurface",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "regionCode",
        "category": "Procedimentos do paciente",
        "label": "regionCode",
        "description": "e.g. 'RMSD', 'S1', 'MJ', 'HAID'",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlanItem.regionCode",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "regionDescription",
        "category": "Procedimentos do paciente",
        "label": "regionDescription",
        "description": "e.g. 'Região Molar Superior Direito (18/17/16)'",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlanItem.regionDescription",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "cost",
        "category": "Procedimentos do paciente",
        "label": "cost",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "TreatmentPlanItem.cost",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "discountPercentage",
        "category": "Procedimentos do paciente",
        "label": "discountPercentage",
        "description": "Campo opcional; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "TreatmentPlanItem.discountPercentage",
        "status": "Definido no código atual",
        "note": "Opcional · number"
      },
      {
        "key": "finalCost",
        "category": "Procedimentos do paciente",
        "label": "finalCost",
        "description": "Campo obrigatório no tipo de dados; formato: number.",
        "example": "0 (apenas exemplo de formato)",
        "path": "TreatmentPlanItem.finalCost",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · number"
      },
      {
        "key": "notes",
        "category": "Procedimentos do paciente",
        "label": "notes",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlanItem.notes",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "fullProcedureDetails",
        "category": "Procedimentos do paciente",
        "label": "fullProcedureDetails",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "TreatmentPlanItem.fullProcedureDetails",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "status",
        "category": "Procedimentos do paciente",
        "label": "Situação",
        "description": "Campo obrigatório no tipo de dados; formato: 'pendente' | 'em_andamento' | 'concluido'.",
        "example": "",
        "path": "TreatmentPlanItem.status",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · 'pendente' | 'em_andamento' | 'concluido'"
      },
      {
        "key": "selectedForPlan",
        "category": "Procedimentos do paciente",
        "label": "selectedForPlan",
        "description": "Whether the patient/dentist chose this option in the final plan",
        "example": "true / false",
        "path": "TreatmentPlanItem.selectedForPlan",
        "status": "Definido no código atual",
        "note": "Opcional · boolean"
      },
      {
        "key": "alternativeOptions",
        "category": "Procedimentos do paciente",
        "label": "alternativeOptions",
        "description": "Alternative treatment options considered",
        "example": "Lista de registros vinculados",
        "path": "TreatmentPlanItem.alternativeOptions",
        "status": "Definido no código atual",
        "note": "Opcional · string[]"
      }
    ]
  },
  {
    "id": "Professional",
    "title": "Profissionais",
    "description": "Referência extraída de src/types/index.ts, estrutura Professional. A declaração de um campo não comprova validação ou automação de todo o fluxo.",
    "fields": [
      {
        "key": "id",
        "category": "Profissionais",
        "label": "Identificador",
        "description": "Identificador usado para localizar o registro e estabelecer vínculos. Não usar o nome como chave.",
        "example": "registro-exemplo-001",
        "path": "Professional.id",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "name",
        "category": "Profissionais",
        "label": "Nome",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.name",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "cro",
        "category": "Profissionais",
        "label": "CRO",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.cro",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "specialty",
        "category": "Profissionais",
        "label": "Especialidade",
        "description": "Campo obrigatório no tipo de dados; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.specialty",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string"
      },
      {
        "key": "clinicIds",
        "category": "Profissionais",
        "label": "clinicIds",
        "description": "Clinics where this professional is available",
        "example": "Lista de registros vinculados",
        "path": "Professional.clinicIds",
        "status": "Definido no código atual",
        "note": "Obrigatório no tipo · string[]"
      },
      {
        "key": "primaryClinicId",
        "category": "Profissionais",
        "label": "primaryClinicId",
        "description": "Clínica principal onde trabalha",
        "example": "Texto ilustrativo",
        "path": "Professional.primaryClinicId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "password",
        "category": "Profissionais",
        "label": "password",
        "description": "Senha de acesso do profissional para troca de perfil",
        "example": "Texto ilustrativo",
        "path": "Professional.password",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "userId",
        "category": "Profissionais",
        "label": "userId",
        "description": "ID do usuário vinculado no sistema de permissões",
        "example": "Texto ilustrativo",
        "path": "Professional.userId",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "cpf",
        "category": "Profissionais",
        "label": "CPF",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.cpf",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "phone",
        "category": "Profissionais",
        "label": "Telefone",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.phone",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "email",
        "category": "Profissionais",
        "label": "E-mail",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.email",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "address",
        "category": "Profissionais",
        "label": "Endereço",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.address",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "city",
        "category": "Profissionais",
        "label": "city",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.city",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "cep",
        "category": "Profissionais",
        "label": "cep",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.cep",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "street",
        "category": "Profissionais",
        "label": "street",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.street",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "number",
        "category": "Profissionais",
        "label": "number",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.number",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "complement",
        "category": "Profissionais",
        "label": "complement",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.complement",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "neighborhood",
        "category": "Profissionais",
        "label": "neighborhood",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.neighborhood",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "state",
        "category": "Profissionais",
        "label": "state",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.state",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "croNumber",
        "category": "Profissionais",
        "label": "croNumber",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.croNumber",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "croUf",
        "category": "Profissionais",
        "label": "croUf",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.croUf",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "stampImageUrl",
        "category": "Profissionais",
        "label": "stampImageUrl",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.stampImageUrl",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      },
      {
        "key": "signatureImageUrl",
        "category": "Profissionais",
        "label": "signatureImageUrl",
        "description": "Campo opcional; formato: string.",
        "example": "Texto ilustrativo",
        "path": "Professional.signatureImageUrl",
        "status": "Definido no código atual",
        "note": "Opcional · string"
      }
    ]
  }
];
