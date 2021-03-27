
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';

class Transformer {

    static convertDeltaToHtml(delta, render) {

        if (!delta.ops) {
            throw new Error(`Incorrect delta format. Cannot find ops array.`);
        }

        const converter = new QuillDeltaToHtmlConverter(delta.ops, {
            multiLineParagraph: false,
            multiLineCodeblock: false,
            multiLineHeader: false,
            multiLineBlockquote: false,
            classPrefix: 'u',
            urlSanitizer: function(url) {

                if (url.indexOf('www.') == 0) {
                    return `https://${url}`;
                }

                return url;
            },
        });
        
        converter.renderCustomWith(render);
        
        return converter.convert();

    }
    
}

export default Transformer;
