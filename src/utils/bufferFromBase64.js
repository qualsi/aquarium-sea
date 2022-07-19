export default bufferFromBase64 = (base64) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer
