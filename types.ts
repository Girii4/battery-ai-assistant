
export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
}

export interface UploadedFile {
    name: string;
    content: string;
}
