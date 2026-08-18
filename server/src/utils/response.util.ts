export function success(message: string, data: any = null) {
  return {
    success: true,
    message,
    data,
  };
}

export function failure(message: string, code: number = 400) {
  const err: any = new Error(message);
  err.statusCode = code;
  throw err;
}
