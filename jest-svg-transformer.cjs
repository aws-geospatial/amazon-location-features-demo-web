const path = require("path");

module.exports = {
  process(src, filename) {
    const componentName = path.basename(filename, path.extname(filename));
    return {
      code: `module.exports = {
        __esModule: true,
        default: '${componentName}',
        ReactComponent: () => '${componentName}',
      };`,
    };
  },
};