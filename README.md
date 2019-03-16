# servicenow-uploader-webpack-plugin

This plugin uploads the source code to ServiceNow after compilation and before writing to disk.

> **Note:** this plugin assumes the webpack config will produce [*only one chunk*](https://webpack.js.org/guides/code-splitting/). This mean you it will consider only the first entry point and plugins like `SplitChunksPlugin` will not work as expected.



## Getting Started

Install `servicenow-uploader-webpack-plugin`

`$ npm i --save-dev servicenow-uploader-webpack-plugin`

or

`$ yarn add -D servicenow-uploader-webpack-plugin`



Create a configuration file:

**.sn-config.json**

```json
{
  "sys_id": "xxx",
  "table": "sys_ui_script",
  "username": "admin",
  "password": "1234",
  "instance": "https://dev9999.service-now.com"
}
```

> **Note:** This configuration file mirrors the constructor signature config schema. Feel free to use what works best for your use case.



Add `.sn-config.json` to `.gitignore`. You don't want sensitive information in your repo.

`$ echo ".sn-config.json >> .gitignore`



Add to webpack config:

**webpack.config.js**

```javascript
const ServiceNowUploader = require("servicenow-uploader-webpack-plugin");
const config = require("./.sn-config.json");

module.exports = {
  plugins: [new ServiceNowUploader(config)]
};
```



## Usage

This plugin works by hooking onto webpack compilation and uploading the transformed source code to ServiceNow. If a `sys_id` is present in the configuration the record will be updated.

If no `sys_id` is present the record will be inserted instead, but *only* if `name` and `onInput` callback are specified. The motivation behind this is to give you full control of your configuration schema, using the `onInput` callback to update the `sys_id` or any other desired info.

**Basic example**

```javascript
const config = { name, table, ...credentials};

const onInput = ({ sys_id }) => config.sys_id = sys_id;

new ServiceNowUploader(config, { onInput });
```



### Constructor `new ServiceNowUploader(config, options)`

Uploads the transformed source code to instance using credentials specified inside config. The target record is updated if the `sys_id` isn't present. Otherwise the record is inserted and the config is updated instead.

#### `config`

Type: `Object`

##### `config.sys_id`

Type: `string`<br>
Optional

Target record sys_id.

##### `config.name`

Type: `string`<br>

Default: webpack entry point file name

Target record's display name.

##### `config.table`

Type: `string`<br>
Default: `sys_ui_script`

Target table. Uses ui script because it can be imported to other client side tables like ui pages and client scripts.

##### `config.instance`

Type: `string`<br>

Your instance complete URL.

##### `config.username`

Type: `string`<br>

Be sure the user has write access to the target table.

##### `config.password`

Type: `string`



#### `options`

Type: `Object`<br>Optional

##### `log`

Type: `Boolean`
Default: `true`

Enables logging

##### `onInsert`

Type: `Function`<br>
Optional

Execute when the record is inserted in ServiceNow. Expectes SN response as argument.

##### `onUpdate`

Type: `Function`<br>Optional

Execute when the record is updated in ServiceNow. Expectes SN response as argument.