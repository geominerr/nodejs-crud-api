import { IncomingMessage } from 'http';
import { IRequestBody } from '../models/user.model';

export class RequestParser {
  getEndpoint(req: IncomingMessage): string {
    const method = req.method;
    const url = this.splitUrl(req?.url);
    if (url) {
      if (url.length === 3) {
        url[2] = 'id';
      }
    }

    return `${method} ${url?.join('/')}`;
  }

  getId(req: IncomingMessage): string | null {
    const url = this.splitUrl(req?.url);

    if (url && url.length === 3) {
      return url[2];
    }

    return null;
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
          } catch (err) {
            resolve(null);
          }
        })
        .on('error', (err) => {
          console.error('Opps Error');
          reject(err);
        });
    });
  }

  private splitUrl(url: string | undefined): string[] | null {
    if (!url) {
      return null;
    }

    return url.slice(1).split('/');
  }
}
