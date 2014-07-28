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

	if (!$.touch) return false; // requires jQMultiTouch

    /** getTransformValues is a helper function to retrieve transform values.
     * Source: http://css-tricks.com/get-value-of-css-rotation-through-javascript/
     */
    function getTransformValues(el) {
        var st = window.getComputedStyle(el, null); // sometimes returns null
        var tr = st && st.getPropertyValue("-webkit-transform") ||
                st && st.getPropertyValue("-moz-transform") ||
                st && st.getPropertyValue("-ms-transform") ||
                st && st.getPropertyValue("-o-transform") ||
                st && st.getPropertyValue("transform") ||
                "fail...";

        // rotation matrix - http://en.wikipedia.org/wiki/Rotation_matrix
        if (tr === undefined || tr == "none" || tr == "fail...") {
            return {
                scale: 1.0,
                angle: 0
            }
        }
        var values = tr.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');
        var a = values[0];
        var b = values[1];
        var c = values[2];
        var d = values[3];

        return {
            scale: Math.sqrt(a*a + b*b),
            angle: Math.round(Math.atan2(b,a) * (180/Math.PI))
        }
    }

	$.extend($.touch, {
		scalable: {
			minScale: false,
			maxScale: false,
			scaleBefore: function(e) {},
			scaleDuring: function(e) {},
			scaleAfter: function(e) {},
			scalableHandler: function(touchEvent, touchHistory) {
				var $this = $(this),
					touchData = $this.data('touch'),
					touches = $this.touches();

				if (touchEvent.type == 'touchdown') {
					touchData.scaling = ( touchData.scalable && touches.length > 1);

					if (touchData.scaling) {
						var dx = touches[1].clientX - touches[0].clientX;
						var dy = touches[1].clientY - touches[0].clientY;
						touchData.distance = Math.sqrt(dx * dx + dy * dy);
						touchData.angle = Math.acos(dx / touchData.distance);
						if (dy < 0) {
							touchData.angle = touchData.angle * -1;
						}
						touchData.dx = dx;
						touchData.dy = dy;

						$this.addClass('scaling');
					}
				} else if (touchEvent.type == 'touchmove') {
					if (touches.length > 1) { // need at least two touches for scaling
						var dx = touches[1].clientX - touches[0].clientX;
						var dy = touches[1].clientY - touches[0].clientY;
						var distance = Math.sqrt(dx * dx + dy * dy);
						var angle = Math.acos(dx / distance);
						if (dy < 0) {
							angle = angle * -1;
						}
						var factor = (distance - touchData.distance);

						// scaling
						if (touchData.scaling && factor != 0) {
							var scale = (1 + (distance - touchData.distance) * 0.0025);
							if (factor > 0) {
								touchData.newscale = scale + touchData.oldscale - (touchData.oldscale != 0 ? 1 : 0);
							} else {
								touchData.newscale = touchData.oldscale != 0 ? Math.abs(touchData.oldscale - (1 - scale)) : Math.abs(scale - touchData.oldscale);
							}
							// check if value is within min/max boundaries
							if (touchData.minScale) touchData.newscale = Math.max(touchData.newscale, touchData.minScale);
							if (touchData.maxScale) touchData.newscale = Math.min(touchData.newscale, touchData.maxScale);

							var transform = getTransformValues(this);
							transform.scale = touchData.newscale;
							var t = 'scale(' + transform.scale + ') rotate(' + transform.angle + 'deg)';
							$this.css({
								transform: t,
								'-moz-transform': t,
								'-webkit-transform': t,
							});
						}
					}
				} else if (touchEvent.type == 'touchup') {
					touchData.scaling = touchData.scaling && touches.length > 1;
					touchData.oldscale = touchData.newscale;

					if (!touchData.scaling) {
						$this.removeClass('scaling');
					}
				}

				$(this).data('touch', touchData);
			},
		},
	});

    $.fn.scalable = function(o) {
        return this.each(function() {
            var $this = $(this).touchable(),
				touchData = $this.data('touch') || {};

			if (!touchData.scalable) {
				// set scalable defaults and custom options
				$.extend(touchData, $.touch.scalable, o);

				// add rotatable handler
				$this.on('touchdown touchmove touchup', touchData.scalableHandler);

				// if element is already transformed, use these values to begin with
				touchData.oldscale = touchData.newscale = getTransformValues(this).scale || 0;

				// indicate that element is now scalable
				$this.addClass('scalable');
				touchData.scalable = true;
			} else {
				// just set new options
				$.extend(touchData, o);
			}

			// update touch data
            $this.data('touch', touchData);
		});
    }

	$(function() {
		// attach scalable behaviour
		$('.scalable').scalable();
	});

})(jQuery);
