import { message } from "antd";

class Message {
  static success(content: string, duration?: number) {
    message.success({
      content,
      duration: duration || 2,
    });
  }

  static fail(content: string, duration?: number) {
    message.error({
      content,
      duration: duration || 2,
    });
  }

  static clear() {
    message.destroy();
  }
}

export { Message };
