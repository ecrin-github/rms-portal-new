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
  // featureTypes: [] = [];
  featureTypes = [{id:20, name:"Phase",context: 'interventional'},{id:21, name :"Primary purpose", context: 'interventional'},{id:22, name:"Allocation type", context: 'interventional'},{id:23, name:"Intervention model", context: 'interventional'},{id:24, name:"Masking", context: 'interventional'},{id:30, name:"Observational model", context: 'observational'},{id:31, name:"Time perspective", context: 'observational'},{id:32, name:"Biospecimens retained", context: 'observational'}];
  // featureValues = [];
  featureValuesAll = [{id:400, name:"Treatment", featureTypeId: 21},{id:205, name:"Randomised", featureTypeId: 22},{id:300, name :"Single group assignment", featureTypeId:23},{id:500, name :"None (Open Label)", featureTypeId:24},{id:600, name:"Cohort", featureTypeId:30},{id:105, name:"Early phase 1", featureTypeId:20},{id:700, name:"Retrospective", featureTypeId:31},{id:800, name :"None retained", featureTypeId:32},{id:502, name:"Blinded (no details)", featureTypeId:24},{id:110, name:"Phase 1", featureTypeId:20},{id:405, name:"Prevention", featureTypeId:21},{id:210, name:"Nonrandomised", featureTypeId:22},{id:305, name:"Parallel assignment", featureTypeId:23},{id:505, name:"Single", featureTypeId:24},{id:605, name:"Case-control", featureTypeId:30},{id:705, name:"Prospective", featureTypeId:31},{id:805, name:"Samples with DNA ", featureTypeId:32},{id:410, name:"Diagnostic", featureTypeId:21},{id:200, name:"Not applicable", featureTypeId:22},{id:310, name:"Crossover assignment", featureTypeId:23},{id:510, name:"Double", featureTypeId: 24},{id:610, name:"Case-only", featureTypeId:30},{id:115, name:"Phase 1/2", featureTypeId:20},{id:710, name:"Cross-sectional", featureTypeId:31},{id:810, name:"Samples without DNA", featureTypeId:32},{id:120, name:"Phase 2", featureTypeId:20},{id:215, name:"Not provided", featureTypeId:22},{id:315, name:"Factorial assignment", featureTypeId:23},{id:515, name:"Triple", featureTypeId:24},{id:615, name:"Case-crossover", featureTypeId:30},{id:815, name:"Not provided", featureTypeId:32},{id:415, name:"Supportive care", featureTypeId:21},{id:725, name:"Retrospective / prospective", featureTypeId:31},{id:420, name:"Screening", featureTypeId:21},{id:320, name:"Sequential assignment", featureTypeId:23},{id:520, name:"Quadruple", featureTypeId:24},{id:125,"name":"Phase 2/3", featureTypeId:20},{id:620, name:"Ecologic or community study", featureTypeId:30},{id:730, name:"Longitudinal", featureTypeId:31},{id:130, name:"Phase 3", featureTypeId:20},{id:325, name:"Not provided", featureTypeId:23},{id:425, name:"Health services research", featureTypeId:21},{id:625, name:"Family-based", featureTypeId:30},{id:599, name:"Not applicable", featureTypeId:24},{id:135, name:"Phase 4", featureTypeId:20},{id:640, name:"Defined population", featureTypeId:30},{id:430, name:"Basic science",featureTypeId:21},{id:100, name:"Not applicable", featureTypeId:20},{id:645, name:"Natural history", featureTypeId:30},{id:435, name:"Device feasibility", featureTypeId:21},{id:140, name:"Not provided", featureTypeId:20},{id:525, name:"Not provided", featureTypeId:24},{id:450, name:"Educational / counselling / training", featureTypeId:21},{id:440, name:"Other", featureTypeId:21},{id:630, name:"Other", featureTypeId:30},{id:715, name:"Other", featureTypeId:31},{id:445, name:"Not provided", featureTypeId:21},{id:635, name:"Not provided", featureTypeId:30},{id:720, name:"Not provided", featureTypeId:31}]
  featureValInter = [];
  featureValObe = [];
  // featureValuesAll: [] = [];
  featureInterventional = [];
  featureObservational = [];
  selectedStudyType: any;
  isBrowsing: boolean = false;
  subscription: Subscription = new Subscription();
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  @Input() sdSid: string;
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

  newStudyFeature(featureTypeId): UntypedFormGroup {
    return this.fb.group({
      id: '',
      sdSid: '',
      featureTypeId: featureTypeId,
      featureValueId: null,
      alreadyExist: false
    });
  }
  getStudyFeature() {
    this.spinner.show();
    const studyFeature$ = this.isBrowsing ? this.studyService.getBrowsingStudyFeatures(this.sdSid) : this.studyService.getStudyFeatures(this.sdSid);
    studyFeature$.subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.studyFeature = res.data.length ? res.data : [];
        if (this.isEdit || this.isView) {
          this.form.value.studyFeatures.map((item1, index) => {
            const arr = this.studyFeature.filter((item:any) => item1.featureTypeId === item.featureTypeId);
            if (arr && arr.length) {
              this.studyFeatures().at(index).patchValue({
                featureValueId: arr[0].featureValueId
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
    const getFeatureType$ =  this.isBrowsing ? this.studyLookupService.getBrowsingFeatureTypes() : this.studyLookupService.getFeatureTypes();
    const getFeatureValue$ = this.isBrowsing ? this.studyLookupService.getBrowsingFeatureValues() : this.studyLookupService.getFeatureValues();
    this.spinner.show();
    const combine$ = combineLatest([getFeatureType$, getFeatureValue$]).subscribe(([featureType, featureValue] : [any, any]) => {
      this.spinner.hide();
      if (featureType.data) {
        // this.featureTypes = featureType.data;
      }
      if (featureValue.data) {
        // this.featureValuesAll = featureValue.data;
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
        this.featureValInter[index] = this.featureValuesAll.filter((item: any) => item.featureTypeId === item1.id);
        this.studyFeatures().push(this.newStudyFeature(item1.id));
      });
    }
    if (this.selectedStudyType === 'observational') {
      this.featureObservational.map((item2, index) => {
        this.featureValObe[index] = this.featureValuesAll.filter((item:any) => item.featureTypeId === item2.id);
        this.studyFeatures().push(this.newStudyFeature(item2.id));
      })
    }
  }
  addFeature() {
    this.spinner.show();
    const payload = JSON.parse(JSON.stringify(this.form.value.studyFeatures)).map(item =>{
      item.sdSid = this.sdSid;
      delete item.id;
      return item;
    });
    console.log('payload ', payload);
    payload.map((item: any) => {
      this.studyService.addStudyFeature(this.sdSid, item).subscribe((res: any) => {
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
    this.studyService.editStudyFeature(payload.id, payload.sdSid, payload).subscribe((res: any) => {
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
      if (this.sdSid) {
        item.sdSid = this.sdSid;
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
