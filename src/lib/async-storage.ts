import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  error?: Error;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Retorna o contexto da requisição atual se estiver rodando dentro do escopo de um request.
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Helper para atualizar propriedades no contexto ativo
 */
export function updateRequestContext(updates: Partial<RequestContext>): void {
  const store = asyncLocalStorage.getStore();
  if (store) {
    Object.assign(store, updates);
  }
}
