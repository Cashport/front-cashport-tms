export interface TransferRequestFinish {
  id: number;
  providers: CarrierPricingFinish[];
}

export interface CarrierPricingFinish {
  idEntity: number;
  provider: number;
  id_carrier_request: number;
  entity: 'trip' | 'otherRequirement';
}
