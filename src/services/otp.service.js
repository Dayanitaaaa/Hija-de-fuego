export function generateOtp(length = 6) {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

export function normalizePhone(raw) {
    if (!raw) return null;
    const cleaned = String(raw).replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    return cleaned;
}

export function isLikelyColombianPhone(phone) {
    if (!phone) return false;
    // Acepta +57XXXXXXXXXX o 3XXXXXXXXX / 57XXXXXXXXXX
    const p = phone.replace(/\s+/g, '');
    if (p.startsWith('+57')) return /^\+57\d{10}$/.test(p);
    if (p.startsWith('57')) return /^57\d{10}$/.test(p);
    return /^3\d{9}$/.test(p);
}
