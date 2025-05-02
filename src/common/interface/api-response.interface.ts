// src/common/interfaces/api-response.interface.ts
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error?: string | null;
  timestamp: string;
  path?: string;
}
