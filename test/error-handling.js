const chai = require('chai');
const assert = chai.assert;

const {Client} = require('../dist/unalike.min.js');

module.exports = (mock) => {

    describe('Unalike Error handling', function() {

        it('should throw 400 exception for bad request with incorrect fields', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            
            client.repository().fetch('id name dddd { id name }')
                    .then(function(response) {

                        assert.fail('Expected 400 exception not thrown');

                        done();

                    })
                    .catch(function(e) {

                        assert.isNotNull(e, 'No error object');
                        assert.strictEqual(e.status, 400, 'Exception status not 400');
                        assert.equal(e.message, 'Cannot query field "dddd" on type "Repository".');

                        done();
                        
                    });

        });

        it('should throw 404 exception for content not found', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            
            client.content('0d0460d1-3363-4779-840a-5856464d520d').fetch('id name')
                    .then(function(response) {

                        assert.fail('Expected graphql query exception');

                        done();

                    })
                    .catch(function(e) {

                        assert.isNotNull(e, 'No error object');
                        assert.strictEqual(e.status, 200, 'Exception status not 200');
                        assert.equal(e.message, `Couldn't find that.`);

                        assert.isNotNull(e.errors, 'No graphql errors array');
                        assert.strictEqual(e.errors[0].status, 404, 'GraphQL error status not 404');
                        assert.equal(e.errors[0].message, `Couldn't find that.`);
                        
                        done();
                        
                    });

        });
        
    });

};
