const upload = require("./upload");

const NAME = "ServiceNowUploader";
const DOCS =
  "https://github.com/gfrancischelli/servicenow-uploader-webpack-plugin";

class ServiceNowUploader {
  constructor(config, { log = true, onInsert = false, onUpdate = false } = {}) {
    if (!config || !config.instance || !config.username || !config.password) {
      throw new Error(`ServiceNowUploader: invalid config.\nUsage: ${DOCS}`);
    }
    this.log = log;
    this.config = config;
    this.onInsert = onInsert;
    this.onUpdate = onUpdate;
  }
  info(msg, ...args) {
    if (this.log) console.log(`${NAME}: ${msg}\n`, ...args);
  }
  error(msg, ...args) {
    if (this.log) console.error(`${NAME}:❗️ ${msg}\n`, ...args);
  }
  apply(compiler) {
    const info = this.info.bind(this);
    const error = this.error.bind(this);

    const { onInsert, onUpdate, config } = this;
    const { sys_id, name } = config;

    const is_insert = sys_id == false;

    const onEmit = async compilation => {
      const [chunk] = compilation.chunks;
      const [filename] = chunk.files;
      const source = compilation.assets[filename].source();

      // Only inserts if it has a name and a callback is specified
      if (is_insert && !config.name && !onInsert) {
        error("Can't insert without sys_id, name an `onInsert` callback");
        return false;
      }

      let response;
      try {
        response = await upload(source, config);
      } catch (e) {
        error(`Error while uploading 👉  ${e.response.data.error.message}`);
        return;
      }

      const { data, status, statusText } = response;

      if (status !== 200) {
        error(`Status [${status}] ${statusText}`, data);
      }

      if (is_insert) {
        if (onInsert) onInsert(data);
        info(`✅  Inserted ${name}`);
      } else {
        if (onUpdate) onUpdate(data);
        info(`✅  Updated ${name}`, data);
      }
    };

    compiler.hooks.emit.tapPromise(NAME, onEmit);
  }
}

module.exports = ServiceNowUploader;
