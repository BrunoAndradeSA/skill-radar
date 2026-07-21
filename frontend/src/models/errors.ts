export class AppError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(
      id ? `${entity} com ID "${id}" não encontrado(a)` : `${entity} não encontrado(a)`,
      'NOT_FOUND',
    );
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
  }
}

export class InvitationError extends AppError {
  constructor(message: string) {
    super(message, 'INVITATION_ERROR');
  }
}
