define('default', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function getClampedFontSize(size) {
    // Restrict the base (1.0em) font size to no smaller than 30px (6pt) and no larger than 54px (11pts)
    if (size < 30) {
        return 30;
    } else if (size > 54) {
        return 54;
    } else {
        return size;
    }
}

var self = {
    setBodyFont: function (font) {
        if (window.document.body) {
            window.document.body.style.fontSize = getClampedFontSize(font.fontSize) + 'px';
            window.document.body.style.fontStyle = font.fontStyle + 'px';
        }
    },
    updateBaseDirection: function () {
        var lang = navigator.language,
            lang_trim = lang.replace(/-.*$/, ''),
            dir = (lang_trim === 'he' || lang_trim === 'ar') ? 'rtl' : 'ltr',
            systemLanguageChangeEvent = new window.CustomEvent("systemLanguageChange");

        if (document.documentElement) {
            document.documentElement.lang = lang;
            document.documentElement.dir = dir;
        }

        window.dispatchEvent(systemLanguageChangeEvent);
    },
};

// Initialize the base direction when the document is loaded
self.updateBaseDirection();

module.exports = self;

});

define('contextmenu', function (require, exports, module) {
/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var MAX_NUM_ITEMS_IN_PORTRAIT_PEEK_MODE = 7,
    MAX_NUM_ITEMS_IN_LANDSCAPE_PEEK_MODE = 3,
    MAX_NUM_ITEMS_IN_NSERIES_PEEK_MODE = 5,
    PEEK_MODE_TRANSLATE_X = -121,
    FULL_MENU_TRANSLATE_X = -569,
    MENU_ITEM_HEIGHT = 121,
    TITLE_HEIGHT = (MENU_ITEM_HEIGHT - 1) + 15, //15 top-padding
    HIDDEN_MENU_TRANSLATE_X = 0,
    MENU_ITEM_BORDER_OFFSET = 2,
    state = {
        HIDE: 0,
        PEEK: 1,
        VISIBLE: 2,
        DRAGEND: 3
    },
    maxNumItemsInPeekMode = MAX_NUM_ITEMS_IN_PORTRAIT_PEEK_MODE,
    menuCurrentState = state.HIDE,
    touchMoved = false,
    numItems = 0,
    peekModeNumItems = 0,
    dragStartPoint,
    currentTranslateX,
    menu,
    menuItemTouchScrolled = false,
    menuItemTouchEndCancelled = false,
    contextMenuContent,
    contextMenuHandle,
    contextMenuPinned,
    contextMenuModal,
    contextMenuHeader,
    pinnedItem,
    headText,
    subheadText,
    currentPeekIndex,
    previousPeekIndex,
    _pinnedItemId,
    elements,
    startX,
    startY,
    utils,
    self,
    dragDelta = 0,
    i18n,
    formcontrol,
    nSeries;

function requirePlugin(id) {
    return require(!!require.resolve ? "../" + id : id);
}

function requireLocal(id) {
    return require(!!require.resolve ? "../../" + id.replace(/\/chrome/, "") : id);
}

function getMenuXTranslation() {
    if (menuCurrentState === state.PEEK) {
        return PEEK_MODE_TRANSLATE_X;
    }
    if (menuCurrentState === state.VISIBLE) {
        return FULL_MENU_TRANSLATE_X;
    }
    return HIDDEN_MENU_TRANSLATE_X;
}

function isMenuScrollable() {
    if (menuCurrentState !== state.VISIBLE) {
        return false;
    }
    return numItems > maxNumItemsInPeekMode;
}

function positionHandle() {
    var moreIcon = document.getElementById('moreHandleIcon'),
        dragBar = document.getElementById('contextMenuDragBar'),
        top,
        bottom;

    if (menuCurrentState === state.PEEK) {
        if (dragBar === null) {
            dragBar = document.createElement('div');
            dragBar.id = "contextMenuDragBar";
            dragBar.className = "contextMenuDragBar";
            if (nSeries) {
                contextMenuHeader.insertBefore(dragBar, contextMenuHeader.firstChild);
            } else {
                contextMenuHandle.appendChild(dragBar);
            }
        }
        contextMenuHandle.className = 'showContextMenuHandle';
        if (nSeries) {
            bottom = MENU_ITEM_HEIGHT;
            contextMenuHandle.style.bottom = bottom + 'px';
            contextMenuHeader.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
        } else {
            top = (window.screen.availHeight + (peekModeNumItems - 1) * MENU_ITEM_HEIGHT) / 2;
            contextMenuHandle.style.top = top + 'px';
        }

        if (numItems > maxNumItemsInPeekMode) {
            if (nSeries) {
                contextMenuContent.style.top = '0px';
                contextMenuContent.style.paddingTop = TITLE_HEIGHT + 'px';
            } else {
                contextMenuContent.style.top = TITLE_HEIGHT + 'px';
            }
            contextMenuContent.style.position = 'absolute';
            // If have more options than the limit, show the more dots on the contextMenuHandle
            if (moreIcon === null) {
                moreIcon = document.createElement('div');
                moreIcon.id = "moreHandleIcon";
                moreIcon.style = 'showMoreHandleIcon';
                moreIcon.className = 'showMoreHandleIcon';
                contextMenuHandle.appendChild(moreIcon);
            } else {
                moreIcon.className = 'showMoreHandleIcon';
            }
        } else {
            top = (window.screen.availHeight - (numItems - 1) * MENU_ITEM_HEIGHT) / 2;
            contextMenuContent.style.top = top + 'px';
            contextMenuContent.style.paddingTop = '';
            if (moreIcon !== null) {
                contextMenuHandle.removeChild(moreIcon);
            }
        }
    } else if (menuCurrentState === state.VISIBLE) {
        if (moreIcon !== null) {
            contextMenuHandle.removeChild(moreIcon);
        }
        if (numItems <= maxNumItemsInPeekMode) {
            contextMenuHandle.className = 'showContextMenuHandle';
            top = (window.screen.availHeight - (numItems - 1) * MENU_ITEM_HEIGHT) / 2;
            contextMenuContent.style.top = top + 'px';
            if (nSeries) {
                bottom = MENU_ITEM_HEIGHT;
                contextMenuHandle.style.bottom = bottom + 'px';
            } else {
                top = (window.screen.availHeight + (numItems - 1) * MENU_ITEM_HEIGHT) / 2;
                contextMenuHandle.style.top = top + 'px';
            }
        } else {
            contextMenuHandle.className = 'hideContextMenuHandle';
        }
    }
}

function menuDragStart() {
    menu.style.webkitTransitionDuration = '0s';
}

function menuDragMove(pageX) {
    var x = window.screen.width + getMenuXTranslation() + pageX - dragStartPoint,
        menuWidth = -FULL_MENU_TRANSLATE_X;
    // Stop translating if the full menu is on the screen
    if (x >= window.screen.width - menuWidth) {
        currentTranslateX = getMenuXTranslation() + pageX - dragStartPoint;
        menu.style.webkitTransform = 'translate(' + currentTranslateX + 'px' + ', 0)';
    }
}

function menuDragEnd() {
    menu.style.webkitTransitionDuration = '0.3s';

    menuCurrentState = state.DRAGEND;
    if (currentTranslateX > PEEK_MODE_TRANSLATE_X) {
        self.hideContextMenu();
    } else if (currentTranslateX < FULL_MENU_TRANSLATE_X / 2) {
        self.showContextMenu();
    } else {
        self.peekContextMenu();
    }
    menu.style.webkitTransform = '';
}

function menuTouchStartHandler(evt) {
    evt.stopPropagation();
    menuDragStart();
    dragStartPoint = evt.touches[0].pageX;
    dragDelta = 0;
}

function bodyTouchStartHandler(evt) {
    dragStartPoint = evt.touches[0].pageX;
    menuDragStart();
}

function menuTouchMoveHandler(evt) {
    var touch = evt.touches[0];
    evt.stopPropagation();
    touchMoved = true;
    menuDragMove(evt.touches[0].pageX);
    dragDelta = touch.pageX - dragStartPoint;
}

function bodyTouchMoveHandler(evt) {
    touchMoved = true;
    menuDragMove(evt.touches[0].pageX);
}

function menuTouchEndHandler(evt) {
    if (menuCurrentState === state.HIDE) {
        return;
    }
    evt.stopPropagation();
    // It is not a valid touch move if dragDelta <= 8
    touchMoved = touchMoved && Math.abs(dragDelta) > 8;
    menu.style.webkitTransform = '';
    if (touchMoved) {
        touchMoved = false;
        menuCurrentState = state.DRAGEND;
        if (currentTranslateX > PEEK_MODE_TRANSLATE_X - (PEEK_MODE_TRANSLATE_X / 4)) {
            self.hideContextMenu();
        } else if (currentTranslateX === FULL_MENU_TRANSLATE_X) {
            self.showContextMenu();
        } else if (currentTranslateX < FULL_MENU_TRANSLATE_X / 2) {
            self.showContextMenu();
        } else {
            self.peekContextMenu();
        }
    } else {
        if (menuCurrentState === state.PEEK) {
            self.showContextMenu();
        } else if (menuCurrentState === state.VISIBLE) {
            self.peekContextMenu();
        }
    }
}

function bodyTouchEndHandler(evt) {
    if (touchMoved) {
        touchMoved = false;
        menuDragEnd();
    }
    else {
        self.hideContextMenu();
    }
}

function getMenuItemAtPosition(x, y, elementHeight) {
    var menuWidth = -FULL_MENU_TRANSLATE_X,
        peekMenuWidth = -PEEK_MODE_TRANSLATE_X,
        index,
        deleteIndex,
        contentPaddingTop = contextMenuContent.style.paddingTop.replace('px', ''),
        placeHolder = document.getElementById('contextMenuPlaceHolder');

    // The 1st item has a 2px border on the top
    // subtract 4px border from the height (2px each on the top and the bottom)

    if (y >= contextMenuContent.offsetTop + contentPaddingTop - contextMenuContent.scrollTop && y < contextMenuContent.offsetTop + contextMenuContent.clientHeight + contextMenuContent.scrollTop) {
        // y is inside the center group of items, let's check x
        if (nSeries) {
            index = (y - contentPaddingTop - contextMenuContent.offsetTop - 2) / elementHeight | 0;
        } else {
            index = (y - contextMenuContent.offsetTop - 2) / elementHeight | 0;
        }
        if (placeHolder !== null && index >= numItems) {
            // If index is out of bound due to placeholder which has the same height as each element
            index--;
        }
        if (menuCurrentState === state.VISIBLE || index === currentPeekIndex) {
            return x < window.screen.width - menuWidth ? -1 : index;
        }
        return x < window.screen.width - peekMenuWidth ? -1: index;
    }

    if (contextMenuPinned.hasChildNodes() && y > contextMenuPinned.offsetTop) {
        // y is inside of the delete icon, check x
        deleteIndex = elements.length - 1;
        if (menuCurrentState === state.VISIBLE || deleteIndex === currentPeekIndex) {
            return x < window.screen.width - menuWidth ? -1 : deleteIndex;
        }
        return x < window.screen.width - peekMenuWidth ? -1 : deleteIndex;
    }
    return -1;
}

function highlightMenuItem(item) {
    var previousHighlightedItems,
        i;

    if (!item) {
        return;
    }

    if (menuCurrentState === state.PEEK) {
        item.className = 'contextmenuItem showContextmenuItem';
        item.active = true;
    } else if (menuCurrentState === state.VISIBLE) {
        // If we have any other item's that are highlighted, force remove it since we can only have one
        previousHighlightedItems = document.getElementsByClassName('fullContextmenuItem');

        for (i = 0; i < previousHighlightedItems.length; i += 1) {
            previousHighlightedItems[i].className = 'contextmenuItem';
        }
        item.className = 'contextmenuItem fullContextmenuItem';
        item.active = true;
    }
}

function contextMenuContentScroll(evt) {
    var previousHighlightedItems,
        i;
    previousHighlightedItems = document.getElementsByClassName('fullContextmenuItem');
    for (i = 0; i < previousHighlightedItems.length; i += 1) {
        previousHighlightedItems[i].className = 'contextmenuItem';
    }
    if (nSeries) {
        if (contextMenuContent.scrollTop <= 0) {
            contextMenuHeader.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
        } else if (contextMenuContent.scrollTop > 0) {
            contextMenuHeader.style.webkitTransform = 'translate3d(0px, -' + contextMenuContent.scrollTop + 'px, 0px)';
        }
    }
    menuItemTouchScrolled = true;
}

function menuItemTouchStartHandler(evt) {
    var x = evt.touches[0].clientX,
        y = evt.touches[0].clientY,
        elementHeight = evt.currentTarget.clientHeight + MENU_ITEM_BORDER_OFFSET;

    evt.stopPropagation();
    startX = evt.touches[0].pageX;
    startY = evt.touches[0].pageY;
    menuItemTouchEndCancelled = false;
    menuItemTouchScrolled = false;
    highlightMenuItem(evt.currentTarget);

    if (menuCurrentState === state.PEEK) {
        previousPeekIndex = currentPeekIndex = getMenuItemAtPosition(x, y, elementHeight);
    } else {
        previousPeekIndex = currentPeekIndex = evt.currentTarget.index;
    }
}

function menuItemTouchMoveHandler(evt) {
    var x = evt.touches[0].clientX,
        y = evt.touches[0].clientY,
        elementHeight = evt.currentTarget.clientHeight + 2; // border = 2

    evt.stopPropagation();

    // when touch actually moves and items overflow
    if (menuCurrentState === state.VISIBLE && isMenuScrollable() && (x !== startX || y !== startY)) {
        menuItemTouchEndCancelled = true;
    }

    y = isMenuScrollable() ? y + contextMenuContent.scrollTop : y; // update y if the menu is scrollable
    currentPeekIndex = getMenuItemAtPosition(x, y, elementHeight);
    if (currentPeekIndex === previousPeekIndex) {
        return;
    }
    if (currentPeekIndex === -1) {
        if (elements[previousPeekIndex] && elements[previousPeekIndex].active) {
            elements[previousPeekIndex].className = 'contextmenuItem';
            elements[previousPeekIndex].active = false;
        }
    } else if (previousPeekIndex === -1) {
        highlightMenuItem(elements[currentPeekIndex]);
    } else {
        if (elements[previousPeekIndex] && elements[previousPeekIndex].active) {
            elements[previousPeekIndex].className = 'contextmenuItem';
            elements[previousPeekIndex].active = false;
        }
        highlightMenuItem(elements[currentPeekIndex]);
    }
    previousPeekIndex = currentPeekIndex;
}

function menuItemTouchEndHandler(evt) {
    var elements,
        i;

    evt.stopPropagation();
    if (currentPeekIndex !== -1 && currentPeekIndex !== undefined) {
        // Clear all the highlighted elements since the highlight can get stuck when scrolling a list when we
        // are using overflow-y scroll
        elements = document.getElementsByClassName('contextmenuItem');

        for (i = 0; i < elements.length; i += 1) {
            elements[i].className = 'contextmenuItem';
            elements[i].active = false;
        }
        if (!menuItemTouchEndCancelled && !menuItemTouchScrolled) {
            if (elements[currentPeekIndex]) {
                window.qnx.webplatform.getController().remoteExec(1, 'executeMenuAction', [elements[currentPeekIndex].attributes.actionId.value]);
            }
            self.hideContextMenu();
        }
    }
}

function rotationHandler() {
    if (window.orientation === 0 || window.orientation === 180) {
        maxNumItemsInPeekMode = MAX_NUM_ITEMS_IN_PORTRAIT_PEEK_MODE;
    } else {
        maxNumItemsInPeekMode = MAX_NUM_ITEMS_IN_LANDSCAPE_PEEK_MODE;
    }

    if (menuCurrentState === state.PEEK) {
        // Force re-draw
        self.peekContextMenu(true);
    } else if (menuCurrentState === state.VISIBLE) {
        self.showContextMenu(true);
    }
}

function mouseDownHandler(evt) {
    evt.preventDefault();
    evt.stopPropagation();
}

function contextMenuHandler(evt) {
    evt.preventDefault();
    evt.stopPropagation();
}

function setHeadText(text) {
    var headTextElement = document.getElementById('contextMenuHeadText');

    if (text) {
        // 'Selection' needs to be inside the translate function
        headTextElement.textContent = (text === 'Selection') ? i18n.translate('Selection').fetch() : i18n.translate(text).fetch();
        if (!subheadText || subheadText === '') {
            headTextElement.className = 'singleHeadText';
        } else {
            headTextElement.className = 'headText';
        }
    } else {
        headTextElement.className = "noHeadText";
    }
}

function setSubheadText(text) {
    var subheadTextElement = document.getElementById('contextMenuSubheadText');

    subheadTextElement.textContent = text;

    if (text) {
        if (document.documentElement.dir !== null && document.documentElement.dir === 'rtl') {
            if (utils.parseUri(text)["host"] !== "") {
                // apply the textAlign instead or right to left direction if it's url
                subheadTextElement.style.direction = 'ltr';
                subheadTextElement.style.textAlign = 'right';
            }
        } else {
            // reset the style when system language is changed from 'rtl' to 'ltr' while app is on
            // or head tag has the attribute dir set to 'ltr' or doesn't have the attribute
            subheadTextElement.style.direction = '';
            subheadTextElement.style.textAlign = '';
        }
        if (!headText || headText === '') {
            subheadTextElement.className = 'singleHeadText';
        } else {
            subheadTextElement.className = 'subheadText';
        }
    } else {
        subheadTextElement.className = 'noHeadText';
    }
}

function resetHeader() {
    // Always hide the header div whenever we are peeking
    if (headText || subheadText) {
        contextMenuHeader.className = '';
        if (headText) {
            setHeadText('');
        }
        if (subheadText) {
            setSubheadText('');
        }
    }
}

function resetMenuContent() {
    var contextMenuPlaceHolder = document.getElementById('contextMenuPlaceHolder');
    if (nSeries && contextMenuPlaceHolder !== null) {
        contextMenuContent.removeChild(contextMenuPlaceHolder);
        contextMenuContent.lastChild.style.borderTop = '';
    }
    contextMenuContent.style.position = '';
    contextMenuContent.style.top = '';
    contextMenuContent.style.height = '';
    contextMenuContent.style.overflowY = '';
    contextMenuContent.className = '';
    contextMenuContent.style.bottom = '';
    contextMenuContent.style.paddingTop = '';
}

function init() {
    // detect the device
    nSeries = window.screen.height === 720 && window.screen.width === 720;

    if (nSeries) {
        maxNumItemsInPeekMode = MAX_NUM_ITEMS_IN_NSERIES_PEEK_MODE;
        MENU_ITEM_HEIGHT = 93;
        FULL_MENU_TRANSLATE_X = -540;
        TITLE_HEIGHT = MENU_ITEM_HEIGHT - 2; // -2 for the border
    } else {
        rotationHandler();
        window.addEventListener('orientationchange', rotationHandler, false);
    }
    menu = document.getElementById('contextMenu');
    menu.addEventListener('webkitTransitionEnd', self.transitionEnd.bind(self));
    menu.addEventListener('touchstart', menuTouchStartHandler);
    menu.addEventListener('touchmove', menuTouchMoveHandler);
    menu.addEventListener('touchend', menuTouchEndHandler);
    menu.addEventListener('contextmenu', contextMenuHandler);
    contextMenuContent = document.getElementById('contextMenuContent');
    contextMenuPinned = document.getElementById('contextMenuDelete');
    contextMenuHandle = document.getElementById('contextMenuHandle');
    contextMenuModal = document.getElementById('contextMenuModal');
    contextMenuHeader = document.getElementById('contextMenuHeader');
    setHeadText('');
    setSubheadText('');
    i18n = qnx.webplatform.i18n;
    utils = requireLocal('../chrome/lib/utils');
    formcontrol = requirePlugin('formcontrol');
}

function buildMenuItem(options, index) {
    var menuItem,
        textItem,
        iconItem,
        imageUrl = options.icon,
        spriteImageUrl = 'platform:///ui-resources/assets/contextmenu.png',
        label = options.label ? i18n.translate(options.label).fetch() : '';

    menuItem = document.createElement('div');
    textItem = document.createElement('div');
    iconItem = document.createElement('div');

    if (nSeries) {
        textItem.style.paddingLeft = "101px";
        iconItem.classList.add("icon-nseries");
    } else {
        textItem.style.paddingLeft = "120px";
        iconItem.classList.add("icon-lseries");
    }

    iconItem.id = "contextmenuIcon";
    menuItem.setAttribute("class", "contextmenuItem");
    textItem.appendChild(document.createTextNode(label));

    if (options.actionId === 'menuService') {
        menuItem.style.backgroundImage = "url(" + imageUrl + ")";
    } else if (imageUrl && imageUrl !== spriteImageUrl) {
        iconItem.style.backgroundImage = "url(" + imageUrl + ")";
        iconItem.classList.add("icon-UserDefined");
    } else {
        iconItem.style.backgroundImage = "url(" + spriteImageUrl + ")";
        iconItem.classList.add("icon-" + (imageUrl ? options.actionId : "Generic"));
    }

    menuItem.appendChild(iconItem);
    menuItem.appendChild(textItem);

    menuItem.setAttribute("actionId", options.actionId);
    menuItem.index = index;
    menuItem.active = false;
    menuItem.addEventListener('mousedown', self.mouseDownHandler);
    menuItem.addEventListener('touchstart', menuItemTouchStartHandler);
    menuItem.addEventListener('touchmove', menuItemTouchMoveHandler);
    menuItem.addEventListener('touchend', menuItemTouchEndHandler);

    return menuItem;
}

self = {
    init: init,
    mouseDownHandler: mouseDownHandler,
    buildMenuItems: function (menuItems, header, pinnedId) {
        var menuItem,
            pinnedMenuItem,
            alreadyPinned = false,
            i,
            index;

        if (header) {
            if (header.headText) {
                headText = header.headText;
            }
            if (header.subheadText) {
                subheadText = header.subheadText;
            }
        }

        for (i = 0; i < menuItems.length; i++) {
            if ((pinnedId && pinnedId === menuItems[i].actionId) || (!alreadyPinned && menuItems[i].isPinned)) {

                alreadyPinned = true;
                if (pinnedId) {
                    index = menuItems.length - 2; //Include cancel
                } else {
                    index = menuItems.length - 1;
                }

                _pinnedItemId = pinnedId || menuItems[i].actionId;

                if (contextMenuPinned.firstChild) {
                    contextMenuPinned.removeChild(contextMenuPinned.firstChild);
                }

                menuItem = buildMenuItem(menuItems[i], index);
                pinnedMenuItem = buildMenuItem(menuItems[i], index);
                pinnedMenuItem.setAttribute('class', 'hideContextMenuItem');
                contextMenuPinned.appendChild(menuItem);
            } else {
                if (alreadyPinned) {
                    //Since we have already pinned let's update the index since it goes at the bottom
                    index = i - 1;
                } else {
                    index = i;
                }

                if (alreadyPinned && menuItems[i].isPinned) {
                    continue;
                }

                menuItem = buildMenuItem(menuItems[i], index);
                if (numItems >= maxNumItemsInPeekMode) {
                    menuItem.setAttribute('class', 'hideContextMenuItem');
                }
                contextMenuContent.appendChild(menuItem);
                numItems++;
            }

        }

        if (pinnedMenuItem) {
            contextMenuContent.appendChild(pinnedMenuItem);
            numItems++;
        }

    },

    showContextMenu: function (forceRedraw) {
        var i,
            items,
            contextMenuPlaceHolder,
            moreIcon,
            lastItem;

        pinnedItem = contextMenuPinned.firstChild.firstChild;

        if (menuCurrentState === state.VISIBLE && !forceRedraw) {
            return;
        }

        moreIcon = document.getElementById('moreHandleIcon');
        if (moreIcon !== null) {
            moreIcon.className = '';
        }

        menu.style.webkitTransitionDuration = '0.3s';
        menu.className = 'showContextMenu';
        contextMenuContent.className = 'contentShown';
        contextMenuHandle.className = 'showContextMenuHandle';

        if (headText || subheadText) {
            contextMenuHeader.className = 'showMenuHeader';

            if (headText) {
                setHeadText(headText);
            }
            if (subheadText) {
                setSubheadText(subheadText);
            }
        }

        items = contextMenuContent.childNodes;

        // Move content so that menu items won't be covered by header
        if (numItems > maxNumItemsInPeekMode) {
            if (nSeries) {
                contextMenuContent.style.top = '0px';
                contextMenuContent.style.paddingTop = TITLE_HEIGHT + 'px';
            } else {
                contextMenuContent.style.top = TITLE_HEIGHT + 'px';
            }
            contextMenuContent.style.bottom = 0 + 'px';
            contextMenuContent.style.overflowY = 'scroll';
        } else {
            if (forceRedraw) {
                for (i = 0; i < items.length; i++) {
                    if (items[i] && items[i].firstChild.className === pinnedItem.className) {
                        items[i].className = 'hideContextMenuItem';
                    }
                }
                contextMenuContent.style.overflowY = '';
                contextMenuPinned.className = '';
            }
        }

        items = contextMenuContent.childNodes;

        if (items.length > maxNumItemsInPeekMode) {
            for (i = maxNumItemsInPeekMode; i < items.length; i += 1) {
                if (items[i].id !== 'contextMenuPlaceHolder') {
                    items[i].className = 'contextmenuItem';
                }
            }
            contextMenuPinned.style.webkitTransitionDuration = '0.25s';
            lastItem = contextMenuContent.lastElementChild;
            if (nSeries) {
                if (numItems > maxNumItemsInPeekMode) {
                    if (lastItem.attributes.actionid.value === 'Cancel') {
                        contextMenuPlaceHolder = document.getElementById('contextMenuPlaceHolder');
                        if (contextMenuPlaceHolder === null) {
                            contextMenuPlaceHolder = document.createElement('div');
                            contextMenuPlaceHolder.id = 'contextMenuPlaceHolder';
                            contextMenuPlaceHolder.className = 'contextMenuPlaceHolder';
                            // insert the placeholder above the pinned item when overflows
                            contextMenuContent.insertBefore(contextMenuPlaceHolder, lastItem);
                            contextMenuContent.lastChild.style.borderTop = "2px solid #414141";
                        }
                    }
                    /* let the whole contextmenu scroll including the header */
                    contextMenuPinned.className = 'hideContextMenuItem'; // horizontal transition
                    contextMenuContent.style.webkitOverflowScrolling = '-blackberry-touch';
                } else {
                    contextMenuPinned.className = 'hideContextMenuPinned';
                }
            } else {
                contextMenuPinned.className = 'hideContextMenuPinned';
                contextMenuContent.style.webkitOverflowScrolling = '-blackberry-touch';
            }
        }

        contextMenuContent.addEventListener('scroll', contextMenuContentScroll);
        menuCurrentState = state.VISIBLE;
        positionHandle();
    },

    isMenuVisible: function () {
        return menuCurrentState === state.PEEK || menuCurrentState === state.VISIBLE;
    },

    hideContextMenu: function (evt) {
        if (menuCurrentState === state.HIDE) {
            return;
        }

        contextMenuContent.scrollTop = 0;

        numItems = 0;
        menu.style.webkitTransitionDuration = '0.3s';
        menu.className = 'hideMenu';

        menu.removeEventListener('touchstart', menuTouchStartHandler, false);
        menu.removeEventListener('touchmove', menuTouchMoveHandler, false);
        menu.removeEventListener('touchend', menuTouchEndHandler, false);

        window.document.body.removeEventListener('touchstart', bodyTouchStartHandler, false);
        window.document.body.removeEventListener('touchmove', bodyTouchMoveHandler, false);
        window.document.body.removeEventListener('touchend', bodyTouchEndHandler, false);

        contextMenuContent.removeEventListener('scroll', contextMenuContentScroll);

        while (contextMenuContent.firstChild) {
            contextMenuContent.removeChild(contextMenuContent.firstChild);
        }

        resetHeader();
        headText = '';
        subheadText = '';
        resetMenuContent();

        window.qnx.webplatform.getController().remoteExec(1, 'webview.notifyContextMenuCancelled');
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        menuCurrentState = state.HIDE;
        contextMenuContent.style.paddingTop = '0px';

        while (contextMenuHandle.firstChild) {
            contextMenuHandle.removeChild(contextMenuHandle.firstChild);
        }
        // Reset sensitivity
        window.qnx.webplatform.getController().remoteExec(1, 'webview.setSensitivity', ['SensitivityTest']);
        contextMenuModal.style.display = 'none';
        formcontrol.ccmVisible(false);
    },

    setHeadText: setHeadText,

    setSubheadText: setSubheadText,

    peekContextMenu: function (forceRedraw) {
        var i,
            items;

        pinnedItem = contextMenuPinned.firstChild.firstChild;

        if (menuCurrentState === state.PEEK && !forceRedraw) {
            return;
        }

        // Resolves the unexpected rendering delay caused by webkitOverflowScrolling property
        contextMenuContent.style.webkitOverflowScrolling = '';
        menu.style.webkitOverflowScrolling = '';

        peekModeNumItems = numItems > maxNumItemsInPeekMode ? maxNumItemsInPeekMode : numItems;
        elements = document.getElementsByClassName("contextmenuItem");

        // Cache items for single item peek mode.
        window.qnx.webplatform.getController().remoteExec(1, "webview.setSensitivity", ["SensitivityNoFocus"]);
        contextMenuModal.style.display = '';

        menu.style.webkitTransitionDuration = '0.3s';
        menu.className = 'peekContextMenu';
        contextMenuHandle.className = 'showContextMenuHandle';

        if ((menuCurrentState === state.DRAGEND || menuCurrentState === state.VISIBLE || forceRedraw)) {
            items = contextMenuContent.childNodes;

            for (i = 0; i < items.length; i++) {
                if (items[i]) {
                    items[i].className = 'contextmenuItem';
                }
                if (items[i].getAttribute('actionId') === _pinnedItemId) {
                    items[i].className = 'hideContextMenuItem';
                }
                if (i >= peekModeNumItems) {
                    items[i].className = 'hideContextMenuItem';
                }
            }
        }

        contextMenuPinned.style.webkitTransitionDuration = '0s';
        contextMenuPinned.className = '';

        // Reset the scroll height no matter what when going into peek mode
        contextMenuContent.style.paddingTop = '0px';
        menu.scrollTop = 0;

        resetHeader();
        resetMenuContent();

        // This is for single item peek mode
        menu.style.overflowX = 'visible';
        menu.style.overflowY = 'visible';

        window.document.body.addEventListener('touchstart', bodyTouchStartHandler);
        window.document.body.addEventListener('touchmove', bodyTouchMoveHandler);
        window.document.body.addEventListener('touchend', bodyTouchEndHandler);

        menuCurrentState = state.PEEK;
        positionHandle();

        // hide the formcontrol when the contextmenu is active
        formcontrol.ccmVisible(true);
    },

    transitionEnd: function () {
        if (menuCurrentState === state.HIDE) {
            self.setHeadText('');
            self.setSubheadText('');
            headText = '';
            subheadText = '';
        }
    },

    activate: function (args) {
        this.init();
        this.buildMenuItems(args.menuItems, args.header, args.pinnedItemId);
        this.peekContextMenu(true);
    }
};

module.exports = self;

});

