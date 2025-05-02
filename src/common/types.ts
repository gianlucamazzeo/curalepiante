// Interfaccia per i metadati di paginazione
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interfaccia generica per risposta paginata
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
