export type VehicleIdentityInputType = "PLATE" | "VIN";
export type VehicleContextState = "VERIFIED" | "PARTIAL" | "ASSISTED";
export type VehicleFacts = { make:string|null; model:string|null; year:number|null; engine:string|null; engineVolumeL:number|null; fuelType:string|null; bodyType:string|null; driveType:string|null; transmission:string|null };
export type PublicVehicleContext = { state:VehicleContextState; inputType:VehicleIdentityInputType; maskedIdentifier:string; confidence:number; source:string; vehicle:VehicleFacts|null; vinAvailable:boolean; canonicalReferenceReady:boolean; exactFitmentReady:boolean; needsVin:boolean; message:string; contextId?:string };
const CYRILLIC_TO_LATIN:Record<string,string>={"А":"A","В":"B","С":"C","Е":"E","Н":"H","І":"I","К":"K","М":"M","О":"O","Р":"P","Т":"T","Х":"X"};
const VIN_RE=/^[A-HJ-NPR-Z0-9]{17}$/; const PLATE_RE=/^[A-Z0-9]{6,10}$/;
export function normalizeVin(value:string){return String(value??"").toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,"").slice(0,17)}
export function normalizePlate(value:string){const compact=String(value??"").toUpperCase().replace(/[^A-ZА-ЯІЇЄ0-9]/g,"");return [...compact].map(c=>CYRILLIC_TO_LATIN[c]??c).join("").slice(0,10)}
export function detectVehicleIdentifier(value:string){const raw=String(value??"").trim();const vin=normalizeVin(raw);if(VIN_RE.test(vin))return{type:"VIN" as const,normalized:vin,masked:`${vin.slice(0,3)}${"•".repeat(10)}${vin.slice(-4)}`};const plate=normalizePlate(raw);if(PLATE_RE.test(plate))return{type:"PLATE" as const,normalized:plate,masked:`${plate.slice(0,2)}${"•".repeat(Math.max(2,plate.length-4))}${plate.slice(-2)}`};return null}
export function vehicleLabel(context:PublicVehicleContext|null){if(!context?.vehicle)return null;const {make,model,year,engine}=context.vehicle;return [make,model,year,engine].filter(Boolean).join(" · ")||null}
export function vehicleDisplayLabel(context:PublicVehicleContext|null){return vehicleLabel(context)??context?.maskedIdentifier??null}
export const DEMO_VEHICLES:PublicVehicleContext[]=[];
