export interface StorageRequestData {
  name: string;
  phone: string;
  bikeModel: string;
  startDate: string;
  endDate: string;
  notes: string;
  duration: string;
  status: 'pending';
  timestamp: string;
}

export interface FormData {
  name: string;
  phone: string;
  bikeModel: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export enum Step {
  HERO = 0,
  DETAILS = 1,
  BIKE_INFO = 2,
  DURATION = 3,
  SUCCESS = 4
}