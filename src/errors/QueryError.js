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

        super('Query error');
        
        this.errors = res.data.errors;
        this.status = res.status;

    }
    
}

export default UnalikeQueryError;
