const chai = require('chai');
const assert = chai.assert;
const {Client} = require('../dist/unalike.min.js');

module.exports = () => {

    describe('Interceptor handling', function() {

        it('should ping and return ping message', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            client.interceptors.request.use(({options}) => {
                
                assert.isNotNull(options);
                options.headers['x-ping'] = 'hello';
                
            });
            client.get('/')
                    .then(function(response) {

                        assert.isNotNull(response);

                        assert.exists(response.data.name);
                       
                        assert.exists(response.headers['x-ping']);
                        assert.equal(response.headers['x-ping'], `hello`);
                        
                        done();

                    })
                    .catch(done);

        });

        it('should ping and return ping message in fulfilled interceptor', function(done) {

            const client = new Client();
            client.setToken(process.env.TOKEN);
            client.interceptors.request.use(({options}) => {
                
                assert.isNotNull(options);
                options.headers['x-ping'] = 'hello';
                
            });
            client.interceptors.fulfilled.use(({response}) => {

                assert.isNotNull(response);
                assert.exists(response.headers['x-ping']);
                assert.equal(response.headers['x-ping'], `hello`);
                        
            });
            client.get('/')
                    .then(function(response) {

                        assert.isNotNull(response);
                        assert.exists(response.data.name);
                        
                        done();

                    })
                    .catch(done);

        });
        
    });

};
