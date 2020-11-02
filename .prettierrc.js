/*
 * @Author: Agan
 * @Date: 2020-10-30 11:50:41
 * @LastEditors: Agan
 * @LastEditTime: 2020-11-02 21:59:23
 * @Description:
 */
exports.modules = {
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  proseWrap: "never",
  arrowParens: "avoid",
  tabwith: 2,
  overrides: [
    {
      files: ".prettierrc",
      options: {
        parser: "json",
      },
    },
  ],
};
