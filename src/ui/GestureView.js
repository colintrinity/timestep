/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License v. 2.0 as published by Mozilla.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Mozilla Public License v. 2.0 for more details.

 * You should have received a copy of the Mozilla Public License v. 2.0
 * along with the Game Closure SDK.  If not, see <http://mozilla.org/MPL/2.0/>.
 */
import ui.View as View;

import math.geom.Vec2D as Vec2D;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts.blockEvents = false;

		supr(this, 'init', [opts]);

		this._dragMagnitude = opts.dragMagnitude || 150;
		this._dragTime = opts.dragTime || 250;
		this._fingerOne = null;
		this._fingerTwo = null;
		this._initialDistance = null;
		this._initialAngle = null;
		this._dragPoints = {};
	};

	this.onInputStart = function (evt) {
		this.startDrag();
	};

	this.onDragStart = function (dragEvent) {
		var point = {x: dragEvent.srcPoint.x, y: dragEvent.srcPoint.y};
		var index = 'p' + dragEvent.id;
		this._dragPoints[index] = point;
		if (this._fingerOne && this._fingerOne != index) {
			this._fingerTwo = index;
		} else {
			this._fingerOne = index;
			this._dragStartTime = Date.now();
			this._dragStartPoint = dragEvent.srcPoint;
		}
	};

	this.onInputSelect = this.onInputOut = function (evt) {
		this._dragPoints = {};
		this._fingerOne = null;
		this._fingerTwo = null;
		this._initialDistance = null;
		this._initialAngle = null;
	};

	this.onDrag = function (dragEvent, moveEvent, delta) {
		if (this._fingerOne && this._fingerTwo) {
			this._dragPoints['p' + dragEvent.id] = {x: moveEvent.srcPoint.x, y: moveEvent.srcPoint.y};
			var p1 = this._dragPoints[this._fingerOne];
			var p2 = this._dragPoints[this._fingerTwo];
			var dx = p2.x - p1.x;
			var dy = p2.y - p1.y;
			var d = Math.sqrt(dx * dx + dy * dy);
			var dragVec = new Vec2D({x: dx, y: dy});
			var angle = dragVec.getAngle();
			if (this._initialDistance === null) {
				this._initialDistance = d;
				this._initialAngle = angle;
			} else {
				this.emit('Pinch', d / this._initialDistance);
				this.emit('Rotate', this._initialAngle - angle);
			}
		}
	};

	this.onDragStop = function (dragEvent, selectEvent) {
		var dY = this._dragStartPoint.y - selectEvent.srcPoint.y;
		var dX = this._dragStartPoint.x - selectEvent.srcPoint.x;
		var dragVec = new Vec2D({x: dX, y: dY});
		var mag = dragVec.getMagnitude();
		var dt = Date.now() - this._dragStartTime;

		if ((mag > this._dragMagnitude) && (dt < this._dragTime)) {
			var angle = dragVec.getAngle();
			var degrees = angle * (180 / Math.PI);
			var isUp = degrees > 60 && degrees < 120;
			var isDown = degrees < -60 && degrees > -120;
			var isRight = degrees > 120 || degrees < -120;
			var isLeft = degrees < 60 || degrees > -60;

			if (isUp) {
				this.emit('DragUp');
			} else if (isDown) {
				this.emit('DragDown');
			} else if (isRight) {
				this.emit('DragRight');
			} else if (isLeft) {
				this.emit('DragLeft');
			}
		}
	};
});