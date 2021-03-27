/**
 * Interceptors, so we intercept the requests and responses globally.
 */
class Interceptors {

    constructor() {

        this.handlers = [];

    }

    use(handler) {

        this.handlers.push(handler);
        return this.handlers.length - 1;
        
    }

    forEach(response) {

        for (const handler of this.handlers) {
            handler(response);
        }
        
    }
    
}


export default Interceptors;
