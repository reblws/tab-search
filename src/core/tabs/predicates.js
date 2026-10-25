const isOfProperty =
  propKey => desiredProp => ({ [propKey]: prop }) => prop === desiredProp;
export const isOfType = isOfProperty('type');
export const isOfWindow = isOfProperty('windowId');
export const isActive = isOfProperty('active')(true);
export const isOfUrl = isOfProperty('url');
