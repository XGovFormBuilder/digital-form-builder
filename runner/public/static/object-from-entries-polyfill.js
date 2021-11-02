if (!Object.fromEntries) {
    Object.fromEntries = function fromEntries(entries) {
        if (!entries) {
            throw new Error('Object.fromEntries() requires a single iterable argument');
        }

        var obj = {};
        
        for (var i = 0; i < entries.length; i++) {
            obj[entries[i][0]] = entries[i][1];
        }

        return obj;
    }
}