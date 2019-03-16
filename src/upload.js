const axios = require("axios");

const response_fields = "?sysparm_fields=sys_id";

function upload(source, { name, username, password, instance, table, sys_id }) {
  const method = sys_id ? "put" : "post";

  const base = `${instance}/api/now/table/${table}`;

  const url =
    method == "post"
      ? `${base}${response_fields}`
      : `${base}/${sys_id}${response_fields}`;

  const data =
    method === "post" ? { script: source } : { name, script: source };

  const auth = { username, password };

  return axios({ url, data, method, auth });
}

module.exports = upload;
