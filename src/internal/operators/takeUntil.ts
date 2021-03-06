import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

import { MonoTypeOperatorFunction, TeardownLogic } from '../types';

/**
 * Emits the values emitted by the source Observable until a `notifier`
 * Observable emits a value.
 *
 * <span class="informal">Lets values pass until a second Observable,
 * `notifier`, emits a value. Then, it completes.</span>
 *
 * <img src="./img/takeUntil.png" width="100%">
 *
 * `takeUntil` subscribes and begins mirroring the source Observable. It also
 * monitors a second Observable, `notifier` that you provide. If the `notifier`
 * emits a value, the output Observable stops mirroring the source Observable
 * and completes. If the `notifier` doesn't emit any value and completes
 * then `takeUntil` will pass all values.
 *
 * ## Example
 * Tick every second until the first click happens
 * ```javascript
 * const interval = interval(1000);
 * const clicks = fromEvent(document, 'click');
 * const result = interval.pipe(takeUntil(clicks));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link take}
 * @see {@link takeLast}
 * @see {@link takeWhile}
 * @see {@link skip}
 *
 * @param {Observable} notifier The Observable whose first emitted value will
 * cause the output Observable of `takeUntil` to stop emitting values from the
 * source Observable.
 * @return {Observable<T>} An Observable that emits the values from the source
 * Observable until such time as `notifier` emits its first value.
 * @method takeUntil
 * @owner Observable
 */
export function takeUntil<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new TakeUntilOperator(notifier));
}

class TakeUntilOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    const takeUntilSubscriber = new TakeUntilSubscriber(subscriber);
    const notifierSubscription = subscribeToResult(takeUntilSubscriber, this.notifier);
    if (notifierSubscription && !notifierSubscription.closed) {
      takeUntilSubscriber.add(notifierSubscription);
      return source.subscribe(takeUntilSubscriber);
    }
    return takeUntilSubscriber;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TakeUntilSubscriber<T, R> extends OuterSubscriber<T, R> {

  constructor(destination: Subscriber<any>, ) {
    super(destination);
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.complete();
  }

  notifyComplete(): void {
    // noop
  }
}
