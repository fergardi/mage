import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateParser, TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable()
export class PaginatorIntl extends MatPaginatorIntl {

  private rangeLabelIntl: string;

  constructor(
    private translateService: TranslateService,
    private translateParser: TranslateParser,
  ) {
    super();
    this.translateService.onLangChange.subscribe((e: Event) => this.getTranslations());
    this.getTranslations();
  }

  getTranslations() {
    this.translateService.get([
      'paginator.itemsPerPageLabel',
      'paginator.nextPageLabel',
      'paginator.previousPageLabel',
      'paginator.firstPageLabel',
      'paginator.lastPageLabel',
      'paginator.rangeLabelIntl',
    ]).subscribe((translation: any) => {
      this.itemsPerPageLabel = translation['paginator.itemsPerPageLabel'];
      this.nextPageLabel = translation['paginator.nextPageLabel'];
      this.previousPageLabel = translation['paginator.previousPageLabel'];
      this.firstPageLabel = translation['paginator.firstPageLabel'];
      this.lastPageLabel = translation['paginator.lastPageLabel'];
      this.rangeLabelIntl = translation['paginator.rangeLabelIntl'];
      this.changes.next();
    });
  }

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    const total = Math.max(length, 0);
    const start = page * pageSize;
    const end = start < length
      ? Math.min(start + pageSize, length)
      : start + pageSize;
    return this.translateParser.interpolate(this.rangeLabelIntl, { start: start, end: end, length: total });
  }

}
