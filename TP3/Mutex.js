class Mutex {
    constructor() {
        this.resolve = null;
        this.promise = null;
    }

    async lock() {
        if (this.promise != null)
            await this.promise;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
        });
    }

    tryLock() {
        if (this.promise != null) {
            return false;
        } else {
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
            });
            return true;
        }
    }

    async unlock() {
        if (this.resolve != null) {
            this.resolve();
            this.resolve = null;
            this.promise = null;
        }
    }
}
