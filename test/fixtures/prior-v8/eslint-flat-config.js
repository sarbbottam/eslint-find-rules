module.exports = [
    {
      files: ["**/*.js"],
      plugins: {
        plugin: {
          rules: {
            "foo-rule": {},
            "old-plugin-rule": { meta: { deprecated: true } },
            "bar-rule": {},
          },
        },
      },
      rules: {
        "foo-rule": [2],
        "plugin/foo-rule": [2],
      },
    },
    {
      files: ["**/*.json"],
      plugins: {
        jsonPlugin: {
          rules: { "foo-rule": {} },
        },
      },
      rules: {
        "jsonPlugin/foo-rule": [2],
      },
    },
  ];
  