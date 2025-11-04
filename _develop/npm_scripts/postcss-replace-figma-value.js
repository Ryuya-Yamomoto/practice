const postcss = require('postcss');

module.exports = postcss.plugin('postcss-replace', () => {
  return (root) => {
    root.walkDecls((decl) => {
      if (decl.prop === 'leading-trim' && decl.value === 'both') {
        decl.prop = 'text-box-trim';
        decl.value = 'trim-both';
      }
      if (decl.prop === 'text-edge' && decl.value === 'cap') {
        decl.prop = 'text-box-edge';
        decl.value = 'cap alphabetic';
      }
    });
  };
});
