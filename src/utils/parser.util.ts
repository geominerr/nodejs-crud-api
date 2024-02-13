import { IncomingMessage } from 'http';
import { IRequestBody } from '../models/user.model';

export class RequestParser {
  getEndpoint(req: IncomingMessage): string {
    try {
      const method = req.method;
      const url = this.splitUrl(req.url);

      if (url && url.length === 3) {
        url[2] = 'id';
      }

      return `${method} ${url?.join('/')}`;
    } catch (err) {
      throw err;
    }
  }

  getId(req: IncomingMessage): string | null {
    try {
      const url = this.splitUrl(req?.url);

      if (url && url.length === 3) {
        return url[2] as string;
      }

      return null;
    } catch (err) {
      throw err;
    }
  }

  readRequestBody(req: IncomingMessage): Promise<IRequestBody | null> {
    return new Promise((resolve, reject) => {
      let body: string = '';

      req
        .on('data', (chunk) => (body += chunk))
        .on('end', () => {
          try {
            const parsedBody = JSON.parse(body);
            resolve(parsedBody);
          } catch {
            resolve(null);
          }
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  private splitUrl(url: string | undefined): string[] | null {
    if (!url) {
      return null;
    }

    if (url[url.length - 1] === '/') {
      return url.slice(1, -1).split('/');
    }

    return url.slice(1).split('/');
  }
}
