/*
 * jQMultiTouch -- The jQuery of Multi-touch
 * Copyright (C) 2010-2014 Michael Nebeling. All rights reserved.
 *
 * jQMultiTouch is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * jQMultiTouch is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with jQMultiTouch. If not, see <http://www.gnu.org/licenses/>.
 *
 * See the README and LINCENSE files for further information.
 *
 */
(function ($) {

    if ($.touch) {
        console.warn('$.touch will be overriden, call $.touch.noConflict to restore');
    }

    /**
        Keeps a touch history that can be queried and manipulated using jQuery paradigms.
    */
    var TouchHistory = function (events) {
        this.events = events || [];
    };

    TouchHistory.prototype = {
        size: function () {
            return this.events.length;
        },
        get: function (index) {
            return this.events[index];
        },
        first: function () {
            return this.get(0);
        },
        last: function () {
            return this.get(this.events.length - 1);
        },
        /**
         * Compares the current touch history against the given predicates and returns true if all criteria are matched. The history will first be filtered according to the predicates as supported by $.touch.historyFilterPredicates (also see TouchHistory#filter) and then compared using the predicates defined in $.touch.historyMatchPredicates.
         *
         * @param t can be a single template or multiple; multiple means that all templates will need to be matched
         */
        match: function (t) { // t can be a single template or multiple templates
            var templates = $.isArray(t) ? t : [t];
            for (var n in templates) {
                var template = templates[n];
                var touchHistory = this.filter(template);
                if (touchHistory.size() == 0) {
                    return false;
                }
                for (var predicate in template) {
                    if (predicate in $.touch.historyMatchPredicates) {
                        if ($.touch.historyMatchPredicates[predicate].call(template, touchHistory, template) === false) {
                            return false; // event doesn't match
                        }
                    }
                }
            }
            return true; // all events match the criteria
        },
        /**
         * Filters the current touch history by the given predicates and returns the result in the form of a new touch history. Supported predicates are registered in $.touch.historyFilterPredicates and can support single or multiple values -- multiple usually means that it is sufficient if one of the values matches.
         *
         * @param t can be a single template or multiple; multiple means that all templates will be applied as a filter
         */
        filter: function (t) {
            var templates = $.isArray(t) ? t : [t];
            var events = this.events;
            $.each(templates, function (_, template) {
                events = $.grep(events, function (touchEvent, index) {
                    for (var predicate in template) {
                        if (predicate in $.touch.historyFilterPredicates) {
                            if ($.touch.historyFilterPredicates[predicate].call(template, touchEvent, index, template) === false) {
                                return false; // ignore event
                            }
                        }
                    }
                    return true;
                });
            });
            return new TouchHistory(events);
        },
        start: function (template) {
            var start = this.find(template);
            return new TouchHistory(start !== -1 ? this.events.slice(start) : []);
        },
        stop: function (template) {
            var stop = this.find(template);
            return new TouchHistory(stop !== -1 ? this.events.slice(0, stop) : this.events);
        },
        empty: function () {
            this.events.length = 0;
            return this;
        },
        query: function (select) {
            var touchHistory = this;
            if (start in select) {
                touchHistory = touchHistory.start(select.start);
            }
            if (stop in select) {
                touchHistory = touchHistory.stop(select.stop);
            }
            if (filter in select) {
                touchHistory = touchHistory.filter(select.filter);
            }
            if (match in select) {
                return touchHistory.match(select.match);
            }
            return touchHistory;
        },
        /**
         * Iterates over each touch event in the history.
         */
        each: function (callback) {
            $.each(this.events, callback);
            return this;
        },
        /**
         * Finds the first touch event in the history that matches the criteria specified in template.
         */
        find: function (template) {
            var pos = -1;
            $.each(this.events, function (index, touchEvent) {
                for (var predicate in template) {
                    if (predicate in $.touch.historyFilterPredicates) {
                        if ($.touch.historyFilterPredicates[predicate].call(template, touchEvent, index) === false) {
                            return true; // break $.each here
                        }
                    } else {
                        throw 'Invalid predicate: ' + predicate;
                    }
                };
                pos = index;
                return false;
            });
            return pos;
        }
    };

    // extend jQuery object with touch environment
    var oldTouch = $.touch;
    $.touch = {
        /** allTouches keeps a record of all all touches */
        allTouches: {},
        /** enabled can be used to check whether touch is available on the device */
        enabled: function () {
            if ('ontouchstart' in window) return true;

            var style = $('<style type="text/css"></style>').text('#jQMultiTouch { display: none } @media (-moz-touch-enabled) { #jQMultiTouch { height: 3px } }').appendTo('head'),
                div = $('<div id="jQMultiTouch"></div>').text('&nbsp;').appendTo('body'),
                test = $(div).height() === 3;
            $(div).remove();
            $(style).remove();

            return !!test;
        },
        noConflict: function () {
            $.touch = oldTouch;
            $.jQMultiTouch = this;
            return typeof oldTouch === undefined;
        },
        ready: function (param) {
            if (typeof param === 'function') {
                $(document).on('touchready', param);
                return true;
            }
            return false;
        },
        /** eventMap converts touch events between different browser implementations */
        eventMap: {
            // Mozilla browsers
            'MozTouchDown': 'touchdown',
            'MozTouchMove': 'touchmove',
            'MozTouchUp': 'touchup',
            // WebKit browsers
            'touchstart': 'touchdown',
            'touchmove': 'touchmove',
            'touchend': 'touchup',
        },
        eventHandler: function (e) {
            var eventMap = $.extend($.touch.eventMap, $.touch.triggerMouseEvents ? {
                    mousedown: 'touchdown',
                    mousemove: 'touchmove',
                    mouseup: 'touchup',
                } : {}),
                touchEventType = eventMap[e.type] || false;

            if (touchEventType === false) return false;

            var preventDefault = $.touch.preventDefault;

            $.each(e.changedTouches ? e.changedTouches : e.touches || [e], function (_, e) {
                var touchId = e.identifier || 0,
                    touch = $.touch.allTouches[touchId] || false;

                if (touch === false) {
                    if (touchEventType === 'touchdown') {
                        // create a new touch
                        touch = {
                            target: e.target,
                            id: touchId,
                        }
                        $.touch.allTouches[touchId] = touch;
                    } else {
                        return false;
                    }
                }

                // update touch point
                touch.clientX = e.clientX;
                touch.clientY = e.clientY;

                // create new touch event
                var touchEvent = {
                    target: e.target,
                    touch: touch,
                    type: touchEventType,
                    time: $.now(),
                    // copy attributes from touch
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                };

                // trigger touch event
                $(touch.target).trigger(touchEvent, [$.touch.history.filter({
                    touch: touch
                })]);

                // prepend touch event to history, but let it not grow larger than maxSize
                $.touch.history.events = $.merge([touchEvent], $.touch.history.events.slice(0, $.touch.historyMaxSize - 1));

                // FIXME target history does not really work for touches on the target's child elements
                //$(touch.target).trigger('gesture', [$.touch.history.filter({ target: touch.target })]);
                var gestureEvent = $.extend({}, touchEvent, {
                    type: 'gesture'
                });
                $(touch.target).trigger(gestureEvent, [$.touch.history.filter({
                    target: touch.target
                })]);

                // unregister touch
                if (touchEventType == 'touchup') {
                    delete $.touch.allTouches[touchId];
                }

                // check for local override of global preventDefault
                var touchableParent = $(touch.target).parents('.touchable').eq(0),
                    touchData = touchableParent.length === 1 ? touchableParent.data('touch') : false;
                if (touchData && touchData.preventDefault !== undefined) {
                    preventDefault = touchData.preventDefault;
                }
            });

            if (preventDefault) {
                try {
                    e.preventDefault();
                } catch (err) {
                    console.log(err);
                }
            }
        },
        /** preventDefault is by default true to globally prevent default browser behaviour for touch events, but can be globally set to false and overriden locally */
        preventDefault: true,
        /** triggerMouseEvents can be set to true to simulate touch events, e.g. for testing on non-touch devices */
        triggerMouseEvents: false,
        /** history holds the current touch history up to a length of $.touch.historyMaxSize */
        history: new TouchHistory([]),
        /** historyMaxSize sets the maximum size of the touch event buffer, default is 64 */
        historyMaxSize: 64,
        /** historyFilterPredicates defines a number of predicates that can be used in TouchHistory#filter() and TouchHistory#find(). */
        historyFilterPredicates: {
            callback: function (touchEvent, index) {
                return this.callback.call(this, touchEvent, index);
            },
            index: function (touchEvent, index) {
                return evaluatePredicateFunction(this.index, index);
            },
            type: function (touchEvent) {
                return $.isArray(this.type) ? $.inArray(touchEvent.type, this.type) != -1 : touchEvent.type == this.type;
            },
            target: function (touchEvent) {
                return $.isArray(this.target) ? $.inArray(touchEvent.target, this.target) != -1 : touchEvent.target == this.target;
            },
            touch: function (touchEvent) {
                if ($.isArray(this.touch)) {
                    return $.inArray(touchEvent.touch.id, $.map(this.touch, function (touch) {
                        return touch.id;
                    })) != -1;
                }
                return touchEvent.touch.id == this.touch.id;
            },
            finger: function (touchEvent) {
                return evaluatePredicateFunction(this.finger, $.inArray(touchEvent.touch.id, $.map($.touch.allTouches, function (touch) {
                    return touch.id;
                })));
            },
            time: function (touchEvent) {
                var timeDiff = $.now() - touchEvent.time;
                return evaluatePredicateFunction(this.time, timeDiff);
            }
        },
        /** historyMatchPredicates defines a number of predicates that can be used in TouchHistory#match(). */
        historyMatchPredicates: {
            length: function (touchHistory) {
                return evaluatePredicateFunction(this.length, touchHistory.size());
            },
            clientX: function (touchHistory, template) {
                var matched = true;
                touchHistory.each(function (_, touchEvent) {
                    matched = evaluatePredicateFunction(template.deltaX, deltaX);
                    return matched; // continue if matched, otherwise break
                });
                return matched;
            },
            clientY: function (touchHistory, template) {
                var matched = true;
                touchHistory.each(function (_, touchEvent) {
                    matched = evaluatePredicateFunction(template.deltaY, deltaY);
                    return matched; // continue if matched, otherwise break
                });
                return matched;
            },
            deltaX: function (touchHistory) {
                var deltaX = touchHistory.first().clientX - touchHistory.last().clientX;
                return evaluatePredicateFunction(this.deltaX, deltaX);
            },
            deltaY: function (touchHistory) {
                var deltaY = touchHistory.first().clientY - touchHistory.last().clientY;
                return evaluatePredicateFunction(this.deltaY, deltaY);
            },
            netX: function (touchHistory) {
                var netX = lastClientX = 0;
                touchHistory.each(function (index, touchEvent) {
                    if (lastClientX != 0) {
                        netX += lastClientX - touchEvent.clientX;
                    }
                    lastClientX = touchEvent.clientX;
                });
                return evaluatePredicateFunction(this.netX, netX);
            },
            netY: function (touchHistory) {
                var netY = lastClientY = 0;
                touchHistory.each(function (index, touchEvent) {
                    if (lastClientY != 0) {
                        netY += lastClientY - touchEvent.clientY;
                    }
                    lastClientY = touchEvent.clientY;
                });
                return evaluatePredicateFunction(this.netY, netY);
            },
        },
    };

    // helper function for comparing predicates against value by defining a range of matching values using '0..1', '+-10', '>=10', '>10', '<=10' or '<10', otherwise the predicate has to exactly match the value
    function evaluatePredicateFunction(predicate, value) {
        if (typeof predicate === 'string') {
            var args = predicate.split('..');
            if (args.length > 1) {
                if (args[0] && args[1]) {
                    return value >= args[0] && value <= args[1];
                } else if (args[0]) {
                    return value >= args[0];
                }
                return predicate <= args[1];
            } else if (predicate.substr(0, 2) == "+-") {
                var arg = predicate.substr(2);
                return value >= arg * -1 && value <= arg;
            } else if (predicate.substr(0, 2) == ">=") {
                var arg = predicate.substr(2);
                return value >= arg;
            } else if (predicate.substr(0, 1) == ">") {
                var arg = predicate.substr(1);
                return value > arg;
            } else if (predicate.substr(0, 2) == "<=") {
                var arg = predicate.substr(2);
                return value <= arg;
            } else if (predicate.substr(0, 1) == "<") {
                var arg = predicate.substr(1);
                return value < arg;
            }
        }
        // otherwise just try to match the value
        return predicate == value;
    };

    $.fn.touches = function () {
        var $this = $(this),
            touches = [];

        $.each($.touch.allTouches, function (_, touch) { // find corresponding touch
            if ($(touch.target).get(0) == $this.get(0) || $this.has(touch.target).length > 0) {
                $.merge(touches, [touch]);
            }
        });

        return touches;
    }

    $.fn.touched = function () {
        return $(this).touches().length !== 0;
    }

    // install touchable behaviour
    $.touch.touchable = {
        // can be set to locally prevent default browser behaviour
        preventDefault: undefined,
        touchDown: function (touchEvent, touchHistory) {
            return true
        },
        touchMove: function (touchEvent, touchHistory) {
            return true
        },
        touchUp: function (touchEvent, touchHistory) {
            return true
        },
        gesture: function (touchEvent, touchHistory) {
            return false
        },
        gestureCallbacks: [],
        touchableHandler: function (touchEvent, touchHistory) {
            var $this = $(this),
                touchData = $this.data('touch');

            if (touchEvent.type == 'touchdown') {
                $this.addClass('touched');
                touchData.touchDown.call(this, touchEvent, touchHistory);
            } else if (touchEvent.type == 'touchmove') {
                touchData.touchMove.call(this, touchEvent, touchHistory);
            } else if (touchEvent.type == 'touchup') {
                if (touchData.touchUp.call(this, touchEvent, touchHistory) !== false) {
                    if ($this.touches().length <= 1) { // if this is the last touch
                        $this.removeClass('touched');
                    }
                }
            } else if (touchEvent.type == 'gesture') {
                if (touchData.gesture.call(this, touchEvent, touchHistory) !== false) {
                    $.each(touchData.gestureCallbacks, function () {
                        if (touchHistory.match(this.template)) {
                            return this.callback.call(this, touchEvent, touchHistory);
                        }
                    });
                }
            }

            // update touch data, not necessary
            //$(this).data('touch', touchData);
        },
    };

    $.fn.touchable = function (o) {
        return this.each(function () {
            var $this = $(this),
                touchData = $this.data('touch') || {};

            if (!touchData.touchable) {
                // set touchable defaults and custom options
                $.extend(touchData, $.touch.touchable, o);

                // install touch event handler
                this.addEventListener('mousedown', $.touch.eventHandler, false);
                this.addEventListener('MozTouchDown', $.touch.eventHandler, true); // Mozilla browsers
                this.addEventListener('touchstart', $.touch.eventHandler, false); // WebKit browsers

                // add touchable and gesture handlers
                $this.on('touchdown touchmove touchup touchend gesture', touchData.touchableHandler);

                // indicate that element is now touchable
                $this.addClass('touchable');
                touchData.touchable = true;
            } else {
                // just set new options
                $.extend(touchData, o);
            }

            // update touch data
            $this.data('touch', touchData);
        });
    }

    $.fn.touch = function (f1, f2) {
        // check for new touchDown and touchUp handlers
        if (typeof f1 === 'function') {
            if (typeof f2 === 'function') {
                return this.touchable({
                    touchDown: f1,
                    touchUp: f2
                });
            }
            return this.touchable({
                touchUp: f1
            });
        }
        // otherwise trigger both touchDown and touchUp
        return this
            .trigger('touchdown')
            .trigger('touchup');
    };

    // handle touch events
    document.addEventListener('mousemove', $.touch.eventHandler, false);
    document.addEventListener('MozTouchMove', $.touch.eventHandler, true); // Mozilla browsers
    document.addEventListener('touchmove', $.touch.eventHandler, false); // WebKit browsers
    document.addEventListener('mouseup', $.touch.eventHandler, false);
    document.addEventListener('MozTouchUp', $.touch.eventHandler, true); // Mozilla browsers
    document.addEventListener('touchend', $.touch.eventHandler, false); // WebKit browsers

    function include(src) {
        $('<script></script>', {
            type: 'text/javascript',
            src: src
        }).appendTo('head');
    }

    // init jQMultiTouch
    $(function () {
        if ($.touch.enabled() || $.touch.triggerMouseEvents) {
            // attach touchable behaviour
            $('.touchable').touchable();

            // trigger touchready handlers
            $(document).trigger('touchready', [$.touch]);
        }
    });

})(jQuery);
