const chai = require('chai');
const assert = chai.assert;

const {Client} = require('../../dist/unalike.min.js');

module.exports = (mock) => {

    describe('Unalike content create and modify', function() {

        it('should create content', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);

            client.query(`mutation content($repositorySlug: String, $content: JSON!) { 
                content(repositorySlug: $repositorySlug, content: $content) {
                    id 
                    name 
                    data
                    revision {
                        id
                        status
                        contentId
                        delta
                    }
                }
            }`, {
                repositorySlug: process.env.REPOSITORY,
                content: mock.content,
            })
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');
                        
                        assert.exists(response.data.content, 'response.data.content');
                        assert.exists(response.data.content.id, 'response.data.content.id');

                        mock.content.id = response.data.content.id;

                        assert.exists(response.data.content.name, 'response.data.content.name');
                        
                        assert.strictEqual(response.data.content.name, mock.content.name);

                        assert.exists(response.data.content.revision, 'response.data.content.revision');
                        assert.exists(response.data.content.revision.id, 'response.data.content.revision.id');
                        assert.exists(response.data.content.revision.status, 'response.data.content.revision.status');
                        assert.exists(response.data.content.revision.delta, 'response.data.content.revision.delta');
                        assert.exists(response.data.content.revision.delta.data, 'response.data.content.revision.delta.data');
                        
                        assert.strictEqual(response.data.content.revision.delta.data.length, 1);
                        assert.equal(response.data.content.revision.delta.data[0].test, 'test');
                       
                        assert.strictEqual(response.data.content.revision.status, 'draft');
                        
                        done();

                    })
                    .catch(done);

        });

        it('should update content', function(done) {

            const value = 'test update content';
            mock.content.data.test = value;
    
            const client = new Client();
            client.setToken(process.env.TOKEN);
            
            client.query(`mutation content($content: JSON!) { 
                content(content: $content) {
                    id 
                    name
                    data
                    revision {
                        id
                        status
                        contentId
                        delta
                    }
                }
            }`, {
                repositorySlug: process.env.REPOSITORY,
                content: mock.content,
            })
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');
                        
                        assert.exists(response.data.content, 'response.data.content');
                        assert.exists(response.data.content.id, 'response.data.content.id');
                        assert.exists(response.data.content.name, 'response.data.content.name');
                        
                        assert.strictEqual(response.data.content.name, mock.content.name);

                        assert.exists(response.data.content.revision, 'response.data.content.revision');
                        assert.exists(response.data.content.revision.id, 'response.data.content.revision.id');
                        assert.exists(response.data.content.revision.status, 'response.data.content.revision.status');
                        assert.exists(response.data.content.revision.contentId, 'response.data.content.revision.contentId');
                        assert.exists(response.data.content.revision.delta, 'response.data.content.revision.delta');
                        assert.exists(response.data.content.revision.delta.data, 'response.data.content.revision.delta.data');

                        assert.strictEqual(Object.keys(response.data.content.revision.delta.data).length, 1);
                        assert.equal(response.data.content.revision.delta.data.test[0], 'test update content');
                        
                        assert.strictEqual(response.data.content.revision.contentId, response.data.content.id);
                        assert.strictEqual(response.data.content.revision.status, 'draft');
                        
                        done();
    
                    })
                    .catch(done);
    
        });
       
    });

};
