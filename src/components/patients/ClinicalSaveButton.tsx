import React from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';

export function ClinicalSaveButton({ saving, onSave }: {
  saving: boolean; onSave: () => unknown;
}) {
  const { layoutTheme } = useApp();
  const t = getThemeStyles(layoutTheme);
  return <button data-pdf-ignore type="button" disabled={saving} aria-busy={saving}
    onClick={() => { void onSave(); }}
    className={`px-5 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait`}>
    <Save className="w-4 h-4" /> Salvar
  </button>;
}
