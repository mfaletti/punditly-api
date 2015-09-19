'use strict';

module.exports = function customFunctionsPlugin(schema) {
  schema.statics.isValid = function(oid){
    var regex = new RegExp("^[0-9a-fA-F]{24}$");
    return regex.test(oid);
  };
};