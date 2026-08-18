export interface Activity {
  id: string;
  type: string;
  message: string;
  user: string;
  time: string;
  status: string;
  timestamp?: Date;
}

export interface RecentActivitiesResponse {
  data?: Activity[];
  error?: string;
}