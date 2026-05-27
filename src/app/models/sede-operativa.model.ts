import { Reparto } from './reparto.enum';

export interface SedeOperativa {
  id: number;
  nomeSede: string;
  indirizzo: string;
  civico: number;
  responsabileSede: string;
  reparti: Reparto;
  cap: number;
  comune: string;
  provincia: string;
  regione: string;
  nazione: string;
  companyId?: number;
  companyName?: string;
}
