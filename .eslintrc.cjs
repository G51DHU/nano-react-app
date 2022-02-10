module.exports = {
  plugins:[
    "snakecasejs"
  ],
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  settings:{
      "snakecasejs/whitelist": [
        "hideBin",
        "gitClone",
        "validateProjectName",
        "selectPackageManager",
        "useGivenPkgMnger",
        "existingPackageManagers",
        "packageInstall",
        "changePkg",
        "changeIndexHtml",
        "bgMagenta",
        "validForNewPackages",
        "execSync",
        "createInterface",
        "readFileSync",
        "writeFileSync",
      ]
  },
  rules: {
    'camelcase': 'off',
    "snakecasejs/snakecasejs": "error"
  }
}
