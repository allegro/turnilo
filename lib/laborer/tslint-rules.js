module.exports = {
  "rules": {
    "align": [true,
      "parameters",
      "statements"
    ],
    "ban": [false,
      ["_", "extend"],
      ["_", "isNull"],
      ["_", "isDefined"]
    ],
    "class-name": true,
    "comment-format": [false,
      "check-space"
    ],
    "curly": false,
    "eofline": true,
    "forin": false,
    "indent": [true, 2],
    "interface-name": false,
    "jsdoc-format": true,
    "label-position": true,
    "label-undefined": true,
    "max-line-length": [true, 200],
    "member-access": false,
    "member-ordering": [true,
      "static-before-instance"
    ],
    "no-any": false,
    "no-arg": true,
    "no-bitwise": false,
    "no-consecutive-blank-lines": false,
    "no-console": [true,
      "debug",
      "info",
      "time",
      "timeEnd",
      "trace"
    ],
    "no-construct": false,
    "no-constructor-vars": true,
    "no-debugger": true,
    "no-duplicate-key": true,
    "no-duplicate-variable": false,
    "no-empty": false,
    "no-eval": true,
    "no-inferrable-types": true,
    "no-internal-module": false,
    "no-null-keyword": false,
    "no-require-imports": false, // ?
    "no-shadowed-variable": false,
    "no-string-literal": false,
    "no-switch-case-fall-through": false, // TS 1.8 takes care of that.
    "no-trailing-whitespace": true,
    "no-unreachable": false, // TS 1.8 takes care of that.
    "no-unused-expression": false,
    "no-unused-variable": false,
    "no-use-before-declare": false, // There seems to be some bug here VO - 2016-08-11
    "no-var-keyword": false,
    "no-var-requires": false,
    "object-literal-sort-keys": false,
    "one-line": [true,
      "check-catch",
      "check-else",
      "check-finally",
      "check-open-brace",
      "check-whitespace"
    ],
    "quotemark": [false, "double", "jsx-double", "avoid-escape"],
    "radix": true,
    "semicolon": true,
    "switch-default": false,
    "trailing-comma": [true, {
      "singleline": "never",
      "multiline": "never"
    }],
    "triple-equals": [true, "allow-null-check"],
    "typedef": false,
    "typedef-whitespace": [true, {
      "call-signature": "nospace",
      "index-signature": "nospace",
      "parameter": "nospace",
      "property-declaration": "nospace",
      "variable-declaration": "nospace"
    }, {
      "call-signature": "onespace",
      "index-signature": "onespace",
      "parameter": "onespace",
      "property-declaration": "onespace",
      "variable-declaration": "onespace"
    }],
    "use-strict": false, // TS 1.8 takes care of that.
    "variable-name": false,
    "whitespace": [true,
      "check-branch",
      "check-decl",
      "check-operator",
      "check-separator",
      "check-type"
    ]
  }
}
