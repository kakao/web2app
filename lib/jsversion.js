(function (exports) {
  "use strict";

  /* package version info */
  exports.daumtools = (typeof exports.daumtools === "undefined") ? {} : exports.daumtools;
  if(typeof exports.daumtools.web2app !== "undefined") {
    exports.daumtools.web2app.version = '/* @echo VERSION */';
  }
}(window));