export class MessageQueueManager {
  private messageQueues = new Map<string, Array<{ message: any; retries: number }>>();

  enqueue(namespace: string, message: any, retries = 0) {
    const queue = this.messageQueues.get(namespace) || [];
    queue.push({ message, retries });
    this.messageQueues.set(namespace, queue);
  }

  async flush(namespace: string, sendFn: (message: any) => Promise<any>) {
    const queue = this.messageQueues.get(namespace);
    if (!queue || queue.length === 0) return;

    const remainingQueue: Array<{ message: any; retries: number }> = [];

    for (const { message, retries } of queue) {
      if (retries < 3) {
        try {
          await sendFn({ ...message, retries });
        } catch {
          remainingQueue.push({ message, retries: retries + 1 });
        }
      }
    }

    this.messageQueues.set(namespace, remainingQueue);
  }

  clear(namespace: string) {
    this.messageQueues.delete(namespace);
  }

  clearAll() {
    this.messageQueues.clear();
  }
}
