import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterUsersPipe implements PipeTransform {

  transform(value: any, searchValue): any {

    if (!searchValue) {
      return value;
    }

    return value.filter((v) =>
      v.userName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
      v.userIdName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1
    );

  }

}
