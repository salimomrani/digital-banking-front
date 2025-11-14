import { HttpInterceptorFn } from '@angular/common/http';

const API_KEY_HEADER = 'x-api-key';
const API_KEY_VALUE = 'local-dev-key';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const clonedRequest = req.clone({
    setHeaders: {
      [API_KEY_HEADER]: API_KEY_VALUE
    }
  });

  return next(clonedRequest);
};
