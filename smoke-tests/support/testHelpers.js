class Helpers {
  capitalizeAllWords(myString) {
    return myString.replace(/\w\S*/g, (w) =>
      w.replace(/^\w/, (c) => c.toUpperCase())
    );
  }

  toCamelCase(string) {
    string = string
      .toLowerCase()
      .replace(/(?:(^.)|([-_\s]+.))/g, function (match) {
        return match.charAt(match.length - 1).toUpperCase();
      });
    return string.charAt(0).toLowerCase() + string.substring(1);
  }
}

module.exports = new Helpers();
