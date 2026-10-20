export type UserRole = 'admin' | 'dentist' | 'receptionist';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  cro?: string;
  specialty?: string;
  phone?: string;
  activeClinicId?: string;
  password?: string; // Senha cadastrada do usuário/profissional
  professionalId?: string; // ID do profissional correspondente em professionals (ex: prof-hugo)
  createdAt?: string;
  updatedAt?: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, { label: string; description: string; allowedTabs: string[]; canManageSettings: boolean; canViewFinancial: boolean; canManageUsers: boolean }> = {
  admin: {
    label: 'Administrador(a)',
    description: 'Acesso irrestrito a todos os módulos, parâmetros do sistema, finanças e gestão de usuários.',
    allowedTabs: ['dashboard', 'pacientes', 'agendamento', 'relatorios', 'documentos', 'laudos', 'triagem', 'exame_clinico', 'odontograma', 'estoque', 'financeiro', 'configuracoes'],
    canManageSettings: true,
    canViewFinancial: true,
    canManageUsers: true
  },
  dentist: {
    label: 'Dentista / Profissional',
    description: 'Acesso a atendimento clínico, agenda, pacientes, exames, evolução e documentos.',
    allowedTabs: ['dashboard', 'pacientes', 'agendamento', 'relatorios', 'documentos', 'laudos', 'triagem', 'exame_clinico', 'odontograma', 'estoque'],
    canManageSettings: false,
    canViewFinancial: false,
    canManageUsers: false
  },
  receptionist: {
    label: 'Recepcionista / Atendente',
    description: 'Acesso à gestão de agenda, cadastro de pacientes, envio de WhatsApp e recepção.',
    allowedTabs: ['pacientes', 'agendamento'],
    canManageSettings: false,
    canViewFinancial: false,
    canManageUsers: false
  }
};
