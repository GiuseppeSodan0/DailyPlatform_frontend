import { StatoFormazione } from './stato-formazione.enum';

export interface Formazione {
  id: number;
  uid?: string;
  uuid?: string;
  nomeCorso: string;
  mansioneId?: number;
  mansioneNome?: string;
  attestato?: string;
  enteFormatore?: string;
  dataRilascio?: string;
  dataScadenza?: string;
  stato: StatoFormazione;
  fileAllegato?: string;
  validazioneIa?: string;
  status?: string;
  companyId?: number;
  companyName?: string;
  partecipanteIds?: number[];
}

export interface CreateFormazioneRequest {
  nomeCorso: string;
  mansioneId: number;
  attestato?: string;
  enteFormatore?: string;
  dataRilascio?: string;
  dataScadenza?: string;
  stato: StatoFormazione;
  validazioneIa?: string;
  partecipanteIds?: number[];
}

export interface UpdateFormazioneRequest {
  nomeCorso?: string;
  mansioneId?: number;
  attestato?: string;
  enteFormatore?: string;
  dataRilascio?: string;
  dataScadenza?: string;
  stato?: StatoFormazione;
  validazioneIa?: string;
  partecipanteIds?: number[];
}
