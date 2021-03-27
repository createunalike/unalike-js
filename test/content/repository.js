const chai = require('chai');
const assert = chai.assert;

const {Client} = require('../../dist/unalike.min.js');

module.exports = (mock) => {

    describe('Unalike repositories', function() {

        it('should get test repository', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            
            client.query(`query repository($slug: String!) { 
                repository(slug: $slug) {
                    id
                    name
                }
            }`, {
                slug: process.env.REPOSITORY,
            })
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');

                        assert.exists(response.data.repository.id, 'response.data.repository.id');
                        assert.exists(response.data.repository.name, 'response.data.repository.name');

                        assert.equal(response.data.repository.id, process.env.REPOSITORY);

                        done();

                    })
                    .catch(done);

        });
        
    });

};
