import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Subscription } from 'rxjs';
import { StudyLookupService } from 'src/app/_rms/services/entities/study-lookup/study-lookup.service';
import { StudyService } from 'src/app/_rms/services/entities/study/study.service';

@Component({
  selector: 'app-study-feature',
  templateUrl: './study-feature.component.html',
  styleUrls: ['./study-feature.component.scss']
})
export class StudyFeatureComponent implements OnInit {
  form: UntypedFormGroup;
  featureTypes: [] = [];
  featureValInter = [];
  featureValObe = [];
  featureValuesAll: [] = [];
  featureInterventional = [];
  featureObservational = [];
  selectedStudyType: any;
  isBrowsing: boolean = false;
  subscription: Subscription = new Subscription();
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  @Input() studyId: string;
  @Input() set initiateEmit(initiateEmit: any) {
    if (initiateEmit) {
      this.emitData();
    }
  }
  @Input() set studyType(studyType: any) {
    this.selectedStudyType = studyType;
    console.log(this.selectedStudyType);
    this.studyTypeChange();
  }
  @Output() emitFeature: EventEmitter<any> = new EventEmitter();
  studyFeature = [];
  showAll: boolean = true;
  pageSize: Number = 10000;


  constructor(private fb: UntypedFormBuilder, private router: Router, private studyService: StudyService, private studyLookupService: StudyLookupService, private spinner: NgxSpinnerService, private toastr: ToastrService, private modalService: NgbModal) {
    this.form = this.fb.group({
      studyFeatures: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    this.getFeature();
    if (this.isEdit || this.isView) {
      this.getStudyFeature()
    }
  }

  studyFeatures(): UntypedFormArray {
    return this.form.get('studyFeatures') as UntypedFormArray;
  }

  newStudyFeature(featureType): UntypedFormGroup {
    return this.fb.group({
      id: '',
      studyId: '',
      featureType: featureType,
      featureValue: null,
      alreadyExist: false
    });
  }
  getStudyFeature() {
    this.spinner.show();
    this.studyService.getStudyFeatures(this.studyId).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.studyFeature = res.results.length ? res.results : [];
        if (this.isEdit || this.isView) {
          this.form.value.studyFeatures.map((item1, index) => {
            const arr = this.studyFeature.filter((item:any) => item1.featureType === item.featureType.id);
            if (arr && arr.length) {
              this.studyFeatures().at(index).patchValue({
                featureValue: arr[0].featureValue.id
              })
            }
          })
        }    
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getFeature() {
    const getFeatureType$ =  this.studyLookupService.getFeatureTypes(this.pageSize);
    const getFeatureValue$ = this.studyLookupService.getFeatureValues(this.pageSize);
    this.spinner.show();
    const combine$ = combineLatest([getFeatureType$, getFeatureValue$]).subscribe(([featureType, featureValue] : [any, any]) => {
      this.spinner.hide();
      if (featureType.results) {
        this.featureTypes = featureType.results;
      }
      if (featureValue.results) {
        this.featureValuesAll = featureValue.results;
      }
      this.featureArrayFormation();
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  featureArrayFormation() {
    this.featureInterventional = this.featureTypes.filter((item: any) => item.context === 'interventional');
    this.featureObservational = this.featureTypes.filter((item: any) => item.context === 'observational');
    if (this.form.value.studyFeatures) {
      (this.form.get('studyFeatures') as UntypedFormArray).clear()
    }
    console.log(this.form.get('studyFeatures') as UntypedFormArray);
    if (this.selectedStudyType === 'interventional') {
      this.featureInterventional.map((item1, index) => {
        this.featureValInter[index] = this.featureValuesAll.filter((item: any) => item.featureType.id === item1.id);
        this.studyFeatures().push(this.newStudyFeature(item1.id));
      });
    }
    if (this.selectedStudyType === 'observational') {
      this.featureObservational.map((item2, index) => {
        this.featureValObe[index] = this.featureValuesAll.filter((item:any) => item.featureType.id === item2.id);
        this.studyFeatures().push(this.newStudyFeature(item2.id));
      })
    }
  }
  addFeature() {
    this.spinner.show();
    const payload = JSON.parse(JSON.stringify(this.form.value.studyFeatures)).map(item =>{
      item.studyId = this.studyId;
      delete item.id;
      return item;
    });
    console.log('payload ', payload);
    payload.map((item: any) => {
      this.studyService.addStudyFeature(this.studyId, item).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.toastr.success('Study Feature updated successfully');
        } else {
          this.toastr.error(res.messages[0]);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      });
    })
  }
  editFeature(featureObject) {
    const payload = featureObject.value;
    this.spinner.show();
    this.studyService.editStudyFeature(payload.id, payload.studyId, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Study Feature updated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  findFeatureType(id) {
    const featureTypeArray: any = this.featureTypes.filter((type: any) => type.id === id);
    return featureTypeArray && featureTypeArray.length ? featureTypeArray[0].name : '';
  }
  findFeatureValue(id) {
    const featureValueArray: any = this.featureValuesAll.filter((type: any) => type.id === id);
    return featureValueArray && featureValueArray.length ? featureValueArray[0].name : '';
  }
  emitData() {
    const payload = this.form.value.studyFeatures.map(item => {
      if (!item.id) {
        delete item.id;
      }
      if (this.studyId) {
        item.studyId = this.studyId;
      }
      return item;
    })
    this.emitFeature.emit({ data: payload, isEmit: false });
  }
  studyTypeChange() {
    this.featureArrayFormation();
    this.showAll = this.selectedStudyType === 'interventional' ? true : this.selectedStudyType === 'observational' ? false : true;
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
