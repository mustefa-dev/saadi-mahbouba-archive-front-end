/**
 * Secure Storage Composable
 * Provides AES-256-GCM encryption for localStorage
 */

const SECRET_KEY = 'your-secret-key-change-in-production-32-chars-minimum'

export const useSecureStorage = () => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  /**
   * Derive a cryptographic key from the secret
   */
  const getKey = async (): Promise<CryptoKey> => {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('salt-value'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypt and store data in localStorage
   */
  const setSecureItem = async (key: string, value: any): Promise<void> => {
    try {
      const cryptoKey = await getKey()
      const iv = crypto.getRandomValues(new Uint8Array(12))

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoder.encode(JSON.stringify(value))
      )

      const encryptedData = {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
      }

      localStorage.setItem(key, JSON.stringify(encryptedData))
    } catch (error) {
      console.error('Error encrypting data:', error)
      throw error
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  const getSecureItem = async (key: string): Promise<any> => {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return null

      const { iv, data } = JSON.parse(stored)
      const cryptoKey = await getKey()

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        cryptoKey,
        new Uint8Array(data)
      )

      return JSON.parse(decoder.decode(decrypted))
    } catch (error) {
      console.error('Error decrypting data:', error)
      return null
    }
  }

  /**
   * Remove item from localStorage
   */
  const removeSecureItem = (key: string): void => {
    localStorage.removeItem(key)
  }

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem
  }
}
