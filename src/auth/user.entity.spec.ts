import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'testPass'
    user.salt = 'testSalt';
  });

  afterEach(() => {
    jest.clearAllMocks(); // so that you clear all attached .spyOn()
  })

  describe('validatePassword', () => {

    it('returns true as password is valid', async () => {
      // because bcrypt.hash is read-only
      const spy = jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve(user.password));
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword(user.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, user.salt);

      expect(result).toEqual(true);
      spy.mockRestore(); // reset implementations back to default
    });
    it('returns false as password is invalid', async () => {
      // because bcrypt.hash is read-only
      const spy = jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve("wrongPassword"));
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword(user.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, user.salt);

      expect(result).toEqual(false);
      spy.mockRestore(); // reset implementations back to default
    });
  });
});