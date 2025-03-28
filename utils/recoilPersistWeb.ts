import { AtomEffect } from 'recoil';

// Simple web implementation using localStorage
const persistAtom: AtomEffect<any> = ({ onSet, node, trigger, setSelf }) => {
  const key = `recoil-persist-${node.key}`;

  // Initialize atom with stored value
  if (typeof window !== 'undefined') {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      try {
        setSelf(JSON.parse(savedValue));
      } catch (e) {
        console.error(`Error parsing stored value for ${key}`, e);
      }
    }
  }

  // Subscribe to state changes and update localStorage
  onSet((newValue, _, isReset) => {
    if (typeof window !== 'undefined') {
      if (isReset) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    }
  });
};

export default {
  persistAtom,
};
