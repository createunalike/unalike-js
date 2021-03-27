const chai = require('chai');
const assert = chai.assert;

const {Client} = require('../../dist/unalike.min.js');

module.exports = (mock) => {

    describe('Unalike content queries', function() {
       
        it('should query all content for repository', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            
            client.query(`query contents($repositoryId: ID!) {
                contents(repositoryId: $repositoryId) {
                    id
                    name
                }
            }`, {
                repositoryId: process.env.REPOSITORY,
            })
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');
                        
                        assert.exists(response.data.contents, 'No contents data');
                        
                        done();

                    })
                    .catch(done);

        });

        it('should query content by id', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            
            client.query(`query content($id: ID!) {
                content(id: $id) {
                    id
                    name
                }
            }`, {
                id: mock.content.id,
            })
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');
                        
                        assert.exists(response.data.content, 'No content data');
                        assert.exists(response.data.content.id, 'response.data.content.id');
                        assert.exists(response.data.content.name, 'response.data.content.name');
                    
                        done();

                    })
                    .catch(done);

        });

        it('should query content by tag via resource', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            client.content().repository(process.env.REPOSITORY).tags('test1').fetch('id name')
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');

                        assert.exists(response.data[0].id, 'response.data.content.id');
                        assert.exists(response.data[0].name, 'response.data.content.name');

                        done();

                    })
                    .catch(done);

        });

        it('should query content by tag array via resource', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            client.content().repository(process.env.REPOSITORY).tags(['TEST1', 'Test2']).fetch('id name')
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');

                        assert.exists(response.data[0].id, 'response.data.content.id');
                        assert.exists(response.data[0].name, 'response.data.content.name');

                        done();

                    })
                    .catch(done);

        });

    });

};
