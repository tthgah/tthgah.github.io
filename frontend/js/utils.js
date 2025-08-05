// A simple SHA-256 implementation using Web Crypto API
// DO NOT rely on client-side hashing for real security.
// Passwords should be hashed on the server using secure algorithms like bcrypt.

async function sha256(message) {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hexHash;
}

// Export for use in other modules
window.sha256 = sha256;