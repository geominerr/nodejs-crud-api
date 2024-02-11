import { IncomingMessage } from 'http';
import { IResponseBody } from './user.model';

export type Handler = (req: IncomingMessage) => Promise<IResponse>;

export type ResponseBody =
  | IResponseBody
  | IResponseBody[]
  | { message: string };

export interface IResponse {
  codeStatus: number;
  body: ResponseBody;
}
