import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { User } from "./user.entity";
import { UserRepository } from "./user.repository";
import * as bcrypt from 'bcryptjs';

const mockCredentialsDto = {
  username: 'testuser',
  password: 'testpwd',
}

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
      ]
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks(); // so that you clear all attached .spyOn()
  })

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    })

    it('successfuly signs up the user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23505' });
      await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(ConflictException);
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '123123' }); // unhandled error code
      await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validateUserPassword', () => {
    let user;
    beforeEach(() => {
        userRepository.findOne = jest.fn();
        user = new User();
        user.username = 'test-user';
        user.validatePassword = jest.fn();
    });

    it('returns the username as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(result).toEqual('test-user');
    });

    it ('returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it ('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);

      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      // because bcrypt.hash is read-only
      const expectedHashValue = 'testhash42';
      const spy = jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve(expectedHashValue));
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await userRepository.hashPassword('testp', 'testsalt');
      expect(bcrypt.hash).toHaveBeenCalledWith('testp', 'testsalt');
      expect(result).toEqual(expectedHashValue);

      spy.mockRestore();
    });
  });
});