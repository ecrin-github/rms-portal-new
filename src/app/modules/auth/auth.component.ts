import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  today: Date = new Date();
  showFooter: boolean = true;

  constructor( private router: Router, public oidcSecurityService: OidcSecurityService) { }

  ngOnInit(): void {
    this.showFooter = this.router.url.includes('contactUs') ? false : true;
  }
  login() {
    this.oidcSecurityService.authorize();
  }
  goToContact() {
    this.router.navigate([])
      .then(result => { window.open('/contactUs', '_self'); });
  }
  goToAbout() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.gitbook.io/crdsr/', '_blank'); });
  }
  goToUserGuide() {
  this.router.navigate([])
  .then(result => { window.open('https://crr.gitbook.io/crdsr/user-guide/', '_blank'); });
  }
  goToBrowse() {
    this.router.navigate([])
      .then(result => { window.open('/browsing', '_self'); });
  }
  goToMdr() {
      this.router.navigate([])
      .then(result => { window.open('https://crmdr.ecrin.org/', '_blank'); });
  }
  goToLegalNotice() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.gitbook.io/crr/legal-notice', '_blank'); });
  }
  goToDataSharingPolicy() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.gitbook.io/crdsr/data-sharing-policy', '_blank'); });
  }
  goToPrivacy() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.gitbook.io/crr/data-privacy-policy', '_blank'); });
  }
}
