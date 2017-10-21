import { compose } from 'redux';

export const identity = x => x;

const isOfProperty =
  propKey => desiredProp => ({ [propKey]: prop }) => prop === desiredProp;
export const isOfType = isOfProperty('type');
export const isOfWindow = isOfProperty('windowId');

export const annotateType = type => obj => Object.assign({}, obj, { type });

// Places elements that dont satisfy the predicate to the second array in
// the accumlator.
export const doubleFilterReducer = predicate => ([accepted, rejected], val) => {
  let nextRejected = rejected;
  let nextAccepted = accepted;
  if (predicate(val)) {
    nextAccepted = [...nextAccepted, val];
  } else {
    nextRejected = [...nextRejected, val];
  }
  return [nextAccepted, nextRejected];
};

export const doubleFilterArray = predicate => array => array.reduce(
  doubleFilterReducer(predicate),
  [[], []],
);

const concat = (acc, arr) => [].concat(acc, arr);
const mergeArray = array => array.reduce(concat);

// Moves elements that dont satisfy the predicate to the tail of the array in-order
export const doubleFilterAndMerge = predicate => compose(
  mergeArray,
  doubleFilterArray(predicate),
);

// If given a type as a function, apply that function to the object to get its
// type
export const getAnnotationFunction = (typeToAnnotate, obj) => {
  if (typeof typeToAnnotate === 'function') {
    return annotateType(typeToAnnotate(obj));
  }
  return annotateType(typeToAnnotate);
};

export const annotateTypeConditionally = (
  predicate,
  acceptedType,
  rejectedType,
) => obj => getAnnotationFunction(
  predicate(obj) ? acceptedType : rejectedType,
  obj,
)(obj);

