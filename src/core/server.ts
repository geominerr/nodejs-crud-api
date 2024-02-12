import http, { IncomingMessage, ServerResponse } from 'http';
import { DataBase } from '../services/database';
import { UserController } from '../controllers/user-contoller';

export class Server {
  db: DataBase;
  userController: UserController;
  basePort: number | string;

  constructor(database: DataBase, basePort: number | string) {
    this.basePort = basePort;
    this.db = database;
    this.userController = new UserController(this.db);
  }

  run(): void {
    try {
      const server = http.createServer(this.handleRequest.bind(this));
      server
        .listen(this.basePort, () => {
          console.log(`Server start on port: ${this.basePort}`);
        })
        .on('error', (err) => {
          throw err;
        });
    } catch (err) {
      console.error(err);
    }
  }

  handleRequest(req: IncomingMessage, res: ServerResponse): void {
    console.log('Port:', this.basePort, 'Request:', `${req.method} ${req.url}`);
    this.userController.handle(req, res);
  }
}