define('dialog', function (require, exports, module) {
/*
 * Copyright (C) Research In Motion Limited 2012. All rights reserved.
 */

var dialog,
    utils,
    i18n,
    _dialogDiv,
    _panel;

function requireLocal(id) {
    return require(!!require.resolve ? "../../" + id.replace(/\/chrome/, "") : id);
}

function updateContentStyle() {
    var content = document.getElementsByClassName("dialog-content")[0];
    if (content !== null) {
        if (document.documentElement.dir === 'rtl') {
            // we overwrite the direction to 'ltr' and only set textAlign to' right' since the text in
            // dialog-content div is translated already
            content.style.direction = 'ltr';
            content.style.textAlign = 'right';
        } else {
            content.style.direction = '';
            content.style.textAlign = '';
        }
    }
}

function clearContentStyle() {
    var content = document.getElementsByClassName("dialog-content")[0];
    if (content !== null) {
        content.style.direction = '';
        content.style.textAlign = '';
    }
}

function init() {
    _dialogDiv = document.getElementById('dialog');
    _panel = document.getElementById('dialog-panel');
    window.addEventListener("systemLanguageChange", function () {
        updateContentStyle();
    });
}

function hide(evt) {
    _dialogDiv.classList.add('hidden');
    clearContentStyle();
}

function response(waitHandle, oktext, username, password) {
    window.qnx.webplatform.getController().remoteExec(1, 'dialog.response', waitHandle, oktext, username, password);
}

function appendDialogContent(contentElement, desc) {
    if (desc.htmlmessage && typeof desc.htmlmessage === "string") {
        contentElement.innerHTML = qnx.webplatform.i18n.translate(desc.htmlmessage).fetch();
    } else {
        contentElement.appendChild(desc.htmlmessage ? desc.htmlmessage : document.createTextNode(desc.message));
    }
}

function setOrdinalGroup() {
    var buttons = document.getElementsByClassName('dialog-buttons')[0].childNodes,
        total,
        num;

    total = num = buttons.length;
    if (document.documentElement.dir === 'rtl') {
        if (buttons !== null && total !== 0) {
            while (num > 0) {
                buttons[--num].style.webkitBoxOrdinalGroup = total - num;
            }
        }
    }
}

function show(desc) {
    var header = document.createElement('div'),
        content = document.createElement('div'),
        inputContainer,
        input,
        inputLineContainer,
        input2,
        input2LineContainer,
        input2ClearButton,
        showPasswdContainer,
        showPasswdDesc,
        showPasswdCheckbox,
        inputClearButton,
        buttons = document.createElement('div'),
        divider,
        divider2,
        button = document.createElement('button'),
        button2,
        button3,
        classAutofill,
        res = {},
        buttonArray = [],
        stackedButtons = [],
        buttonsContainer = document.createElement('div'),
        i,
        url,
        contentPreamble,
        domainName,
        id,
        radioButtonContainer,
        radio,
        label,
        divHeight,
        screenHeight,
        container,
        classContainerAutoFill = 'dialog-auth-input-line-container-autofill',
        classClearButtonActive = 'dialog-input-clear-button-active';
    init();

    //Check and parse the incoming description, since we use the executeJS into this context
    desc = typeof desc === 'string' ? JSON.parse(desc) : desc;
    url = desc.url;
    utils  = requireLocal("../chrome/lib/utils");
    i18n = qnx.webplatform.i18n;

    _dialogDiv.classList.add('hidden');
    _panel.innerHTML = '';

    header.classList.add('dialog-header');
    content.classList.add('dialog-content');
    buttons.classList.add('dialog-buttons');
    button.classList.add('dialog-button');

    switch (desc.dialogType) {
    case 'JavaScriptAlert':
        header.appendChild(document.createTextNode(desc.title ? i18n.translate(desc.title).fetch() : i18n.translate("JavaScript Alert").fetch()));
        appendDialogContent(content, desc);
        button.appendChild(document.createTextNode(desc.oklabel ? i18n.translate(desc.oklabel).fetch() : i18n.translate("OK").fetch()));
        button.addEventListener('click', hide);

        _panel.appendChild(header);
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        buttons.appendChild(button);
        buttonsContainer.appendChild(buttons);
        _panel.appendChild(buttonsContainer);

        res.ok = button;
        setOrdinalGroup();
        break;
    case 'SSLCertificateException':
        header.appendChild(document.createTextNode(desc.title ? i18n.translate(desc.title).fetch() : i18n.translate("SSL Certificate Exception").fetch()));
        desc.message = i18n.translate("The certificate for this site can't be trusted. " +
                                      "Another site may be impersonating the site you are trying to visit. " +
                                      "If you add an exception, you will continue to the site and not be " +
                                      "warned next time you view %1$s.").fetch(desc.url);
        appendDialogContent(content, desc);
        button.appendChild(document.createTextNode(desc.savelabel ? i18n.translate(desc.savelabel).fetch() : i18n.translate("Add Exception").fetch()));
        button.addEventListener('click', hide);

        divider = document.createElement('div');
        divider.classList.add('dialog-button-divider');
        button2 = document.createElement('button');
        button2.classList.add('dialog-button');
        button2.appendChild(document.createTextNode(desc.cancellabel ? i18n.translate(desc.cancellabel).fetch() : i18n.translate("Cancel").fetch()));
        button2.addEventListener('click', hide);

        _panel.appendChild(header);
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        buttons.appendChild(button);
        buttons.appendChild(divider);
        buttons.appendChild(button2);
        buttonsContainer.appendChild(buttons);
        _panel.appendChild(buttonsContainer);

        res.save = button;
        res.cancel = button2;
        setOrdinalGroup();
        break;
    case 'InsecureSubresourceLoadPolicyConfirm':
        desc.title = i18n.translate("Security Information").fetch();
        desc.oklabel = i18n.translate("Yes").fetch();
        desc.cancellabel = i18n.translate("No").fetch();
        /* falls through */
    case 'JavaScriptConfirm':
        header.appendChild(document.createTextNode(desc.title ? i18n.translate(desc.title).fetch() : i18n.translate("JavaScript Confirm").fetch()));
        appendDialogContent(content, desc);
        button.appendChild(document.createTextNode(desc.oklabel ? i18n.translate(desc.oklabel).fetch() : i18n.translate("OK").fetch()));
        button.addEventListener('click', hide);
        divider = document.createElement('div');
        divider.classList.add('dialog-button-divider');
        button2 = document.createElement('button');
        button2.classList.add('dialog-button');
        button2.appendChild(document.createTextNode(desc.cancellabel ? i18n.translate(desc.cancellabel).fetch() : i18n.translate("Cancel").fetch()));
        button2.addEventListener('click', hide);

        _panel.appendChild(header);
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        buttons.appendChild(button2);
        buttons.appendChild(divider);
        buttons.appendChild(button);
        if (desc.thirdOptionLabel) {
            button3 = document.createElement('button');
            button3.classList.add('dialog-button');
            button3.appendChild(document.createTextNode(desc.thirdOptionLabel));
            button3.addEventListener('click', hide);
            divider2 = document.createElement('div');
            divider2.classList.add('dialog-button-divider');
            buttons.appendChild(divider2);
            buttons.appendChild(button3);
            res.thirdOptionButton = button3;
        }
        buttonsContainer.appendChild(buttons);
        _panel.appendChild(buttonsContainer);

        res.ok = button;
        res.cancel = button2;
        res.oktext = 'true';
        setOrdinalGroup();
        break;
    case 'JavaScriptPrompt':
        header.appendChild(document.createTextNode(desc.title ? i18n.translate(desc.title).fetch() : i18n.translate("JavaScript Prompt").fetch()));
        input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.classList.add('dialog-input');
        input.setAttribute('value', desc.result ? desc.result : "");
        input.addEventListener('keydown', function (keyEvent) {
            if (parseInt(keyEvent.keyCode, 10) === 13) {
                button.click();
            }
        });
        appendDialogContent(content, desc);
        button.appendChild(document.createTextNode(desc.oklabel ? i18n.translate(desc.oklabel).fetch() : i18n.translate("OK").fetch()));
        button.addEventListener('click', hide);
        divider = document.createElement('div');
        divider.classList.add('dialog-button-divider');
        button2 = document.createElement('button');
        button2.classList.add('dialog-button');
        button2.appendChild(document.createTextNode(desc.cancellabel ? i18n.translate(desc.cancellabel).fetch() : i18n.translate("Cancel").fetch()));
        button2.addEventListener('click', hide);

        _panel.appendChild(header);
        content.appendChild(input);
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        buttons.appendChild(button2);
        buttons.appendChild(divider);
        buttons.appendChild(button);
        buttonsContainer.appendChild(buttons);
        _panel.appendChild(buttonsContainer);

        res.ok = button;
        res.cancel = button2;
        res.__defineGetter__('oktext', function () {
            return input.value;
        });
        setOrdinalGroup();
        break;
    case 'AuthenticationChallenge':
        header.appendChild(document.createTextNode(desc.title ? i18n.translate(desc.title).fetch() : (desc.isProxy ? i18n.translate("Can't Connect to the network").fetch() : i18n.translate("Authentication Required").fetch())));
        url = desc.url;

        if (desc.isProxy) {
            contentPreamble = i18n.translate("The login information entered for the proxy is incorrect. Try entering the information again.").fetch();
        } else if (url) {
            domainName = utils.parseUri(url)["host"];
            if (url.indexOf("https://") === 0) {
                contentPreamble = i18n.translate("Connecting to %1$s via SSL connection").fetch(domainName);
            } else {
                contentPreamble = i18n.translate("Connecting to %1$s").fetch(domainName);
            }
        }
        content.appendChild(document.createElement('div')).innerText = contentPreamble;
        appendDialogContent(content, desc);
        inputContainer = document.createElement('div');
        inputContainer.classList.add('dialog-input-container');
        inputLineContainer = document.createElement('div');
        inputLineContainer.classList.add('dialog-auth-input-line-container');
        input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('placeholder', i18n.translate('Username').fetch());
        input.classList.add('dialog-auth-input');
        input.addEventListener('keydown', function (keyEvent) {
            if (parseInt(keyEvent.keyCode, 10) === 13) {
                input2[0].focus();
                return;
            }
            if (inputLineContainer.classList.contains(classContainerAutoFill)) {
                inputLineContainer.classList.remove(classContainerAutoFill);
                input2LineContainer.classList.remove(classContainerAutoFill);
                showPasswdCheckbox[0].disabled = false;
                input2[0].value = '';
            }
        });
        input.addEventListener('input', function () {
                if (input.value === '') {
                    // Clear password when user clears username with backspace.
                    input2.value = '';
                    input2ClearButton.classList.remove(classClearButtonActive);
                    if (inputClearButton.classList.contains(classClearButtonActive)) {
                        inputClearButton.classList.remove(classClearButtonActive);
                    }
                } else if (!inputClearButton.classList.contains(classClearButtonActive)) {
                    inputClearButton.classList.add(classClearButtonActive);
                }
            });
        inputClearButton = document.createElement('button');
        inputClearButton.classList.add('dialog-input-clear-button');
        inputClearButton.addEventListener('click', function () {
                if (inputLineContainer.classList.contains(classAutofill)) {
                    inputLineContainer.classList.remove(classAutofill);
                    input2LineContainer.classList.remove(classAutofill);
                    showPasswdCheckbox.disabled = false;
                }
                input.value = '';
                input2.value = '';
                inputClearButton.classList.remove(classClearButtonActive);
                input2ClearButton.classList.remove(classClearButtonActive);
            });
        if (desc.username) {
            input.setAttribute('value', decodeURIComponent(desc.username));
            inputLineContainer.classList.add(classAutofill);
            inputClearButton.classList.add(classClearButtonActive);
        }
        input2LineContainer = document.createElement('div');
        input2LineContainer.classList.add('dialog-auth-input-line-container');
        input2 = document.createElement('input');
        input2.setAttribute('type', 'password');
        input2.setAttribute('placeholder', i18n.translate('Password').fetch());
        input2.classList.add('dialog-auth-input');
        input2.addEventListener('keydown', function (keyEvent) {
            if (parseInt(keyEvent.keyCode, 10) === 13) {
                button.click();
            }
        });
        input2.addEventListener('input', function () {
            if (input2.value === '' && input2ClearButton.classList.contains(classClearButtonActive)) {
                input2ClearButton.classList.remove(classClearButtonActive);
            } else if (input2.value !== '' && !input2ClearButton.classList.contains(classClearButtonActive)) {
                input2ClearButton.classList.add(classClearButtonActive);
            }
        });
        input2.addEventListener('focus', function (keyEvent) {
            if (input2LineContainer.classList.contains(classAutofill)) {
                input2LineContainer.classList.remove(classAutofill);
                showPasswdCheckbox.disabled = false;
                input2.value = '';
            }
            if (input2.type === 'text') {
                // Change the input type back to password temporarily
                // to bring up the keyboard in password mode.
                // FIXME: If the "Show password" is checked and we have already
                // inputed some characters, there's a short period that the
                // password will be displayed as dots between the input
                // gets focus and the keyboard brings up.
                input2.type = 'password';
            }
        });
        input2ClearButton = document.createElement('button');
        input2ClearButton.classList.add('dialog-input-clear-button');
        input2ClearButton.addEventListener('click', function () {
            if (input2LineContainer.classList.contains(classAutofill)) {
                input2LineContainer.classList.remove(classAutofill);
                showPasswdCheckbox.disabled = false;
            }
            input2.value = '';
            input2ClearButton.classList.remove(classClearButtonActive);
        });
        if (desc.password) {
            input2.setAttribute('value', decodeURIComponent(desc.password));
            input2LineContainer.classList.add(classAutofill);
            input2ClearButton.classList.add(classClearButtonActive);
        }
        showPasswdContainer = document.createElement('div');
        showPasswdContainer.classList.add('dialog-show-password-container');
        showPasswdCheckbox = document.createElement('input');
        showPasswdCheckbox.setAttribute('type', 'checkbox');
        showPasswdCheckbox.classList.add('dialog-show-password-checkbox');
        showPasswdCheckbox.addEventListener('click', function () {
            if (showPasswdCheckbox.checked) {
                input2.type = 'text';
            } else {
                input2.type = 'password';
            }
        });
        if (input2LineContainer.classList.contains(classAutofill)) {
            showPasswdCheckbox.disabled = true;
        } else {
            showPasswdCheckbox.disabled = false;
        }
        showPasswdDesc = document.createTextNode(i18n.translate('Show password').fetch());
        button.appendChild(document.createTextNode(desc.oklabel ? i18n.translate(desc.oklabel).fetch() : (desc.isProxy ? i18n.translate("Try Again").fetch() : i18n.translate("OK").fetch())));
        button.addEventListener('click', hide);
        divider = document.createElement('div');
        divider.classList.add('dialog-button-divider');
        button2 = document.createElement('button');
        button2.classList.add('dialog-button');
        button2.appendChild(document.createTextNode(desc.cancellabel ? i18n.translate(desc.cancellabel).fetch() : i18n.translate("Cancel").fetch()));
        button2.addEventListener('click', hide);

        inputLineContainer.appendChild(input);
        inputLineContainer.appendChild(inputClearButton);

        input2LineContainer.appendChild(input2);
        input2LineContainer.appendChild(input2ClearButton);

        showPasswdContainer.appendChild(showPasswdDesc);
        showPasswdContainer.appendChild(showPasswdCheckbox);

        inputContainer.appendChild(inputLineContainer);
        inputContainer.appendChild(input2LineContainer);
        inputContainer.appendChild(showPasswdContainer);

        content.appendChild(inputContainer);

        buttons.appendChild(button2);
        buttons.appendChild(divider);
        buttons.appendChild(button);

        _panel.appendChild(header);
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        buttonsContainer.appendChild(buttons);
        _panel.appendChild(buttonsContainer);

        res.ok = button;
        res.cancel = button2;

        res.__defineGetter__('username', function () {
            return input.value;
        });

        res.__defineGetter__('password', function () {
            return input2.value;
        });

        res.oktext = 'true';
        setOrdinalGroup();
        break;

    case 'SaveCredential':
        header.appendChild(document.createTextNode(desc.title ? i18n.translate(desc.title).fetch() : i18n.translate("Signing In").fetch()));
        appendDialogContent(content, desc);
        button.appendChild(document.createTextNode(desc.oklabel ? i18n.translate(desc.oklabel).fetch() : i18n.translate("Save").fetch()));
        button.addEventListener('click', hide);
        divider = document.createElement('div');
        divider.classList.add('dialog-button-divider');
        button2 = document.createElement('button');
        button2.classList.add('dialog-button');
        button2.appendChild(document.createTextNode(desc.neverlabel ? i18n.translate(desc.neverlabel).fetch() : i18n.translate("Never").fetch()));
        button2.addEventListener('click', hide);
        divider2 = document.createElement('div');
        divider2.classList.add('dialog-button-divider');
        button3 = document.createElement('button');
        button3.classList.add('dialog-button');
        button3.appendChild(document.createTextNode(desc.cancellabel ? i18n.translate(desc.cancellabel).fetch() : i18n.translate("Ignore").fetch()));
        button3.addEventListener('click', hide);

        _panel.appendChild(header);
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        buttons.appendChild(button3);
        buttons.appendChild(divider2);
        buttons.appendChild(button2);
        buttons.appendChild(divider);
        buttons.appendChild(button);
        buttonsContainer.appendChild(buttons);
        _panel.appendChild(buttonsContainer);

        res.save = button;
        res.never = button2;
        res.cancel = button3;
        setOrdinalGroup();
        break;
    case 'CameraSelection':
        header.appendChild(document.createTextNode(i18n.translate(desc.title).fetch()));

        radioButtonContainer = document.createElement('div');
        radioButtonContainer.classList.add('dialog-cameras-container');

        for (i = 0; i < desc.cameras.length; i++) {
            id = 'camera_selection_dialog_c' + i;
            radio = document.createElement('input');
            radio.setAttribute('type', 'radio');
            radio.setAttribute('name', 'cameras');
            radio.setAttribute('id', id);
            radio.classList.add("dialog-camera-radio-button");
            radio.value = i;
            if (!i) {
                radio.checked = true;
            }
            label = document.createElement('label');
            label.setAttribute('for', id);
            label.appendChild(document.createTextNode(i18n.translate(desc.cameras[i]).fetch()));

            container = document.createElement('div');
            container.appendChild(radio);
            container.appendChild(label);
            radioButtonContainer.appendChild(container);
        }

        content.appendChild(radioButtonContainer);
        button.appendChild(document.createTextNode(i18n.translate("OK").fetch()));
        button.addEventListener('click', hide);

        _panel.appendChild(header);
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        buttons.appendChild(button);
        buttonsContainer.appendChild(buttons);
        _panel.appendChild(buttonsContainer);

        res.ok = button;
        res.dialogType = desc.dialogType;
        setOrdinalGroup();
        break;
    case 'CustomAsk':
        //Header content for the pannel
        header.appendChild(document.createTextNode(desc.title ? i18n.translate(desc.title).fetch() : i18n.translate("Custom Dialog").fetch()));
        appendDialogContent(content, desc);
        _panel.appendChild(header);
        //Create all needed variables for stacked buttons
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        _panel.appendChild(buttonsContainer);
        //Loop for each button sent as an array
        for (i = 0; i < desc.optionalButtons.length; i++) {
            stackedButtons[i] = document.createElement('div');
            stackedButtons[i].classList.add('dialog-buttons-stacked');
            //If not last element make the styled stacked button
            button = document.createElement('button');
            button.classList.add('dialog-button');
            button.appendChild(document.createTextNode(i18n.translate(desc.optionalButtons[i]).fetch()));
            button.addEventListener('click', hide);
            stackedButtons[i].appendChild(button);
            buttonsContainer.appendChild(stackedButtons[i]);
            //The button array is for the callback
            buttonArray[i] = button;
        }
        _panel.appendChild(buttonsContainer);
        //All possible choices in the button array
        res.custom = buttonArray;
        break;
    case 'Generic':
    case 'GeolocationPermission':
        header.appendChild(document.createTextNode(i18n.translate("Location Services Off").fetch()));
        desc.message = i18n.translate("Turn on Location Services in Settings to take advantage of all the features in this app.").fetch(desc.url);
        appendDialogContent(content, desc);
        button.appendChild(document.createTextNode(i18n.translate("Settings").fetch()));
        button.addEventListener('click', hide);

        divider = document.createElement('div');
        divider.classList.add('dialog-button-divider');
        button2 = document.createElement('button');
        button2.classList.add('dialog-button');
        button2.appendChild(document.createTextNode(i18n.translate("Close").fetch()));
        button2.addEventListener('click', hide);

        _panel.appendChild(header);
        buttonsContainer.classList.add('dialog-content-container');
        buttonsContainer.appendChild(content);
        buttons.appendChild(button);
        buttons.appendChild(divider);
        buttons.appendChild(button2);
        buttonsContainer.appendChild(buttons);
        _panel.appendChild(buttonsContainer);

        res.ok = button;
        res.cancel = button2;
        setOrdinalGroup();
        break;

    // By default we need to return the thread so we don't block if this is an un-recognized dialog
    default:
        window.qnx.webplatform.getController().remoteExec(1, 'dialog.result');
        return;
    }

    function adjustDialogForOverflow() {
        _panel.style.maxHeight = "";
        buttonsContainer.style.paddingBottom = "";
        divHeight = _panel.offsetHeight;
        screenHeight = screen.height - 40;
        if (screenHeight < divHeight) {
            _panel.style.maxHeight = screenHeight + "px";
            buttonsContainer.style.paddingBottom = "47px";
        }

    }

    // Adjust dialog max height and button padding
    adjustDialogForOverflow();
    // update the content style depending on the direction of language
    updateContentStyle();
    window.addEventListener("orientationchange", adjustDialogForOverflow, false);

    _dialogDiv.classList.remove('hidden');

    /*
     * This call is executed from a different context, therefore we can't
     * really return a value. We need to expose a call through the controller
     * publish remote function
     */

    return res;
}

function checkButtons(i) {
    return function () {
        var index = i;
        window.qnx.webplatform.getController().remoteExec(1, 'dialog.result', [index]);
    };
}

function showDialog(description) {
    var res = show(description),
        i,
        el,
        returnValue = {};
    if (res) {
        if (res.ok) {
            res.ok.addEventListener('click', function () {
                returnValue.username = res.hasOwnProperty('username') ? encodeURIComponent(res.username) : undefined;
                returnValue.password = res.hasOwnProperty('password') ? encodeURIComponent(res.password) : undefined;
                returnValue.oktext = res.hasOwnProperty('oktext') ? encodeURIComponent(res.oktext) : '';
                returnValue.ok = true;
                // Retrieves what radio button was selected when dialog type is 'CameraSelection'
                if (res.dialogType && res.dialogType === 'CameraSelection')
                {
                    var inputs = document.getElementsByName('cameras'),
                        selectedIndex,
                        i;

                    for (i = 0; i < inputs.length; i++) {
                        if (inputs[i].checked) {
                            selectedIndex = inputs[i].value;
                            break;
                        }
                    }

                    returnValue.cameraSelectedIndex = selectedIndex;
                }

                window.qnx.webplatform.getController().remoteExec(1, 'dialog.result', [returnValue]);
            });
        }
        if (res.cancel) {
            res.cancel.addEventListener('click', function () {
                returnValue.cancel = true;
                window.qnx.webplatform.getController().remoteExec(1, 'dialog.result', [returnValue]);
            });
        }
        if (res.save) {
            res.save.addEventListener('click', function () {
                returnValue.save = true;
                window.qnx.webplatform.getController().remoteExec(1, 'dialog.result', [returnValue]);
            });
        }
        if (res.never) {
            res.never.addEventListener('click', function () {
                returnValue.never = true;
                window.qnx.webplatform.getController().remoteExec(1, 'dialog.result', [returnValue]);
            });
        }
        if (res.thirdOptionButton) {
            res.thirdOptionButton.addEventListener('click', function () {
                returnValue.thirdOptionButton = true;
                window.qnx.webplatform.getController().remoteExec(1, 'dialog.result', [returnValue]);
            });
        }
        //returns index of button array
        if (res.custom) {
            for (i = 0; i < res.custom.length; i++) {
                el = res.custom[i];
                el.addEventListener('click', checkButtons(i), false);
            }
        }
    }
}

dialog = {
    /**
     * description can have
     *   title - the title of the dialog
     *   message - the dialog's message. Text only
     *   htmlmessage - alternate message content, can contain HTML
     *   oklabel - the label for the primary/action/OK button
     *   cancellabel - the label for the secondary/dismiss/Cancel button
     *   neverlabel - the label for "never remember this site" action of save credential dialog
     *
     * @returns object res
     *   ok - The ok button element. Attach your click handlers here
     *   cancel - The cancel button element. Attach your click handlers here
     *   oktext - The string "true" for hitting OK on a Confirm, the input's value for hitting OK on a Prompt, or absent
     *   username - User name for authentication challenge dialog
     *   password - Password for authentication challenge dialog
     */
    showDialog: showDialog,
};

module.exports = dialog;

});

