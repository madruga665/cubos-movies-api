import { User, Session } from '../auth';

declare global {
  namespace Express {
    interface Request {
      user: User;
      session: Session;
    }
  }
}
