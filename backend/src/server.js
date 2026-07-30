const app = require('./app');
const config = require('./config/env');

app.listen(config.port, () => {
  console.log(`ChromaFit API listening on http://localhost:${config.port}`);
});
