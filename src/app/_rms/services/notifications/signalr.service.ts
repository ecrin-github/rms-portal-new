import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {environment} from "../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    private ws: WebSocket;

    constructor(private toastr: ToastrService) {
        this.ws = new WebSocket( environment.wsBaseUrl + 'push-notifications');
    }

    public startConnection = () => {
        this.ws.onopen = () => {
            this.ws.onmessage = (event) => {
                console.log("Received event message: ", event)
                const jsonMessage = JSON.parse(event.data);
                this.showNotification(jsonMessage.message);
            }
        }
    }

    showNotification(notification: string){
        this.toastr.success(notification);
    }
}
