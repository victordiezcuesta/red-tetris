const NAME_REGEX = /^[A-Za-z0-9_-]{1,20}$/;
export const MAX_MESSAGE_LENGTH = 50;

export const isValidName = (name: string): boolean =>
	NAME_REGEX.test(name);

export const isValidMessage = (text: string): boolean =>
	text.trim().length > 0 && text.length <= MAX_MESSAGE_LENGTH;