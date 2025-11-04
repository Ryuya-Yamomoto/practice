const postcss = require('postcss');

const plugin = (opt) => ({
  postcssPlugin: 'postcss-auto-tablet',
  Once(root) {
    if (!opt) return;
    root.walkAtRules('media', (rule) => {
      if (rule.params.includes('--pc')) {
        const cloneRule = rule.clone();
        cloneRule.params = cloneRule.params.replace('--pc', '--tb');
        cloneRule.walkDecls((decl) => {
          decl.value = decl.value.replace(/(-*[\d.]+)px/g, 'pw($1)').replace(/rem\(/g, 'pw(');
        });

        rule.after(cloneRule);
      }
    });
  },
});
plugin.postcss = true;
module.exports = plugin;
