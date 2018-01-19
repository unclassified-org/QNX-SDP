Navigator.ns('Navigator');

/**
 *
 * @author dkerr
 * $Id: Tabs.js 7093 2013-09-06 18:38:37Z dkerr@qnx.com $
 */
Navigator.Tabs = new ((function () {

    var self = this,
            _chromeHeight,
            _allTabsEnabled = false,
            _tabs = {},
            _touchEvent = 'touchstart';
    
    ///// EVENTS /////

    /**
    {
        event: 'QnxCar.Navigator.Tabs.E_TAB_CREATED',
    }
    */
    this.E_TAB_CREATED = 'Navigator.Tabs.E_TAB_CREATED';

    /**
    {
        event: 'QnxCar.Navigator.Tabs.E_TAB_REMOVED',
    }
    */
    this.E_TAB_REMOVED = 'Navigator.Tabs.E_TAB_REMOVED';

    /**
    {
        event: 'QnxCar.Navigator.Tabs.E_TAB_SELECTED',
    }
    */
    this.E_TAB_SELECTED = 'Navigator.Tabs.E_TAB_SELECTED';

    ///// PRIVATE METHODS /////

    var addCSS = function (selector, property, value) {
        if (x$('style').length !== 0) {
            x$('style').html('bottom', selector + ' {' + property + ':' + value + '}');
        } else {
            var style = x$(document.createElement('style')),
                    txtNode = x$(document.createTextNode(selector + ' {' + property + ':' + value + '}' )),
                    fragment = x$(document.createDocumentFragment());

            style.attr('type','text/css');
            fragment.bottom(style.bottom(txtNode));
            x$(document.head).html('bottom',fragment);
        }
    };

    var tabItem = function (tab) {
        var item = x$(document.createElement('div')),
            span = x$(document.createElement('span')),
            txtNode = x$(document.createTextNode(tab.name || "Untitled")),
            fragment = x$(document.createDocumentFragment()),
            key = tab.key || 'pos' + tab.order;
        
        item
            .attr('id', 'tab-' + key)
            .addClass('tabItem ' + tab.opts.class + ' pos' + tab.order)
            .on(_touchEvent, function () {
                self.select(tab);
            });

        if (tab.opts.selected) {
            item.addClass('highlighted');
        }

        span.css({display:'none'});

        fragment.bottom(item.bottom(span.bottom(txtNode)));
        return fragment;
    };
    
    ///// PUBLIC METHODS /////
    
    self.init = function (chromePos) {
        _chromeHeight = chromePos.h;
        
        // setup css params dependent on display size
        addCSS('#tablist', 'height', _chromeHeight + 'px;');
        addCSS('.tabItem', 'height', _chromeHeight + 'px;');
    };

    self.replace = function (tab) {
        if (x$('#tab-pos' + tab.order).length) {
            x$('#tab-pos' + tab.order).remove();
        }
 
        if (x$('#tab-' + tab.key).length) {
            x$('#tab-' + tab.key).remove();
        }
        
        x$('#tablist').html('bottom', tabItem(tab));
    };

    self.create = function (tab) {
        x$('#tablist').html('bottom', tabItem(tab));
        
        if (!_tabs.hasOwnProperty(tab.key)) {
            _tabs[tab.key] = tab;
        }
        
        self.dispatch(self.E_TAB_CREATED, {tab:tab});
    };
    
    self.remove = function (key) {
        x$('#tab-' + key).remove();
        
        self.dispatch(self.E_TAB_REMOVED, {key:key});
    };

    self.highlight = function (tabId) {
        x$('.tabItem.highlighted').removeClass('highlighted');
        x$('#tab-' + tabId).addClass('highlighted');
    };

    self.select = function (selectedTab) {

        var reselect = false,
            currentTab = x$('.highlighted')[0];
        
        // patch for PR:252142 - in rare cases, all tabs become de-highlighted
        if (typeof currentTab == "undefined") {
            // highlight the selectedTab to recover
            self.highlight(selectedTab.key);
        } 

        if (currentTab.id == 'tab-' + selectedTab.key) {
            reselect = true;
        } else {
            self.highlight(selectedTab.key);
        }

        // defer or block the dispatch so the tab can re-paint quickly
        if (_allTabsEnabled) {
            setTimeout(function() {
                self.dispatch(self.E_TAB_SELECTED, {tab:selectedTab, reselect:reselect});
            },0);
        }
        
    };
    
    self.hide = function (tabId) {
        x$('#tab-' + tabId).setStyle('display','none');
    };
    
    self.show = function (tabId) {
        x$('#tab-' + tabId).setStyle('display','block');
    };

    
    self.enableAll = function () {
        x$('#tablist').removeClass('disabled');
        _allTabsEnabled = true;
    };
 
    self.disableAll = function () {
        x$('#tablist').addClass('disabled');
        _allTabsEnabled = false;
    };

    self.isEnabled = function (arg) {
        if (isNaN(arg) && arg === 'all') {
            return _allTabsEnabled;
        } else {
            return (x$('#tab-' + arg).has('.disabled').length == 1) ? false : true;
        }
    };
    
}).extend(Navigator.EventDispatcher))();
