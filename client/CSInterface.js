/**
 * CSInterface - v11.2.1
 */

var CSInterface = (function() {
    'use strict';

    var CSInterface = function() {};

    CSInterface.prototype.evalScript = function(script, callback) {
        if (callback === null || callback === undefined) {
            callback = function(result) {};
        }
        window.__adobe_cep__.evalScript(script, callback);
    };

    CSInterface.prototype.getSystemPath = function(pathType) {
        var path = decodeURI(window.__adobe_cep__.getSystemPath(pathType));
        return path;
    };

    CSInterface.prototype.getApplicationID = function() {
        return window.__adobe_cep__.getApplicationId();
    };

    CSInterface.prototype.getHostEnvironment = function() {
        return JSON.parse(window.__adobe_cep__.getHostEnvironment());
    };

    CSInterface.prototype.closeExtension = function() {
        window.__adobe_cep__.closeExtension();
    };

    CSInterface.prototype.getExtensionID = function() {
        return window.__adobe_cep__.getExtensionId();
    };

    CSInterface.prototype.resizeContent = function(width, height) {
        window.__adobe_cep__.resizeContent(width, height);
    };

    CSInterface.prototype.addEventListener = function(type, listener, obj) {
        window.__adobe_cep__.addEventListener(type, listener, obj);
    };

    CSInterface.prototype.removeEventListener = function(type, listener, obj) {
        window.__adobe_cep__.removeEventListener(type, listener, obj);
    };

    CSInterface.prototype.dispatchEvent = function(event) {
        if (typeof event.data == "object") {
            event.data = JSON.stringify(event.data);
        }
        window.__adobe_cep__.dispatchEvent(event);
    };

    return CSInterface;
}());
