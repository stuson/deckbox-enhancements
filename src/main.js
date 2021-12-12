require("./style.css");

const injectRowAdded = () => {
    PanelCardInfo.prototype.addRow = inject(PanelCardInfo.prototype.addRow, {
        callback: (rowIndex) => {
            setTimeout(() => updateFormRow(rowIndex), 10);
        },
    });
};

const injectSelectData = () => {
    PanelCardInfo.prototype.selectData = inject(PanelCardInfo.prototype.selectData, {
        after: (rowIndex) => {
            updateFormRow(rowIndex);
            updateDropdown(rowIndex);
        },
    });
};

const updateFoilStatus = (button, formIndex) => {
    const flags = Dropdown.all[`details[${formIndex}][flags]`].selectedValues.values();
    const isFoil = flags.includes("is_foil");
    setFoil(button.parent, isFoil);
};

const updateFormRow = (rowIndex) => {
    const button = getButtonFromRowIndex(rowIndex);
    const img = getImgFromButton(button);
    replacePictureSprite(img);
    updateFoilStatus(button, rowIndex);
};

const updateDropdown = (rowIndex) => {
    const mapPicture = (valueSet) => {
        valueSet[0] = valueSet[0].replace(
            /(src='.*?')(.*?data-tt='(.*?)')/,
            "src='https://s.deckbox.org/system/images/mtg/cards/$3.jpg'$2"
        );

        const url = valueSet[0].match(/src='(.*?)'/)[1];
        return valueSet;
    };

    const mappedValues =
        Dropdown.all[`details[${rowIndex}][card_edition_id]`].values.map(mapPicture);
    Dropdown.all[`details[${rowIndex}][card_edition_id]`].values = mappedValues;
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

const preloadImg = (url) => {
    new Image().src = url;
};

const getButtonFromRowIndex = (rowIndex) => {
    return Dropdown.all[`details[${rowIndex}][card_edition_id]`].button;
};

const getImgFromButton = (button) => {
    return button.parent.getElementsByTagName("img")[0];
};

const replacePictureSprite = (img) => {
    img.src = `https://s.deckbox.org/system/images/mtg/cards/${img.dataset.tt}.jpg`;
};

const setFoil = (buttonContainer, isFoil = false) => {
    isFoil ? buttonContainer.classList.add("foil") : buttonContainer.classList.remove("foil");
};

injectSelectData();
injectRowAdded();
