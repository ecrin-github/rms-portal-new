import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';


@Injectable({
    providedIn: 'root'
})
export class RedirectService {
    constructor(
        @Inject(DOCUMENT)
        private document: Document
    ) {}

    public postRedirect(instanceId: number, objectId: number, token: string) {
        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', `https://crr.tsd.usit.no/direct/${objectId}/${instanceId}`, false);
        xhttp.setRequestHeader('Authorization', 'Bearer ' + token);
        xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');

        const form = this.document.createElement('form');
        form.method = 'POST';
        form.target = '_top';
        form.action = `https://crr.tsd.usit.no/direct/${objectId}/${instanceId}`;
        const input = this.document.createElement('input');
        input.type = 'hidden';
        input.name = 'id_token';
        input.value = token;

        form.append(input);
        this.document.body.appendChild(form);
        form.submit();
        xhttp.send();
    }
}
