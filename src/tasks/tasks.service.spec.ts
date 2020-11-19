import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '../auth/user.entity';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUser : Partial<User> = {
  id: 12,
  username: 'Test User'
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ]
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('somevalue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'search query'};
      const result = await tasksService.getTasks(filters, mockUser);

      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('somevalue');
    });
  })

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      const mockTask = { title: 'test task', description: 'test desc' };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id,
        }
      });
    });

    it('throws error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null); // setup that the repository will return this when called
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.createTask() and returns the result', async () => {
      const mockTask = { title: 'create', description: 'create',  }
      taskRepository.createTask.mockResolvedValue(mockTask);

      const result = await tasksService.createTask(mockTask, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.createTask).toHaveBeenCalledWith(mockTask, mockUser);
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.deleteTask() to delete a task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();

      await tasksService.deleteTaskById(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id});
    });

    it('throws an error as task could not be found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('updates a task status', async () => {
      const save = jest.fn().mockResolvedValue(true); // because it is async

      tasksService.getTaskById = jest.fn().mockResolvedValue({ // because it is async
        status: TaskStatus.OPEN,
        save,
      });

      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();

      const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
      expect(tasksService.getTaskById).toHaveBeenCalled();

      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});