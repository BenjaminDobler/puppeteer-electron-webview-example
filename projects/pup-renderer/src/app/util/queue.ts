export class Queue {
  private queue = [];
  workingOnPromise = false;

  constructor() {}

  add(func: (...someArgs) => Promise<any>, scope, ...args): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        func,
        args,
        resolve,
        reject,
        scope,
      });
      this.dequeue();
    });
  }

  private dequeue() {
    if (this.workingOnPromise) {
      return false;
    }
    const item = this.queue.shift();
    if (!item) {
      return false;
    }
    try {
      this.workingOnPromise = true;

      item.func
        .call(item.scope, ...item.args)
        .then((value) => {
          this.workingOnPromise = false;
          item.resolve(value);
          this.dequeue();
        })
        .catch((err) => {
          this.workingOnPromise = false;
          item.reject(err);
          this.dequeue();
        });
    } catch (err) {
      this.workingOnPromise = false;
      item.reject(err);
      this.dequeue();
    }
    return true;
  }
}
