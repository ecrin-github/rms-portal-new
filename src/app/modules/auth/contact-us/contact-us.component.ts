import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from 'src/app/_rms/services/back/back.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  isAccessRequest: boolean = false;
  reasonPicked: boolean = false;

  constructor(private router: Router, 
              private backService: BackService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.isAccessRequest = (params?.option?.toLowerCase() === "access");
      if (this.isAccessRequest) {
        const reasonSelect = (<HTMLInputElement>document.getElementById("reason"));
        reasonSelect.value = "access";
      }
    });
  }

  onChangeReason($event) {
    if ($event.target.value) {
      this.reasonPicked = true;
    }

    if ($event.target.value?.toLowerCase() === "access") {
      this.isAccessRequest = true;
    } else {
      this.isAccessRequest = false;
    }
  }

  back() {
    this.backService.back();
  }

  goToUserGuide() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.gitbook.io/crr/', '_blank'); });
  }
  goToAbout() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.gitbook.io/crdsr/', '_tab1'); });
  }
  goToMdr() {
    this.router.navigate([])
    .then(result => { window.open('https://crmdr.ecrin.org/', '_blank'); });
  }
  goToLegalNotice() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.gitbook.io/crr/legal-notice', '_blank'); });
  }
  goToPrivacy() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.gitbook.io/crr/data-privacy-policy', '_blank'); });
  }
  goToLogin() {
    this.router.navigate(['/']);
  }
}
