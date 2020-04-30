import { trigger, animate, transition, style, query } from '@angular/animations'

export const RouterAnimation = trigger('routerAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({
        position: 'absolute',
        left: 0,
        width: '100%',
        opacity: 0,
        transform: 'scale(0) translateY(100%)'
      })
    ]),
    query(':enter', [
      animate('500ms ease',
        style({ opacity: 1, transform: 'scale(1)' })
    )
  ])
])
