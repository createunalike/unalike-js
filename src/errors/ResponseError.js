/**
 * Complex response error.
 */
class UnalikeError extends Error {

    constructor(response) {

        let message = 'Unknown error';
        
        // Handle primary message formats
        // TODO: Check if we can tidy this up a little
        if (response.body && response.body.message) {
            message = response.body.message;
        } else if (response.data && response.data.message) {
            message = response.data.message;
        // Handle graph errors, as there might be more than one, but usually there's one that we can get a message from
        } else if (response.data.errors && response.data.errors.length > 0 && response.data.errors[0].message) {
            message = response.data.errors[0].message;
        }
      
        super(message);

        this.status = response.status;

    }
    
}

export default UnalikeError;
