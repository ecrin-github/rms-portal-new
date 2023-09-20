import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { tap } from 'rxjs/operators';

@Injectable()
export class MyinterceptorInterceptor implements HttpInterceptor {

  constructor(private oidcSecurityService: OidcSecurityService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token = this.oidcSecurityService.getAccessToken();
    let path = '';
    if (!request.url.includes('https://login.elixir-czech.org/oidc')) {
      path += request.url;
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
        url: path
      })
    } else {
      path = request.url;
    }
    return next.handle(request).pipe(tap(event => {
      if (event instanceof HttpResponse) {

      }
    }, error => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 || error.status === 404) {
          localStorage.clear();
          document.location.reload();
        }
      }
    }
    ));
  }
}
