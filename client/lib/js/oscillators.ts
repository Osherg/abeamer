"use strict";
// uuid: 3d515a83-c625-4829-bc61-de6eb79b72cd

// ------------------------------------------------------------------------
// Copyright (c) 2018 Alexandre Bento Freire. All rights reserved.
// Licensed under the MIT License+uuid License. See License.txt for details
// ------------------------------------------------------------------------

/** @module end-user | The lines bellow convey information for the end-user */

/**
 * ## Description
 *
 * An **oscillator** is an optional interpolator that runs `t` from [easing(0), easing(1)]
 * and the usually outputs a value from [-1, 1] where usually
 * f(0) = 0 and f(1) = 0.
 * Its output will be generate `v = valueStart + (value - valueStart) * oscillator(easing(t))`
 * and then will be injected into a path as input.
 *
 * An oscillator has the following usages:
 *
 * 1. A rotational movement, where the oscillator defines the rotation and
 * the easing the defines the speed.
 *
 * 2. Flashing elements, where an element changes its `opacity` or `text-shadow`,
 * and these values oscillate between [0, 1].
 *
 * 3. Uni-dimensional oscillators. Unlike oscillators, the oscillators have their value stored
 * in the Action Link, allowing to link the end value to the next animation.
 *
 * An oscillator if it's used together with an easing will if it's in the same dimension
 * deform the wave and if it's in different dimensions the easing will define
 * the speed of oscillator.
 *
 * The oscillators shares the namespace with [](easings), allowing any easing function
 * to operate also as a oscillator.
 * Since the main function of an oscillator is to return to its original position
 * at the end of the animation cycle, when an easing is used as an oscillator the
 * best is to use the following:
 * ```json
 * { iterationCount: 2,
 *   direction: alternate
 * }
 * ```
 *
 * One type of oscillators are `pulsars`.
 * Pulsars only have energy during a certain amount of time,
 * the rest of the time are motionless.
 *
 *
 * ## Core oscillators
 * **WARNING!** In the ABeamer 2.x these core oscillators will move `core-oscillators` plugin.
 * To prevent breaking changes include now the js script `core-oscillators.js` on the html file.
 *
 *  ABeamer has the following core oscillators:
 *
 * - `harmonic` - it generates a sinusoidal function that repeats it self every
 * duration / cycles.
 * @see gallery/gallery-oscillator
 *
 * - `damped` - it's a sinusoidal function that reduces its amplitude due friction in
 * every cycle.
 * To reduce the user's effort, ABeamer uses cycles parameter to compute the friction.
 *
 * - `pulsar` - outside the range of [midpoint - spread, midpoint + spread]
 * it will return 0, and inside the range will generate a function depending of
 * the parameter `type`:
 *     * `normal` - a bell shape curve. this is the default type.
 *     * `sine` - a sinusoidal function.
 *     * `random` - a random value within [-1, 1].
 *     * `positive-random` - a random value with [0, 1].
 * @see gallery/gallery-pulsar
 */
namespace ABeamer {

  // #generate-group-section
  // ------------------------------------------------------------------------
  //                               Oscillators
  // ------------------------------------------------------------------------

  // The following section contains data for the end-user
  // generated by `gulp build-definition-files`
  // -------------------------------
  // #export-section-start: release


  /**
   * Defines the type of a oscillator function.
   * An oscillator function is an interpolator that runs from [0, 1].
   * Usually outputs a value from [-1, 1] but other values are also possible.
   * An oscillator is mostly used to rotate an element returning to the original position.
   */
  export type OscillatorFunc = (t: number, params: OscillatorParams,
    args?: ABeamerArgs) => number;


  /**
   * Defines the oscillator type, which is either string representing a predefined
   * oscillator function or a custom function (see oscillator function)
   * The oscillator function interpolates from [0, 1].
   */
  export type OscillatorHandler = OscillatorName | number | ExprString
    | OscillatorFunc | EasingFunc;


  /**
   * Defines the Base parameters for every oscillator function.
   * At the moment no parameter is required, but it can change in the future.
   */
  export type OscillatorParams = AnyParams;


  /** List of the built-in oscillators */
  export enum OscillatorName {
    harmonic = 1000,  // lower ids are for easings.
    damped,
    pulsar,
  }


  /** Oscillator parameters defined in an Animation Property. */
  export interface Oscillator {

    /** Defines an Oscillator by Name, Expression or Code Handler */
    handler: OscillatorHandler;


    /** Params passed to the Oscillator. Depends on the Oscillator Type */
    params?: AnyParams
    | HarmonicOscillatorParams
    | DampedOscillatorParams
    | PulsarOscillatorParams
    ;
  }

  /** Function used to define what to do when a value is negative. */
  export type NegativeFunc = (t: number) => number;


  /**
   * List of Negative built-in functions:
   * - `abs` Math.abs
   * - `clip` If v < 0 then v = 0
   */
  export enum NegativeBuiltInFuncs {
    none,
    clip,
    abs,
  }


  /** Params defined inside the props.oscillator.params, when `props.oscillator = 'harmonic'` */
  export interface HarmonicOscillatorParams extends OscillatorParams {
    /**
     * Defines the number of full cycles (positive arc+negative arc)
     * contained during the `duration` period.
     * If `negativeHander = abs`, 1 cycle will have 2 arcs.
     */
    cycles?: number;


    /** Function used to define what to do when a value is negative. */
    negativeHander?: NegativeBuiltInFuncs | string | NegativeFunc;

    /** Allows to shift and scale the input of every oscillator. */
    shift: number;

    // cut: number;
  }


  /** Params defined inside the props.oscillator.params, when `props.oscillator = 'damped'` */
  export interface DampedOscillatorParams {
    frequency?: number;
    /** Defines how much energy the oscillator will lose from one cycle to the next. */
    friction?: number;
    /** Function used to define what to do when a value is negative. */
    negativeHander?: NegativeBuiltInFuncs | string | NegativeFunc;
  }


