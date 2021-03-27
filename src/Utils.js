/**
 * Utils for content once queried.
 */
class Utils {

    /**
     * Calculate reading time for a string of words.
     *
     * @param {string} words - Words to caculate.
     * @returns {number} Time in minutes.
     */
    static calcReadingTime(words) {

        const wordsPerMinute = 200; // Average case.
        let result = 1;

        const textLength = words.split(' ').length; // Split by words
        if (textLength > 0) {
            result = Math.ceil(textLength / wordsPerMinute);
        }
    
        return result;

    }

}

export default Utils;
