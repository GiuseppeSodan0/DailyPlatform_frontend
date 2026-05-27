import { GiudizioIdoneita } from './giudizio-idoneita.enum';

export interface SorveglianzaSanitaria {
  id: number;
  uid?: string;
  uuid?: string;
  fkLavoratore?: number;
  lavoratoreNome?: string;
  lavoratoreCognome?: string;
  fkMansione?: number;
  mansioneNome?: string;
  rischiSanitari?: string;
  protocolloSanitario?: string;
  visitaPrevista?: string;
  visitaEffettuata?: string;
  scadenza?: string;
  giudizioIdoneita: GiudizioIdoneita;
  limitazioniPrescrizioni?: string;
  fileAllegatiRiservati?: string;
  medicoCompetente?: string;
  status?: string;
  companyId?: number;
  companyName?: string;
}

export interface CreateSorveglianzaSanitariaRequest {
  fkLavoratore: number;
  fkMansione: number;
  rischiSanitari?: string;
  protocolloSanitario?: string;
  visitaPrevista?: string;
  visitaEffettuata?: string;
  scadenza?: string;
  giudizioIdoneita: GiudizioIdoneita;
  limitazioniPrescrizioni?: string;
  medicoCompetente?: string;
}

export interface UpdateSorveglianzaSanitariaRequest {
  fkLavoratore?: number;
  fkMansione?: number;
  rischiSanitari?: string;
  protocolloSanitario?: string;
  visitaPrevista?: string;
  visitaEffettuata?: string;
  scadenza?: string;
  giudizioIdoneita?: GiudizioIdoneita;
  limitazioniPrescrizioni?: string;
  medicoCompetente?: string;
}
