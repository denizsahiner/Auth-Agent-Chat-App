import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || "", "base64");

export function encryptMessage(plainText: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    ciphertext: encrypted.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptMessage({
  iv,
  ciphertext,
  tag,
}: {
  iv: string;
  ciphertext: string;
  tag: string;
}) {
  if (!iv || !ciphertext || !tag) {
    console.warn("Message decryption skipped due to missing data:", { iv, ciphertext, tag });
    return "[Decryption failed]";
  }

  const ivBuffer = Buffer.from(iv, "base64");
  const tagBuffer = Buffer.from(tag, "base64");
  const ciphertextBuffer = Buffer.from(ciphertext, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, ivBuffer);
  decipher.setAuthTag(tagBuffer);

  const decrypted = Buffer.concat([decipher.update(ciphertextBuffer), decipher.final()]);
  return decrypted.toString("utf8");
}
