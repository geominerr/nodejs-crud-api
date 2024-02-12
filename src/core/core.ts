import cluster from 'cluster';
import os from 'os';
import http from 'http';
import dotenv from 'dotenv';

import { Server } from './server';
import { DataBase } from '../services/database';

export class App {
  db: DataBase;
  basePort: string | number;
  mode: string | null;
  amountWorkers: number = 0;
  currWorkerPort: number = 0;

  constructor() {
    dotenv.config();
    this.db = new DataBase();
    this.basePort = process.env.PORT || 4000;
    this.mode = process.env.MODE_ENV || null;
  }

  start(): void {
    try {
      if (this.mode === 'multi') {
        // This is an attempt to use cluster... the implementation is not correct! :-)
        if (cluster.isPrimary) {
          this.createProxyServer();

          this.amountWorkers = os.availableParallelism() - 1;
          this.currWorkerPort = +this.basePort;

          for (let i = 0; i < this.amountWorkers; i += 1) {
            const workerPort = +this.basePort + i + 1;
            const worker = cluster.fork({ WORKER_PORT: workerPort });

            new Server(this.db, workerPort).run();

            worker.send({ message: 'bla bla' });
          }
        } else {
        }
      } else {
        new Server(this.db, this.basePort).run();
      }
    } catch (err) {
      console.error(err);
    }
  }

  createProxyServer(): void {
    const proxyServer = http.createServer((req, res) => {
      const workerPort = this.getNextWorkerPort();

      const options = {
        method: req.method,
        headers: req.headers,
        joinDuplicateHeaders: true,
        port: workerPort,
        path: req.url,
      };

      const proxyRequest = http.request(options, (proxyRes) => {
        proxyRes.pipe(res.setHeader('Content-Type', 'application/json'), {
          end: true,
        });
      });

      req.pipe(proxyRequest, { end: true });

      proxyRequest.on('error', (err) => {
        console.error(`Proxy error: ${err.message}`);
        res
          .writeHead(500, { 'Content-Type': 'application/json' })
          .end({ message: 'Proxy server error' });
      });
    });

    proxyServer.listen(this.basePort, () => {
      console.log(`Proxy Server started on port: ${this.basePort}`);
    });
  }

  getNextWorkerPort(): number {
    const { currWorkerPort, basePort, amountWorkers } = this;
    const nextPort =
      ((currWorkerPort - +basePort + 1) % amountWorkers) + +basePort;

    this.currWorkerPort = nextPort;

    return this.currWorkerPort;
  }
}
