import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  @Input() reason: any;
  contactForm: UntypedFormGroup;
  isAccessRequest: boolean = false;
  isSubmitted: boolean = false;
  submittedSuccessfully: boolean = false;

  constructor(private fb: UntypedFormBuilder, 
              private commonLookUpService: CommonLookupService, 
              private toastr: ToastrService, 
              private router: Router) { 
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      confirmEmail: ['', Validators.required],
      organisation: '',
      message: ['', Validators.required],
      reason: ['', Validators.required]
    })
  }

  ngOnInit(): void { }

  get g() { return this.contactForm.controls; }

  goToLogin() {
    this.router.navigate(['/']);
  }

  onChange() {
    if (this.contactForm.value?.reason?.toLowerCase() === "access") {
      this.isAccessRequest = true;
    }
  }

  private emailBuilder(
    fName: string,
    lName: string,
    organisation: string,
    email: string,
    message: string
  ): string {
    return '<b>Requestor name: </b>' + fName + ' ' + lName + '<br />' +
        '<b>Requestor organisation: </b>' + organisation + '<br />' +
        '<b>Requestor Email: </b>' + email + '<br />' +
        '<b>Requestor message:</b><br />' +
        message;
  }

  submitContact() {
    this.contactForm.patchValue({"reason": (this.contactForm.value?.reason?.toLowerCase() === "upload" ? "crDSR Data Upload Request" : "crDSR Incoming Message")});
    this.isSubmitted = true;
    if (this.contactForm.valid) {
      if (this.contactForm.value.email === this.contactForm.value.confirmEmail) {
        const payload = {
          subject: this.contactForm.value.reason,
          message: this.emailBuilder(
              this.contactForm.value.firstName,
              this.contactForm.value.lastName,
              this.contactForm.value.organisation,
              this.contactForm.value.email,
              this.contactForm.value.message
          ),
          sender: this.contactForm.value.email,
          cc: this.contactForm.value.email
        }
        this.commonLookUpService.emailAPI(payload).subscribe((res: any) => {
          if (res.status === 'success') { // TODO: BE should be changed
            this.toastr.success('Success! An email has been sent to your mail address.')
            this.submittedSuccessfully = true;
          }
        }, error => {
          this.toastr.error(error.message);
        })
      } else {
        this.toastr.error('Emails entered are not same. Please enter the correct email.')
      }
    }
  }
}
