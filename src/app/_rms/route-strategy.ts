import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from "@angular/router";

export class CustomRouteReuseStrategy implements RouteReuseStrategy {

  handlers: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data.shouldReuse || false;
  }

  store(route: ActivatedRouteSnapshot, handle: {}): void {
    if (route.data.shouldReuse) {
        this.handlers[route.data['key']] = handle;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && !!this.handlers[route.data['key']];
  }
  
  retrieve(route: ActivatedRouteSnapshot): {} {
    if (!route.routeConfig) return null;
    return this.handlers[route.data['key']];
  }
  
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.data.shouldReuse || false;
  }

}