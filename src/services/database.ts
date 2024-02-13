import { v4 as uuidV4 } from 'uuid';
import { IRequestBody, IResponseBody } from '../models/user.model';

export class DataBase {
  users: Map<string, IResponseBody> = new Map();

  constructor() {}

  getUser(id: string): IResponseBody | null {
    const { users } = this;

    if (!users.has(id)) {
      return null;
    }

    return users.get(id) as IResponseBody;
  }

  createUser(userData: IRequestBody): IResponseBody {
    const uuid = uuidV4();
    const userCreated = { ...userData, id: uuid };

    this.users.set(uuid, userCreated);

    return userCreated;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  updateUser(userData: IResponseBody): IResponseBody | null {
    const { users } = this;
    const { id } = userData;

    if (users.has(id)) {
      users.set(id, { ...userData });

      return userData;
    }

    return null;
  }

  getAllUsers(): IResponseBody[] {
    return Array.from(this.users.values());
  }
}
