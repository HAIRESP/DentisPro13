import type {ExamVitalSigns} from '../types';
export function freshMeasurementSession(now=new Date()):{date:string;values:ExamVitalSigns}{
 const pad=(n:number)=>String(n).padStart(2,'0');
 return {date:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,values:{examTime:`${pad(now.getHours())}:${pad(now.getMinutes())}`}};
}
export function resetMeasurementDraft<T extends {vitalSigns?:ExamVitalSigns;examDate?:string}>(data:T,now=new Date()):T {
 const fresh=freshMeasurementSession(now);
 return {...data,examDate:fresh.date,vitalSigns:fresh.values,heartRateBpm:undefined,bloodPressureSystolic:undefined,bloodPressureDiastolic:undefined,bodyTemperatureCelsius:undefined,oxygenSaturationPercent:undefined,capillaryGlucoseMgDl:undefined};
}
