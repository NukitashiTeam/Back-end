const fs = require('fs');

// @ts-ignore
function injectTagsToFile(routerFilePath) {
  let content = fs.readFileSync(routerFilePath, 'utf-8');

  const tagMatch = content.match(/AUTO-TAG:\s*(\w+)/);
  if (!tagMatch) return content;

  const tag = tagMatch[1];

  // Tự động thêm #swagger.tags vào trước mỗi route
  content = content.replace(
    /(router\.(get|post|put|delete)\s*\()/g,
    `// #swagger.tags = ['${tag}']\n$1`
  );

  return content;
}

module.exports = { injectTagsToFile };
