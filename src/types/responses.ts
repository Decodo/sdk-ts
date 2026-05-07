export type ResultEntry = {
  content: unknown;
  status_code: number;
  url?: string;
  task_id: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>[];
  created_at: string;
  updated_at: string;
  help?: string;
  browser_actions_warnings?: Record<string, string>[];
  browser_actions_error?: Record<string, string>[];
  delivery_zip?: string;
};

export type SyncResponse = {
  results: ResultEntry[];
};

export type AsyncTaskResponse = {
  id: string;
  target?: string;
  url?: string;
  query?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  page_from?: number;
  limit?: number;
  geo?: string | null;
  device_type?: string;
  headless?: string | null;
  parse?: boolean;
  locale?: string | null;
  domain?: string;
  output_schema?: string | null;
  content_encoding?: string;
  page_count?: number;
  adults?: number;
  children?: number;
  callback_url?: string;
  browser_actions_error?: Record<string, string>[];
  browser_actions_warnings?: Record<string, string>[];
};

export type BatchResponse = {
  id?: string;
  queries?: AsyncTaskResponse[];
  errors?: Array<{ message: string }>;
};

export type TaskStatus = 'pending' | 'faulted' | 'done';

export type TaskMetadata = {
  status: TaskStatus;
  [key: string]: unknown;
};

export type TaskResultsResponse = {
  results: ResultEntry[];
};

export type ErrorResponse = {
  status: string;
  message: string;
  errors?: unknown[];
};
