import { UserController } from '../controllers/user-contoller';
import { DataBase } from '../services/database';
import { IncomingMessage } from 'http';

jest.mock('../services/database');

describe('UserController', () => {
  let userController: UserController;
  const db = new DataBase();

  beforeEach(() => {
    userController = new UserController(db);
  });

  it('getUser should return status code 400 for invalid ID', async () => {
    const codeStatus = 400;
    const request = {
      url: '/api/users/90sdf9sf',
      method: 'GET',
    } as IncomingMessage;

    const res = await userController['getUser'](request);
    expect(res.codeStatus).toBe(codeStatus);
  });

  it('getUser should return status code 404 if user doesnt exist', async () => {
    const codeStatus = 404;
    const request = {
      url: '/api/users/e2874f7b-76ae-413a-bf8e-84140b6440db',
      method: 'GET',
    } as IncomingMessage;
    db.getUser = jest.fn().mockReturnValue(null);

    const res = await userController['getUser'](request);
    expect(res.codeStatus).toBe(codeStatus);
  });

  it('getUser should return status code 200 if user exist', async () => {
    const codeStatus = 200;
    const request = {
      url: '/api/users/e2874f7b-76ae-413a-bf8e-84140b6440db',
      method: 'GET',
    } as IncomingMessage;
    const mockData = {
      username: 'Fedddf',
      age: 25,
      hobbies: ['fishing', 'sport'],
      id: 'e2874f7b-76ae-413a-bf8e-84140b6440db',
    };

    db.getUser = jest.fn().mockReturnValue(mockData);

    const res = await userController['getUser'](request);

    expect(res.codeStatus).toBe(codeStatus);
  });

  it('deleteUser should return status code 400 for invalid ID', async () => {
    const codeStatus = 400;
    const request = {
      url: '/api/users/90sdf9sf',
      method: 'DELETE',
    } as IncomingMessage;

    const res = await userController['deleteUser'](request);
    expect(res.codeStatus).toBe(codeStatus);
  });

  it('geleteUser should return status code 404 if user doesnt exist', async () => {
    const codeStatus = 404;
    const request = {
      url: '/api/users/e2874f7b-76ae-413a-bf8e-84140b6440db',
      method: 'DELETE',
    } as IncomingMessage;
    db.deleteUser = jest.fn().mockReturnValue(false);

    const res = await userController['deleteUser'](request);
    expect(res.codeStatus).toBe(codeStatus);
  });

  it('deleteUser should return status code 204 if the user is successfully deleted', async () => {
    const codeStatus = 204;
    const request = {
      url: '/api/users/e2874f7b-76ae-413a-bf8e-84140b6440db',
      method: 'DELETE',
    } as IncomingMessage;

    db.deleteUser = jest.fn().mockReturnValue(true);

    const res = await userController['deleteUser'](request);

    expect(res.codeStatus).toBe(codeStatus);
  });

  it('getAllUsers should return status code 200 and all records', async () => {
    const codeStatus = 200;
    const amountRecords = 10;
    const request = {
      url: '/api/users',
      method: 'GET',
    } as IncomingMessage;
    const mockData = {
      username: 'Fedddf',
      age: 25,
      hobbies: ['fishing', 'sport'],
      id: 'e2874f7b-76ae-413a-bf8e-84140b6440db',
    };

    db.getAllUsers = jest
      .fn()
      .mockReturnValue(Array(amountRecords).fill({ ...mockData }));

    const res = await userController['getAllUsers'](request);

    expect(res.codeStatus).toBe(codeStatus);
    expect(Array.isArray(res.body)).toBeTruthy();

    if (Array.isArray(res.body)) {
      expect(res.body.length).toBe(amountRecords);
    }
  });
});
