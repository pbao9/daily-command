// StorageService: the only module allowed to touch chrome.storage.local.
const StorageService = {
  get(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(typeof key === 'string' ? result[key] : result);
      });
    });
  },

  set(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  },

  setAll(obj) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(obj, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  },

  remove(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  },

  clear() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  },

  getBytesInUse(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.getBytesInUse(key, (bytes) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(bytes);
      });
    });
  },
};
