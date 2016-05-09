import { Pipe } from '@angular/core';

@Pipe({ name: 'reverse', pure: false })
export class ReverseArrayPipe {
	transform(value: any): any {
		return value.slice().reverse();
	}
}
