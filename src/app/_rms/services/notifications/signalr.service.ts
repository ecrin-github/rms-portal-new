import {Component, Injectable, OnInit} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {ToastrService} from 'ngx-toastr';
import {Notification} from './notification';

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    private hubConnection: signalR.HubConnection;

    constructor(private toastr: ToastrService) {}

    public startConnection = () => {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(
                'https://api-v2.ecrin-rms.org/push',
                {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                }).build();

        this.hubConnection
            .start()
            .then(() => console.log('connection started'))
            .catch(err => console.log('error while starting SignalR connection: ' + err));

        this.hubConnection.on('SendPushNotification', (notification: Notification) => {
            this.showNotification(notification);
        });
    }

    showNotification(notification: Notification){
        this.toastr.success('Object instance of the Data object ' + notification.sdOid + ' has been updated on the TSD portal.');
    }
}
