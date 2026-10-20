export function clinicalPatient<T extends {id:string}>(patients:T[],id:string | null | undefined):T | undefined {
 return id ? patients.find(patient=>patient.id===id) : undefined;
}
