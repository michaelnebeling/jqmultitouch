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
		rotatable: {
			step: 1, // TODO: not implemented yet
			rotateBefore: function(e) { return true },
			rotateDuring: function(e) { return true },
			rotateAfter: function(e) { return true },
			rotatableHandler: function(touchEvent, touchHistory) {
				var $this = $(this),
					touchData = $this.data('touch'),
					touches = $this.touches();

				if (touchEvent.type == 'touchdown') {
					touchData.rotating = (touchData.rotatable && touches.length > 1);

					if (touchData.scaling ||touchData.resizing || touchData.rotating) {
						var dx = touches[1].clientX - touches[0].clientX;
						var dy = touches[1].clientY - touches[0].clientY;
						touchData.distance = Math.sqrt(dx * dx + dy * dy);
						touchData.angle = Math.acos(dx / touchData.distance);
						if (dy < 0) {
							touchData.angle = touchData.angle * -1;
						}
						touchData.dx = dx;
						touchData.dy = dy;

						$this.addClass('rotating');
					}
				} else if (touchEvent.type == 'touchmove') {
					if (touches.length > 1) { // need at least two touches for rotating
						var dx = touches[1].clientX - touches[0].clientX;
						var dy = touches[1].clientY - touches[0].clientY;
						var distance = Math.sqrt(dx * dx + dy * dy);
						var angle = Math.acos(dx / distance);
						if (dy < 0) {
							angle = angle * -1;
						}
						var factor = (distance - touchData.distance);
						touchData.rotation = ((angle - touchData.angle) * 360) / (Math.PI * 2);

						var transform = getTransformValues(this);
						if (touchData.rotating && (angle != touchData.angle)) {
							transform.angle = touchData.rotation + touchData.oldrotation;
							var t = 'scale(' + transform.scale + ') rotate(' + transform.angle + 'deg)';
							$this.css({
								transform: t,
								'-moz-transform': t,
								'-webkit-transform': t,
							});
						}
					}
				} else if (touchEvent.type == 'touchup') {
					touchData.rotating = touchData.rotating && touches.length > 1;
					if (touchData.rotating) {
						touchData.oldrotation += touchData.rotation;
					} else {
						$this.removeClass('rotating');
					}
				}

				$(this).data('touch', touchData);
			},
		},
	});

    $.fn.rotatable = function(o) {
        o = $.extend({}, $.touch.rotatable, o);
        return this.each(function() {
            var $this = $(this).touchable(),
				touchData = $this.data('touch') || {};

			if (!touchData.rotatable) {
				// set rotatable defaults and custom options
				$.extend(touchData, $.touch.rotatable, o);

				// add rotatable handler
				$this.on('touchdown touchmove touchup', touchData.rotatableHandler);

				// if element is already transformed, use these values to begin with
				touchData.rotation = touchData.oldrotation = getTransformValues(this).rotation || 0;

				// indicate that element is now rotatable
				$this.addClass('rotatable');
				touchData.rotatable = true;
			} else {
				// just set new options
				$.extend(touchData, o);
			}

			// update touch data
            $this.data('touch', touchData);
        });
    }

	$(function() {
		// attach rotatable behaviour
		$('.rotatable').rotatable();
	});
})(jQuery);
