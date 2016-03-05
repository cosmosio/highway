/**
 * @license highway https://github.com/cosmosio/highway
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2016 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

var Observable = require("watch-notify"),
    toArray = require("to-array");

/**
 * @class
 * Routing allows for navigating in an application by defining routes.
 */
module.exports = function HighwayConstructor() {

    /**
     * The routes observable (the applications use it)
     * @private
     */
    var _routes = new Observable(),

        /**
         * The events observable (used by Routing)
         * @private
         */
        _events = new Observable(),

        /**
         * The routing history
         * @private
         */
        _history = [],

        /**
         * For navigating through the history, remembers the current position
         * @private
         */
        _currentPos = -1,

        /**
         * The max history depth
         * @private
         */
        _maxHistory = 10;

    /**
     * Set a new route
     * @param {String} route the name of the route
     * @param {Function} func the function to be execute when navigating to the route
     * @param {Object} scope the scope in which to execute the function
     * @returns a handle to remove the route
     */
    this.set = function set() {
        return _routes.watch.apply(_routes, arguments);
    };

    /**
     * Remove a route
     * @param {Object} handle the handle provided by the set method
     * @returns true if successfully removed
     */
    this.unset = function unset(handle) {
        return _routes.unwatch(handle);
    };

    /**
     * Navigate to a route
     * @param {String} route the route to navigate to
     * @param {*} as many params as necessary
     * @returns
     */
    this.navigate = function navigate(route) {
        clearForwardHistory();
        _history.push(toArray(arguments));
        ensureMaxHistory();
        _currentPos = _history.length - 1;
        load.apply(this, arguments);
    };

    /**
     * Go back and forth in the history
     * @param {Number} nb the number of jumps in the history. Use negative number to go back.
     * @returns true if history exists
     */
    this.go = function go(nb) {
        var history = _history[_currentPos + nb];
        if (history) {
            _currentPos += nb;
            load.apply(this, history);
            return true;
        } else {
            return false;
        }
    };

    /**
     * Go back in the history, short for go(-1)
     * @returns true if it was able to go back
     */
    this.back = function back() {
        return this.go(-1);
    };

    /**
     * Go forward in the history, short for go(1)
     * @returns true if it was able to go forward
     */
    this.forward = function forward() {
        return this.go(1);
    };

    /**
     * Watch for route changes
     * @param {Function} func the func to execute when the route changes
     * @param {Object} scope the scope in which to execute the function
     * @returns {Object} the handle to unwatch for route changes
     */
    this.watch = function watch(func, scope) {
        return _events.watch("route", func, scope);
    };

    /**
     * Unwatch routes changes
     * @param {Object} handle the handle was returned by the watch function
     * @returns true if unwatch
     */
    this.unwatch = function unwatch(handle) {
        return _events.unwatch(handle);
    };

    /**
     * Set the maximum length of history
     * As the user navigates through the application, the
     * router keeps track of the history. Set the depth of the history
     * depending on your need and the amount of memory that you can allocate it
     * @param {Number} maxHistory the depth of history
     * @returns {Boolean} true if maxHistory is equal or greater than 0
     */
    this.setMaxHistory = function setMaxHistory(maxHistory) {
        if (maxHistory >= 0) {
            _maxHistory = maxHistory;
            ensureMaxHistory();
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get the current max history setting
     * @returns {Number} the depth of history
     */
    this.getMaxHistory = getMaxHistory;

    /**
     * Get the current length of history
     * @returns {Number} the length of history
     */
    this.getHistoryCount = function getHistoryCount() {
        return _history.length;
    };

    /**
     * Flush the entire history
     */
    this.clearHistory = function clearHistory() {
        _history.length = 0;
    };

    /**
     * Get a route from the history or the entire historic
     * @param index
     * @returns {*}
     */
    this.getHistory = function getHistory(index) {
        if (typeof index == "undefined") {
            return _history;
        } else {
            return _history[_history.length - index - 1];
        }
    };

    function load() {
        var copy = toArray(arguments);

        _routes.notify.apply(_routes, copy);
        copy.unshift("route");
        _events.notify.apply(_events, copy);
    }

    function getMaxHistory() {
        return _maxHistory;
    }

    function ensureMaxHistory() {
        var count = _history.length,
            max = getMaxHistory(),
            excess = count - max;

        if (excess > 0) {
            _history.splice(0, excess);
        }
    }

    function clearForwardHistory() {
        _history.splice(_currentPos + 1, _history.length);
    }
};
