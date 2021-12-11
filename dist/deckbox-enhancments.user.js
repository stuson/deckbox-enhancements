// ==UserScript==
// @name         Deckbox Image Enlarger
// @namespace    http://tampermonkey.net/
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

const css = `
.details_row img.sprite.s_picture {
  max-width: 106px;
  min-height: 148px;
  margin: 10px;
}

.foil {
  position: relative;
}

.foil::before,
.foil::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}

.foil::before {
  background-size: 250% 250%;
  background-image: linear-gradient(
      115deg,
      transparent 20%,
      #ec9bb6 36%,
      #ccac6f 43%,
      #69e4a5 50%,
      #8ec5d6 57%,
      #b98cce 64%,
      transparent 80%
  );
  opacity: 0.8;
  mix-blend-mode: color-dodge;
  z-index: 1;
  filter: brightness(0.6) contrast(1.3);
  animation: foilTurn 55s ease-in-out infinite;
}

.foil::after {
  background-image: url(https://assets.codepen.io/13471/sparkles.gif),
      url(https://assets.codepen.io/13471/holo.png),
      linear-gradient(
          125deg,
          #ff008460 15%,
          #fca40050 30%,
          #ffff0040 40%,
          #00ff8a30 60%,
          #00cfff50 70%,
          #cc4cfa60 85%
      );
  background-size: 160%;
  z-index: 2;
  mix-blend-mode: color-dodge;
  background-blend-mode: overlay;
  opacity: 0.15;
  animation: foilScroll 55s infinite;
}

@keyframes foilTurn {
  0%,
  10%,
  90%,
  100% {
      background-position: 50% 50%;
  }
  30%,
  40% {
      background-position: 0% 0%;
  }
  60%,
  70% {
      background-position: 100% 100%;
  }
}

@keyframes foilScroll {
  0%,
  10%,
  90%,
  100% {
      opacity: 0.15;
  }
  30%,
  40% {
      opacity: 0.4;
  }
  60%,
  70% {
      opacity: 0.4;
  }
}

`;

const emptyRowHTML = `
<div id="details_row_REPLACE_ME" class="details_row" data-index="REPLACE_ME">
<input type="hidden" name="details[REPLACE_ME][card_set_id]" id="details[REPLACE_ME][card_set_id]" value=""/>
<input type="hidden" name="details[REPLACE_ME][set_id]" value="3006036"/>
<a tabindex="100" class="add_row" href="#" onclick="panelCardInfo.splitRow('Inventory', 'REPLACE_ME');return false;">
  <img src="https://s.deckbox.org/images/icon_spacer.gif" class="sprite s_split transient" data-title="Split">  </a>
    <div class="det_row_count exp">
      <div class="inner">
        <img src="https://s.deckbox.org/images/icon_spacer.gif" class="sprite s_plus" onclick="panelCardInfo.inc('count', 'REPLACE_ME')"/>
        <input id="details[REPLACE_ME][count]" name="details[REPLACE_ME][count]"
               type="text" value="1" autocomplete="off" class="card_count inventory_count"/>
        <img src="https://s.deckbox.org/images/icon_spacer.gif" class="sprite s_remove"  onclick="panelCardInfo.dec('count', 'REPLACE_ME')"/>
      </div>
    </div>
    <div class="det_row_count exp">
      <div class="inner">
        <img src="https://s.deckbox.org/images/icon_spacer.gif" class="sprite s_plus" onclick="panelCardInfo.inc('trade_count', 'REPLACE_ME')" />
        <input id="details[REPLACE_ME][trade_count]" name="details[REPLACE_ME][trade_count]" type="text" 
               value="0"
               autocomplete="off" class="tradelist_count card_count"/>
        <img src="https://s.deckbox.org/images/icon_spacer.gif" class="sprite s_remove" onclick="panelCardInfo.dec('trade_count', 'REPLACE_ME')"/>
      </div>
    </div>

    <div class="btn btn-slim btn-default notxt"><span id="_button_edition_REPLACE_ME"></span><span class="caret"></span></div>
    <script type="text/javascript">
      PanelCardInfo.editionDropdown('REPLACE_ME', 24788, true, 'Inventory', false);
    </script>

<div id="button_condition" class="btn btn-default btn-slim notxt">
  <span id="_button_condition_REPLACE_ME"></span>
  <span class="caret"></span>
</div>
<script type="text/javascript">
    Dropdown.all['details[REPLACE_ME][condition_id]'] = new Dropdown(Dropdown.dataCache["card_conditions"], {
        id: 'details[REPLACE_ME][condition_id]',
        menuClassName: '_menu_2',
        width: 'auto',
        initial: [Tcg.Preferences.getOrSet('default_import_condition_Inventory', 2)],
        buttonText: Tcg.utils.extractIcons,
        button: {
            id: '_button_condition_REPLACE_ME'
        }
    });
</script>

<div class="btn btn-default btn-slim notxt">
  <span id="_button_language_REPLACE_ME"></span>
  <span class="caret"></span>
</div>
<script type="text/javascript">
    Dropdown.all['details[REPLACE_ME][language_id]'] = new Dropdown(Dropdown.dataCache["card_languages"], {
        id: 'details[REPLACE_ME][language_id]',
        menuClassName: '_menu_2',
        width: 'auto',
        initial: [Tcg.Preferences.getOrSet('default_import_language_Inventory', 1)],
        buttonText: Tcg.utils.extractIcons,
        button: {id: '_button_language_REPLACE_ME'}
    });
</script>

<div class="btn btn-default btn-slim notxt">
  <span id="_button_flags_REPLACE_ME"></span>
  <span class="caret"></span>
</div>
<script type="text/javascript">
    Dropdown.all['details[REPLACE_ME][flags]'] = new DropdownMulti(Dropdown.dataCache["card_flags"], {
        id: 'details[REPLACE_ME][flags]',
        menuClassName: '_menu_2',
        width: 'auto',
        initial: Tcg.Preferences.getOrSet('default_import_flags_Inventory', '').split(','),
        emptyIcon: "<img src=\"https://s.deckbox.org/images/icon_spacer.gif\" class=\"sprite s_flag_yellow sprite_off\">",
        buttonText: Tcg.utils.extractIcons,
        button: {id: "_button_flags_REPLACE_ME"}
    });
</script>

  <div id='details[REPLACE_ME][photos_count]' class="btn btn-default btn-slim notxt" onclick="panelCardInfo.submitThenPhotos('REPLACE_ME')">
      <div class='sprite50 s50_camera short sprite_off' data-title='Click to view or upload photos or scans of this card.'></div>
  </div>
</div>
<br/>
`;

addStyles();
injectAutocompleteFinished();
injectRowAdded();
