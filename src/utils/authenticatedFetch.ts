const SESSION_KEY = 'dentispro_server_session_v1';
export const getSessionToken = () => sessionStorage.getItem(SESSION_KEY) || '';
export function setSessionToken(token: string) { if (token) sessionStorage.setItem(SESSION_KEY,token); else sessionStorage.removeItem(SESSION_KEY); }
export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  if (!path.startsWith('/api/') || path.startsWith('//')) throw new Error('Destino de API inválido.');
  const token = getSessionToken();
  const headers = new Headers(init.headers);
  if(token) headers.set('Authorization',`Bearer ${token}`);
  const response = await fetch(path,{...init,headers,credentials:'omit',redirect:'error'});
  if(response.status===401 && token && getSessionToken()===token) {
    setSessionToken('');window.dispatchEvent(new Event('dentispro-session-expired'));
  }
  return response;
}
export async function authRequest(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST') {
  const response=await authenticatedFetch(`/api/auth${path}`,{method,...(body===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});
  const data=await response.json();
  if(!response.ok) throw Error(data.error || 'Não foi possível completar a operação.');
  return data;
}
