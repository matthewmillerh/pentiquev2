/**
 * Validates the authentication token stored in localStorage.
 *
 * This function checks if a token exists in localStorage under the key
 * 'pentique_auth_token'. If a token is found, it decodes the token and verifies
 * its expiration time. If the token is expired or invalid, it is removed from
 * localStorage. The function returns an object indicating whether the token is
 * valid, along with additional information such as the reason for invalidity
 * or the decoded token data.
 *
 * @returns {Object} An object containing the validation result:
 * - {boolean} valid - Indicates whether the token is valid.
 * - {string} [reason] - The reason why the token is invalid (if applicable).
 * - {Object} [decoded] - The decoded token data (if the token is valid).
 */
import { jwtDecode } from 'jwt-decode'

export function validateToken() {
  const token = localStorage.getItem('pentique_auth_token')
  if (!token) {
    return { valid: false, reason: 'No token found' }
  }

  try {
    const decoded = jwtDecode(token) // Decode the token
    const currentTime = Math.floor(Date.now() / 1000)

    if (decoded.exp < currentTime) {
      localStorage.removeItem('pentique_auth_token') // Remove the expired token
      return { valid: false, reason: 'Token has expired' }
    }

    return { valid: true, decoded } // Token is valid
  } catch (err) {
    localStorage.removeItem('pentique_auth_token') // Remove the invalid token
    return { valid: false, reason: 'Invalid token' + err }
  }
}
