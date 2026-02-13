/**
 * Strip spaces and common separators from phone for API submission.
 * Backend expects e.g. +33633515008 (optional +, then digits only).
 * @param {string} phone
 * @returns {string}
 */
export default function normalizePhone(phone) {
  if (phone == null || typeof phone !== "string") return phone;
  return phone.replace(/[\s.\-()]/g, "");
}
