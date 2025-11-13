const swaggerJSDoc = require('swagger-jsdoc');
const option = require('../swagger');

const specs = swaggerJSDoc(option);
console.log(JSON.stringify({ paths: specs.paths || {}, components: Object.keys(specs.components || {}) }, null, 2));
