
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { DatabaseService } from './database/database.service';

describe('AppController', () => {
  let appController: AppController;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const mockDatabaseService = {
      query: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    databaseService = app.get<DatabaseService>(DatabaseService);
  });

  describe('testDatabase', () => {
    it('should return a successful database response', async () => {
      const mockTime = new Date('2026-10-14T10:00:00Z');

      jest.spyOn(databaseService, 'query').mockResolvedValue({
        rows: [{ now: mockTime }],
      } as any);

      await expect(appController.testDatabase()).resolves.toEqual({
        message: 'Database connection successful',
        time: mockTime,
      });
    });
  });
});
