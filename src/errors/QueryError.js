/**
 * Query error object, returning response errors and status.
 */
class UnalikeQueryError extends Error {

    /**
     * Constructor from response.
     *
     * @param {object} res - Response object from API request.
     */
    constructor(res) {
        
        let msg = 'Query error';

        if (res.data.errors && res.data.errors.length > 0 && res.data.errors[0].message) {
            msg = res.data.errors[0].message;
        }

        super(msg);

        this.errors = res.data.errors;
        
        this.status = res.status;

    }
    
}

export default UnalikeQueryError;
