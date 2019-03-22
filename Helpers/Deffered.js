//modified https://codereview.stackexchange.com/questions/105754/access-resolve-function-outside-of-a-javascript-promise

class Deffered {
    constructor(callback) {
        const instance = this;

        // Catch the resolve and reject
        this._resolver = null;
        this._rejector = null;
        this._promise = new Promise(function (resolve, reject) {
            instance._resolver = (value) => {
                clearTimeout(instance.timeoutHandle);
                resolve(value);
            };
            instance._rejector = reject;
        });
        this.timeoutHandle = setTimeout(() => {
            this._rejector('timeout');
        }, 5000);
        // Deferred has { resolve, reject }. But personally, I like the Promise
        // version of resolve and reject as separate args.
        if (typeof callback === 'function')
            callback.call(this, this._resolver, this._rejector);
    }

    then(resolve, reject) {
        return this._promise.then(resolve, reject);
    }

    catch(reject) {
        return this._promise.catch(reject);
    }

    resolve(value) {
        this._resolver(value);
    }

    reject(error) {
        this._rejector(error);
    }

}

module.exports = Deffered;