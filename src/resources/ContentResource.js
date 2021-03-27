import Resource from './Resource';

/**
 * Content resource to query and filter content.
 */
class ContentResource extends Resource {

    constructor(client) {

        super(client);
        
    }

    repository(repository) {

        this.variables.repository = repository;
        return this;

    }

    person(person) {

        this.variables.person = person;
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

    type(type) {
        
        this.variables.type = type;
        return this;

    }

    /**
     * Get content revision by status.
     *
     * @param {string|Array} status - Content revision status.
     */
    status(status) {
        
        this.variables.status = status;
        return this;

    }

    published() {

        this.variables.published = true;
        return this;

    }

    tags(tags) {
        
        this.variables.tags = tags;
        return this;

    }

    async fetch(fields) {

        if (this.variables.id) {

            const variables = {
                id: this.variables.id,
            };

            const response = await this.client.query(`query content($id: ID!) {
                content(id: $id) {
                    ${fields}
                }
            }`, variables);
        
            return {
                data: response.data.content,
            };

        }
    
        const variables = {
            repositoryId: this.variables.repository,
            personId: this.variables.person,
            sortBy: this.variables.sortBy,
            sortDirection: this.variables.sortDirection,
            pageSize: this.variables.pageSize,
            page: this.variables.page,
            type: this.variables.type,
            status: this.variables.status,
            published: this.variables.published,
            tags: this.variables.tags,
        };

        const response = await this.client.query(`query contents($repositoryId: ID, $personId: ID, $sortBy: String, $sortDirection: SortDirection, $pageSize: Int, $page: Int, $type: [String], $status: [String], $published: Boolean, $tags: [String]){
            contents(repositoryId: $repositoryId, personId: $personId, sortBy: $sortBy, sortDirection: $sortDirection, pageSize: $pageSize, page: $page, type: $type, status: $status, published: $published, tags: $tags) {
                ${fields}
            }
        }`, variables);

        return {
            data: response.data.contents,
        };

    }

    async delete() {

        if (!this.variables.id) {
            throw new Error('Content ID needs to be supplied before you can delete.');
        }

        const variables = {
            contentId: this.variables.id,
        };

        const response = await this.client.query(`mutation deleteContent($contentId: ID!) {
            deleteContent(contentId: $contentId) {
                id
                name
            }
        }`, variables);

        return {
            data: response.data.deleteContent,
        };
        
    }

}

export default ContentResource;
