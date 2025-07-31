import { SocketError } from './types';

interface PendingRequest<T = unknown> {
  resolve: (data: T) => void;
  reject: (reason: SocketError) => void;
  timeout: NodeJS.Timeout;
  createdAt: number;
}

export class PendingRequestsManager {
  private pendingRequests = new Map<string, PendingRequest>();

  add<T>(requestId: string, resolve: (data: T) => void, reject: (reason: SocketError) => void, timeoutMs: number) {
    const timeout = setTimeout(() => {
      this.delete(requestId);
      reject({
        code: 'REQUEST_TIMEOUT',
        message: 'No response from server',
        isOperational: true,
      });
    }, timeoutMs);

    this.pendingRequests.set(requestId, {
      resolve,
      reject,
      timeout,
      createdAt: Date.now(),
    });
  }

  resolve<T>(requestId: string, data: T) {
    const req = this.pendingRequests.get(requestId);
    if (!req) return false;
    clearTimeout(req.timeout);
    req.resolve(data);
    this.pendingRequests.delete(requestId);
    return true;
  }

  reject(requestId: string, error: SocketError) {
    const req = this.pendingRequests.get(requestId);
    if (!req) return false;
    clearTimeout(req.timeout);
    req.reject(error);
    this.pendingRequests.delete(requestId);
    return true;
  }

  delete(requestId: string) {
    const req = this.pendingRequests.get(requestId);
    if (req) clearTimeout(req.timeout);
    this.pendingRequests.delete(requestId);
  }

  clearAll() {
    this.pendingRequests.forEach(req => clearTimeout(req.timeout));
    this.pendingRequests.clear();
  }
}
