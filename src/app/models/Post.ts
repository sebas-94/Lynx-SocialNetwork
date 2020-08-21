import {User} from './User';

export interface Post {
  id?: string;
  author?: User;
  content?: string;
  date?: any;
  visible?: any;
  likes?: any;
  reposts?: any;
  ref?: any;
  countReplies?: number;
}
