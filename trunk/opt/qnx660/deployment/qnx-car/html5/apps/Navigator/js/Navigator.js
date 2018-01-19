/**
 * The definition for the Navigator namespace
 * This object contains other framework classes and provides general functionality
 *
 * @author mlapierre
 * $Id: Navigator.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
var Navigator =  new function() {

    var self = this;

    ///// EVENTS /////

    ///// PRIVATE METHODS /////

    ///// PUBLIC METHODS /////

    self.ns = function(ns) {
        var pieces = ns.split('.');
        var currentNS = 'Navigator';
        for (var i=1; i<pieces.length; i++) {
            if (!eval([currentNS, pieces[i]].join('.'))) {
                eval(currentNS)[pieces[i]] = {};
            }
            currentNS += '.' + pieces[i];
        }
    };
};

////////// PROTOTYPE EXTENSIONS //////////

/**
 * Allows classes to 'inherit' methods from another class
 * @param {Function} superclass The class we want to extend
 * @return {Function} The calling function with the extended prototype
 */
Function.prototype.extend = function(superclass) { 
    if (typeof superclass == 'function' ) { 
        this.prototype = new superclass;
        this.prototype.constructor = this;
        this.prototype.parent = superclass.prototype;
    }
    return this;
} 
