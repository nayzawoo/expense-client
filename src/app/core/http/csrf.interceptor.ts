import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

/** Attach CSRF header on mutating API requests when a token is available. */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (!req.url.includes('/api/') || SAFE.has(req.method.toUpperCase())) {
    return next(req);
  }

  const token = auth.csrfToken();
  const headerName = auth.csrfHeaderName();
  if (!token || req.headers.has(headerName)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { [headerName]: token } }));
};
