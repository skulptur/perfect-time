import { ClockEvent, EventCallback } from './clockEvent'
import { beatsToSeconds, secondsToBeats } from 'audio-fns'
import { Ticker } from '../types'
import { createNoopTicker } from './noopTicker'

const defaultOptions = {
  toleranceLate: 0.1,
  toleranceEarly: 0.001,
  tempo: 120,
  ticker: createNoopTicker(),
}

export type ClockOptions = {
  toleranceEarly: number
  toleranceLate: number
  tempo: number
  ticker: Ticker
}

export class Clock {
  public audioContext: AudioContext
  public toleranceEarly: number
  public toleranceLate: number
  public _events: Array<ClockEvent> = []

  private tempo: number = NaN

  public ticker: Ticker
  public _started: boolean = false

  constructor(context: AudioContext, options: Partial<ClockOptions> = {}) {
    this.ticker = options.ticker || defaultOptions.ticker
    this.toleranceEarly = options.toleranceEarly || defaultOptions.toleranceEarly
    this.toleranceLate = options.toleranceLate || defaultOptions.toleranceLate
    this.tempo = options.tempo || defaultOptions.tempo
    this.audioContext = context
  }

  // Schedules `callback` to run after `delay` seconds.
  public setTimeout(delay: number, callback: EventCallback) {
    return this._createEvent(callback, this._absTime(delay))
  }

  // Schedules `callback` to run before `deadline`.
  public atTime(deadline: number, callback: EventCallback) {
    return this._createEvent(callback, deadline)
  }

  // Schedules `callback` to run before `deadline` given in beats.
  public atBeat(deadline: number, callback: EventCallback) {
    return this.atTime(beatsToSeconds(deadline, this.tempo), callback)
  }

  public timeNow() {
    return this.audioContext.currentTime
  }

  public beatNow() {
    return secondsToBeats(this.audioContext.currentTime, this.tempo)
  }

  // Stretches `deadline` and `repeat` of all scheduled `events` by `ratio`, keeping
  // their relative distance to `tRef`. In fact this is equivalent to changing the tempo.
  public timeStretch(
    ratio: number = 1,
    tRef: number = this.audioContext.currentTime,
    events: Array<ClockEvent> = this._events
  ) {
    if (ratio === 1) return
    events.forEach((event) => {
      event.timeStretch(tRef, ratio)
    })
    return events
  }

  public setTempo = (tempo: number) => {
    const ratio = this.tempo / tempo
    this.tempo = tempo
    this.timeStretch(ratio)
  }

  public getTempo = () => {
    return this.tempo
  }

  // Removes all scheduled events and start
  public start() {
    if (this._started) return
    let self = this
    this._started = true
    this._events = []

    this.ticker.start(self._tick.bind(this))
  }

  // Stops the clock
  public stop() {
    if (!this._started) return

    this._started = false

    this.ticker.stop()
  }

  // ---------- Private ---------- //

  // This function is ran periodically, and at each tick it executes
  // events for which `currentTime` is included in their tolerance interval.
  public _tick() {
    let event = this._events.shift()
    const currentTime = this.audioContext.currentTime
    while (event && event._earliestTime! <= currentTime) {
      event._execute()
      event = this._events.shift()
    }

    // Put back the last event
    if (event) this._events.unshift(event)
  }

  // Creates an event and insert it to the list
  public _createEvent(callback: EventCallback, deadline: number) {
    console.log(this.audioContext.currentTime, deadline)
    return new ClockEvent(this, deadline, callback)
  }

  // Inserts an event to the list
  public _insertEvent(event: ClockEvent) {
    this._events.splice(this._indexByTime(event._earliestTime!), 0, event)
  }

  // Removes an event from the list
  public _removeEvent(event: ClockEvent) {
    let ind = this._events.indexOf(event)
    if (ind !== -1) this._events.splice(ind, 1)
  }

  // Returns true if `event` is in queue, false otherwise
  public _hasEvent(event: ClockEvent) {
    return this._events.indexOf(event) !== -1
  }

  // Returns the index of the first event whose deadline is >= to `deadline`
  public _indexByTime(deadline: number) {
    // performs a binary search
    let low = 0,
      high = this._events.length,
      mid
    while (low < high) {
      mid = Math.floor((low + high) / 2)
      if (this._events[mid]._earliestTime! < deadline) low = mid + 1
      else high = mid
    }
    return low
  }

  // Converts from relative time to absolute time
  public _absTime(relTime: number) {
    return relTime + this.audioContext.currentTime
  }

  // Converts from absolute time to relative time
  public _relTime(absTime: number) {
    return absTime - this.audioContext.currentTime
  }
}
