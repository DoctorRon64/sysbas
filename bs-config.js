module.exports = {
  proxy: "http://localhost:8001",
  files: [
    "**/*.html",
    "**/*.css",
    "**/*.js"
  ],
  ignore: [
    "node_modules/**",
    ".git/**"
  ],
  open: false
};