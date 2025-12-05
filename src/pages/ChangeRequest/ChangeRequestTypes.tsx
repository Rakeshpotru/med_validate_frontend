export interface ChangeRequest {
  change_request_id: number;
  change_request_code: string;
  change_request_file: string;
  project_id: number;
  project_name: string;
  is_verified: boolean | null;
  reject_reason: string | null;
  change_request_json?: string;
  transaction_template_id?: number | null;
  change_request_user_mapping_id: number;
}

export interface ApiResponse {
  status_code: number;
  message: string;
  data: ChangeRequest[];
}