define('invocationlist', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var isShowing = false,
    isNSeries = false,
    userEvents = ['mousedown', 'mouseup', 'click', 'touchstart', 'touchmove', 'touchend'],
    PREVENT_INTERACTION_TIMEOUT = 2000, // 2 seconds
    SCREEN_TRANSITION_TIME = 250,
    SCREEN_TRANSITION_TIMEOUT = SCREEN_TRANSITION_TIME + 200,
    SCREEN_TRANSITION_TYPE = '-webkit-transform',
    SCREEN_TRANSITION_STYLE = SCREEN_TRANSITION_TYPE + ' ' + SCREEN_TRANSITION_TIME + 'ms ease-out',
    interactionTimeoutId = 0,
    zIndex = 100,
    invocationListScreen,
    invocationListScroll,
    listItems,
    results,
    self,
    title,
    touchDownPosition,
    pendingAnimationQueue = [],
    animationBlockers = 0,
    offscreenLocation = { LEFT: 'translate3d(-120%, 0, 0)',
                          RIGHT: 'translate3d(120%, 0, 0)',
                          TOP: 'translate3d(0, -120%, 0)',
                          BOTTOM: 'translate3d(0, 120%, 0)',
                          ONSCREEN: 'translate3d(0, 0, 0)' },
    ScreenObj = function (domElement) {
        return {
            pushing: false,
            popping: false,
            popped: false,
            pushed: false,
            domElement: domElement
        };
    };

function requirePlugin(id) {
    return require(!!require.resolve ? "../" + id : id);
}

/*
    Screen Animation Coordinator
 */
function tryStartAnimating() {
    if (animationBlockers === 0) {
        var animation;
        while ((animation = pendingAnimationQueue.shift())) {
            animation();
        }
    }
}

function resetTitlebar() {
    var titlebarwithactions = document.getElementById('titlebarwithactions'),
        content = document.getElementById('invocationListContent');

    if (titlebarwithactions.parentNode) {
        titlebarwithactions.parentNode.removeChild(titlebarwithactions);
    }
    content.style.top = '';
}

function unblockAnimating() {
    animationBlockers--;
    if (animationBlockers < 0) {
        throw new Error('Attempt to unblock animations when there are none');
    }
    tryStartAnimating();
}

function blockAnimating() {
    animationBlockers++;
}

function forceLayout(element) {
    /* When animating elements that were just added to the DOM
       they first need to layed out or else the style will only
       calculated once and the transition animation will not occur */
    return document.defaultView.getComputedStyle(element, "").display;
}

function appendAnimation(animation) {
    pendingAnimationQueue.push(animation);
}

function animate() {
    tryStartAnimating();
}

function stopEvent(event) {
    event.preventDefault();
    event.stopPropagation();
}

function allowUserInteraction() {
    if (interactionTimeoutId === 0) {
        return;
    }
    clearTimeout(interactionTimeoutId);
    interactionTimeoutId = 0;
    console.log("allowing user interaction");
    userEvents.forEach(function (eventType) {
        document.removeEventListener(eventType, stopEvent, true);
    });
}

function preventUserInteraction() {
    if (interactionTimeoutId !== 0) {
        return;
    }

    userEvents.forEach(function (eventType) {
        document.addEventListener(eventType, stopEvent, true);
    });

    interactionTimeoutId = setTimeout(function () {
        console.error('prevent user interaction timeout occured');
        allowUserInteraction();
    }, PREVENT_INTERACTION_TIMEOUT);
}

function transitionWithTimeout(element, transition, transitionTimeout, callback) {
    var boundEvent,
       timeoutId,
       onEvent;

    onEvent = function (timeoutId, event) {
        if (event.target === element) {
            clearTimeout(timeoutId);
            element.removeEventListener("webkitTransitionEnd", boundEvent, false);
            if (callback) {
                callback();
            }
        }
    };

    if (callback) {
        // Last resort timer in case all frames of transition are dropped and webKitTransitionEnd event never fires
        timeoutId = setTimeout(function () {
            console.log("transistion timed out for " + element.id);
            element.removeEventListener("webkitTransitionEnd", boundEvent, false);
            callback();
        }, transitionTimeout);
        boundEvent = onEvent.bind(this, timeoutId);
        element.addEventListener("webkitTransitionEnd", boundEvent, false);
    }

    transition();
    return timeoutId;
}

/*
    Screen Pushing / Popping Abstractions
 */

function screenPushed(screenObj) {
    allowUserInteraction();
    isShowing = true;
    screenObj.pushing = false;
    screenObj.domElement.style.webkitTransition = '';
    setTimeout(function () {
        screenObj.domElement.style.webkitTransition = SCREEN_TRANSITION_STYLE;
    }, 0);
}

function screenPopped(screenObj) {
    allowUserInteraction();
    screenObj.domElement.style.webkitTransition = '';
    isShowing = false;
    screenObj.popped = false;
    setTimeout(function () {
        screenObj.domElement.classList.add('removed');
        screenObj.domElement.style.webkitTransition = SCREEN_TRANSITION_STYLE;
        screenObj.domElement.removeEventListener('webkitTransitionEnd', screenObj.transitionEndListener);
    }, 0);
}

function animatePushScreen(screenObj) {
    screenObj.pushing = true;

    transitionWithTimeout(screenObj.domElement, function () {
        screenObj.domElement.style.webkitTransform = offscreenLocation.ONSCREEN;
    }, SCREEN_TRANSITION_TIMEOUT, screenPushed.bind(this, screenObj));
}

function animatePopScreen(screenObj) {
    screenObj.popping = true;

    transitionWithTimeout(screenObj.domElement, function () {
        screenObj.domElement.style.webkitTransform = offscreenLocation.BOTTOM;
    }, SCREEN_TRANSITION_TIMEOUT, screenPopped.bind(this, screenObj));

    zIndex -= 10;
}

function showActivityIndicator() {
    /// Hide the list and show the activity indicator
    document.getElementById('invocationListContent').classList.add('hidden');
    document.getElementById('targetLoader').classList.remove('hidden');
}

function invokeTarget(target) {

    showActivityIndicator();
    // Callback for invoking an invocation is to hide the invocation list screen
    window.qnx.webplatform.getController().remoteExec(1, "invocation.invoke", [target]);

    animatePopScreen(invocationListScreen);
    resetTitlebar();
}

function contextMenuHandler(evt) {
    evt.preventDefault();
    evt.stopPropagation();
}

function orientationChangeHandler() {
    var listContent = document.getElementById('invocationListContent');
    listContent.style.height = screen.height - title.height + 'px';
}

/*
    UI Widget Builders
 */

function populateList(parentId, targets, inheritedTargets) {
    var listContent = document.getElementById(parentId),
        listItem,
        iconDiv,
        labelDiv,
        subLabel,
        prop,
        i,
        device = window.qnx.webplatform.device;

    listItems = [];
    title = requirePlugin('titlebarwithactions');
    // Reset listContent
    listContent.innerHTML = "";
    if (device.type === device.DEVICE_TYPE.L_SERIES) {
        listContent.style.top = title.height + 'px';
        listContent.style.height = screen.height - title.height + 'px';
        window.addEventListener('orientationchange', orientationChangeHandler);
    }
    listContent.setAttribute('class', 'invocationListContainer');
    listContent.addEventListener('contextmenu', contextMenuHandler);

    // create a bunch of subdivs
    for (i in targets) {
        if (targets.hasOwnProperty(i)) {
            listItem = document.createElement('div');

            iconDiv = document.createElement('div');
            iconDiv.setAttribute('class', 'invocationListItemIconDiv');

            iconDiv.style.backgroundImage = 'url(file://' + targets[i].icon + ')';

            labelDiv = document.createElement('div');
            labelDiv.setAttribute('class', 'invocationListLabel');
            labelDiv.innerHTML = targets[i].label;


            if (targets[i]['label-sub1']) {
                subLabel = document.createElement('div');
                subLabel.setAttribute('class', 'invocationListMainLabel');
                subLabel.innerHTML = targets[i]['label-sub1'];
                labelDiv.appendChild(subLabel);
            }

            listItem.appendChild(iconDiv);
            listItem.appendChild(labelDiv);

            if (inheritedTargets) {
                for (prop in inheritedTargets) {
                    if (!targets[i].invoke.hasOwnProperty(prop)) {
                        targets[i].invoke[prop] = inheritedTargets[prop];
                    }
                }
            }
            listItem.addEventListener('click', invokeTarget.bind(this, targets[i].invoke), false);
            listItem.setAttribute('class', 'invocationListItem');

            listItems[targets[i].target] = targets[i];
            listContent.appendChild(listItem);
        }
    }
}



function createTitleBar(title) {
    var screenDiv = document.getElementById('invocationlist'),
        cancelBar = document.getElementById('cancelTitlebar'),
        listContent = document.getElementById('invocationListContent'),
        options,
        titleBar;

    invocationListScroll = function invocationListScroll(evt) {
        if (listContent.scrollTop < 0) { //  && listContent.firstChild === titleBar) {
            // Check if there is a titleBar inside the cancel div already that we added
            titleBar.style.webkitTransform = 'translate3d(0px, 0px, 0)';
        } else if (listContent.scrollTop > 0  && cancelBar.firstChild === titleBar) {
            // Remove the title bar form the list and put it into the cancel bar
            titleBar.style.webkitTransform = 'translate3d(0px, -' + listContent.scrollTop + 'px, 0)';
        }
    };

    options = {
        label: qnx.webplatform.i18n.translate('Cancel').fetch(),
        callback: self.hide
    };

    titleBar = requirePlugin('titlebarwithactions').create(title ? title : qnx.webplatform.i18n.translate('Share').fetch(), options);
    cancelBar.appendChild(titleBar);

    if (isNSeries) {
        listContent.addEventListener('scroll', invocationListScroll);
    }

    invocationListScreen = new ScreenObj(screenDiv);
    invocationListScreen.domElement.style.webkitTransform = offscreenLocation.BOTTOM;
    invocationListScreen.domElement.style.webkitTransition = SCREEN_TRANSITION_STYLE;

    // Need to force layout for DOM element to recognize style changes
    forceLayout(invocationListScreen.domElement);
}

self = {
    hide: function () {
        if (invocationListScreen.popping || !isShowing) {
            return;
        }

        preventUserInteraction();

        // Make sure the keyboard focus is cleared when switching screens
        document.activeElement.blur();

        appendAnimation(animatePopScreen.bind(self, invocationListScreen));
        animate();

        resetTitlebar();
    },

    /*
     * @description This method will show an invocation list of provided targets,
     *  the targets are then run through the invocation framework, with the provided
     *  invocation target object passed.
     * @param {Object} args An object that comprises 2 parameters a title as a string and targets an array of targets
     */
     //  args.targets = {
     //                     {
     //                         icon : "path/to/icon.png",
     //                         label : "Text Label",
     //                         invoke { invokable object that you want passed to invoke}
     //                     },
     //                     ... many of these
     //                  };

    show: function (args) {

        isNSeries = (window.screen.height === 720) && (window.screen.width === 720);

        createTitleBar(args.title);

        if (invocationListScreen.pushing || isShowing) {
            return;
        }

        preventUserInteraction();
        populateList('invocationListContent', args.targets, args.inheritedTargets);

        // Hide the activity indicator for now
        document.getElementById('targetLoader').classList.add('hidden');

        // Make sure the keyboard focus is cleared when switching views
        document.activeElement.blur();

        appendAnimation(animatePushScreen.bind(self, invocationListScreen));

        zIndex += 10;
        invocationListScreen.domElement.style.zIndex = zIndex;
        invocationListScreen.domElement.classList.remove('removed');

        // Need to force layout for DOM element to recognize style changes
        forceLayout(invocationListScreen.domElement);
        animate();
    }
};

module.exports = self;

});

