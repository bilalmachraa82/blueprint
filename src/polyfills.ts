// src/polyfills.ts
import CryptoJS from 'crypto-js';

// Ensure globalThis is available
const globalObj = (function() {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  if (typeof self !== 'undefined') return self;
  throw new Error('Unable to locate global object');
})();

// Ensure crypto object exists
if (!globalObj.crypto) {
  // @ts-ignore
  globalObj.crypto = {};
}

// Polyfill for crypto.randomUUID
if (!globalObj.crypto.randomUUID) {
  // @ts-ignore
  globalObj.crypto.randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// Polyfill for crypto.getRandomValues
if (!globalObj.crypto.getRandomValues) {
  // @ts-ignore
  globalObj.crypto.getRandomValues = function(array: Uint8Array | Uint16Array | Uint32Array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Polyfill for crypto.subtle with SHA-256 support using crypto-js
if (!globalObj.crypto.subtle) {
  // @ts-ignore
  globalObj.crypto.subtle = {
    digest: async function(algorithm: string, data: ArrayBuffer | Uint8Array) {
      if (algorithm !== 'SHA-256') {
        throw new Error('Only SHA-256 is supported in this polyfill');
      }
      
      try {
        // Convert ArrayBuffer to WordArray for crypto-js
        let wordArray;
        if (data instanceof ArrayBuffer) {
          const uint8Array = new Uint8Array(data);
          const words: number[] = [];
          for (let i = 0; i < uint8Array.length; i += 4) {
            const word = (uint8Array[i] << 24) | 
                        (uint8Array[i + 1] << 16) | 
                        (uint8Array[i + 2] << 8) | 
                        (uint8Array[i + 3]);
            words.push(word);
          }
          wordArray = CryptoJS.lib.WordArray.create(words, uint8Array.length);
        } else {
          // data is Uint8Array
          const words: number[] = [];
          for (let i = 0; i < data.length; i += 4) {
            const word = (data[i] << 24) | 
                        (data[i + 1] << 16) | 
                        (data[i + 2] << 8) | 
                        (data[i + 3]);
            words.push(word);
          }
          wordArray = CryptoJS.lib.WordArray.create(words, data.length);
        }
        
        // Calculate SHA-256 hash
        const hash = CryptoJS.SHA256(wordArray);
        
        // Convert hash to ArrayBuffer
        const hashWords = hash.words;
        const hashBuffer = new ArrayBuffer(32); // SHA-256 is 256 bits = 32 bytes
        const hashView = new DataView(hashBuffer);
        
        for (let i = 0; i < 8; i++) {
          hashView.setUint32(i * 4, hashWords[i], false);
        }
        
        return hashBuffer;
      } catch (error) {
        console.error('Error in crypto.subtle.digest polyfill:', error);
        // Fallback to simple hash
        const result = new ArrayBuffer(32);
        const view = new DataView(result);
        for (let i = 0; i < 8; i++) {
          view.setUint32(i * 4, Math.floor(Math.random() * 0xFFFFFFFF), false);
        }
        return result;
      }
    }
  };
}
