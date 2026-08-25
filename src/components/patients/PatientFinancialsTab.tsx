import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { Patient, PatientPayment, TreatmentPlan } from '../../types';
import { getPatientAgeAndBirthDate } from '../../utils/patientUtils';
import { DocumentSignatureFooter } from '../common/DocumentSignatureFooter';
import { 
  DollarSign, 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  Printer, 
  Trash2, 
  X, 
  Building2, 
  FileText,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Wallet
} from 'lucide-react';

interface PatientFinancialsTabProps {
  patient: Patient;
}

export const PatientFinancialsTab: React.FC<PatientFinancialsTabProps> = ({ patient }) => {
  const { 
    treatmentPlans, 
    patientPayments, 
    addPatientPayment, 
    deletePatientPayment, 
    clinics, 
    clinicInfo,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PatientPayment | null>(null);

  // Filter treatment plans and payments for this patient
  const patientPlans = treatmentPlans.filter(p => p.patientId === patient.id);
  const myPayments = patientPayments.filter(p => p.patientId === patient.id);

  // Financial Metrics
  const totalBudget = patientPlans
    .filter(p => p.status !== 'cancelado')
    .reduce((acc, p) => acc + (p.finalValue || p.totalValue || 0), 0);

  const totalPaid = myPayments.reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, totalBudget - totalPaid);
  const paymentPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalPaid / totalBudget) * 100)) : 100;

  // Form State for new payment
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PatientPayment['paymentMethod']>('pix');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(patientPlans[0]?.id || '');
  const [description, setDescription] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState<string>(patient.preferredClinicId || clinics[0]?.id || 'cli-1');
  const [notes, setNotes] = useState('');

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const linkedPlan = patientPlans.find(p => p.id === selectedPlanId);
    const linkedClinic = clinics.find(c => c.id === selectedClinicId);

    addPatientPayment({
      patientId: patient.id,
      patientName: patient.name,
      amount: numAmount,
      date: paymentDate,
      paymentMethod,
      description: description || (linkedPlan ? `Pagamento - ${linkedPlan.title}` : 'Pagamento de Tratamento'),
      treatmentPlanId: linkedPlan?.id,
      treatmentPlanTitle: linkedPlan?.title,
      clinicId: linkedClinic?.id,
      clinicName: linkedClinic?.name || patient.preferredClinicName || clinicInfo.name,
      notes
    });

    // Reset Form
    setAmount('');
    setDescription('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getMethodLabel = (method: PatientPayment['paymentMethod']) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'cartao_credito': return 'Cartão de Crédito';
      case 'cartao_debito': return 'Cartão de Débito';
      case 'dinheiro': return 'Dinheiro em Espécie';
      case 'boleto': return 'Boleto Bancário';
      case 'convenio': return 'Repasse Convênio';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5d1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Orçamento Aprovado</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#5a5a40]">{formatCurrency(totalBudget)}</h3>
            <p className="text-[11px] text-gray-500 mt-1">{patientPlans.length} plano(s) registrado(s)</p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5d1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pago pelo Paciente</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</h3>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">{paymentPercentage}% quitado do total</p>
          </div>
        </div>

        {/* Balance Due */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5d1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Devedor Restante</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${balanceDue > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${balanceDue > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
              {formatCurrency(balanceDue)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              {balanceDue > 0 ? 'Pendente de quitação' : 'Totalmente quitado 🎉'}
            </p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="bg-[#5a5a40] text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#d4a373]">
            <span className="text-xs font-bold uppercase tracking-wider">Controle Financeiro</span>
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-200 mb-3">Lançar entrada, parcela ou pagamento total deste paciente.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-2.5 bg-[#d4a373] text-[#2c2c2c] font-bold text-xs rounded-xl hover:bg-[#c39262] transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Registrar Pagamento
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown per Treatment Plan */}
      {patientPlans.length > 0 && (
        <div className="bg-[#fbfbf9] p-5 rounded-2xl border border-[#e5e5d1] space-y-4">
          <h3 className="text-sm font-bold text-[#5a5a40] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#d4a373]" /> Detalhamento de Quitação por Plano de Tratamento
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientPlans.map(plan => {
              const planPayments = myPayments.filter(p => p.treatmentPlanId === plan.id);
              const planPaid = planPayments.reduce((a, b) => a + b.amount, 0);
              const planTotal = plan.finalValue || plan.totalValue;
              const planBalance = Math.max(0, planTotal - planPaid);
              const planPct = planTotal > 0 ? Math.min(100, Math.round((planPaid / planTotal) * 100)) : 100;

              return (
                <div key={plan.id} className="bg-white p-4 rounded-xl border border-[#e5e5d1] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#5a5a40]">{plan.title}</h4>
                      <p className="text-[11px] text-gray-500">Criado em {plan.date} • {plan.clinicName}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      planPct >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {planPct >= 100 ? 'Quitado' : 'Em Pagamento'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-600">Pago: {formatCurrency(planPaid)}</span>
                      <span className="text-gray-500">Total: {formatCurrency(planTotal)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${planPct >= 100 ? 'bg-emerald-500' : 'bg-[#5a5a40]'}`}
                        style={{ width: `${planPct}%` }}
                      />
                    </div>
                    {planBalance > 0 && (
                      <p className="text-[11px] text-amber-700 font-medium text-right">Falta: {formatCurrency(planBalance)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historical Payments Table */}
      <div className="bg-white rounded-2xl border border-[#e5e5d1] p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#5a5a40]" />
            <h3 className="text-sm font-bold text-[#5a5a40]">Histórico de Pagamentos e Comprovantes</h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">{myPayments.length} lançamento(s)</span>
        </div>

        {myPayments.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <CreditCard className="w-10 h-10 mx-auto stroke-1 text-gray-300" />
            <p className="text-xs font-medium">Nenhum pagamento registrado para este paciente ainda.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl transition cursor-pointer`}
            >
              Lançar Primeiro Pagamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e5e5d1] text-gray-500 uppercase text-[10px] tracking-wider font-bold bg-[#fbfbf9]">
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Recibo Nº</th>
                  <th className="py-3 px-3">Descrição / Procedimento</th>
                  <th className="py-3 px-3">Forma de Pgto</th>
                  <th className="py-3 px-3">Unidade</th>
                  <th className="py-3 px-3 text-right">Valor</th>
                  <th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5d1]">
                {myPayments.map(p => (
                  <tr key={p.id} className="hover:bg-[#fbfbf9] transition">
                    <td className="py-3 px-3 font-semibold text-gray-700">{p.date}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] font-bold text-[#5a5a40] bg-[#f0f0e4] px-2 py-0.5 rounded-md">
                        {p.receiptNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-gray-800">{p.description}</p>
                      {p.treatmentPlanTitle && (
                        <p className="text-[10px] text-gray-400">{p.treatmentPlanTitle}</p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-800 font-medium rounded-lg text-[11px]">
                        {getMethodLabel(p.paymentMethod)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{p.clinicName || patient.preferredClinicName}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          title="Visualizar e Imprimir Recibo"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Printer className="w-3.5 h-3.5" /> Recibo
                        </button>
                        <button
                          onClick={() => deletePatientPayment(p.id)}
                          title="Excluir Pagamento"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Register New Payment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div className="flex items-center gap-2 text-[#5a5a40]">
                <Receipt className="w-5 h-5 text-[#d4a373]" />
                <h3 className="text-base font-bold">Registrar Novo Pagamento</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Paciente</label>
                <input
                  type="text"
                  disabled
                  value={`${patient.name} (${patient.cpf})`}
                  className="w-full text-xs p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Valor do Pagamento (R$)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full text-sm font-bold p-2.5 bg-white border border-[#e5e5d1] rounded-xl text-emerald-800 focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Data do Pagamento*</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro em Espécie</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="convenio">Convênio / Seguro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unidade / Clínica</label>
                  <select
                    value={selectedClinicId}
                    onChange={(e) => setSelectedClinicId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                  >
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {patientPlans.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vincular ao Plano de Tratamento</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                  >
                    <option value="">-- Sem vínculo direto --</option>
                    {patientPlans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} - {formatCurrency(p.finalValue || p.totalValue)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Descrição do Lançamento</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Entrada em PIX para Implante / Parcela 1 de 4"
                  className="w-full text-xs p-2.5 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Observações Internas (Opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Comprovante arquivado na recepção"
                  className="w-full text-xs p-2 bg-white border border-[#e5e5d1] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Receipt View */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[28px] max-w-xl w-full p-8 shadow-2xl space-y-6">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3 no-print">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Comprovante Oficial de Pagamento
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className={`px-4 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer`}
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Document Content */}
            <div className="relative overflow-hidden border border-gray-200 p-6 rounded-2xl bg-[#fcfcf9] space-y-6">
              {/* Centered Watermark Image */}
              {(clinicInfo.showWatermark ?? true) && (clinicInfo.watermarkUrl || clinicInfo.logoUrl) && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8 z-0">
                  <img
                    src={clinicInfo.watermarkUrl || clinicInfo.logoUrl}
                    alt="Marca d'Água Recibo"
                    className="max-w-[65%] max-h-[65%] object-contain"
                    style={{ opacity: (clinicInfo.watermarkOpacity ?? 15) / 100 }}
                  />
                </div>
              )}
              
              {/* Header */}
              <div className="relative z-10 flex items-start justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  {clinicInfo.logoUrl && (
                    <img src={clinicInfo.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-lg border border-gray-200 p-0.5 shrink-0" />
                  )}
                  <div>
                    <h2 className="text-base font-bold text-[#5a5a40]">{selectedReceipt.clinicName || clinicInfo.name}</h2>
                    <p className="text-xs text-gray-500">{clinicInfo.address} • {clinicInfo.city}</p>
                    <p className="text-xs text-gray-500">Tel: {clinicInfo.phone} • {clinicInfo.cro}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#d4a373] uppercase block">RECIBO DE PAGAMENTO</span>
                  <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                    {selectedReceipt.receiptNumber}
                  </span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase">Valor Recebido:</span>
                <span className="text-2xl font-black text-emerald-800">{formatCurrency(selectedReceipt.amount)}</span>
              </div>

              {/* Legal Text */}
              <div className="text-xs text-gray-700 space-y-3 leading-relaxed">
                <p>
                  Recebemos de <strong>{selectedReceipt.patientName}</strong>, inscrito(a) no CPF sob o nº <strong>{patient.cpf}</strong>, a quantia supra de <strong>{formatCurrency(selectedReceipt.amount)}</strong> referente ao tratamento:
                </p>
                <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <strong>Data de nascimento:</strong> {getPatientAgeAndBirthDate(patient.birthDate).birthDateFormatted} • <strong>Idade e meses:</strong> {getPatientAgeAndBirthDate(patient.birthDate).ageText}
                </p>
                <div className="bg-white p-3 rounded-lg border border-gray-200 font-semibold text-gray-800">
                  {selectedReceipt.description}
                  {selectedReceipt.treatmentPlanTitle && (
                    <span className="block text-[11px] font-normal text-gray-500 mt-0.5">
                      Vinculado ao: {selectedReceipt.treatmentPlanTitle}
                    </span>
                  )}
                </div>
                <p>
                  Forma de Pagamento: <strong>{getMethodLabel(selectedReceipt.paymentMethod)}</strong> em <strong>{selectedReceipt.date}</strong>.
                </p>
              </div>

              {/* Signatures & Digital Certification */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="w-52 mx-auto border-t border-gray-400 pt-1 text-center">
                  <p className="font-semibold text-gray-700 text-xs">{selectedReceipt.patientName}</p>
                  <p className="text-[10px] text-gray-500">Assinatura do Paciente / Responsável</p>
                </div>

                <DocumentSignatureFooter compact={true} />

                <div className="text-[9.5px] text-center text-gray-400 pt-1 border-t border-gray-100">
                  {clinicInfo.footerText || `Emitido via DentisPro Cloud • ${new Date().toLocaleDateString('pt-BR')}`}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
