// ==UserScript==
// @name         Deckbox Image Enlarger
// @namespace    https://github.com/stuson/deckbox-enhancements/raw/main/dist/
// @include      css.user.js
// @version      0.1
// @description  Expand images without hovering when adding cards to your Deckbox inventory.
// @author       Sam Tuson
// @match        https://deckbox.org/sets/3006036*
// @icon         https://www.google.com/s2/favicons?domain=deckbox.org
// ==/UserScript==

const addStyles = () => {
    const style = document.createElement("style");
    style.innerHTML = css;

    document.head.appendChild(style);
};

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

addStyles();
injectAutocompleteFinished();
injectRowAdded();
