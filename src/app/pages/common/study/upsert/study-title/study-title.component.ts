import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { StudyTitleInterface } from 'src/app/_rms/interfaces/study/study-title.interface';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { StudyLookupService } from 'src/app/_rms/services/entities/study-lookup/study-lookup.service';
import { StudyService } from 'src/app/_rms/services/entities/study/study.service';
import { ConfirmationWindowComponent } from '../../../confirmation-window/confirmation-window.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-study-title',
  templateUrl: './study-title.component.html',
  styleUrls: ['./study-title.component.scss']
})
export class StudyTitleComponent implements OnInit {
  form: UntypedFormGroup;
  titleType: [] = [];
  languageCodes: [] = [];
  subscription: Subscription = new Subscription();
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  @Input() sdSid: string;
  @Input() set initiateEmit(initiateEmit: any) {
    if (initiateEmit) {
      this.emitData();
    }
  }
  titleAdded = false;
  isBrowsing: boolean = false;
  @Input() set publicTitle(title: any) {
    if (title) {
      this.createPublicTitle(title);
      this.titleAdded = true;
    }
  }

  @Output() emitTitle: EventEmitter<any> = new EventEmitter();
  studyTitle: StudyTitleInterface
  len: any;

  constructor( private fb: UntypedFormBuilder, private studyService: StudyService, private commonLookupService: CommonLookupService, private studyLookupService: StudyLookupService, private spinner: NgxSpinnerService, private toastr: ToastrService, private modalService: NgbModal, private router: Router) {
    this.form = this.fb.group({
      studyTitles: this.fb.array([])
    });
   }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    this.getTitleType();
    this.getLanguageCode();
    if (this.isEdit || this.isView) {
      this.getStudyTitle();
    }
  }
  studyTitles(): UntypedFormArray {
    return this.form.get('studyTitles') as UntypedFormArray;
  }

  newStudyTitle(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      sdSid: '',
      titleTypeId: null,
      titleText: '',
      langCode: 'en',
      comments: '',
      alreadyExist: false,
      isTitleLinked: false
    });
  }

  addStudyTitle() {
    this.len = this.studyTitles().value.length;
    if (this.len) {
      if (this.studyTitles().value[this.len-1].titleTypeId !== null && this.studyTitles().value[this.len-1].titleText !== null) {
        this.studyTitles().push(this.newStudyTitle());
      } else {
        if (this.studyTitles().value[this.len-1].alreadyExist) {
          this.studyTitles().push(this.newStudyTitle());
        } else {
          this.toastr.info('Please provide the Title Type and Title Value in the previously added Study Title');
        }
      }
    } else {
      this.studyTitles().push(this.newStudyTitle());
    }
  }

  removeStudyTitle(i: number) {
    if (!this.studyTitles().value[i].alreadyExist) {
      this.studyTitles().removeAt(i);
    } else {
      const removeModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop: 'static'});
      removeModal.componentInstance.type = 'studyTitle';
      removeModal.componentInstance.id = this.studyTitles().value[i].id;
      removeModal.componentInstance.sdSid = this.studyTitles().value[i].sdSid;
      removeModal.result.then((data) => {
        if (data) {
          this.studyTitles().removeAt(i);
        }
      }, error => {})
    }
  }
  createPublicTitle(title) {
    if (!this.isEdit && !this.isView) {
      if (!this.titleAdded) {
        const publicType: any = this.titleType.filter((item: any) => item.name === 'Public title');
        this.studyTitles().push(this.fb.group({
          id: '',
          sdSid: '',
          titleTypeId: publicType && publicType.length ? publicType[0].id : '',
          titleText: title,
          langCode: '',
          comments: '',
          alreadyExist: false,
          isTitleLinked: true
        }))
      } 
      if (this.titleAdded) {
        let titleArr = <UntypedFormArray>this.form.controls["studyTitles"];
        titleArr.controls[0].patchValue({
          titleText: title
        });
      }
    }
  }
  getTitleType() {
    setTimeout(() => {
      this.spinner.show(); 
    });
    const getTitleType$ = this.isBrowsing ? this.studyLookupService.getBrowsingStudyTitleTypes() : this.studyLookupService.getStudyTitleTypes();
    getTitleType$.subscribe((res:any) => {
      this.spinner.hide();
      if(res.data) {
        this.titleType = res.data;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getLanguageCode() {
    setTimeout(() => {
      this.spinner.show(); 
    });
    const langCode$ = this.isBrowsing ? this.commonLookupService.getBrowsingLanguageCodes('en') : this.commonLookupService.getLanguageCodes('en');
    langCode$.subscribe((res: any) => {
      this.spinner.hide();
      if (res.data) {
        this.languageCodes = res.data;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getStudyTitle() {
    this.spinner.show();
    const getStudyTitles$ = this.isBrowsing ? this.studyService.getBrowsingStudyTitles(this.sdSid) : this.studyService.getStudyTitles(this.sdSid);
    getStudyTitles$.subscribe((res: any) => {
      if (res && res.data) {
        this.studyTitle = res.data.length ? res.data : [];
        this.patchForm(this.studyTitle);
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchForm(titles) {
    this.form.setControl('studyTitles', this.patchArray(titles));
  }
  patchArray(titles): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    titles.forEach(title => {
      formArray.push(this.fb.group({
        id: title.id,
        sdSid: title.sdSid,
        titleTypeId: title.titleTypeId,
        titleText: title.titleText,
        langCode: title.langCode,
        comments: title.comments,
        alreadyExist: true
      }))
    });
    return formArray;
  }
  addTitle(index) {
    this.spinner.show();
    const payload = this.form.value.studyTitles[index];
    payload.sdSid = this.sdSid;
    delete payload.id;

    this.studyService.addStudyTitle(this.sdSid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Study Title added successfully');
        this.getStudyTitle();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  editTitle(titleObject) {
    const payload = titleObject.value;
    this.spinner.show();
    this.studyService.editStudyTitle(payload.id, payload.sdSid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if(res.statusCode === 200) {
        this.toastr.success('Study Title updated successfully');
        this.getStudyTitle();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  findTitleType(id) {
    const titleTypeArray: any = this.titleType.filter((type: any) => type.id === id);
    return titleTypeArray && titleTypeArray.length ? titleTypeArray[0].name : '';
  }
  emitData() {
    const payload = this.form.value.studyTitles.map(item => {
      if (!item.id) {
        delete item.id;
      }
      if(this.sdSid) {
        item.sdSid = this.sdSid;
      }
      return item;
    })
    this.emitTitle.emit({data: payload, isEmit: false});
  }
  scrollToElement(): void {
    setTimeout(() => {
      const yOffset = -200; 
      const element = document.getElementById('titlepanel'+this.len);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
