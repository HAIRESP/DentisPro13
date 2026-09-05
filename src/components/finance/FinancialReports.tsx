import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialTransaction, DentistCommissionRecord, InsuranceGuide } from '../../types';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Calendar, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  CreditCard,
  QrCode,
  FileSpreadsheet,
  Printer,
  Award,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  Building2,
  Percent,
  X,
  Search,
  Check,
  FlaskConical,
  Trash2,
  FolderSearch,
  FolderTree,
  FileCode,
  Folder,
  Copy,
  Terminal,
  Download,
  Sparkles,
  Upload
} from 'lucide-react';

export interface LabOrder {
  id: string;
  patientName: string;
  labName: string;
  serviceType: string;
  category: 'protese' | 'analises_clinicas';
  toothOrRegion?: string;
  sendDate: string;
  dueDate: string;
  cost: number;
  status: 'pendente' | 'em_producao' | 'enviado_lab' | 'recebido_protese' | 'concluido';
  notes?: string;
}

import { getThemeStyles } from '../../utils/themeUtils';

export interface ExtractedTxtRecord {
  id: string;
  folderPath: string;
  fileName: string;
  paciente: string;
  convenio: string;
  guia: string;
  carteira: string;
  procedimento: string;
  valor: string;
  data: string;
  status: string;
  rawText: string;
}

