import Resource from './Resource';

/**
 * Repository resource to query and filter repositories.
 */
class RepositoryResource extends Resource {

    constructor(client) {

        super(client);
        
    }

    repository(repository) {

        this.variables.repository = repository;
        return this;

    }

    sortBy(sortBy) {

        this.variables.sortBy = sortBy;
        return this;

    }

    sortUp() {
        
        this.variables.sortDirection = 'ASC';
        return this;

    }

    sortDown() {
        
        this.variables.sortDirection = 'DESC';
        return this;

    }

    async fetch(fields) {

        if (this.variables.id) {

            const response = await this.client.query(`query repository($slug: String) {
                repository(slug: $slug) {
                    ${fields}
                }
            }`, {
                slug: this.variables.id,
            });
        
            return {
                data: response.data.repository,
            };

        }

        const variables = {
            sortBy: this.variables.sortBy,
            sortDirection: this.variables.sortDirection,
        };

        const response = await this.client.query(`query repositories($sortBy: String, $sortDirection: SortDirection) { 
            repositories(sortBy: $sortBy, sortDirection: $sortDirection) { 
                ${fields}
            }
        }`, variables);

        return {
            data: response.data.repositories,
        };

    }

}

export default RepositoryResource;
