const NAME_REGEX = /^[A-Za-z0-9_-]{1,20}$/;

export const isValidName = (name: string): boolean => NAME_REGEX.test(name);
