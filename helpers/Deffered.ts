//Deffered.ts
//--------------------------------------------------
//Copyright 2020 Pascâl Hartmann
//See LICENSE File
//--------------------------------------------------
//Helper Class for promises
//modified from
//https://codereview.stackexchange.com/questions/105754/access-resolve-function-outside-of-a-javascript-promise
//--------------------------------------------------

export default class Deferred<T> implements Promise<T> {

    [Symbol.toStringTag]: 'Promise'
    private _resolveSelf;
    private _rejectSelf;
    private promise: Promise<T>
    private timeout: ReturnType<typeof setTimeout>;

    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        this.timeout = setTimeout(() => {
            this.reject("timeout")
        }, 5000)
        this.promise = new Promise((resolve, reject) => {
                this._resolveSelf = resolve
                this._rejectSelf = reject

            }
        )
        executor.call(this, this._resolveSelf, this._rejectSelf)
    }

    public then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) =>
            TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) =>
            TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected)
    }

    public catch<TResult = never>(
        onrejected?: ((reason: any) =>
            TResult | PromiseLike<TResult>) | undefined | null
    ): Promise<T | TResult> {
        return this.promise.then(onrejected)
    }

    public finally(onfinally?: () => void): Promise<T> {
        return this.promise.finally(onfinally)
    }

    public resolve(val: T) {
        clearTimeout(this.timeout)
        this._resolveSelf(val)
    }

    public reject(reason: any) {
        clearTimeout(this.timeout)
        this._rejectSelf(reason)
    }

}