export const FinancialReports: React.FC = () => {
  const { 
    financials, 
    addTransaction, 
    deleteTransaction, 
    patients,
    professionals,
    commissions,
    addCommission,
    payCommission,
    insuranceGuides,
    addInsuranceGuide,
    updateInsuranceGuideStatus,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  const [activeSubTab, setActiveSubTab] = useState<'fluxo_caixa' | 'dre' | 'comissoes' | 'convenios' | 'laboratorios'>('fluxo_caixa');

  // --- LABORATÓRIOS & ANÁLISES CLÍNICAS STATES ---
  const [labOrders, setLabOrders] = useState<LabOrder[]>([
    {
      id: 'lab-1',
      patientName: 'Vitória Bernardo Lacerda',
      labName: 'Lab Prótese Elite Fortaleza',
      serviceType: 'Coroa em Zircônia Anatômica',
      category: 'protese',
      toothOrRegion: 'Dente 11',
      sendDate: '2026-05-02',
      dueDate: '2026-05-12',
      cost: 480.00,
      status: 'recebido_protese',
      notes: 'Cor A2 com caracterização cervical'
    },
    {
      id: 'lab-2',
      patientName: 'Carlos Eduardo Bezerra',
      labName: 'Laboratório BioLab de Análises Clínicas',
      serviceType: 'Exame Histopatológico (Biópsia)',
      category: 'analises_clinicas',
      toothOrRegion: 'Lesão Mucosa Gengival',
      sendDate: '2026-05-04',
      dueDate: '2026-05-14',
      cost: 220.00,
      status: 'em_producao',
      notes: 'Suspeita de líquen plano oral'
    },
    {
      id: 'lab-3',
      patientName: 'Ana Paula Vasconcelos',
      labName: 'Prótese Dental Master',
      serviceType: 'Prótese Total Flexível Superior',
      category: 'protese',
      toothOrRegion: 'Arcada Superior',
      sendDate: '2026-05-05',
      dueDate: '2026-05-18',
      cost: 650.00,
      status: 'enviado_lab',
      notes: 'Dentes gengivados resina trilux'
    }
  ]);

  const [isNewLabModalOpen, setIsNewLabModalOpen] = useState(false);
  const [labPatientName, setLabPatientName] = useState('');
  const [labName, setLabName] = useState('');
  const [labServiceType, setLabServiceType] = useState('');
  const [labCategory, setLabCategory] = useState<'protese' | 'analises_clinicas'>('protese');
  const [labTooth, setLabTooth] = useState('');
  const [labSendDate, setLabSendDate] = useState(new Date().toISOString().split('T')[0]);
  const [labDueDate, setLabDueDate] = useState('');
  const [labCost, setLabCost] = useState('');
  const [labNotes, setLabNotes] = useState('');
  const [labFilterCategory, setLabFilterCategory] = useState<'todos' | 'protese' | 'analises_clinicas'>('todos');
  const [labFilterStatus, setLabFilterStatus] = useState<string>('todos');

  // --- FLUXO DE CAIXA STATES ---
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [type, setType] = useState<'receita' | 'despesa'>('receita');
  const [category, setCategory] = useState('Atendimento Clínico');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<FinancialTransaction['paymentMethod']>('pix');
  const [patientId, setPatientId] = useState('');

  // --- COMISSÕES STATES ---
  const [isNewCommModalOpen, setIsNewCommModalOpen] = useState(false);
  const [commProfId, setCommProfId] = useState('');
  const [commPatientName, setCommPatientName] = useState('');
  const [commProcedure, setCommProcedure] = useState('');
  const [commValue, setCommValue] = useState('');
  const [commRate, setCommRate] = useState('50');
  const [commFilterProf, setCommFilterProf] = useState('todos');

  // --- CONVÊNIOS STATES ---
  const [isNewGuideModalOpen, setIsNewGuideModalOpen] = useState(false);
  const [guideNumber, setGuideNumber] = useState('');
  const [insuranceName, setInsuranceName] = useState('Amil Dental');
  const [guidePatientName, setGuidePatientName] = useState('');
  const [guideProcedure, setGuideProcedure] = useState('');
  const [guideTussCode, setGuideTussCode] = useState('');
  const [guideValueClaimed, setGuideValueClaimed] = useState('');
  const [guideFilterInsurance, setGuideFilterInsurance] = useState('todos');

  // --- EXTRATOR RECURSIVO D:\CONVÊNIOS STATES ---
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isExtratorModalOpen, setIsExtratorModalOpen] = useState(false);
  const [extractedRecords, setExtractedRecords] = useState<ExtractedTxtRecord[]>([
    {
      id: 'ext-demo-1',
      folderPath: 'D:\\Convênios\\Amil\\Paciente_Lacerda',
      fileName: 'Dados.txt',
      paciente: 'Vitória Bernardo Lacerda',
      convenio: 'Amil Dental',
      guia: 'TISS-982410',
      carteira: '8821940129',
      procedimento: 'Limpeza e Profilaxia',
      valor: '180,00',
      data: '2026-05-02',
      status: 'Aprovado',
      rawText: 'Paciente: Vitória Bernardo Lacerda\nGuia: TISS-982410\nConvenio: Amil Dental\nCarteira: 8821940129\nProcedimento: Limpeza e Profilaxia\nValor: 180.00\nData: 02/05/2026\nStatus: Aprovado'
    },
    {
      id: 'ext-demo-2',
      folderPath: 'D:\\Convênios\\Unimed\\Maio2026\\Bezerra',
      fileName: 'Dados.txt',
      paciente: 'Carlos Eduardo Bezerra',
      convenio: 'Unimed Odonto',
      guia: 'TISS-774102',
      carteira: '3301928410',
      procedimento: 'Restauração de Resina Fotopolimerizável',
      valor: '350,00',
      data: '2026-05-04',
      status: 'Em Análise',
      rawText: 'Paciente: Carlos Eduardo Bezerra\nGuia: TISS-774102\nConvenio: Unimed Odonto\nCarteira: 3301928410\nProcedimento: Restauração de Resina Fotopolimerizável\nValor: 350.00\nData: 04/05/2026\nStatus: Em Análise'
    }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerLog, setScannerLog] = useState<string>('Selecione a pasta D:\\Convênios para escanear automaticamente todas as subpastas em busca dos arquivos Dados.txt.');
  const [activeExtratorTab, setActiveExtratorTab] = useState<'scan' | 'python_script'>('scan');

  const parseDadosTxt = (text: string, folderPath: string, fileName: string): ExtractedTxtRecord => {
    const lines = text.split(/\r?\n/);
    let paciente = '';
    let convenio = '';
    let guia = '';
    let carteira = '';
    let procedimento = '';
    let valor = '';
    let data = '';
    let status = 'Pendente';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const lower = trimmed.toLowerCase();
      if (lower.startsWith('paciente:') || lower.startsWith('nome:')) {
        paciente = trimmed.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('convenio:') || lower.startsWith('convênio:') || lower.startsWith('plano:')) {
        convenio = trimmed.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('guia:') || lower.startsWith('nº guia:') || lower.startsWith('numero guia:')) {
        guia = trimmed.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('carteira:') || lower.startsWith('matricula:') || lower.startsWith('matrícula:')) {
        carteira = trimmed.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('procedimento:') || lower.startsWith('servico:') || lower.startsWith('serviço:')) {
        procedimento = trimmed.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('valor:') || lower.startsWith('preco:') || lower.startsWith('preço:')) {
        valor = trimmed.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('data:')) {
        data = trimmed.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('status:')) {
        status = trimmed.split(':')[1]?.trim() || '';
      } else if (trimmed.includes(';') || trimmed.includes(',')) {
        const parts = trimmed.split(/[;,]/);
        if (parts.length >= 2 && !paciente) paciente = parts[0].trim();
        if (parts.length >= 3 && !guia) guia = parts[1].trim();
        if (parts.length >= 4 && !valor) valor = parts[2].trim();
      }
    });

    if (!paciente && lines.length > 0) paciente = lines[0].replace(/.*:/, '').trim() || 'Desconhecido';
    if (!guia) {
      const match = text.match(/\b\d{5,12}\b/);
      if (match) guia = match[0];
    }
    if (!valor) {
      const matchVal = text.match(/R\$\s*[\d.,]+|[\d.,]+\s*R\$/i);
      if (matchVal) valor = matchVal[0];
    }

    return {
      id: `ext-${Math.random().toString(36).substring(2, 9)}`,
      folderPath: folderPath || 'D:\\Convênios',
      fileName,
      paciente: paciente || 'Paciente Não Identificado',
      convenio: convenio || 'Convênio Não Informado',
      guia: guia || `GUI-${Math.floor(100000 + Math.random() * 900000)}`,
      carteira: carteira || 'N/A',
      procedimento: procedimento || 'Atendimento Odontológico',
      valor: valor || '0,00',
      data: data || new Date().toLocaleDateString('pt-BR'),
      status: status || 'Pendente',
      rawText: text
    };
  };

  const handleFolderScanSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setScannerLog('Acessando diretórios e subpastas do diretório selecionado...');

    const newRecords: ExtractedTxtRecord[] = [];
    let txtCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase() === 'dados.txt' || file.name.toLowerCase().endsWith('dados.txt')) {
        txtCount++;
        try {
          const text = await file.text();
          const relPath = file.webkitRelativePath ? `D:\\${file.webkitRelativePath.replace(/\//g, '\\')}` : `D:\\Convênios\\${file.name}`;
          const parsed = parseDadosTxt(text, relPath, file.name);
          newRecords.push(parsed);
        } catch (err) {
          console.error('Erro ao ler arquivo:', file.name, err);
        }
      }
    }

    setIsScanning(false);
    if (txtCount > 0) {
      setExtractedRecords(newRecords);
      setScannerLog(`✔ Sucesso! Encontrados e extraídos ${txtCount} arquivo(s) "Dados.txt". Dados convertidos em CSV.`);
    } else {
      setScannerLog(`⚠ NENHUM arquivo chamado "Dados.txt" foi encontrado nas subpastas selecionadas. Verifique se os arquivos na pasta D:\\Convênios se chamam "Dados.txt".`);
    }
  };

  const exportExtractedToCSV = () => {
    if (extractedRecords.length === 0) return;

    const headers = [
      'ID',
      'Caminho_da_Pasta',
      'Nome_do_Arquivo',
      'Paciente',
      'Convenio',
      'Guia_TISS',
      'Carteira',
      'Procedimento',
      'Valor_R$',
      'Data',
      'Status',
      'Texto_Bruto'
    ];

    const csvRows = [
      headers.join(';'),
      ...extractedRecords.map(r => [
        `"${r.id}"`,
        `"${r.folderPath.replace(/"/g, '""')}"`,
        `"${r.fileName.replace(/"/g, '""')}"`,
        `"${r.paciente.replace(/"/g, '""')}"`,
        `"${r.convenio.replace(/"/g, '""')}"`,
        `"${r.guia.replace(/"/g, '""')}"`,
        `"${r.carteira.replace(/"/g, '""')}"`,
        `"${r.procedimento.replace(/"/g, '""')}"`,
        `"${r.valor.replace(/"/g, '""')}"`,
        `"${r.data.replace(/"/g, '""')}"`,
        `"${r.status.replace(/"/g, '""')}"`,
        `"${r.rawText.replace(/\r?\n/g, ' | ').replace(/"/g, '""')}"`
      ].join(';'))
    ];

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Banco_Dados_Convenios_Extraidos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importExtractedToSystemGuides = () => {
    if (extractedRecords.length === 0) return;
    let count = 0;
    extractedRecords.forEach(r => {
      const valNum = parseFloat(r.valor.replace(/[^\d.,]/g, '').replace(',', '.')) || 150.0;
      addInsuranceGuide({
        guideNumber: r.guia || `GUI-${Math.floor(Math.random() * 900000)}`,
        insuranceName: r.convenio || 'Amil Dental',
        patientName: r.paciente,
        procedureName: r.procedimento,
        valueClaimed: valNum,
        submissionDate: r.data || new Date().toISOString().split('T')[0],
        status: 'enviada',
        disallowanceValue: 0
      });
      count++;
    });
    alert(`✅ ${count} guia(s) extraída(s) foram importadas com sucesso para a Gestão de Convênios do DentisPro!`);
  };

  const downloadPythonScript = () => {
    const pyCode = `# ==============================================================================
# EXTRATOR RECURSIVO DE ARQUIVOS 'Dados.txt' PARA BANCO DE DADOS CSV
# Diretorio Base: D:\\Convenios
# ==============================================================================
import os
import csv
import re

ROOT_DIR = r"D:\\Convenios"
OUTPUT_CSV = r"D:\\Convenios\\Banco_Dados_Convenios.csv"

def parse_dados_file(filepath):
    data = {
        "Caminho_Pasta": os.path.dirname(filepath),
        "Nome_Arquivo": os.path.basename(filepath),
        "Paciente": "",
        "Convenio": "",
        "Guia_TISS": "",
        "Carteira": "",
        "Procedimento": "",
        "Valor": "",
        "Data": "",
        "Status": "Pendente",
        "Conteudo_Bruto": ""
    }
    
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
            data["Conteudo_Bruto"] = " | ".join([l.strip() for l in lines if l.strip()])
            
            for line in lines:
                l = line.strip()
                if not l:
                    continue
                lower = l.lower()
                if lower.startswith("paciente:") or lower.startswith("nome:"):
                    data["Paciente"] = l.split(":", 1)[1].strip()
                elif lower.startswith("convenio:") or lower.startswith("convênio:") or lower.startswith("plano:"):
                    data["Convenio"] = l.split(":", 1)[1].strip()
                elif lower.startswith("guia:") or lower.startswith("nº guia:"):
                    data["Guia_TISS"] = l.split(":", 1)[1].strip()
                elif lower.startswith("carteira:") or lower.startswith("matricula:"):
                    data["Carteira"] = l.split(":", 1)[1].strip()
                elif lower.startswith("procedimento:") or lower.startswith("servico:"):
                    data["Procedimento"] = l.split(":", 1)[1].strip()
                elif lower.startswith("valor:") or lower.startswith("preco:"):
                    data["Valor"] = l.split(":", 1)[1].strip()
                elif lower.startswith("data:"):
                    data["Data"] = l.split(":", 1)[1].strip()
                elif lower.startswith("status:"):
                    data["Status"] = l.split(":", 1)[1].strip()

    except Exception as e:
        print(f"Erro ao abrir {filepath}: {e}")
        
    return data

def main():
    print("================================================================")
    print(f"=== INICIANDO VARREDURA RECURSIVA EM: {ROOT_DIR} ===")
    print("================================================================")
    records = []
    
    if not os.path.exists(ROOT_DIR):
        print(f"ERRO: O diretorio {ROOT_DIR} nao foi encontrado no Windows.")
        input("Pressione ENTER para sair...")
        return

    for root, dirs, files in os.walk(ROOT_DIR):
        for filename in files:
            if filename.lower() == "dados.txt":
                full_path = os.path.join(root, filename)
                print(f"[+] Lendo: {full_path}")
                rec = parse_dados_file(full_path)
                records.append(rec)

    if not records:
        print("Nenhum arquivo 'Dados.txt' foi localizado nas subpastas.")
        input("Pressione ENTER para sair...")
        return

    fieldnames = list(records[0].keys())
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        writer.writerows(records)

    print(f"\\n✅ SUCESSO! {len(records)} arquivos extraidos com sucesso.")
    print(f"📁 Banco de Dados CSV gerado em: {OUTPUT_CSV}")
    input("\\nPressione ENTER para finalizar...")

if __name__ == "__main__":
    main()
`;

    const blob = new Blob([pyCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extrator_convenios.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadBatLauncher = () => {
    const batCode = `@echo off
chcp 65001 > nul
title Extrator de Dados.txt - D:\\Convenios
echo =========================================================
echo EXTRATOR RECURSIVO D:\\CONVENIOS (Dados.txt -> CSV)
echo =========================================================
python extrator_convenios.py
pause
`;
    const blob = new Blob([batCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'executar_extracao.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculations for Fluxo de Caixa
  const totalReceita = financials.filter(f => f.type === 'receita' && f.status === 'pago').reduce((a, c) => a + c.amount, 0);
  const totalDespesa = financials.filter(f => f.type === 'despesa' && f.status === 'pago').reduce((a, c) => a + c.amount, 0);
  const lucroLiquido = totalReceita - totalDespesa;

  // Breakdown by payment method
  const paymentBreakdown = financials.filter(f => f.type === 'receita' && f.status === 'pago').reduce((acc, f) => {
    acc[f.paymentMethod] = (acc[f.paymentMethod] || 0) + f.amount;
    return acc;
  }, {} as Record<string, number>);

  const filteredFinancials = financials.filter(f => {
    if (filterType === 'receita') return f.type === 'receita';
    if (filterType === 'despesa') return f.type === 'despesa';
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- DRE CALCULATIONS ---
  const receitaBruta = totalReceita;
  const impostosETaxas = receitaBruta * 0.08; // Estimativa Simples Nacional (6%) + Taxas de Cartão (2%)
  const receitaLiquida = receitaBruta - impostosETaxas;
  
  // Custos Diretos de Materiais e Insumos
  const custosMateriais = financials
    .filter(f => f.type === 'despesa' && (f.category.toLowerCase().includes('material') || f.category.toLowerCase().includes('estoque') || f.category.toLowerCase().includes('laboratório')))
    .reduce((a, c) => a + c.amount, 0);
  
  const lucroBruto = receitaLiquida - custosMateriais;
  const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

  // Comissões Pagas a Dentistas
  const comissoesPagas = commissions
    .filter(c => c.status === 'pago')
    .reduce((a, c) => a + c.commissionAmount, 0);

  // Despesas Operacionais Fixas
  const despesasOperacionais = totalDespesa - custosMateriais;
  const lucroOperacionalDRE = lucroBruto - comissoesPagas - despesasOperacionais;
  const margemLiquidaPct = receitaBruta > 0 ? (lucroOperacionalDRE / receitaBruta) * 100 : 0;

  // --- COMISSÕES CALCULATIONS ---
  const totalComissoesPendente = commissions
    .filter(c => c.status === 'pendente')
    .reduce((a, c) => a + c.commissionAmount, 0);
  
  const totalComissoesPagasAcc = commissions
    .filter(c => c.status === 'pago')
    .reduce((a, c) => a + c.commissionAmount, 0);

  const filteredCommissions = commissions.filter(c => {
    if (commFilterProf !== 'todos' && c.professionalId !== commFilterProf) return false;
    return true;
  });

  // --- CONVÊNIOS CALCULATIONS ---
  const totalGuiasValorClaimed = insuranceGuides.reduce((a, g) => a + g.valueClaimed, 0);
  const totalGuiasValorApproved = insuranceGuides.filter(g => g.status === 'aprovada' || g.status === 'paga').reduce((a, g) => a + g.valueApproved, 0);
  const totalGlosasValor = insuranceGuides.reduce((a, g) => a + g.disallowanceValue, 0);

  const filteredInsuranceGuides = insuranceGuides.filter(g => {
    if (guideFilterInsurance !== 'todos' && g.insuranceName.toLowerCase() !== guideFilterInsurance.toLowerCase()) return false;
    return true;
  });

  // Handlers
  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addTransaction({
      type,
      category,
      description,
      amount: parseFloat(amount) || 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      patientId: patientId || undefined,
      status: 'pago'
    });

    setDescription('');
    setAmount('');
    setIsNewTxModalOpen(false);
  };

  const handleAddCommissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commProfId || !commPatientName || !commProcedure || !commValue) return;

    const prof = professionals.find(p => p.id === commProfId);
    const procVal = parseFloat(commValue) || 0;
    const rate = parseFloat(commRate) || 50;
    const commAmt = (procVal * rate) / 100;

    addCommission({
      professionalId: commProfId,
      professionalName: prof ? prof.name : 'Cirurgião-Dentista',
      patientName: commPatientName,
      procedureName: commProcedure,
      date: new Date().toISOString().split('T')[0],
      procedureValue: procVal,
      commissionRate: rate,
      commissionAmount: commAmt,
      status: 'pendente'
    });

    setCommPatientName('');
    setCommProcedure('');
    setCommValue('');
    setIsNewCommModalOpen(false);
  };

  const handleAddGuideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideNumber || !insuranceName || !guidePatientName || !guideProcedure || !guideValueClaimed) return;

    const valClaimed = parseFloat(guideValueClaimed) || 0;

    addInsuranceGuide({
      guideNumber,
      insuranceName,
      patientName: guidePatientName,
      procedureName: guideProcedure,
      tussCode: guideTussCode || undefined,
      submissionDate: new Date().toISOString().split('T')[0],
      valueClaimed: valClaimed,
      valueApproved: valClaimed,
      disallowanceValue: 0,
      status: 'enviada'
    });

    setGuideNumber('');
    setGuidePatientName('');
    setGuideProcedure('');
    setGuideTussCode('');
    setGuideValueClaimed('');
    setIsNewGuideModalOpen(false);
  };

  const handleAddLabOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labPatientName || !labName || !labServiceType || !labCost) return;

    const costVal = parseFloat(labCost) || 0;
    const newOrder: LabOrder = {
      id: `lab-${Date.now()}`,
      patientName: labPatientName,
      labName,
      serviceType: labServiceType,
      category: labCategory,
      toothOrRegion: labTooth || undefined,
      sendDate: labSendDate || new Date().toISOString().split('T')[0],
      dueDate: labDueDate || new Date(Date.now() + 864000000).toISOString().split('T')[0],
      cost: costVal,
      status: 'enviado_lab',
      notes: labNotes || undefined
    };

    setLabOrders([newOrder, ...labOrders]);

    // Automatically log expense transaction
    addTransaction({
      type: 'despesa',
      category: 'Laboratórios & Próteses',
      description: `[Lab] ${labServiceType} (${labName}) - Paciente: ${labPatientName}`,
      amount: costVal,
      date: labSendDate || new Date().toISOString().split('T')[0],
      paymentMethod: 'pix',
      status: 'pago'
    });

    setLabPatientName('');
    setLabName('');
    setLabServiceType('');
    setLabTooth('');
    setLabCost('');
    setLabNotes('');
    setIsNewLabModalOpen(false);
  };

  const handleUpdateLabStatus = (id: string, newStatus: LabOrder['status']) => {
    setLabOrders(labOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDeleteLabOrder = (id: string) => {
    setLabOrders(labOrders.filter(o => o.id !== id));
  };

  const handlePrintReport = () => {
    const reportType = activeSubTab === 'fluxo_caixa' ? 'Fluxo_de_Caixa' :
      activeSubTab === 'dre' ? 'Demonstrativo_DRE' :
      activeSubTab === 'comissoes' ? 'Relatorio_Comissoes' :
      activeSubTab === 'convenios' ? 'Faturamento_Convenios' : 'Ordens_Laboratorio_Protese';
    printDocumentWithTitle({
      docTitle: reportType,
      date: new Date()
    });
  };

  const filteredLabOrders = labOrders.filter(o => {
    if (labFilterCategory !== 'todos' && o.category !== labFilterCategory) return false;
    if (labFilterStatus !== 'todos' && o.status !== labFilterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar Header & Module Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${t.headingText} flex items-center gap-2 tracking-tight`}>
            <TrendingUp className={`w-7 h-7 ${t.accentText}`} />
            Módulo Financeiro & Gestão de Relatórios
          </h1>
          <p className="text-xs opacity-75">Fluxo de Caixa, DRE Contábil, Comissões, Convênios e Controle de Laboratórios & Análises.</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintReport}
            className={`px-3.5 py-2.5 ${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold text-xs rounded-2xl flex items-center gap-1.5 transition border ${t.cardBorder} cursor-pointer`}
          >
            <Printer className={`w-4 h-4 ${t.accentText}`} />
            Imprimir
          </button>

          {activeSubTab === 'fluxo_caixa' && (
            <button
              onClick={() => setIsNewTxModalOpen(true)}
              className={`px-4 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              Lançar Movimentação
            </button>
          )}

          {activeSubTab === 'comissoes' && (
            <button
              onClick={() => setIsNewCommModalOpen(true)}
              className={`px-4 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              Lançar Comissão
            </button>
          )}

          {activeSubTab === 'convenios' && (
            <>
              <button
                onClick={() => setIsExtratorModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <FolderSearch className="w-4 h-4 text-emerald-200" />
                Extração D:\Convênios (Dados.txt ➔ CSV)
              </button>
              <button
                onClick={() => setIsNewGuideModalOpen(true)}
                className={`px-4 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer`}
              >
                <Plus className="w-4 h-4" />
                Nova Guia TISS
              </button>
            </>
          )}

          {activeSubTab === 'laboratorios' && (
            <button
              onClick={() => setIsNewLabModalOpen(true)}
              className={`px-4 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              Novo Trabalho / Análise
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className={`${t.btnSecondaryBg} p-1.5 rounded-2xl border ${t.cardBorder} flex flex-wrap items-center gap-1 text-xs`}>
        <button
          onClick={() => setActiveSubTab('fluxo_caixa')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'fluxo_caixa' 
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs` 
              : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
          }`}
        >
          <TrendingUp className={`w-4 h-4 ${activeSubTab === 'fluxo_caixa' ? t.btnPrimaryText : t.accentText}`} />
          1. Fluxo de Caixa
        </button>

        <button
          onClick={() => setActiveSubTab('dre')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'dre' 
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs` 
              : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
          }`}
        >
          <FileText className={`w-4 h-4 ${activeSubTab === 'dre' ? t.btnPrimaryText : t.accentText}`} />
          2. DRE Contábil
        </button>

        <button
          onClick={() => setActiveSubTab('comissoes')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'comissoes' 
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs` 
              : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
          }`}
        >
          <Award className={`w-4 h-4 ${activeSubTab === 'comissoes' ? t.btnPrimaryText : t.accentText}`} />
          3. Comissões de Dentistas
        </button>

        <button
          onClick={() => setActiveSubTab('convenios')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'convenios' 
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs` 
              : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeSubTab === 'convenios' ? t.btnPrimaryText : t.accentText}`} />
          4. Gestão de Convênios
        </button>

        <button
          onClick={() => setActiveSubTab('laboratorios')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'laboratorios' 
              ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs` 
              : `${t.btnSecondaryText} opacity-70 hover:opacity-100`
          }`}
        >
          <FlaskConical className={`w-4 h-4 ${activeSubTab === 'laboratorios' ? t.btnPrimaryText : t.accentText}`} />
          5. Laboratórios & Análises
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FLUXO DE CAIXA */}
      {/* ========================================================================= */}
      {activeSubTab === 'fluxo_caixa' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entradas (Receitas)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-800 font-mono">
                R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">Entradas brutas confirmadas</p>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saídas (Despesas)</span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-rose-800 font-mono">
                R$ {totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-rose-700 font-medium">Custos operacionais e materiais</p>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2 bg-gradient-to-br from-white to-[#f0f0e8]/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider">Saldo Líquido em Caixa</span>
                <div className="w-8 h-8 rounded-xl bg-[#f0f0e8] text-[#5a5a40] flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#d4a373]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#5a5a40] font-mono">
                R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-[#5a5a40] font-medium">Resultado acumulado de caixa</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#d4a373]" />
                Balanço de Fluxo de Caixa Comparativo
              </h3>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-semibold">Receitas Totais</span>
                    <span className="text-emerald-800 font-mono font-bold">R$ {totalReceita.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-[#fbfbf9] h-3 rounded-full overflow-hidden border border-[#e5e5d1]">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, totalReceita > 0 ? 100 : 0)}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-semibold">Despesas Operacionais</span>
                    <span className="text-rose-800 font-mono font-bold">R$ {totalDespesa.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-[#fbfbf9] h-3 rounded-full overflow-hidden border border-[#e5e5d1]">
                    <div 
                      className="bg-rose-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${totalReceita > 0 ? Math.min(100, (totalDespesa / totalReceita) * 100) : 0}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#d4a373]" />
                Entradas por Forma de Pagamento
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-[#fbfbf9] p-3.5 rounded-2xl border border-[#e5e5d1]">
                  <span className="text-gray-500 flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5 text-[#d4a373]" /> PIX</span>
                  <p className="text-base font-bold text-[#2c2c2c] font-mono mt-1">R$ {(paymentBreakdown['pix'] || 0).toFixed(2)}</p>
                </div>

                <div className="bg-[#fbfbf9] p-3.5 rounded-2xl border border-[#e5e5d1]">
                  <span className="text-gray-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-blue-600" /> Cartão Crédito</span>
                  <p className="text-base font-bold text-[#2c2c2c] font-mono mt-1">R$ {(paymentBreakdown['cartao_credito'] || 0).toFixed(2)}</p>
                </div>

                <div className="bg-[#fbfbf9] p-3.5 rounded-2xl border border-[#e5e5d1]">
                  <span className="text-gray-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Cartão Débito</span>
                  <p className="text-base font-bold text-[#2c2c2c] font-mono mt-1">R$ {(paymentBreakdown['cartao_debito'] || 0).toFixed(2)}</p>
                </div>

                <div className="bg-[#fbfbf9] p-3.5 rounded-2xl border border-[#e5e5d1]">
                  <span className="text-gray-500 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-amber-600" /> Dinheiro / Boleto</span>
                  <p className="text-base font-bold text-[#2c2c2c] font-mono mt-1">
                    R$ {((paymentBreakdown['dinheiro'] || 0) + (paymentBreakdown['boleto'] || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Extrato Table */}
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-[32px] p-6 shadow-sm space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className={`text-sm font-bold ${t.headingText}`}>Extrato de Lançamentos do Fluxo de Caixa</h3>
              
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setFilterType('todos')}
                  className={`px-3 py-1.5 rounded-2xl font-semibold transition cursor-pointer ${
                    filterType === 'todos' 
                      ? `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs` 
                      : `${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder}`
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('receita')}
                  className={`px-3 py-1.5 rounded-2xl font-semibold transition cursor-pointer ${
                    filterType === 'receita' 
                      ? 'bg-emerald-700 text-white shadow-xs' 
                      : `${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder}`
                  }`}
                >
                  Receitas
                </button>
                <button
                  onClick={() => setFilterType('despesa')}
                  className={`px-3 py-1.5 rounded-2xl font-semibold transition cursor-pointer ${
                    filterType === 'despesa' 
                      ? 'bg-rose-700 text-white shadow-xs' 
                      : `${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.cardBorder}`
                  }`}
                >
                  Despesas
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2c2c2c]">
                <thead className="bg-[#fbfbf9] text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#e5e5d1]">
                  <tr>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Descrição / Procedimento</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5">Forma de Pgto</th>
                    <th className="p-3.5 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5d1]">
                  {filteredFinancials.map(f => (
                    <tr key={f.id} className="hover:bg-[#fbfbf9] transition">
                      <td className="p-3.5 font-mono text-gray-500">{f.date}</td>
                      <td className="p-3.5 font-bold text-[#2c2c2c]">{f.description}</td>
                      <td className="p-3.5 text-gray-500">{f.category}</td>
                      <td className="p-3.5 font-mono uppercase text-gray-500">{f.paymentMethod}</td>
                      <td className={`p-3.5 text-right font-mono font-bold text-sm ${f.type === 'receita' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {f.type === 'receita' ? '+' : '-'} R$ {f.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DRE CONTÁBIL */}
      {/* ========================================================================= */}
      {activeSubTab === 'dre' && (
        <div className="space-y-6">
          {/* DRE Header Banner */}
          <div className="bg-gradient-to-br from-[#5a5a40] to-[#2c3e2e] text-white p-6 rounded-[32px] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#d4a373] tracking-widest">Demonstrativo de Resultado do Exercício</span>
              <h2 className="text-xl font-serif italic text-white mt-1">DRE Odontológica Consolidada</h2>
              <p className="text-xs text-gray-300 mt-1 max-w-xl">
                Demonstração contábil entre receita bruta, deduções fiscais, custos diretos com insumos, repasses de comissão e despesas fixas da clínica.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right shrink-0">
              <span className="text-[10px] text-gray-300 uppercase font-bold">Margem Líquida DRE</span>
              <p className={`text-2xl font-bold font-mono ${margemLiquidaPct >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {margemLiquidaPct.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* DRE Structure Card Table */}
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#d4a373]" /> Estrutura da DRE (R$)
            </h3>

            <div className="divide-y divide-[#e5e5d1] text-xs">
              {/* 1. Receita Bruta */}
              <div className="py-3 flex justify-between items-center bg-[#fbfbf9] px-4 rounded-xl font-bold text-[#2c2c2c]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  (+) RECEITA OPERACIONAL BRUTA
                </span>
                <span className="font-mono text-emerald-800 text-sm">
                  R$ {receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 2. Deduções e Impostos */}
              <div className="py-2.5 flex justify-between items-center px-6 text-gray-600">
                <span>(-) Impostos & Taxas de Adquirente (Simples/ISS ~8%)</span>
                <span className="font-mono text-rose-700">
                  - R$ {impostosETaxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 3. Receita Líquida */}
              <div className="py-3 flex justify-between items-center bg-[#f0f0e8]/60 px-4 rounded-xl font-bold text-[#5a5a40]">
                <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
                <span className="font-mono text-[#5a5a40] text-sm">
                  R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 4. Custos de Insumos & Laboratório */}
              <div className="py-2.5 flex justify-between items-center px-6 text-gray-600">
                <span>(-) Custos de Materiais, Resinas & Laboratórios de Prótese</span>
                <span className="font-mono text-rose-700">
                  - R$ {custosMateriais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 5. Lucro Bruto */}
              <div className="py-3 flex justify-between items-center bg-[#fbfbf9] px-4 rounded-xl font-bold text-[#2c2c2c]">
                <span>(=) LUCRO BRUTO (Margem Bruta: {margemBrutaPct.toFixed(1)}%)</span>
                <span className="font-mono text-emerald-800 text-sm">
                  R$ {lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 6. Repasses de Comissões */}
              <div className="py-2.5 flex justify-between items-center px-6 text-gray-600">
                <span>(-) Repasses de Comissões a Cirurgiões-Dentistas</span>
                <span className="font-mono text-rose-700">
                  - R$ {comissoesPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 7. Despesas Operacionais Fixas */}
              <div className="py-2.5 flex justify-between items-center px-6 text-gray-600">
                <span>(-) Despesas Fixas & Administrativas (Aluguel, Água, Luz, Internet, Folha)</span>
                <span className="font-mono text-rose-700">
                  - R$ {despesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 8. Lucro Líquido Final */}
              <div className="py-4 flex justify-between items-center bg-[#5a5a40] text-white px-6 rounded-2xl font-bold text-sm shadow-sm mt-2">
                <span className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#d4a373]" />
                  (=) RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO OPERACIONAL)
                </span>
                <span className="font-mono text-emerald-300 text-base">
                  R$ {lucroOperacionalDRE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMISSÕES DE DENTISTAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'comissoes' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comissões Pendentes (A Pagar)</span>
              <p className="text-2xl font-bold text-amber-700 font-mono">
                R$ {totalComissoesPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-amber-600 font-medium">Repasses aguardando fechamento</p>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comissões Pagas (Pagas)</span>
              <p className="text-2xl font-bold text-emerald-800 font-mono">
                R$ {totalComissoesPagasAcc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">Repasses quitados ao corpo clínico</p>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dentistas Cadastrados</span>
              <p className="text-2xl font-bold text-[#5a5a40] font-mono">
                {professionals.length} profissionais
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Com taxas de repasse configuradas</p>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#5a5a40]">Extrato de Repasses de Comissões</h3>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-semibold">Filtrar Dentista:</span>
                <select
                  value={commFilterProf}
                  onChange={(e) => setCommFilterProf(e.target.value)}
                  className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3 py-1.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                >
                  <option value="todos">Todos os Dentistas</option>
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2c2c2c]">
                <thead className="bg-[#fbfbf9] text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#e5e5d1]">
                  <tr>
                    <th className="p-3.5">Profissional / Dentista</th>
                    <th className="p-3.5">Paciente & Procedimento</th>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Valor Procedimento</th>
                    <th className="p-3.5">% Alíquota</th>
                    <th className="p-3.5">Comissão (R$)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5d1]">
                  {filteredCommissions.map(c => (
                    <tr key={c.id} className="hover:bg-[#fbfbf9] transition">
                      <td className="p-3.5 font-bold text-[#2c2c2c]">{c.professionalName}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-800">{c.patientName}</p>
                        <p className="text-[10px] text-gray-500">{c.procedureName}</p>
                      </td>
                      <td className="p-3.5 font-mono text-gray-500">{c.date}</td>
                      <td className="p-3.5 font-mono">R$ {c.procedureValue.toFixed(2)}</td>
                      <td className="p-3.5 font-mono text-amber-700 font-bold">{c.commissionRate}%</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-800">
                        R$ {c.commissionAmount.toFixed(2)}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          c.status === 'pago' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status === 'pago' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {c.status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {c.status === 'pendente' && (
                          <button
                            onClick={() => payCommission(c.id)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-xl transition shadow-xs"
                          >
                            Pagar Comissão
                          </button>
                        )}
                        {c.status === 'pago' && (
                          <span className="text-[11px] text-gray-400 font-mono">Pago em {c.paymentDate}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GESTÃO DE CONVÊNIOS & GUIAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'convenios' && (
        <div className="space-y-6">
          {/* Banner/Card Extrator D:\Convênios */}
          <div className="bg-gradient-to-r from-[#2c3e2e] to-[#425a45] rounded-[32px] p-6 text-white shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30">
                  <FolderSearch className="w-4 h-4 text-amber-300" />
                  Ferramenta de Extração Recursiva
                </div>
                <h3 className="text-lg font-bold text-white">
                  Extrator de Arquivos Dados.txt do Diretório D:\Convênios
                </h3>
                <p className="text-xs text-stone-200 leading-relaxed">
                  Busca automaticamente em todas as pastas e subpastas pelo arquivo <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">Dados.txt</code>, lê o conteúdo de cada um, extrai os campos de paciente, convênio, guia, procedimento e valor, e exporta em um Banco de Dados CSV unificado.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsExtratorModalOpen(true)}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-[#1a291b] font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <FolderTree className="w-4 h-4 text-[#1a291b]" />
                  Abrir Extrator D:\Convênios ➔ CSV
                </button>
              </div>
            </div>
          </div>

          {/* Convênios Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Faturamento Solicitado em Guias</span>
              <p className="text-2xl font-bold text-blue-800 font-mono">
                R$ {totalGuiasValorClaimed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-blue-700 font-medium">Total de procedimentos submetidos</p>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aprovado / Recebido</span>
              <p className="text-2xl font-bold text-emerald-800 font-mono">
                R$ {totalGuiasValorApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">Guias aprovadas e liquidadas</p>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor em Glosas / Retenções</span>
              <p className="text-2xl font-bold text-rose-800 font-mono">
                R$ {totalGlosasValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-rose-700 font-medium">Glosa a contestar junto aos planos</p>
            </div>
          </div>

          {/* Guias TISS Table */}
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#5a5a40]">Gestão de Guias TISS e Recursos de Glosa</h3>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-semibold">Filtrar Convênio:</span>
                <select
                  value={guideFilterInsurance}
                  onChange={(e) => setGuideFilterInsurance(e.target.value)}
                  className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3 py-1.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                >
                  <option value="todos">Todos os Convênios</option>
                  <option value="Amil Dental">Amil Dental</option>
                  <option value="Unimed Odonto">Unimed Odonto</option>
                  <option value="Bradesco Dental">Bradesco Dental</option>
                  <option value="SulAmérica Odonto">SulAmérica Odonto</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2c2c2c]">
                <thead className="bg-[#fbfbf9] text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#e5e5d1]">
                  <tr>
                    <th className="p-3.5">Nº Guia TISS</th>
                    <th className="p-3.5">Convênio</th>
                    <th className="p-3.5">Paciente & Procedimento</th>
                    <th className="p-3.5">Data Envio</th>
                    <th className="p-3.5">Valor Cobrado</th>
                    <th className="p-3.5">Valor Glosado</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5d1]">
                  {filteredInsuranceGuides.map(g => (
                    <tr key={g.id} className="hover:bg-[#fbfbf9] transition">
                      <td className="p-3.5 font-mono font-bold text-[#5a5a40]">{g.guideNumber}</td>
                      <td className="p-3.5 font-bold text-gray-800">{g.insuranceName}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-[#2c2c2c]">{g.patientName}</p>
                        <p className="text-[10px] text-gray-500">{g.procedureName} {g.tussCode && `(TUSS ${g.tussCode})`}</p>
                      </td>
                      <td className="p-3.5 font-mono text-gray-500">{g.submissionDate}</td>
                      <td className="p-3.5 font-mono font-bold text-gray-800">R$ {g.valueClaimed.toFixed(2)}</td>
                      <td className="p-3.5 font-mono font-bold text-rose-700">
                        {g.disallowanceValue > 0 ? `R$ ${g.disallowanceValue.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          g.status === 'paga' || g.status === 'aprovada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : g.status === 'glosada'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {g.status === 'paga' && <CheckCircle className="w-3 h-3" />}
                          {g.status === 'glosada' && <AlertCircle className="w-3 h-3" />}
                          {g.status === 'enviada' && <Clock className="w-3 h-3" />}
                          <span className="capitalize">{g.status}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        {g.status === 'enviada' && (
                          <button
                            onClick={() => updateInsuranceGuideStatus(g.id, 'aprovada')}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-xl"
                          >
                            Aprovar
                          </button>
                        )}
                        {g.status === 'enviada' && (
                          <button
                            onClick={() => updateInsuranceGuideStatus(g.id, 'glosada', 'Glosado em auditoria', g.valueClaimed * 0.2)}
                            className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] rounded-xl"
                          >
                            Glosar
                          </button>
                        )}
                        {g.status === 'aprovada' && (
                          <button
                            onClick={() => updateInsuranceGuideStatus(g.id, 'paga')}
                            className="px-2.5 py-1 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold text-[10px] rounded-xl"
                          >
                            Dar Baixa Pgto
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CONTROLE DE LABORATÓRIOS DE PRÓTESE & ANÁLISES CLÍNICAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'laboratorios' && (
        <div className="space-y-6">
          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Pedidos / Exames</span>
              <p className="text-2xl font-bold font-mono text-[#2c2c2c]">
                {labOrders.length} <span className="text-xs font-normal text-gray-500">trabalhos</span>
              </p>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custo Total de Serviços</span>
              <p className="text-2xl font-bold font-mono text-[#5a5a40]">
                R$ {labOrders.reduce((a, b) => a + b.cost, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prontos p/ Entrega na Clínica</span>
              <p className="text-2xl font-bold font-mono text-emerald-700">
                {labOrders.filter(o => o.status === 'recebido_protese' || o.status === 'concluido').length} <span className="text-xs font-normal text-gray-500">prontos</span>
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5d1] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#2c2c2c] flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-[#d4a373]" />
                  Controle de Trabalhos Préticos & Análises Clínicas
                </h3>
                <p className="text-xs text-gray-500">Acompanhamento do ciclo de confecção, provas, exames histopatológicos e custos de prótese.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={labFilterCategory}
                  onChange={(e) => setLabFilterCategory(e.target.value as any)}
                  className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-1.5 font-medium text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                >
                  <option value="todos">Todas as Categorias</option>
                  <option value="protese">Prótese Dentária</option>
                  <option value="analises_clinicas">Análises Clínicas / Patologia</option>
                </select>

                <select
                  value={labFilterStatus}
                  onChange={(e) => setLabFilterStatus(e.target.value)}
                  className="bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-1.5 font-medium text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="enviado_lab">Enviado ao Lab</option>
                  <option value="em_producao">Em Confecção / Produção</option>
                  <option value="recebido_protese">Recebido na Clínica</option>
                  <option value="concluido">Entregue / Concluído</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2c2c2c]">
                <thead className="bg-[#fbfbf9] text-[#5a5a40] uppercase tracking-wider text-[10px] border-b border-[#e5e5d1]">
                  <tr>
                    <th className="p-3.5 rounded-l-2xl">Paciente & Categoria</th>
                    <th className="p-3.5">Laboratório / Centro</th>
                    <th className="p-3.5">Serviço & Região</th>
                    <th className="p-3.5">Envio ➔ Previsão</th>
                    <th className="p-3.5 text-right font-mono">Custo (R$)</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right rounded-r-2xl">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5d1]/50">
                  {filteredLabOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400 italic">
                        Nenhum trabalho de laboratório ou exame encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredLabOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#fbfbf9]/60 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-[#2c2c2c]">{o.patientName}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${
                            o.category === 'protese' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {o.category === 'protese' ? 'Prótese Dentária' : 'Análise / Patologia'}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-stone-700">
                          {o.labName}
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-stone-900">{o.serviceType}</p>
                          {o.toothOrRegion && <p className="text-[11px] text-gray-500 font-mono">{o.toothOrRegion}</p>}
                        </td>
                        <td className="p-3.5 text-[11px] text-stone-600 font-mono">
                          <p>Env: {o.sendDate}</p>
                          <p className="font-bold text-stone-800">Prev: {o.dueDate}</p>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-stone-900">
                          R$ {o.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateLabStatus(o.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border focus:outline-none cursor-pointer ${
                              o.status === 'recebido_protese' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              o.status === 'em_producao' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              o.status === 'enviado_lab' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-stone-100 text-stone-700 border-stone-300'
                            }`}
                          >
                            <option value="enviado_lab">1. Enviado ao Lab</option>
                            <option value="em_producao">2. Em Confecção</option>
                            <option value="recebido_protese">3. Recebido na Clínica</option>
                            <option value="concluido">4. Entregue / Concluído</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => handleDeleteLabOrder(o.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remover Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* 1. Modal Novo Lançamento Financeiro */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#d4a373]" />
                Lançamento Financeiro
              </h3>
              <button onClick={() => setIsNewTxModalOpen(false)} className="text-gray-400 hover:text-[#2c2c2c]"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddTx} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setType('receita')}
                  className={`py-2 rounded-xl transition ${type === 'receita' ? 'bg-emerald-700 text-white' : 'text-gray-500'}`}
                >
                  + Receita (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => setType('despesa')}
                  className={`py-2 rounded-xl transition ${type === 'despesa' ? 'bg-rose-700 text-white' : 'text-gray-500'}`}
                >
                  - Despesa (Saída)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder={type === 'receita' ? 'Ex: Tratamento do paciente Ana Silva' : 'Ex: Compra de luvas e resinas'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="250.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="boleto">Boleto</option>
                    <option value="convenio">Convênio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Categoria</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-medium text-xs rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-medium text-xs rounded-2xl shadow-xs"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Nova Comissão */}
      {isNewCommModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d4a373]" />
                Lançar Comissão de Dentista
              </h3>
              <button onClick={() => setIsNewCommModalOpen(false)} className="text-gray-400 hover:text-[#2c2c2c]"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddCommissionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Dentista / Profissional *</label>
                <select
                  required
                  value={commProfId}
                  onChange={(e) => setCommProfId(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                >
                  <option value="">Selecione o Cirurgião-Dentista...</option>
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.cro})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Paciente Atendido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Silva Santos"
                  value={commPatientName}
                  onChange={(e) => setCommPatientName(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Procedimento Executado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Restauração de Dente Posterior"
                  value={commProcedure}
                  onChange={(e) => setCommProcedure(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Valor Procedimento (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="300.00"
                    value={commValue}
                    onChange={(e) => setCommValue(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">% Comissão</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={commRate}
                    onChange={(e) => setCommRate(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => setIsNewCommModalOpen(false)}
                  className="px-4 py-2.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-medium text-xs rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-medium text-xs rounded-2xl shadow-xs"
                >
                  Registrar Comissão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Nova Guia TISS */}
      {isNewGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4a373]" />
                Nova Guia TISS / Convênio
              </h3>
              <button onClick={() => setIsNewGuideModalOpen(false)} className="text-gray-400 hover:text-[#2c2c2c]"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddGuideSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Nº da Guia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: GUIA-99881"
                    value={guideNumber}
                    onChange={(e) => setGuideNumber(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Convênio *</label>
                  <select
                    value={insuranceName}
                    onChange={(e) => setInsuranceName(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  >
                    <option value="Amil Dental">Amil Dental</option>
                    <option value="Unimed Odonto">Unimed Odonto</option>
                    <option value="Bradesco Dental">Bradesco Dental</option>
                    <option value="SulAmérica Odonto">SulAmérica Odonto</option>
                    <option value="OdontoPrev">OdontoPrev</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Paciente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={guidePatientName}
                  onChange={(e) => setGuidePatientName(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Procedimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Profilaxia e Raspagem"
                  value={guideProcedure}
                  onChange={(e) => setGuideProcedure(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Código TUSS (Opcional)</label>
                  <input
                    type="text"
                    placeholder="85100010"
                    value={guideTussCode}
                    onChange={(e) => setGuideTussCode(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Valor Cobrado (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="220.00"
                    value={guideValueClaimed}
                    onChange={(e) => setGuideValueClaimed(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => setIsNewGuideModalOpen(false)}
                  className="px-4 py-2.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-medium text-xs rounded-2xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-medium text-xs rounded-2xl shadow-xs cursor-pointer"
                >
                  Transmitir Guia TISS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Novo Trabalho de Laboratório / Análise Clínica */}
      {isNewLabModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#d4a373]" />
                Novo Registro de Laboratório / Análise
              </h3>
              <button onClick={() => setIsNewLabModalOpen(false)} className="text-gray-400 hover:text-[#2c2c2c] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddLabOrderSubmit} className="space-y-3">
              {/* Category Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLabCategory('protese')}
                  className={`py-2 rounded-xl transition cursor-pointer ${labCategory === 'protese' ? 'bg-[#5a5a40] text-white' : 'text-gray-500'}`}
                >
                  Prótese Dentária
                </button>
                <button
                  type="button"
                  onClick={() => setLabCategory('analises_clinicas')}
                  className={`py-2 rounded-xl transition cursor-pointer ${labCategory === 'analises_clinicas' ? 'bg-[#5a5a40] text-white' : 'text-gray-500'}`}
                >
                  Análises Clínicas / Biópsia
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Paciente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Bezerra"
                  value={labPatientName}
                  onChange={(e) => setLabPatientName(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Laboratório / Centro *</label>
                  <input
                    type="text"
                    required
                    placeholder={labCategory === 'protese' ? 'Ex: Lab Prótese Elite' : 'Ex: Laboratório BioLab'}
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Serviço / Procedimento *</label>
                  <input
                    type="text"
                    required
                    placeholder={labCategory === 'protese' ? 'Ex: Coroa Zircônia Anatômica' : 'Ex: Exame Histopatológico'}
                    value={labServiceType}
                    onChange={(e) => setLabServiceType(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Dente / Região (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Dente 11 / Quadrante Sup."
                    value={labTooth}
                    onChange={(e) => setLabTooth(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Custo / Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="450.00"
                    value={labCost}
                    onChange={(e) => setLabCost(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Data de Envio</label>
                  <input
                    type="date"
                    required
                    value={labSendDate}
                    onChange={(e) => setLabSendDate(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Previsão de Entrega</label>
                  <input
                    type="date"
                    required
                    value={labDueDate}
                    onChange={(e) => setLabDueDate(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Observações Técnicas / Cor</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cor A2 VITA, caracterização cervical suave, prova de infraestrutura dia 10..."
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl p-3 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => setIsNewLabModalOpen(false)}
                  className="px-4 py-2.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-medium text-xs rounded-2xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-medium text-xs rounded-2xl shadow-xs cursor-pointer"
                >
                  Salvar e Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Extração Recursiva D:\Convênios (Dados.txt -> CSV) */}
      {isExtratorModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-4xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-800">
                  <FolderSearch className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2c2c2c] flex items-center gap-2">
                    Extrator Recursivo de Arquivos Dados.txt
                  </h3>
                  <p className="text-xs text-gray-500">Varredura automática em pastas/subpastas do diretório D:\Convênios para extração em banco de dados CSV.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExtratorModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-[#2c2c2c] hover:bg-stone-100 rounded-full cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tab Navigation inside Modal */}
            <div className="flex items-center gap-2 bg-[#fbfbf9] p-1.5 rounded-2xl border border-[#e5e5d1] text-xs font-bold">
              <button
                onClick={() => setActiveExtratorTab('scan')}
                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeExtratorTab === 'scan' ? 'bg-[#5a5a40] text-white shadow-xs' : 'text-gray-600 hover:text-[#5a5a40]'
                }`}
              >
                <FolderTree className="w-4 h-4 text-[#d4a373]" />
                1. Varredura via Navegador (Sem Instalação)
              </button>
              <button
                onClick={() => setActiveExtratorTab('python_script')}
                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeExtratorTab === 'python_script' ? 'bg-[#5a5a40] text-white shadow-xs' : 'text-gray-600 hover:text-[#5a5a40]'
                }`}
              >
                <Terminal className="w-4 h-4 text-[#d4a373]" />
                2. Script Python Local (.py & .bat para Windows)
              </button>
            </div>

            {/* TAB 1: BROWSER RECURSIVE SCANNER */}
            {activeExtratorTab === 'scan' && (
              <div className="space-y-4">
                {/* File input (hidden) with directory attributes */}
                <input
                  type="file"
                  ref={folderInputRef}
                  /* @ts-ignore */
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderScanSelect}
                  className="hidden"
                />

                {/* Directory Selection Box */}
                <div className="bg-[#fbfbf9] border-2 border-dashed border-[#d4a373]/50 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800">
                    <Folder className="w-6 h-6 text-[#d4a373]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2c2c2c]">Selecionar o Diretório D:\Convênios</h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                      O sistema varrerá recursivamente todas as subpastas (ex: <code className="font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">D:\Convênios\Amil\Paciente_X\Dados.txt</code>), abrirá e compilará todos os arquivos em um Banco de Dados CSV.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      disabled={isScanning}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 text-emerald-200" />
                      {isScanning ? 'Escaneando Subpastas...' : 'Selecionar Pasta D:\\Convênios'}
                    </button>
                  </div>
                </div>

                {/* Status Log Box */}
                <div className="bg-stone-900 text-stone-200 p-3.5 rounded-2xl text-xs font-mono border border-stone-800 flex items-center justify-between">
                  <span>{scannerLog}</span>
                  <span className="px-2 py-0.5 bg-stone-800 text-stone-400 rounded text-[10px] font-bold uppercase">
                    {extractedRecords.length} Registros
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e5e5d1]">
                  <div className="text-xs font-bold text-[#5a5a40] flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    {extractedRecords.length} arquivo(s) Dados.txt compilados
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={importExtractedToSystemGuides}
                      disabled={extractedRecords.length === 0}
                      className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-2xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4 text-[#d4a373]" />
                      Importar p/ Guias TISS
                    </button>

                    <button
                      type="button"
                      onClick={exportExtractedToCSV}
                      disabled={extractedRecords.length === 0}
                      className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-40"
                    >
                      <Download className="w-4 h-4 text-[#d4a373]" />
                      Exportar Banco de Dados CSV
                    </button>
                  </div>
                </div>

                {/* Extracted Preview Table */}
                <div className="border border-[#e5e5d1] rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs text-[#2c2c2c]">
                    <thead className="bg-[#fbfbf9] text-[#5a5a40] uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b border-[#e5e5d1]">
                      <tr>
                        <th className="p-3">Paciente</th>
                        <th className="p-3">Convênio</th>
                        <th className="p-3">Guia TISS</th>
                        <th className="p-3">Procedimento</th>
                        <th className="p-3 text-right">Valor</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Caminho da Subpasta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5d1]">
                      {extractedRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-[#fbfbf9] transition">
                          <td className="p-3 font-bold text-stone-900">{r.paciente}</td>
                          <td className="p-3 font-medium text-stone-700">{r.convenio}</td>
                          <td className="p-3 font-mono font-bold text-[#5a5a40]">{r.guia}</td>
                          <td className="p-3 text-stone-800">{r.procedimento}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-800">R$ {r.valor}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3 text-[10px] font-mono text-gray-500 truncate max-w-xs" title={r.folderPath}>
                            {r.folderPath}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: PYTHON SCRIPT LOCAL */}
            {activeExtratorTab === 'python_script' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Terminal className="w-4 h-4 text-amber-700" />
                    Execução Nativa no Windows em D:\Convênios
                  </p>
                  <p>
                    Se preferir rodar o extrator diretamente no prompt de comando do seu computador Windows sem abrir o navegador, baixe o script em Python e o arquivo executável <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-950">.bat</code>.
                  </p>
                </div>

                <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-stone-800 space-y-2 max-h-56">
                  <div className="flex items-center justify-between text-stone-400 text-[10px] border-b border-stone-800 pb-2">
                    <span>extrator_convenios.py (Script Python)</span>
                    <span>Diretório: D:\Convênios</span>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-emerald-400">
{`import os, csv

ROOT_DIR = r"D:\\Convenios"
OUTPUT_CSV = r"D:\\Convenios\\Banco_Dados_Convenios.csv"

# O script varre todas as subpastas procurando 'Dados.txt'
for root, dirs, files in os.walk(ROOT_DIR):
    for filename in files:
        if filename.lower() == "dados.txt":
            # Extrai e formata para Banco_Dados_Convenios.csv...
            pass`}
                  </pre>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[#e5e5d1]">
                  <button
                    type="button"
                    onClick={downloadBatLauncher}
                    className="px-4 py-2.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-2xl flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#d4a373]" />
                    Baixar Executável (.bat)
                  </button>

                  <button
                    type="button"
                    onClick={downloadPythonScript}
                    className="px-5 py-2.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-[#d4a373]" />
                    Baixar Script Python (.py)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
