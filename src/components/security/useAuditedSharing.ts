import {useEffect} from 'react';
import {authorizeWorkspaceAction} from '../../utils/workspaceActions';

// These hooks account for sharing initiated by the app. OS screenshots, browser
// menu printing and copies made after data was delivered cannot be prevented.
export function useAuditedSharing(active: boolean, report: (message: string) => void) {
  useEffect(() => {
    if (!active) return;
    const nativeOpen = window.open.bind(window);
    const nativeCopy = navigator.clipboard?.writeText.bind(navigator.clipboard);
    window.open = ((url?: string | URL, target?: string, features?: string) => {
      const value = String(url || '');
      if (!/https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(value)) return nativeOpen(url, target, features);
      const popup = nativeOpen('', target || '_blank', features);
      void authorizeWorkspaceAction('export', 'whatsapp').then(()=>{if(popup){popup.opener=null;popup.location.href=value;}}).catch(e=>{popup?.close();report(e.message);});
      return popup;
    }) as typeof window.open;
    if (nativeCopy) navigator.clipboard.writeText = async text => {await authorizeWorkspaceAction('export', 'clipboard'); await nativeCopy(text);};
    let permitted: HTMLAnchorElement | null = null;
    const click = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link === permitted || !/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(link.href)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      void authorizeWorkspaceAction('export', 'whatsapp').then(()=>{permitted=link;link.click();permitted=null;}).catch(e=>report(e.message));
    };
    document.addEventListener('click',click,true);
    return ()=>{window.open=nativeOpen;if(nativeCopy)navigator.clipboard.writeText=nativeCopy;document.removeEventListener('click',click,true);};
  },[active,report]);
}
