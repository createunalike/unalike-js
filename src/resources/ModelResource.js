import Resource from './Resource';

/**
 * Model resource to query and filter models.
 */
class ModelResource extends Resource {

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

    pageSize(pageSize) {
        
        this.variables.pageSize = pageSize;
        return this;

    }

    page(page) {
        
        this.variables.page = page;
        return this;

    }

    status(status) {
        
        this.variables.status = status;
        return this;

    }

    async fetch(fields) {

        if (this.variables.id) {

            const variables = {
                id: this.variables.id,
            };

            const response = await this.client.query(`query model($id: ID!) {
                model(id: $id) {
                    ${fields}
                }
            }`, variables);
        
            return {
                data: response.data.model,
            };

        }

        const variables = {
            repositoryId: this.variables.repository,
        };

        const response = await this.client.query(`query models($repositoryId: ID) {
            models(repositoryId: $repositoryId) {
                ${fields}
            }
        }`, variables);

        return {
            data: response.data.models,
        };

    }

    async delete() {

        if (!this.variables.id) {
            throw new Error('Model ID needs to be supplied before you can delete.');
        }
    
        const variables = {
            modelId: this.variables.id,
        };

        const response = await this.client.query(`mutation deleteModel($modelId: ID!) {
            deleteModel(modelId: $modelId) {
                id
                name
            }
        }`, variables);

        return {
            data: response.data.deleteModel,
        };

    }

}

export default ModelResource;
