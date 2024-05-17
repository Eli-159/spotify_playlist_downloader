module.exports = class ReqQue {
    constructor(numConcurrent) {
        this.numConcurrent = numConcurrent;
        this.freeQuota = numConcurrent;
        this.que = [];
    }

    addReqs = (calls) => {
        const reqList = new ReqQue.ReqList(this, calls);
        reqList.reqs.forEach((req) => {
            req.wait.then(this.reqComp).catch(this.reqComp);
            this.que.push(req);
        });
        this.executeQue();
        return reqList;
    }

    reqComp = () => {
        this.freeQuota++;
        this.executeQue();
    }

    executeQue = () => {
        if (this.freeQuota > 0 && this.que.length > 0) {
            this.que.shift().execute();
            this.freeQuota--;
            this.executeQue();
        }
    }

    static ReqList = class {
        constructor(que, calls) {
            this.wait = new Promise((res, rej) => {
                this.end = {
                    res: res,
                    rej: rej
                };
            });

            this.que = que;

            if (typeof calls == 'string' || typeof calls == 'function') {
                const req = new ReqQue.Req(0, calls);
                req.wait.then(this.reqComplete).catch(this.end.rej);
                this.reqs = [req];
            } else {
                this.reqs = calls.map((call, index) => {
                    const req = new ReqQue.Req(index, call);
                    req.wait.then(this.reqComplete).catch(this.end.rej);
                    return req;
                });
            }

            this.result = new Array(this.reqs.length).fill(null);
            this.remainingReqs = this.reqs.length;
        }

        reqComplete = (req) => {
            this.result[req.index] = req.result;
            this.remainingReqs--;
            if (this.remainingReqs == 0) {
                this.end.res(this.result);
            }
        }
    }

    static Req = class {
        constructor(index, call) {
            this.wait = new Promise((res, rej) => {
                this.end = {
                    res: res,
                    rej: rej
                };
            });

            this.index = index;
            this.result = null;

            if (typeof call == 'function') {
                this.call = call;
            } else if (typeof call == 'string') {
                this.call = () => {
                    return fetch(call);
                };
            } else {
                throw Error(`Unknown Call Type: Expected "function" or "string" but recieved "${typeof call}"`);
            }
        }

        execute = () => {
            this.call().then(result => {
                this.result = result;
                this.end.res(this);
            }).catch(this.end.rej);
        }
    }
}