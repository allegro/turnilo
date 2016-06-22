function extractConfig(text) {
  var a = '<script>var __CONFIG__ = {';
  var b = '};</script>';
  var ai = text.indexOf(a);
  var bi = text.indexOf(b);
  if (ai < 0 || bi < 0) return null;
  return JSON.parse(text.substring(ai + a.length - 1, bi + 1));
}

module.exports = extractConfig;
