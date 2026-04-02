// src/utils/storage.js
import CryptoJS from 'crypto-js'

const SECRET_PASSPHRASE = 'U2FsdGVkX1'

function encrypt(value) {
  const plaintext = JSON.stringify(value)

  const ciphertext = CryptoJS.AES.encrypt(plaintext, SECRET_PASSPHRASE).toString()
  return ciphertext
}

function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_PASSPHRASE)

    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8)

    return JSON.parse(decryptedStr)
  } catch (err) {
    console.error('StorageHelper: decryption failed', err)
    return null
  }
}

const Storage = {
 
  set(key, value) {
    try {
      const cipher = encrypt(value)
      localStorage.setItem(key, cipher)
    } catch (err) {
      console.error('StorageHelper.set error:', err)
    }
  },

  get(key) {
    try {
      const cipher = localStorage.getItem(key)
      if (!cipher) return null
      return decrypt(cipher)
    } catch (err) {
      console.error('StorageHelper.get error:', err)
      return null
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.error('StorageHelper.remove error:', err)
    }
  },

  clearAll() {
    try {
      localStorage.clear()
    } catch (err) {
      console.error('StorageHelper.clearAll error:', err)
    }
  }
}

export default Storage
