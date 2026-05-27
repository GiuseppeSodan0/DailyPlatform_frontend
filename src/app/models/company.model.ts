import { SedeOperativa } from './sede-operativa.model';

export interface CompanyUserBrief {
  id: number;
  name: string;
  surname: string;
  email: string;
}

export interface Company {
  id: number;
  uid: string;
  uuid: string;
  factoryName: string;
  partitaIva: number;
  codiceFiscale: string;
  codiceUnivoco: string;
  email: string;
  pec: string;
  telefono: string;
  responsabile: CompanyUserBrief | null;
  sediOperative: SedeOperativa[];
  indirizzo: string;
  civico: number;
  settore: string;
  medicoCompetente: CompanyUserBrief | null;
  rspp: CompanyUserBrief | null;
  consulente: CompanyUserBrief | null;
  status: string;
  note: string;
  cap: string;
  comune: string;
  provincia: string;
  regione: string;
  nazione: string;
  codiceAteco: string;
  numDipendenti: number;
}
