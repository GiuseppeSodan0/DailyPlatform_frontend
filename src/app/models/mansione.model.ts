import { RischioLavorativo } from './rischio-lavorativo.enum';
import { DPI } from './dpi.enum';

export interface Mansione {
  id: number;
  uid?: string;
  uuid?: string;
  nomeMansione: string;
  descrizione?: string;
  fasiDiLavoro?: string;
  rischiAssociati?: RischioLavorativo[];
  dpiRichiesti?: DPI[];
  formazioneRichiesta?: string;
  sorveglianzaSanitaria?: string;
  procedureOperative?: string;
  checklistCollegate?: string;
  documentiCollegati?: string;
  status?: string;
  companyId?: number;
  companyName?: string;
}

export interface CreateMansioneRequest {
  nomeMansione: string;
  descrizione?: string;
  fasiDiLavoro?: string;
  rischiAssociati?: RischioLavorativo[];
  dpiRichiesti?: DPI[];
  formazioneRichiesta?: string;
  sorveglianzaSanitaria?: string;
  procedureOperative?: string;
  checklistCollegate?: string;
  documentiCollegati?: string;
}

export interface UpdateMansioneRequest {
  nomeMansione?: string;
  descrizione?: string;
  fasiDiLavoro?: string;
  rischiAssociati?: RischioLavorativo[];
  dpiRichiesti?: DPI[];
  formazioneRichiesta?: string;
  sorveglianzaSanitaria?: string;
  procedureOperative?: string;
  checklistCollegate?: string;
  documentiCollegati?: string;
}
