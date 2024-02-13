import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';

import { DataBase } from '../services/database';
import { Server } from './server';
import { ProxyServer } from './proxy-server';
import { WorkerServer } from './worker';

export class App {
  basePort: string | number;
  mode: string | null;

  constructor() {
    dotenv.config();
    this.basePort = process.env.PORT || 4000;
    this.mode = process.env.MODE_ENV || null;
  }

  start(): void {
    try {
      if (this.mode === 'multi') {
        if (cluster.isPrimary) {
          const amountWorkers = os.availableParallelism();
          const workersPort: number[] = [];
          const databasePort: number = +this.basePort + amountWorkers - 1;

          for (let i = 0; i < amountWorkers - 1; i += 1) {
            const workerPort = +this.basePort + i + 1;

            if (workerPort === databasePort) {
              cluster.fork({
                WORKER_PORT: workerPort,
                DATABASE_PORT: databasePort,
                SERVER_DB: true,
              });

              break;
            }

            workersPort.push(workerPort);
            cluster.fork({
              WORKER_PORT: workerPort,
              DATABASE_PORT: databasePort,
            });
          }

          new ProxyServer(+this.basePort, workersPort).run();
        } else {
          const basePort = Number(process.env.WORKER_PORT);
          const databasePort = Number(process.env.DATABASE_PORT);

          if (process.env.SERVER_DB) {
            new Server(new DataBase(), databasePort).run();
            return;
          }

          new WorkerServer(basePort, databasePort).run();
        }
      } else {
        new Server(new DataBase(), this.basePort).run();
      }
    } catch (err) {
      console.error(err);
    }
  }
}