define('toaster', function (require, exports, module) {
/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var guid = 0,
    FRENCH_TOAST_TIMEOUT = 2500,
    NORMAL_TOAST_TIMEOUT = 1500,
    self;

function showToast(toast) {
    toast.setAttribute('class', 'toast_base');
}

function destroyToast(toast) {
    toast.removeEventListener('webkitTransitionEnd', function () {
        destroyToast(toast);
    }, false);

    if (toast.parentNode !== null) {
        document.getElementById('toaster').removeChild(toast);
    }
}

function dismissToast(toast) {
    qnx.webplatform.getController().remoteExec(1, 'toast.dismissed', [toast.id]);
    toast.addEventListener('webkitTransitionEnd', function () {
        destroyToast(toast);
    }, false);

    toast.setAttribute('class', 'toast_base toast_dismiss');
}

function createBasicToast(toastId, msg, translate, timeout) {
    var toast = document.createElement('div'),
        message,
        timeoutVal;

    // Set a new default if we got one passed in
    timeoutVal = timeout ? timeout : NORMAL_TOAST_TIMEOUT;

    toast.id = toastId;
    toast.setAttribute('class', 'toast_base toast_hidden');

    message = document.createElement('p');
    message.innerText = translate ? qnx.webplatform.i18n.translate(msg).fetch() : msg;
    message.setAttribute('class', 'toast_message');
    toast.appendChild(message);
    toast.addEventListener('click', function (e) {
        e.stopPropagation();
        dismissToast(toast);
    });

    document.getElementById('toaster').appendChild(toast);

    // Show the toast
    setTimeout(function () {
        showToast(toast);
    }, 0);

    // Dismiss the toast after timeout
    setTimeout(function () {
        dismissToast(toast);
    }, timeoutVal);

    return toast;
}

function createFrenchToast(toastId, msg, buttonText, translate, timeout) {
    var toast = document.createElement('div'),
        button = document.createElement('p'),
        buttonClickListener,
        toastClickListener,
        toastTimerId = 0,
        message,
        timeoutVal;

    timeoutVal = timeout ? timeout : FRENCH_TOAST_TIMEOUT;

    toast.id = toastId;
    toast.setAttribute('class', 'toast_base toast_hidden');

    button.innerText = translate ? qnx.webplatform.i18n.translate(buttonText).fetch() : buttonText;
    button.setAttribute('class', 'toast_button');
    buttonClickListener = function (e) {
        clearTimeout(toastTimerId);

        // We got clicked, so lets trigger our callback
        qnx.webplatform.getController().remoteExec(1, 'toast.callback', [toast.id]);

        // Stop event propogation so we don't cause a focus loss
        // on the current element. Call dismissToast manually.
        e.stopPropagation();
        dismissToast(toast);
    };
    button.addEventListener('click', buttonClickListener, false);

    message = document.createElement('p');
    message.innerText = translate ? qnx.webplatform.i18n.translate(msg).fetch() : msg;
    message.setAttribute('class', 'toast_message border_right');
    toast.appendChild(message);

    toastClickListener = function (e) {
        e.stopPropagation();
        dismissToast(toast);
    };

    toast.addEventListener('click', toastClickListener, false);
    toast.appendChild(button);

    // Dismiss the toast after timeout
    toastTimerId = setTimeout(dismissToast.bind(this, toast), timeoutVal);

    document.getElementById('toaster').appendChild(toast);

    // Show the toast
    setTimeout(function () {
        showToast(toast);
    }, 0);
    return toast;
}

self = {

    createBasicToast: function (args) {
        return createBasicToast(args.toastId, args.message, args.translate, args.timeout);
    },
    createFrenchToast: function (args) {
        return createFrenchToast(args.toastId, args.message, args.buttonText, args.translate, args.timeout);
    },
    dismissToast: function (toast) {
        if (!toast) {
            return;
        }
        dismissToast(toast);
    }
};

module.exports = self;

});

