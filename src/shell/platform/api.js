// Promise that sends a rejection error if an API is undefined
export function apiP(api, method, ...args) {
  return new Promise((resolve, reject) => {
    if (api) {
      resolve(api[method](...args));
    } else if (!api[method]) {
      reject(new Error(`Method ${method} doesn't exist on ${api}!`));
    } else {
      reject(new Error(`${api} API not available!`));
    }
  });
}
