import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({ name: 'values', pure: false })
export class DictionaryToArrayPipe implements PipeTransform {
	transform(value: any, args: any[] = null): any {
		return Object.keys(value).map(key => value[key]);
	}
}
