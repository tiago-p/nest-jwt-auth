import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function comparePasswords(
  userPassword: string,
  currentPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(currentPassword, userPassword);
}
