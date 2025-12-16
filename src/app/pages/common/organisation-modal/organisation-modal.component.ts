import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-organisation-modal',
  templateUrl: './organisation-modal.component.html',
  styleUrls: ['./organisation-modal.component.scss']
})
export class OrganisationModalComponent implements OnInit {
  id: String = '-1';
  name: String = '';
  city: String = '';
  countryName: String = '';

  constructor(private activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
  }

  onSave() {
    this.activeModal.close({'id': -1, 'defaultName': this.name, "city": this.city, 'countryName': this.countryName});
  }

  closeModal() {
    this.activeModal.close(null);
  }
}
