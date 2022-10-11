import { AppleController } from './AppleController';
import { AppleService } from '../services/AppleService';
import { Request, Response } from 'express';
import { client } from '../utils/db';

jest.mock('../service/AppleService');
