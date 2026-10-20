/** Digest of the saved clinical payload; excludes PDF rendering and print timestamps. */
export async function documentFingerprint(input: unknown): Promise<string> {
  const canonical=(value:unknown):unknown=>{
    if(Array.isArray(value))return value.map(canonical);
    if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));
    return value;
  };
  const bytes=new TextEncoder().encode(JSON.stringify(canonical(input)));
  const buffer=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
}
