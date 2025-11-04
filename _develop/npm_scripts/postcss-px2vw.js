const postcss = require('postcss');

const plugin = (opt) => ({
  postcssPlugin: 'postcss-auto-tablet',
  Once(root) {
    if (!opt) return;
    root.walkAtRules('media', (rule) => {
      if (rule.params.includes('--sp')) {
        rule.walkDecls((decl) => {
          decl.value = decl.value.replace(/(?:\b|-)\d*\.?\d+px\b/g, (match) => {
            return `vw(${match.replace('px', '')})`;
          });
        });
      }
    });
  },
});
plugin.postcss = true;
module.exports = plugin;
