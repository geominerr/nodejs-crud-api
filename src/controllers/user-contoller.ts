import { IncomingMessage, ServerResponse } from 'http';

import { DataBase } from '../services/database';
import { RequestParser } from '../utils/parser.util';
import { Validator } from '../utils/validator.util';
import { Handler, IResponse, ResponseBody } from '../models/handler.model';

export class UserController {
  private db: DataBase;

  private requestParser: RequestParser;

  private validator: Validator;

  private methodMap: Record<string, Handler> = {
    'GET api/users/id': this.getUser.bind(this),
    'GET api/users': this.getAllUsers.bind(this),
    'POST api/users': this.createUser.bind(this),
    'PUT api/users/id': this.updateUser.bind(this),
    'DELETE api/users/id': this.deleteUser.bind(this),
  };

  constructor(database: DataBase) {
    this.db = database;
    this.requestParser = new RequestParser();
    this.validator = new Validator();
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const endpoint: string = this.requestParser.getEndpoint(req);
      const methodHandler = this.methodMap?.[endpoint];

      if (methodHandler) {
        const response = await methodHandler(req);

        if (response) {
          res.writeHead(response.codeStatus, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify(response.body));
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: 'Not Found! The requested resource does not exist.',
          }),
        );
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message:
            'An unexpected error occurred while processing your request. Please try again later',
        }),
      );
    }
  }

  private async createUser(req: IncomingMessage): Promise<IResponse> {
    try {
      const userBody = await this.requestParser.readRequestBody(req);

      if (!userBody) {
        return this.createResponse(401, {
          message: 'Invalid JSON format',
        });
      }

      if (!this.validator.validateRequestBody(userBody)) {
        return this.createResponse(400, {
          message:
            'The request body does not contain required fields or the fields are not valid',
        });
      }

      const user = this.db.createUser(userBody);

      return this.createResponse(200, user);
    } catch (err) {
      throw err;
    }
  }

  private async getUser(req: IncomingMessage): Promise<IResponse> {
    try {
      const id = this.requestParser.getId(req);

      if (!id || !this.validator.validateUUIDV4(id)) {
        return this.createResponse(400, {
          message: `User id:${id} is invalid (not uuid)`,
        });
      }

      const user = this.db.getUser(id);

      if (!user) {
        return this.createResponse(404, {
          message: `User with id:${id} doesn't exist`,
        });
      }

      return this.createResponse(200, user);
    } catch (err) {
      throw err;
    }
  }

  private async getAllUsers(req: IncomingMessage): Promise<IResponse> {
    try {
      const users = this.db.getAllUsers();

      return this.createResponse(200, users);
    } catch (err) {
      throw new Error(`${req.url}`); // ^_^
    }
  }

  private async updateUser(req: IncomingMessage): Promise<IResponse> {
    try {
      const id = this.requestParser.getId(req);

      if (!id || !this.validator.validateUUIDV4(id)) {
        return this.createResponse(400, {
          message: `User id:${id} is invalid (not uuid)`,
        });
      }

      const requestBody = await this.requestParser.readRequestBody(req);

      if (!requestBody) {
        return this.createResponse(401, {
          message: 'Invalid JSON format',
        });
      }

      if (!this.validator.validateRequestBody(requestBody)) {
        return this.createResponse(403, {
          message:
            'The request body does not contain required fields or the fields are not valid',
        });
      }

      const newDataUser = { ...requestBody, id };
      const user = this.db.updateUser(newDataUser);

      if (user) {
        return this.createResponse(200, user);
      }

      return this.createResponse(404, {
        message: `User with id:${id} doesn't exist`,
      });
    } catch (err) {
      throw err;
    }
  }

  private async deleteUser(req: IncomingMessage): Promise<IResponse> {
    try {
      const id = this.requestParser.getId(req);

      if (!id || !this.validator.validateUUIDV4(id)) {
        return this.createResponse(400, {
          message: `User id:${id} is invalid (not uuid)`,
        });
      }

      const isDeleted = this.db.deleteUser(id);

      if (!isDeleted) {
        return this.createResponse(404, {
          message: `User with id:${id} doesn't exist`,
        });
      }

      return this.createResponse(201, {
        message: `User with ID ${id} has been successfully deleted.`,
      });
    } catch (err) {
      throw err;
    }
  }

  private createResponse(codeStatus: number, body: ResponseBody): IResponse {
    return { codeStatus, body };
  }
}
