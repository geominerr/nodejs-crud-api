import http, { IncomingMessage, ServerResponse } from 'http';

export class WorkerServer {
  basePort: number;
  dbPort: number;

  constructor(basePort: number, dbPort: number) {
    this.basePort = basePort;
    this.dbPort = dbPort;
  }

  run(): void {
    try {
      const server = http.createServer(this.handleRequest.bind(this));
      server
        .listen(this.basePort, () => {
          console.log(
            `Worker start on port:`,
            this.basePort,
            'Procces pid',
            process.pid,
          );
        })
        .on('error', (err) => {
          throw err;
        });
    } catch (err) {
      console.error(err);
    }
  }

  handleRequest(req: IncomingMessage, res: ServerResponse): void {
    console.log(
      'WorkerPort:',
      this.basePort,
      'Request:',
      `${req.method} ${req.url}`,
      'Proccess pid',
      process.pid,
    );

    const options = {
      method: req.method,
      headers: req.headers,
      joinDuplicateHeaders: true,
      port: this.dbPort,
      path: req.url,
    };

    const proxyRequest = http.request(options, (proxyRes) => {
      proxyRes.pipe(
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers),
        {
          end: true,
        },
      );
    });

    req.pipe(proxyRequest, { end: true });

    proxyRequest.on('error', (err) => {
      console.error(`Worker error: ${err.message}`);
      res
        .writeHead(500, { 'Content-Type': 'application/json' })
        .end({ message: 'Worker server error' });
    });
  }
}
