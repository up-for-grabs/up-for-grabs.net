import jest from "eslint-plugin-jest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("prettier", "plugin:jest/recommended"), {
    plugins: {
        jest,
    },

    rules: {
        "no-undef": "off",
        "vars-on-top": "off",
        "no-var": "off",
        "func-names": "off",
        "one-var": "off",
        eqeqeq: "off",
        "no-param-reassign": "off",
        "no-underscore-dangle": "off",
        "no-useless-escape": "off",
        "no-restricted-globals": "off",
        "no-use-before-define": "off",
        "global-require": "off"
    },
}];