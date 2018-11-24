const _extenders = {
    String: {
        run: () => {
            String.min = (string1, string2) => {
                return string1 < string2 ? string1 : string2
            }

            String.max = (string1, string2) => {
                return string1 > string2 ? string1 : string2
            }
        }
    }
}

module.exports = _extenders