export interface TripPlan {
  title: string;
  destination: string;
  days: number;
  budget: number;
  createdAt: Date;
}

export interface TripPlanResponse extends TripPlan {
  _id: string;
}