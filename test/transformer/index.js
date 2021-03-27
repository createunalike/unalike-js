const chai = require('chai');
const assert = chai.assert;

const {Transformer} = require('../../dist/unalike.min.js');

module.exports = (mock) => {

    describe('Unalike transform', function() {
        
        it('should create html version of delta', function(done) {

            const html = Transformer.convertDeltaToHtml(mock.delta);

            assert.typeOf(html, 'string');

            done();

        });

    });

};
