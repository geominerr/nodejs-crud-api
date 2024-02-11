import http, { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { DataBase } from '../services/database';
import { UserController } from '../controllers/user-contoller';

export class Server {
  db: DataBase;
  userController: UserController;
  basePort: string | number;

  constructor() {
    dotenv.config();
    this.basePort = process.env.PORT || 4000;
    this.db = new DataBase();
    this.userController = new UserController(this.db);
  }

  run(): void {
    try {
      const server = http.createServer(this.handleRequest.bind(this));
      server.listen(this.basePort, () => {
        console.log(`Server start on port: ${this.basePort}`);
      });
    } catch (err) {
      console.error(err);
    }
  }

  handleRequest(req: IncomingMessage, res: ServerResponse): void {
    this.userController.handle(req, res);
  }
}
