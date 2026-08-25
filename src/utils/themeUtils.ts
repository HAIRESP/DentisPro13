export type ThemeId = 'natural' | 'natural-tones' | 'dental-clean' | 'dark-executive' | 'soft-pink';

export interface ThemeStyles {
  // Modal container background and text
  modalBg: string;
  modalHeaderBg: string;
  modalHeaderTitle: string;
  modalHeaderSubtitle: string;
  modalBorder: string;
  modalText: string;
  modalMutedText: string;
  
  // Banner / Welcome Header background and elements
  bannerBg: string;
  bannerBorder: string;
  bannerAccentText: string;
  bannerSubtext: string;
  headingText: string;
  
  // Modal subcards and boxes
  cardBg: string;
  cardBorder: string;
  cardText: string;
  
  // Inputs
  inputBg: string;
  inputBorder: string;
  inputText: string;
  
  // Primary buttons
  btnPrimaryBg: string;
  btnPrimaryHover: string;
  btnPrimaryText: string;
  
  // Secondary / Cancel buttons
  btnSecondaryBg: string;
  btnSecondaryHover: string;
  btnSecondaryText: string;
  
  // Accent color & text
  accentColor: string;
  accentText: string;
  
  // Overlay backdrop
  overlayBg: string;
}

export function getThemeStyles(layoutTheme: string): ThemeStyles {
  if (layoutTheme === 'dark-executive') {
    return {
      modalBg: 'bg-[#18181b] text-zinc-100',
      modalHeaderBg: 'bg-[#09090b] text-zinc-100 border-b border-zinc-800',
      modalHeaderTitle: 'text-zinc-100 font-bold',
      modalHeaderSubtitle: 'text-zinc-400',
      modalBorder: 'border-zinc-800',
      modalText: 'text-zinc-100',
      modalMutedText: 'text-zinc-400',
      
      bannerBg: 'bg-gradient-to-r from-[#18181b] via-[#09090b] to-[#18181b] text-zinc-100',
      bannerBorder: 'border-zinc-800',
      bannerAccentText: 'text-amber-400',
      bannerSubtext: 'text-zinc-400',
      headingText: 'text-amber-400',
      
      cardBg: 'bg-zinc-900',
      cardBorder: 'border-zinc-800',
      cardText: 'text-zinc-100',
      
      inputBg: 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none',
      inputBorder: 'border-zinc-700',
      inputText: 'text-zinc-100',
      
      btnPrimaryBg: 'bg-amber-500 hover:bg-amber-400',
      btnPrimaryHover: 'hover:bg-amber-400',
      btnPrimaryText: 'text-zinc-950 font-bold',
      
      btnSecondaryBg: 'bg-zinc-800 hover:bg-zinc-700',
      btnSecondaryHover: 'hover:bg-zinc-700',
      btnSecondaryText: 'text-zinc-200 font-medium',
      
      accentColor: '#f59e0b',
      accentText: 'text-amber-400',
      
      overlayBg: 'bg-black/80 backdrop-blur-xs',
    };
  }

  if (layoutTheme === 'dental-clean') {
    return {
      modalBg: 'bg-[#f0f9ff] text-slate-900',
      modalHeaderBg: 'bg-[#0f4c81] text-white border-b border-[#0284c7]',
      modalHeaderTitle: 'text-white font-bold',
      modalHeaderSubtitle: 'text-sky-100',
      modalBorder: 'border-[#bae6fd]',
      modalText: 'text-slate-900',
      modalMutedText: 'text-slate-600',
      
      bannerBg: 'bg-gradient-to-r from-[#0f4c81] via-[#0284c7] to-[#0369a1] text-white',
      bannerBorder: 'border-sky-400/40',
      bannerAccentText: 'text-sky-200',
      bannerSubtext: 'text-sky-100',
      headingText: 'text-[#0f4c81]',
      
      cardBg: 'bg-white',
      cardBorder: 'border-[#bae6fd]',
      cardText: 'text-slate-900',
      
      inputBg: 'bg-white border-sky-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:outline-none',
      inputBorder: 'border-sky-300',
      inputText: 'text-slate-900',
      
      btnPrimaryBg: 'bg-[#0284c7] hover:bg-[#0369a1]',
      btnPrimaryHover: 'hover:bg-[#0369a1]',
      btnPrimaryText: 'text-white font-bold',
      
      btnSecondaryBg: 'bg-sky-100 hover:bg-sky-200',
      btnSecondaryHover: 'hover:bg-sky-200',
      btnSecondaryText: 'text-sky-900 font-medium',
      
      accentColor: '#0284c7',
      accentText: 'text-[#0284c7]',
      
      overlayBg: 'bg-slate-900/60 backdrop-blur-xs',
    };
  }

  if (layoutTheme === 'soft-pink') {
    return {
      modalBg: 'bg-[#fff1f2] text-[#4c0519]',
      modalHeaderBg: 'bg-[#881337] text-white border-b border-[#9f1239]',
      modalHeaderTitle: 'text-white font-bold',
      modalHeaderSubtitle: 'text-pink-100',
      modalBorder: 'border-[#fecdd3]',
      modalText: 'text-[#4c0519]',
      modalMutedText: 'text-rose-700',
      
      bannerBg: 'bg-gradient-to-r from-[#881337] via-[#9f1239] to-[#be123c] text-white',
      bannerBorder: 'border-pink-400/40',
      bannerAccentText: 'text-pink-200',
      bannerSubtext: 'text-pink-100',
      headingText: 'text-[#881337]',
      
      cardBg: 'bg-white',
      cardBorder: 'border-[#fecdd3]',
      cardText: 'text-[#4c0519]',
      
      inputBg: 'bg-white border-pink-300 text-[#4c0519] placeholder-pink-300 focus:border-pink-600 focus:outline-none',
      inputBorder: 'border-pink-300',
      inputText: 'text-[#4c0519]',
      
      btnPrimaryBg: 'bg-[#e11d48] hover:bg-[#be123c]',
      btnPrimaryHover: 'hover:bg-[#be123c]',
      btnPrimaryText: 'text-white font-bold',
      
      btnSecondaryBg: 'bg-pink-100 hover:bg-pink-200',
      btnSecondaryHover: 'hover:bg-pink-200',
      btnSecondaryText: 'text-pink-900 font-medium',
      
      accentColor: '#f43f5e',
      accentText: 'text-[#f43f5e]',
      
      overlayBg: 'bg-rose-950/60 backdrop-blur-xs',
    };
  }

  // Default: natural / natural-tones
  return {
    modalBg: 'bg-white text-[#2c2c2c]',
    modalHeaderBg: 'bg-[#4a4a35] text-white border-b border-[#5a5a40]',
    modalHeaderTitle: 'text-white font-bold',
    modalHeaderSubtitle: 'text-[#e5e5d1]',
    modalBorder: 'border-[#e5e5d1]',
    modalText: 'text-[#2c2c2c]',
    modalMutedText: 'text-stone-600',
    
    bannerBg: 'bg-gradient-to-r from-[#4a4a35] via-[#3b3b2a] to-[#4a4a35] text-white',
    bannerBorder: 'border-[#5a5a40]',
    bannerAccentText: 'text-[#d4a373]',
    bannerSubtext: 'text-[#d1d1c1]',
    headingText: 'text-[#5a5a40]',
    
    cardBg: 'bg-[#fcfdfa]',
    cardBorder: 'border-[#e5e5d1]',
    cardText: 'text-[#2c2c2c]',
    
    inputBg: 'bg-white border-[#e5e5d1] text-[#2c2c2c] placeholder-stone-400 focus:border-[#5a5a40] focus:outline-none',
    inputBorder: 'border-[#e5e5d1]',
    inputText: 'text-[#2c2c2c]',
    
    btnPrimaryBg: 'bg-[#5a5a40] hover:bg-[#4a4a35]',
    btnPrimaryHover: 'hover:bg-[#4a4a35]',
    btnPrimaryText: 'text-white font-bold',
    
    btnSecondaryBg: 'bg-[#f0f0e8] hover:bg-[#e5e5d1]',
    btnSecondaryHover: 'hover:bg-[#e5e5d1]',
    btnSecondaryText: 'text-[#5a5a40] font-medium',
    
    accentColor: '#d4a373',
    accentText: 'text-[#d4a373]',
    
    overlayBg: 'bg-[#2c2c2c]/70 backdrop-blur-xs',
  };
}
