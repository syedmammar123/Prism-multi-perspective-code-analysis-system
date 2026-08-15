export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

function createAppError(
  message: string,
  statusCode: number,
  isOperational = true
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
}

export function ValidationError(message: string): AppError {
  return createAppError(message, 400);
}

export function UnauthorizedError(message: string): AppError {
  return createAppError(message, 401);
}

export function NotFoundError(message: string): AppError {
  return createAppError(message, 404);
}

export function AgentOutputError(message: string): AppError {
  return createAppError(message, 500);
}
