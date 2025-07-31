/**
 * 解析当前URL中的查询参数
 * @returns 包含所有查询参数键值对的对象
 */
const getQueryParams = (): Record<string, string> => {
  const params: Record<string, string> = {};
  const { href } = window.location;

  const pattern = /([^?&=]+)=([^&#]*)*/g;
  const matches = href.match(pattern);

  if (matches) {
    for (const match of matches) {
      const [key, value] = match.split("=");

      if (key) {
        params[key] = decodeURIComponent(value || "");
      }
    }
  }
  return params;
};

export { getQueryParams };
