/**
 * Resource base class for the resources.
 */
class Resource {

    constructor(client) {

        this.client = client;

        this.variables = {
            
        };

    }

    id(id) {

        this.variables.id = id;
        return this;

    }

}

export default Resource;
