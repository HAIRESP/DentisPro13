import { createPortal } from 'react-dom';
import React, { useEffect, useId, useRef, useState } from 'react';
import type { ExamVitalSigns } from '../../types';
import { temperatureOptions, systolicOptions, diastolicOptions, heartRateOptions, oxygenOptions, splitBloodPressure, joinBloodPressure } from '../../utils/examMeasurementOptions';

// Editable combobox: the arrow always opens the complete list, even after typing.
function MeasurementInput({ label, value, options, onChange, disabled, suggested, decimal = false }: {
  label: string; value: string; options: string[]; onChange: (value: string) => void;
  disabled: boolean; suggested: string; decimal?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const choices = ['', ...options];
  const [position, setPosition] = useState({ top: 0, left: 0, width: 60 });
  useEffect(() => {
    if (!open || !list.current) return;
    const option = list.current.children[active] as HTMLElement | undefined;
    if (option) list.current.scrollTop = option.offsetTop - list.current.clientHeight / 2 + option.offsetHeight / 2;
  }, [open, active]);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, [open]);
  const display = (v: string) => decimal ? v.replace('.', ',') : v;
  const select = (v: string) => { onChange(display(v)); setOpen(false); input.current?.focus(); };
  const show = () => {
    const rect = input.current?.getBoundingClientRect();
    if (rect) setPosition({ top: Math.max(8, Math.min(rect.top - 96, window.innerHeight - 232)), left: Math.max(8, Math.min(rect.left, window.innerWidth - 76)), width: 68 });
    setActive(Math.max(0, choices.indexOf((value || suggested).replace(',', '.'))));
    setOpen(true);
  };
  return <div className="relative w-[60px] shrink-0" onBlur={e => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
  }}>
    <div className="flex h-10 rounded-lg border border-stone-700 bg-white focus-within:ring-1 focus-within:ring-stone-500">
      <input ref={input} type="text" inputMode={decimal ? 'decimal' : 'numeric'}
        role="combobox" aria-label={label} aria-expanded={open} aria-controls={open ? id : undefined}
        aria-autocomplete="none" aria-activedescendant={open ? `${id}-${active}` : undefined}
        disabled={disabled} value={value} maxLength={30}
        onChange={e => {
          const next = e.target.value;
          if ((decimal ? /^\d*(?:[.,]\d?)?$/ : /^\d*$/).test(next)) onChange(next);
        }}
        onBlur={() => {
          const numeric = Number(value.replace(',', '.'));
          if (decimal && value.trim() && Number.isFinite(numeric)) onChange(numeric.toFixed(1).replace('.', ','));
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) show();
            else setActive(i => Math.max(0, Math.min(choices.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))));
          } else if (e.key === 'Enter' && open) { e.preventDefault(); select(choices[active]); }
          else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
        }} className="w-full min-w-0 rounded-l-lg bg-transparent px-1.5 text-center text-[13px] font-normal outline-none disabled:opacity-60" />
      <button type="button" aria-label={`Selecionar ${label}`} disabled={disabled}
        tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => { input.current?.focus(); if (open) setOpen(false); else show(); }}
        className="w-4 shrink-0 rounded-r-lg text-[10px] text-stone-600 hover:bg-stone-100 disabled:opacity-40">▾</button>
    </div>
    {open && !disabled && createPortal(<ul ref={list} id={id} role="listbox" aria-label={label}
      style={{ position: 'fixed', top: position.top, left: position.left, width: position.width, height: 224, zIndex: 10000, display: 'block', margin: 0, padding: '4px 0', listStyle: 'none', overflowY: 'auto' }}
      className="rounded-lg border border-stone-300 bg-white shadow-lg">
      {choices.map((option, i) => <li key={option || 'empty'} id={`${id}-${i}`} role="option" aria-selected={i === active}
        onMouseDown={e => e.preventDefault()} onClick={() => select(option)}
        style={{ display: 'block', minHeight: 28 }}
        className={`cursor-pointer px-1 py-1 text-center text-[13px] font-normal hover:bg-stone-100 ${i === active ? 'bg-stone-100' : ''}`}>
        {option ? display(option) : '—'}
      </li>)}
    </ul>, document.body)}
  </div>;
}

export function ExamMeasurements({ date, onDateChange, values = {}, onChange, disabled = false }: {
  date: string; onDateChange: (date: string) => void;
  values?: ExamVitalSigns; onChange: (values: ExamVitalSigns) => void; disabled?: boolean;
}) {
  const [systolic, diastolic] = splitBloodPressure(values.bloodPressure);
  const set = (key: keyof ExamVitalSigns, value: string) => onChange({ ...values, [key]: value });
  return <>
    <div className="print:hidden flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-3 bg-white py-2 text-[13px] font-normal text-stone-900">
      <label className="flex items-center gap-3">Data
        <input aria-label="Data" type="date" required disabled={disabled} value={date}
          onChange={e => onDateChange(e.target.value)} className="h-10 w-[142px] rounded-lg border border-stone-700 bg-white px-2 text-[13px] font-normal" />
      </label>
      <div className="flex items-center gap-2">
        <span className="text-center leading-5">Temperatura<br />corpórea (°C)</span>
        <MeasurementInput label="Temperatura corpórea (°C)" value={values.temperature ?? ''} options={temperatureOptions} suggested="36.5" decimal disabled={disabled} onChange={value => set('temperature', value)} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-center leading-5">Pressão arterial<br />(mmHg)</span>
        <div className="flex items-center gap-1">
          <MeasurementInput label="Pressão sistólica (mmHg)" value={systolic} options={systolicOptions} suggested="120" disabled={disabled} onChange={value => set('bloodPressure', joinBloodPressure(value, diastolic))} />
          <span aria-hidden="true">/</span>
          <MeasurementInput label="Pressão diastólica (mmHg)" value={diastolic} options={diastolicOptions} suggested="80" disabled={disabled} onChange={value => set('bloodPressure', joinBloodPressure(systolic, value))} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-center leading-5">Batimentos<br />cardíacos (bpm)</span>
        <MeasurementInput label="Batimentos cardíacos (bpm)" value={values.heartRate ?? ''} options={heartRateOptions} suggested="75" disabled={disabled} onChange={value => set('heartRate', value)} />
      </div>
      <div className="flex items-center gap-2">
        <span>Oximetria (%)</span>
        <MeasurementInput label="Oximetria (%)" value={values.oxygenSaturation ?? ''} options={oxygenOptions} suggested="98" disabled={disabled} onChange={value => set('oxygenSaturation', value)} />
      </div>
    </div>
    <div className="hidden print:block space-y-2">
      <div><strong>Data:</strong> {date.split('-').reverse().join('/')}</div>
      <ExamMeasurementsPrint values={values} />
    </div>
  </>;
}

const fields: { key: keyof ExamVitalSigns; label: string }[] = [
  { key: 'temperature', label: 'Temperatura corpórea (°C)' },
  { key: 'bloodPressure', label: 'Pressão arterial (mmHg)' },
  { key: 'heartRate', label: 'Batimentos cardíacos (bpm)' },
  { key: 'oxygenSaturation', label: 'Oximetria (%)' },
];
export function ExamMeasurementsPrint({ values }: { values?: ExamVitalSigns }) {
  if (!values || !fields.some(({ key }) => values[key]?.trim())) return null;
  return <div className="flex flex-wrap gap-3 text-sm">
    {fields.filter(({ key }) => values[key]?.trim()).map(({ key, label }) =>
      <div key={key}><strong>{label}:</strong> {values[key]}</div>)}
  </div>;
}
