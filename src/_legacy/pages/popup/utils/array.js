export const identity = x => x;
// ('x -> bool) -> 'x -> bool
export const not = pred => x => !pred(x);

const isOfProperty =
  propKey => desiredProp => ({ [propKey]: prop }) => prop === desiredProp;
export const isOfType = isOfProperty('type');
export const isOfWindow = isOfProperty('windowId');
export const isActive = isOfProperty('active')(true);
export const isOfUrl = isOfProperty('url');

export const annotateType = type => obj => Object.assign({}, obj, { type });
// Given a variable number of predicates, returns an array of arrays length
// (length of predicates + 1).
// If element satisfies predicate -> place it in that predicate's index
// If no predicates satisfied -> place it in (length of predicates) index
export const partition = (...predicates) => (array) => {
  const initialPartitions = [...predicates.map(() => []), []];
  const partitionIndices = predicates.reduce(
    (acc, p, index) => acc.set(p, index),
    new Map().set(undefined, predicates.length),
  );
  return array.reduce((acc, x) => {
    const pred = predicates.find(p => p(x));
    const partitionIndex = partitionIndices.get(pred);
    return Object.assign(
      [],
      acc,
      { [partitionIndex]: [...acc[partitionIndex], x] },
    );
  }, initialPartitions);
};

export const concat = (acc, arr) => [].concat(acc, arr);

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

const and = (f, g) => x => f(x) && g(x);
const or = (f, g) => x => f(x) || g(x);
// ((func, func) -> 'x -> bool) -> (...('x -> bool)) -> ('x -> bool)
const composeFilter = binaryOperator => (...predicates) =>
  predicates.reduce((acc, predicate) => binaryOperator(acc, predicate));

export const composeFilterAnd = composeFilter(and);
export const composeFilterOr = composeFilter(or);
