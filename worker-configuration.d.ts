interface Env {
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
  DB: D1Database;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(colName?: string): Promise<T | null>;
  all<T = any>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

interface D1Result<T = any> {
  success: boolean;
  results?: T[];
  meta: {
    served_by: string;
    duration: number;
    changes: number;
    last_row_id: number;
    changed_db: boolean;
    size_after: number;
    rows_read: number;
    rows_written: number;
  };
}
