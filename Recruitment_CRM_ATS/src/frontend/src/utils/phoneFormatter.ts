/**
 * UK Phone Number Formatter
 * Formats phone numbers to UK standard format
 * Supports: +44 7xxx xxx xxx, 07xxx xxx xxx, (0xxx) xxx xxxx
 */

export function formatUKPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // Handle international format (+44)
  if (cleaned.startsWith('+44')) {
    cleaned = '0' + cleaned.substring(3)
  } else if (cleaned.startsWith('44')) {
    cleaned = '0' + cleaned.substring(2)
  }
  
  // Remove leading 0 if it's not a UK number
  if (cleaned.length > 0 && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned
  }
  
  // Format mobile numbers (07xxx xxx xxx)
  if (cleaned.startsWith('07') && cleaned.length === 11) {
    return `${cleaned.substring(0, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`
  }
  
  // Format landline numbers
  if (cleaned.startsWith('01') || cleaned.startsWith('02')) {
    if (cleaned.length === 11) {
      // London and other 02x numbers: (020) xxxx xxxx
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 7)} ${cleaned.substring(7)}`
    } else if (cleaned.length === 10) {
      // Other landlines: (01xxx) xxxxx
      return `(${cleaned.substring(0, 5)}) ${cleaned.substring(5)}`
    }
  }
  
  // Return as-is if doesn't match standard formats
  return phone
}

export function validateUKPhoneNumber(phone: string): boolean {
  if (!phone) return false
  
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // UK mobile: 07xxx xxxxxx (11 digits)
  // UK landline: 01xxx xxxxx or 02x xxxx xxxx (10-11 digits)
  // International: +44 7xxx xxxxxx or +44 1xxx xxxxxx
  
  const mobilePattern = /^(?:\+44|0)7\d{9}$/
  const landlinePattern = /^(?:\+44|0)[1-9]\d{8,9}$/
  
  return mobilePattern.test(cleaned) || landlinePattern.test(cleaned)
}

export function formatPhoneForDisplay(phone: string): string {
  return formatUKPhoneNumber(phone)
}

export function formatPhoneForStorage(phone: string): string {
  // Store in international format: +44 7xxx xxx xxx
  if (!phone) return ''
  
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  if (cleaned.startsWith('0')) {
    cleaned = '+44' + cleaned.substring(1)
  } else if (!cleaned.startsWith('+44')) {
    cleaned = '+44' + cleaned
  }
  
  // Format: +44 7xxx xxx xxx
  if (cleaned.startsWith('+447') && cleaned.length === 13) {
    return `+44 ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`
  }
  
  return cleaned
}

