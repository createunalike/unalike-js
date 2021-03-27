const chai = require('chai');
const assert = chai.assert;

const {Client} = require('../../dist/unalike.min.js');

module.exports = (mock) => {

    describe('Unalike delete content', function() {

        it(`should delete contents by id's via resource`, function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            
            client.content(mock.content.id).delete()
                    .then(function(response) {

                        assert.isNotNull(response, 'No response object');
                        assert.exists(response.data, 'Response has no data object');
                        assert.notExists(response.errors, 'Has errors');

                        assert.strictEqual(response.data.id, mock.content.id);

                        done();

                    })
                    .catch(done);

        });

    });

};
