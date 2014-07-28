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
(function($) {

	if (!$.touch) return false;

	/** swipe generates a swipe gesture template based on direction (left|up|right|down), distance (short|medium|long) and speed (slow|medium|fast) parameters and attaches it to the selection */
	$.fn.swipe = function(o, c) {
		if (!c || typeof o === 'function') {
			c = o;
			o = {};
		}
		o = $.extend({ direction: 'right', distance: 'short', speed: 'fast' }, o);
		console.log(o);
		var t = { finger: 0, type: 'touchmove' },
			delta;
		switch(o.distance) {
			case 'long':
				delta = 600;
				break;
			case 'medium':
				delta = 300;
				break;
			default: // 'short'
				delta = 100;
		}
		switch(o.speed) {
			case 'slow':
				t.time = '1..600';
				break;
			case 'medium':
				t.time = '1..300';
				break;
			default: // 'fast'
				t.time = '1..100';
		}
		switch(o.direction) {
			case 'left':
				t.deltaX = '<' + (-delta);
				break;
			case 'up':
				t.deltaY = '<' + (-delta);
				break;
			case 'down':
				t.deltaY = '>' + delta;
				break;
			default: // 'right'
				t.deltaX = '>' + delta;
		}
		return this.each(function() {
			var $this = $(this).touchable(),
				touchData = $this.data('touch');

			$.merge(touchData.gestureCallbacks, [{ callback: c, template: t }]);

			// update touch data
			$this.data('touch', touchData);
		});
	};

	// TODO: implement more gestures in the future...

})(jQuery);
