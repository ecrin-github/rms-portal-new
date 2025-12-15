import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from 'src/app/_rms/services/back/back.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  aboutUrl: string = "https://crr.gitbook.io/crdsr/";
  userGuideUrl: string = "https://crr.gitbook.io/crdsr/user-guide";
  mdrUrl: string = "https://crmdr.ecrin.org/";
  legalNoticeUrl: string = "https://crr.gitbook.io/crr/legal-notice";
  dataPrivacyPolicyUrl: string = "https://crr.gitbook.io/crr/data-privacy-policy";

  isAccessRequest: boolean = false;
  reasonPicked: boolean = false;
  reason: string = null;

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
      this.reason = $event.target.value;
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
}