define('titlebarwithactions', function (require, exports, module) {
/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var _titleBarHeight = {
        lSeries : {
            portrait: '111',
            landscape: '101'
        },
        nSeries : '93'
    },
    titleBar;

titleBar = {
    create: function (title, leftButtonSpec, rightButtonSpec) {
        var titlebarDiv = document.createElement('div'),
            barDiv = document.createElement('div'),
            leftButtonContainer = document.createElement('div'),
            titleContainer = document.createElement('div'),
            rightButtonContainer = document.createElement('div'),
            titlespan = document.createElement('span'),
            leftButton,
            rightButton;

        // Construct DOM objects for title bar
        titlebarDiv.id = 'titlebarwithactions';
        barDiv.id = 'titlebarbuttons';
        barDiv.className = 'bar';
        leftButtonContainer.className = 'buttonContainer left';
        titleContainer.className = 'textContainer';
        rightButtonContainer.className = 'buttonContainer right';

        barDiv.appendChild(leftButtonContainer);
        barDiv.appendChild(titleContainer);
        barDiv.appendChild(rightButtonContainer);
        titlebarDiv.appendChild(barDiv);

        // Left action button
        if (leftButtonSpec) {
            leftButton = document.createElement('button');
            leftButton.textContent = leftButtonSpec.label || '';
            leftButton.className = leftButtonSpec.className || '';
            leftButton.removeEventListener('click', leftButtonSpec.callback, false);
            leftButton.addEventListener('click', leftButtonSpec.callback, false);
            leftButtonContainer.appendChild(leftButton);
        } else {
            leftButtonContainer.style.visibility = 'hidden';
        }

        // Title area
        if (title) {
            titlespan.textContent = title;

            // If we don't have a right button, allow the text to overlow to the right
            if (!rightButtonSpec) {
                titleContainer.style.overflow = 'visible';
            }
        }
        titleContainer.appendChild(titlespan);

        // Right action button
        if (rightButtonSpec) {
            rightButton = document.createElement('button');
            rightButton.textContent =  rightButtonSpec.label || '';
            rightButton.className = rightButtonSpec.className || '';
            rightButton.removeEventListener('click', rightButtonSpec.callback, false);
            rightButton.addEventListener('click', rightButtonSpec.callback, false);
            rightButtonContainer.appendChild(rightButton);
        } else {
            rightButtonContainer.style.visibility = 'hidden';
        }

        if (leftButtonSpec && !rightButtonSpec) {
            titleContainer.className = titleContainer.className + ' left';
        }

        return titlebarDiv;
    }
};

titleBar.__defineGetter__("height", function () {
    var device = window.qnx.webplatform.device;
    if (device.type === device.DEVICE_TYPE.L_SERIES) {
        if (window.orientation === 90 || window.orientation === -90) {
            return _titleBarHeight.lSeries.landscape;
        } else if (window.orientation === 0 || window.orientation === 180) {
            return _titleBarHeight.lSeries.portrait;
        }
    } else if (device.type === device.DEVICE_TYPE.N_SERIES) {
        return _titleBarHeight.nSeries;
    }
});

module.exports = titleBar;

});

