/*
Replacement file for lodash-es/_root.js.

Replaces the problematic Function() constructor call (uses eval) with a
reference to the window object.
*/
import freeGlobal from 'lodash/_freeGlobal';

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || window;

export default root;
