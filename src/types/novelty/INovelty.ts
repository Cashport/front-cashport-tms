export interface INoveltyType {
  id: number;
  name: string;
  icon_id: string;
  updated_at: Date;
  created_at: Date;
  service_type_id: number;
}

export interface IEvidence {
  id: number;
  novelty_id: number;
  name: string;
  url: string;
  created_at: Date;
  updated_at: Date;
}

export interface INovelty {
  id: number;
  trip_id: number;
  novelty_type: string;
  observation: string;
  value: number;
  status: string;
  status_id: string;
  created_by: string;
  quantity: number;
  unit_value: number;
  overcost_id: number;
  evidences: IEvidence[];
}

export interface INoveltyEvidenceBody {
  name: string;
  url: string;
}

export interface INoveltyBody {
  id?: number;
  observation: string;
  novelty_type_id: number;
  trip_id: number;
  quantity: number;
  value: number;
  overcostId: number;
  created_by: string;
  evidences?: INoveltyEvidenceBody[];
}

export interface IOvercost {
  id: number;
  description: string;
  price: number;
}
