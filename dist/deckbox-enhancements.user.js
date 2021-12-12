// ==UserScript==
// @name         Deckbox Enhancements
// @namespace    https://github.com/stuson
// @version      0.1.1
// @description  Various enhancements for Deckbox (deckbox.org)
// @author       Sam Tuson
// @match        https://deckbox.org/sets/*
// @icon         https://www.google.com/s2/favicons?domain=deckbox.org
// ==/UserScript==
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

var styleElementsInsertedAtTop = [];

var insertStyleElement = function(styleElement, options) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];

    options = options || {};
    options.insertAt = options.insertAt || 'bottom';

    if (options.insertAt === 'top') {
        if (!lastStyleElementInsertedAtTop) {
            head.insertBefore(styleElement, head.firstChild);
        } else if (lastStyleElementInsertedAtTop.nextSibling) {
            head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
        } else {
            head.appendChild(styleElement);
        }
        styleElementsInsertedAtTop.push(styleElement);
    } else if (options.insertAt === 'bottom') {
        head.appendChild(styleElement);
    } else {
        throw new Error('Invalid value for parameter \'insertAt\'. Must be \'top\' or \'bottom\'.');
    }
};

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes, extraOptions) {
        extraOptions = extraOptions || {};

        var style = document.createElement('style');
        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }

        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        } else if (style.styleSheet) { // for IE8 and below
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        }
    }
};

},{}],2:[function(require,module,exports){
require("./style.css");

console.log("updated!");

const injectAutocompleteFinished = () => {
    Tcg.ui.ImportAddCardAdvanced.prototype._afterUpdate = inject(
        Tcg.ui.ImportAddCardAdvanced.prototype._afterUpdate,
        {
            after: updateAllFormRows,
        }
    );
};

const injectRowAdded = () => {
    PanelCardInfo.prototype.addRow = inject(PanelCardInfo.prototype.addRow, {
        callback: (addedFormIndex) => {
            setTimeout(() => replacePictureSprite(addedFormIndex), 10);
        },
    });
};

const updateFoilStatus = (button, formIndex) => {
    const flags = Dropdown.all[`details[${formIndex}][flags]`].selectedValues.values();
    const isFoil = flags.includes("is_foil");
    setFoil(button, isFoil);
};

const updateAllFormRows = () => {
    const matches = new Set();
    for (const index of Form.serialize("panel_card_info").matchAll(/.*?(FRM.*?)%5D/g, "$1")) {
        matches.add(index[1]);
    }

    for (const match of matches) {
        const button = Dropdown.all[`details[${match}][card_edition_id]`].button.parent;
        const img = button.getElementsByTagName("img")[0];
        replacePictureSprite(img);
        updateFoilStatus(button, match);
    }
};

const inject = (fn, injectedFuncs) => {
    const blankFunc = () => {};
    const defaultArgs = { after: blankFunc, before: blankFunc, callback: blankFunc };

    return function () {
        const { after, before, callback } = { ...defaultArgs, ...injectedFuncs };

        before.apply(this, arguments);
        let r = fn.apply(this, arguments);
        after.apply(this, arguments);
        r = callback.apply(this, [r, ...arguments]);
        return r;
    };
};

const replacePictureSprite = (img) => {
    img.src = `https://s.deckbox.org/system/images/mtg/cards/${img.dataset.tt}.jpg`;
};

const setFoil = (button, isFoil = false) => {
    isFoil ? button.classList.add("foil") : button.classList.remove("foil");
};

injectAutocompleteFinished();
injectRowAdded();

},{"./style.css":3}],3:[function(require,module,exports){
var css = ".details_row img.sprite.s_picture {\n  max-width: 106px;\n  min-height: 148px;\n  margin: 10px;\n}\n.esym {\n  position: relative;\n  z-index: 3;\n}\n.foil {\n  position: relative;\n}\n.foil::before,\n.foil::after {\n  content: \"\";\n  position: absolute;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  background-repeat: no-repeat;\n  background-position: 50% 50%;\n}\n.foil::before {\n  background-size: 250% 250%;\n  background-image: linear-gradient(\n        115deg,\n        transparent 20%,\n        #ec9bb6 36%,\n        #ccac6f 43%,\n        #69e4a5 50%,\n        #8ec5d6 57%,\n        #b98cce 64%,\n        transparent 80%\n    );\n  opacity: 0.8;\n  mix-blend-mode: color-dodge;\n  z-index: 1;\n  filter: brightness(0.6) contrast(1.3);\n  animation: foilTurn 55s ease-in-out infinite;\n}\n.foil::after {\n  background-image: url(https://assets.codepen.io/13471/sparkles.gif),\n        url(https://assets.codepen.io/13471/holo.png),\n        linear-gradient(\n            125deg,\n            #ff008460 15%,\n            #fca40050 30%,\n            #ffff0040 40%,\n            #00ff8a30 60%,\n            #00cfff50 70%,\n            #cc4cfa60 85%\n        );\n  background-size: 160%;\n  z-index: 2;\n  mix-blend-mode: color-dodge;\n  background-blend-mode: overlay;\n  opacity: 0.15;\n  animation: foilScroll 55s infinite;\n}\n@keyframes foilTurn {\n  0%, 10%, 90%, 100% {\n    background-position: 50% 50%;\n  }\n\n  30%, 40% {\n    background-position: 0% 0%;\n  }\n\n  60%, 70% {\n    background-position: 100% 100%;\n  }\n}\n@keyframes foilScroll {\n  0%, 10%, 90%, 100% {\n    opacity: 0.15;\n  }\n\n  30%, 40% {\n    opacity: 0.4;\n  }\n\n  60%, 70% {\n    opacity: 0.4;\n  }\n}\n"; (require("browserify-css").createStyle(css, { "href": "src/style.css" }, { "insertAt": "bottom" })); module.exports = css;
},{"browserify-css":1}]},{},[2]);