  /** List of the built-in pulsar type */
  export enum PulsarType {
    normal,
    sine,
    random,
    positiveRandom,
  }


  /** Params defined inside the props.oscillator.params, when `props.oscillator = 'pulsar'` */
  export interface PulsarOscillatorParams {

    /** Type of pulsar defined by ID or string. */
    type?: PulsarType | string;


    /** The point where the pulsar reaches it's maximum value. */
    midpoint?: number;


    /**
     * The amplitude around midpoint where the pulsar begins to receive value.
     * The pulsar starts gaining energy at `midpoint-spread`, reaches the maximum value
     * at `midpoint` and then decreases until reaches zero at `midpoint+spread`.
     */
    spread?: number;
  }

  // #export-section-end: release
  // -------------------------------

  // ------------------------------------------------------------------------
  //                               Implementation
  // ------------------------------------------------------------------------

  export function _oscillatorNumToStr(num: number): string {
    return OscillatorName[num] || _easingNumToStr(num);
  }

  /** Transforms the user `negativeHandler` value into a Code Handler. */
  function _parseNegativeHandler(negativeHander?: NegativeBuiltInFuncs
    | string | NegativeFunc): NegativeFunc {

    if (typeof negativeHander === 'string') {
      negativeHander = NegativeBuiltInFuncs[negativeHander];
    }
    if (typeof negativeHander === 'number') {
      switch (negativeHander) {
        case NegativeBuiltInFuncs.abs: return (t) => Math.abs(t);
        case NegativeBuiltInFuncs.clip: return (t) => Math.abs(t);
      }
    }
    return negativeHander as NegativeFunc;
  }


  // ------------------------------------------------------------------------
  //                               Harmonic Oscillator
  // ------------------------------------------------------------------------

  /** Internal parameters to the Harmonic Oscillator */
  interface _WorkHarmonicOscillatorParams extends HarmonicOscillatorParams {
    _isPrepared: boolean;
    _negativeHandler: NegativeFunc;
    _cycles: number;
    _shift: number;
  }


  _easingFunctions['harmonic'] = _harmonicOscillator;

  /** Implements the Harmonic Oscillator */
  function _harmonicOscillator(t: number,
    params: _WorkHarmonicOscillatorParams): number {

    if (!params._isPrepared) {
      params._cycles = params.cycles || 1;
      params._negativeHandler = _parseNegativeHandler(params.negativeHander);
      params._shift = params.shift || 0;
    }
    const cycles = params._cycles;
    const v = Math.sin(Math.PI * 2 * (t + params._shift) * cycles);
    return params._negativeHandler ? params._negativeHandler(v) : v;
  }

  // ------------------------------------------------------------------------
  //                               Damped Oscillator
  // ------------------------------------------------------------------------

  /** Internal parameters to the Damped Oscillator */
  interface _WorkDampedOscillatorParams extends DampedOscillatorParams {
    _isPrepared: boolean;
    _curFrequency: number;
    _curAmplitude: number;
    _scale: number;
    _shift: number;
    _negativeHandler: NegativeFunc;
  }


  _easingFunctions['damped'] = _dampedOscillator;

  /** Implements the Damped Oscillator */
  function _dampedOscillator(t: number,
    params: _WorkDampedOscillatorParams): number {

    if (!params._isPrepared) {
      params._isPrepared = true;
      params._curFrequency = params.frequency || 0.1;
      params._curAmplitude = 1;
      params._scale = 1 - (params.friction || 0.1);
      params._shift = 0;
      params._negativeHandler = _parseNegativeHandler(params.negativeHander);
    }

    let t1 = t - params._shift;
    if (t1 >= params._curFrequency) {
      params._shift = t;
      params._curFrequency = params._curFrequency * params._scale;
      params._curAmplitude = params._curAmplitude * params._scale;
      t1 = t - params._shift;
    }

    // @TODO: Improve the damped function
    const v = Math.sin(Math.PI * 2 * (t1 / params._curFrequency)) * params._curAmplitude;
    return params._negativeHandler ? params._negativeHandler(v) : v;
  }

  // ------------------------------------------------------------------------
  //                               Pulsar Oscillator
  // ------------------------------------------------------------------------

  /** Internal parameters to the Pulsar Oscillator */
  interface _WorkPulsarOscillatorParams extends PulsarOscillatorParams {
    _isPrepared: boolean;
  }


  _easingFunctions['pulsar'] = _pulsarOscillator;

  /** Implements the Pulsar Oscillator */
  function _pulsarOscillator(t: number,
    params: _WorkPulsarOscillatorParams): number {

    if (!params._isPrepared) {
      params._isPrepared = true;

      params.midpoint = params.midpoint || 0.5;
      params.spread = params.spread || 0.1;
      params.type = params.type || PulsarType.normal;
      if (typeof params.type === 'string') {
        params.type = PulsarType[params.type];
      }
    }

    const midpoint = params.midpoint;
    const spread = params.spread;

    if (t <= midpoint - spread || t >= midpoint + spread) { return 0; }

    const pulsarType = params.type as PulsarType;

    switch (pulsarType) {
      case PulsarType.normal:
        let t1 = (t - (midpoint - spread)) / spread;
        if (t > midpoint) { t1 = 2 - t1; }
        return (Math.exp(t1) - 1) / (Math.E - 1);

      case PulsarType.sine:
        const t2 = (t - (midpoint - spread)) / spread;
        return Math.sin(Math.PI * t2);

      case PulsarType.random:
        return Math.random() * 2 - 1;

      case PulsarType.positiveRandom:
        return Math.random();
    }
  }
}
