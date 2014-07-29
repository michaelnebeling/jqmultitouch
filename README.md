# jQMultiTouch

## The jQuery of Multi-touch

jQMultiTouch is a lightweight toolkit and development framework for multi-touch web interface development. Not only is it similar to jQuery in terms of the idea of providing a lightweight and general framework, but also because of the fact that it adopts many key ideas from jQuery and applies them to the framework's core concepts.
			
The main ideas behind jQMultiTouch and its core features are described [in this paper](http://www.globis.ethz.ch/publications/?action=show_abstract&pubid=346) presented at the [EICS 2012](http://eics-conference.org/2012) conference.

jQMultiTouch is written and maintained by [Michael Nebeling](http://www.michael-nebeling.de).
It is licensed under GPLv3 (GNU Public License), see the file LICENSE.

**Note: Please cite the [EICS 2012 Paper](http://dl.acm.org/citation.cfm?id=2305497) if you are using jQMultiTouch in your academic projects.**

## Features
				
* **Support for Firefox and WebKit Browsers**:  One of the core features of jQMultiTouch is that it supports Firefox and WebKit-based browsers such as Safari. As a result, cross-browser compatibilty issues between different touch event models and data are resolved and touch events can be handled in a uniform way independent of browser-specific implementations.
* **Default Multi-Touch Gesture Handlers**:  jQMultiTouch provides support for custom touch and gesture handlers, but also offers default implementations to enable common dragging, scaling and rotation operations in supported browsers.
* **Touch History Query and Evaluation Mechanisms**:  One of the core components of jQMultiTouch is the touch event buffer or history. The touch history keeps a record of current and previous touches, and can be filtered by all touch-related properties, e.g. touch id (i.e. finger), touch event, target element and timestamp. This is important for gestures that may involve several fingers, a series of touch down, move and up events as well as multiple target elements within a certain period of time.
* **Gesture Templates**: To make working with the touch history easier for developers, jQMultiTouch provides several methods for querying and filtering the entries according to a combination of criteria. These can for example be used to detect simple swipe left/right gestures.
* **Touch Support**: jQMultiTouch also provides a cross-browser compatible method to find out whether touch events are supported by the device and browser in use.
* **Device Orientation**: In addition, jQMultiTouch provides a simple way of reacting to changes in the orientation of the device.

## Examples

**The following applications are simple examples that demonstrate the general use of the framework. They have been designed to illustrate the basic concepts of the framework and how they could be applied in applications.**

* [Behaviours Demo](examples/behaviours.html): Simple demonstrator of core jQMultiTouch behaviours
* [Orienation Demo](examples/orientation.html): Shows jQMultiTouch's orientation detection support
* [Gestures Demo](examples/gestures.html): Shows jQMultiTouch's gesture support
* [1$ Gesture Recogniser Demo](examples/dollar.html): Demonstrates the integration of [1$ Unistroke Recognizer](http://depts.washington.edu/aimgroup/proj/dollar) and jQMultiTouch for stroke-based gesture recognition
* [Simple Line Drawing Application](examples/draw.html): Simple application for drawing on a HTML5 canvas using one or more fingers, shows custom and browser-specific touch event handlers
* [Picture Viewing Application](examples/pictures.html): Simple picture viewing application that shows jQMultiTouch's support for attachable behaviours to support common dragging, scaling and rotation behaviours
* [CNN Application](examples/cnn.html): Simple prototype of the CNN web site using jQMultiTouch gestures to play around with the interaction between screens

## FAQ

**Q: What is jQMultiTouch?**

*A: jQMultiTouch is a development framework for multi-touch web interfaces. It is based on jQuery and adopts some of its core concepts with the goal of providing a uniform method for implementing multi-device web applications with support for multi-touch interactions. This is a challenge due to the increased diversity of touch-enabled devices ranging not only from the iPhone/iPod touch and iPad to Android phones and tablets, but nowadays also including laptops and all-in-one desktop computers with support for touch input. It currently supports Firefox and WebKit-based browsers, and provides different methods for the recognotion and implementation of gesture-based interactions.*

**Q: How is it different from jQuery Mobile, jQTouch and Sencha Touch?**

*A: jQMultiTouch does not have the specific focus on mobile web application development and also does not provide UI widgets and components that mimic the look of native controls. The idea behind jQMultiTouch is to provide a general framework for multi-touch web interface development and to address some of the core challenges such as tracking multiple input points on one or more web page elements at a time, supporting multi-touch event capture and delegation and implementing custom gesture handlers.*

**Q: Can I use jQMultiTouch in my projects?**

*A: Yes, please fork the [GitHub repository](https://github.com/michaelnebeling/jqmultitouch) and go ahead. jQMultiTouch has been released as free open-source software distributed under the GPLv3 (GNU Public License).*

**Q: Why doesn't it work on my touch device?**

*A: We know that compatibility with some devices is still a problem (e.g. Windows Phone and Windows 8 touch devices are not yet supported), and are working on fixing the issues.*

## About

jQMultiTouch was originally created by [Michael Nebeling](http://www.michael-nebeling.de) in the [Global Information Systems Group](http://www.globis.ethz.ch) at ETH Zurich. It also contains contributions from Saiganesh Swaminathan, Maximilian Speicher, Martin Grubinger, Maria Husmann and Yassin Hassan. It is available as free open-source software distributed under the GPLv3 license.

Should you have any questions or comments, please feel free to [send an email to Michael Nebeling](mailto:michael.nebeling@gmail.com).