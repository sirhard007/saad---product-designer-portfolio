import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export function hashPassword(password: string) {
 const salt=randomBytes(16).toString('hex');
 return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;
}
export function verifyPassword(password: string, stored: string) {
 const [salt,hash]=stored.split(':');
 if(!salt || !/^[a-f0-9]{32}$/i.test(salt) || !hash || !/^[a-f0-9]{128}$/i.test(hash)) return false;
 return timingSafeEqual(Buffer.from(hash,'hex'),scryptSync(password,salt,64));
}
