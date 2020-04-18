// Function to make paths safe that are used in an input
var safeStringInput = function(string) {
  var safeString = string;

  // Safen the string
  // \ will be \\
  safeString.replace(/\\/g, '\\\\');

  // : will be \:
  safeString.replace(/\:/g, '\\:');

  // Return safe string
  return safeString;
}

// Function to make string safe that are used in a filter
var safeStringFilter = function(string) {
  var safeString = string;

  // Safen the string
  // \ will be \\
  safeString.replace(/\\/g, '\\\\');

  // : will be \:
  safeString.replace(/\:/g, '\\:');

  // ' will be \'
  safeString.replace(/\'/g, '\\\'');

  // Return safe string
  return safeString;
}

module.exports = {
  forInput: safeStringInput,
  forFilter: safeStringFilter
}