define('childwebviewcontrols', function (require, exports, module) {
/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var container,
    titlebar,
    self;

function requirePlugin(id) {
    return require(!!require.resolve ? "../" + id : id);
}

function onBack(e) {
    e.preventDefault();
    window.qnx.webplatform.getController().remoteExec(1, 'childWebView.back');
}

function onClose(e) {
    e.preventDefault();
    self.hide(); // call through self for testability
    window.qnx.webplatform.getController().remoteExec(1, 'childWebView.destroy');
}

function hide() {
    if (container) {
        container.innerHTML = '';
        container.className = '';
    }
}

function handleTouchStart(e) {
    if (e.touches.length < 2) {
        e.preventDefault();
    }
}

function show() {
    container = document.getElementById('childwebviewcontrols');
    hide();
    container.appendChild(requirePlugin('titlebarwithactions').create(
        '',
        {
            label: qnx.webplatform.i18n.translate('Close').fetch(),
            className: 'close',
            callback: onClose
        }
    ));
    container.className = 'show';
}

function setTitle(title) {
    if (!container) {
        return;
    }
    var titleElement = container.querySelector('.textContainer span');
    if (titleElement) {
        titleElement.textContent = title;
    }
}

self = {
    show: show,
    hide: hide,
    setTitle: setTitle
};

module.exports = self;

});

