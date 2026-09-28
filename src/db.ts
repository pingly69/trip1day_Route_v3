export interface SiteRow {
  site_id: string;
  site_name: string;
  active: number;
}

export interface RouteRow {
  route_id: string;
  site_id: string;
  site_name: string;
  route_name: string;
  origin: string;
  destination: string;
  distance_km: number;
  active: number;
}

export interface UserRow {
  line_uid: string;
  requester_name: string;
  car_no: string;
  group_car: number;
  emp_no: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionRow {
  transaction_id: string;
  req_name: string;
  req_line_user_id: string;
  req_date: string;
  plate_no: string;
  site_id: string;
  site_name: string;
  travel_purpose: string;
  image_url: string;
  total_km: number;
  toll_fee: number;
  park_fee: number;
  flat_rate_fee: number;
  net_total: number;
  approver: string;
  status: string;
  approve_datetime: string | null;
  trip_details: string;
  created_at: string;
  emp_no?: string | null;
}

export interface TransactionFilters {
  startCreatedAt?: string;
  endCreatedAt?: string;
  startReqDate?: string;
  endReqDate?: string;
  startApprove?: string;
  endApprove?: string;
  reqName?: string;
  plateNo?: string;
  approver?: string;
  siteId?: string;
  status?: string;
}
