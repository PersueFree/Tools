// src/types/reduxTypes.ts
export interface StState {
  value?: string;
  shuffleValue?: string;
}

export interface RsState {
  prefix?: string;
  strLength?: number;
  groups?: number;
  type?: number;
  shuffleValue?: string | string[];
}

export interface CcState {
  confuseKey?: string;
  type?: string;
  subValue?: string;
  result?: string;
}

export interface PocState {
  confuseKey?: string;
  type?: string;
  subValue?: string;
  result?: string;
}

export interface EdState {
  confuseKey?: string;
  count?: string;
  subValue?: string;
  result?: string;
  dstRight?: string;
}

export interface AppState {
  st: StState;
  rs: RsState;
  cc: CcState;
  poc: PocState;
  ed: EdState;
}

// Redux action payload types
// export interface SetStPayload extends StState {}
// export interface SetCcPayload extends CcState {}
// export interface SetPocPayload extends PocState {}
// export interface SetEdPayload extends EdState {}
