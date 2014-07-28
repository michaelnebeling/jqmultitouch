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

    $.extend($.touch, {
		orientationHandler: function() {
			var orientation = typeof window.orientation === 'number' ? window.orientation : ($(window).width() >= $(window).height() ? 90 : 0);

			if ($(document).trigger('orientationchanged', [orientation])) {
				switch (orientation) {
					case 90:
						$('.orientable').removeClass('portrait landscape-90').addClass('landscape');
						break;
					case -90:
						$('.orientable').removeClass('portrait').addClass('landscape landscape-90');
						break;
					default:
						$('.orientable').removeClass('landscape landscape-90').addClass('portrait');
				}
			}
		},
		orientationChanged: function(param) {
			if (typeof param === 'function') {
				$(document).on('orientationchanged', param);
				return true;
			}
			return false;
		},
	});

    window.addEventListener(('onorientationchange' in window ? 'orientationchange' : 'resize'), $.touch.orientationHandler, false);
    window.addEventListener('load', $.touch.orientationHandler, false);

})(jQuery);
