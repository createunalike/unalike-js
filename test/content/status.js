const chai = require('chai');
const assert = chai.assert;

const {Client} = require('../../dist/unalike.min.js');

module.exports = (mock) => {

    describe('Unalike content status', function() {
       
        it('should publish the content', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            
            client.query(`mutation contentStatus($contentId: ID!, $status: String!, $access: String) { 
                contentStatus(contentId: $contentId, status: $status, access: $access) {
                    id
                    name
                }
            }`, {
                contentId: mock.content.id,
                status: 'published',
                access: 'public',
            })
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');

                        done();

                    })
                    .catch(done);

        });

    });

};
