export interface Policy {
  id: number;
  uid?: string;
  uuid?: string;
  name: string;
  description: string;
  expression: string;
  targetEntity: string;
  targetAction: string;
  priority: number;
  status: string;
  companyId?: number;
}
