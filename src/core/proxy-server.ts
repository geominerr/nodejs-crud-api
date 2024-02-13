import http from 'http';

export class ProxyServer {
  basePort: number;
  workerPorts: number[];
  currIndexWoker: number = 0;

  constructor(basePort: number, workersPort: number[]) {
    this.basePort = basePort;
    this.workerPorts = workersPort;
  }

  run() {
    const proxyServer = http.createServer((req, res) => {
      try {
        const workerPort = this.getWorkerPort();

        const options = {
          method: req.method,
          headers: req.headers,
          joinDuplicateHeaders: true,
          port: workerPort,
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
          console.error(`Proxy error: ${err.message}`);
          res
            .writeHead(500, { 'Content-Type': 'application/json' })
            .end({ message: 'Proxy server error' });
        });
      } catch (err) {
        console.log(err);
      }
    });

    proxyServer.listen(this.basePort, () => {
      console.log(
        'Proxy Server started on port:',
        this.basePort,
        'Proccess pid',
        process.pid,
      );
    });
  }

  getWorkerPort(): number {
    const { workerPorts, currIndexWoker } = this;
    const port = workerPorts[currIndexWoker];

    if (port) {
      this.currIndexWoker += 1;
      return port;
    }

    this.currIndexWoker = 0;

    return workerPorts[this.currIndexWoker] as number;
  }
}
