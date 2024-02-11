import { IRequestBody } from '../models/user.model';

export class Validator {
  private requestBody: Record<string, string> = {
    username: 'string',
    age: 'number',
    hobbies: 'array',
  };

  private regexpUUID: RegExp =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  validateRequestBody(data: IRequestBody): boolean {
    const keys = Object.keys(data);
    const requestKeys = Object.keys(this.requestBody);

    if (keys.length !== requestKeys.length) {
      return false;
    }

    return keys.every((key) => {
      if (this.requestBody?.[key]) {
        if (key !== 'hobbies') {
          return (
            typeof data[key as keyof IRequestBody] === this.requestBody[key]
          );
        }

        return Array.isArray(data[key as keyof IRequestBody]);
      }

      return false;
    });
  }

  validateUUIDV4(id: string): boolean {
    return this.regexpUUID.test(id);
  }
}
