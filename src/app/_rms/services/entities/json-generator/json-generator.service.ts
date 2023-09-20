import { Injectable } from '@angular/core';
import {FileSaverService} from 'ngx-filesaver';

@Injectable({
  providedIn: 'root'
})
export class JsonGeneratorService {

  constructor( private fileSaver: FileSaverService) { }

  jsonGenerator(data, type) {
    let filename: string;
    filename = type === 'dtp' ? data.coreDtp.displayName + Date.now() + '.json' : type === 'dup' ? data.coreDup.displayName + Date.now() + '.json' : type === 'study' ? data.coreStudy.displayTitle + Date.now() + '.json' : data.coreObject.displayTitle + Date.now() + '.json';
    const fileType = this.fileSaver.genType(filename);
    const blob = new Blob([JSON.stringify(data)], {type: fileType});
    this.fileSaver.save(blob, filename);
  }
}