define('formcontrol', function (require, exports, module) {
/*
* Copyright (C) Research In Motion Limited 2012. All Rights Reserved.
*/

var _previousButton,
    _nextButton,
    _submitButton,
    _formControlPanel,
    _enabled = false,
    _previousEnabled,
    _nextEnabled,
    _created = false,
    _ccmVisible = false,
    _visible = false,
    _keyboardOpen = false,
    _hasPhysicalKeyboard,
    _keyboardPosition,
    formcontrol;

function applyTranslations() {
    var i18n = qnx.webplatform.i18n;
    _previousButton.innerText = i18n.translate('Previous').fetch();
    _nextButton.innerText = i18n.translate('Next').fetch();
    _submitButton.innerText = i18n.translate('Submit').fetch();
}

function updateState() {
    var newVisible = _enabled && (window.orientation === 0 || window.orientation === 180) && !_ccmVisible && (_keyboardOpen || _hasPhysicalKeyboard);
    if (newVisible) {
        _previousButton.disabled = !_previousEnabled;
        _nextButton.disabled = !_nextEnabled;
        window.qnx.webplatform.getController().remoteExec(1, "formcontrol.sensitivity", ['SensitivityNoFocus']);
    } else if (!_ccmVisible) {
        window.qnx.webplatform.getController().remoteExec(1, "formcontrol.sensitivity", ['SensitivityTest']);
    }
    if (newVisible !== _visible) {
        if (newVisible) {
            _formControlPanel.classList.add('show');
        } else {
            _formControlPanel.classList.remove('show');
        }
        _visible = newVisible;
    }
}

formcontrol = {
    create: function () {
        if (!_created) {
            _created = true;
            _hasPhysicalKeyboard = window.matchMedia("(-blackberry-physical-keyboard)").matches;
            _previousButton = document.getElementById('formcontrol_previous');
            _nextButton = document.getElementById('formcontrol_next');
            _submitButton = document.getElementById('formcontrol_submit');
            _formControlPanel = document.getElementById('formcontrolPanel');

            applyTranslations();

            _previousButton.addEventListener('click', function () {
                window.qnx.webplatform.getController().remoteExec(1, 'formcontrol.action', ['focusPreviousField']);
            });
            _nextButton.addEventListener('click', function () {
                window.qnx.webplatform.getController().remoteExec(1, 'formcontrol.action', ['focusNextField']);
            });
            _submitButton.addEventListener('click', function () {
                window.qnx.webplatform.getController().remoteExec(1, 'formcontrol.action', ['submitForm']);
            });
            window.addEventListener('systemLanguageChange', function () {
                applyTranslations();
            });
            window.onorientationchange = function () {
                if (_enabled || _visible) {
                    updateState();
                }
            };
        }
    },

    enabled : function () {
        return _enabled;
    },

    ccmVisible : function (visible) {
        _ccmVisible = visible;
        updateState();
    },

    update : function (options) {
        _enabled = options.enable;
        _previousEnabled = options.previousEnabled;
        _nextEnabled = options.nextEnabled;
        applyTranslations();
        updateState();
    },

    updateVerticalPosition : function (height) {
        _keyboardOpen = typeof height !== 'undefined';
        if (_keyboardOpen) {
            _formControlPanel.style.top = height + 'px';
        }
        updateState();
    },

    visible : function () {
        return _visible;
    }
};

module.exports = formcontrol;

});
