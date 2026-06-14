import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALGORITHM = "aes-256-gcm"

function getKey(): Buffer {
  const hex = process.env.DRIVE_TOKEN_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error("DRIVE_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)")
  }
  return Buffer.from(hex, "hex")
}

/** Encrypts a string, returning `iv:authTag:ciphertext` (all hex). */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString("hex"), authTag.toString("hex"), ciphertext.toString("hex")].join(":")
}

/** Decrypts a string produced by {@link encrypt}. */
export function decrypt(payload: string): string {
  const [ivHex, authTagHex, ciphertextHex] = payload.split(":")
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("Invalid encrypted payload")
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"))
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ])
  return plaintext.toString("utf8")
}
