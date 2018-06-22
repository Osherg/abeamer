"use strict";
// uuid: ce496037-5728-4543-b2b1-f8a9aaa3d0f0

// ------------------------------------------------------------------------
// Copyright (c) 2018 Alexandre Bento Freire. All rights reserved.
// Licensed under the MIT License+uuid License. See License.txt for details
// ------------------------------------------------------------------------

// Implements a list of built-in chart Tasks

/** @module end-user | The lines bellow convey information for the end-user */

/**
 * ## Description
 *
 * A **chart task** task creates an animated chart.
 *
 * **WARN** This plugin is still in alpha stage, parts of API can change in the future.
 * It's still missing labelsX and legends and many internal parts.
 * It will be improved soon.
 *
 * This plugin has the following built-in charts:
 *
 * - `pie`.
 * - `bar`.
 * - `area`.
 * - `line`.
 * - `marker`.
 * - `mixed`- Draws different types of chars in the same chart, uses
 *   `chartTypes` parameter to determine the type of each chart per series.
 *
 * read the details on `AxisChartTaskParams`.
 */
namespace ABeamer {

  // #generate-group-section
  // ------------------------------------------------------------------------
  //                               Shape Tasks
  // ------------------------------------------------------------------------

  // The following section contains data for the end-user
  // generated by `gulp build-definition-files`
  // -------------------------------
  // #export-section-start: release

  export enum ChartTypes {
    pie,
    bar,
    area,
    line,
    marker,
    mixed,
  }

  export type ChartTaskName = 'chart';

  export type SeriesData = number[];


  export interface BaseChartTaskParams extends AnyParams {
    chartType?: ChartTypes | string;
    data: SeriesData[];
    animeSelector?: string;

    // title
    title?: string | ExprString | ChartTitle;

    // colors
    fillColors?: string | string[] | string[][];
    strokeColors?: string | string[] | string[][];
    strokeWidth?: uint | uint[] | uint[][];
  }


  export enum ChartCaptionOrientation {
    horizontal,
    vertical,
  }


  export enum ChartCaptionPosition {
    top,
    bottom,
    left,
    right,
  }


  export enum ChartCaptionAlignment {
    left,
    center,
    right,
  }


  export interface ChartCaptions {
    fontColor?: string | ExprString;
    fontFamily?: string | ExprString;
    fontSize?: uint | ExprString;
    alignment?: ChartCaptionAlignment | string;
    marginBefore?: uint | ExprString;
    marginAfter?: uint | ExprString;
  }


  export interface ChartLabels extends ChartCaptions {
    captions?: string[] | ExprString;
  }


  export type ChartLabelsX = ChartLabels;


  export interface ChartLabelsY extends ChartLabels {
    tickCount?: uint;
  }


  export enum ChartPointShape {
    circle,
    square,
    diamond,
  }


  export interface ChartMarkers {
    visible?: boolean | boolean[] | boolean[][];
    shape?: (ChartPointShape | string) | (ChartPointShape | string)[]
    | (ChartPointShape | string)[][];
    size?: uint | uint[] | uint[][];
    color?: string | string[] | string[][];
  }


  export interface ChartLine {
    visible?: boolean;
    color?: string | ExprString;
    width?: number | ExprString;
  }


  export interface ChartTitle extends ChartCaptions {
    caption: string | ExprString;
  }


  export interface PieChartTaskParams extends BaseChartTaskParams {
    angleStart?: number | ExprString;
    dispersionStart?: number | ExprString;
    isClockwise?: boolean;
  }


  export interface AxisChartTaskParams extends BaseChartTaskParams {

    /** Chart Type per series. Use only if charType is `mixed`. */
    charTypes?: (ChartTypes | string)[];

    // labels X
    labelsX?: ChartLabelsX | ExprString;

    // labels Y
    labelsY?: ChartLabelsY | ExprString;

    // markers
    markers?: ChartMarkers;

    // columns
    colWidth?: uint | ExprString;
    colMaxHeight?: uint | ExprString;
    colSpacing?: uint | ExprString;
    colInterSpacing?: uint | ExprString;

    // colors
    negativeFillColors?: string | string[] | string[][];
    xAxis?: ChartLine;
    yAxis?: ChartLine;
    y0Line?: ChartLine;

    // limits
    maxValue?: number | ExprString;
    minValue?: number | ExprString;

    // animation
    colHeightStart?: number | ExprString;
    deviationStart?: number | ExprString;
    sweepStart?: number | ExprString;
  }

  // #export-section-end: release
  // -------------------------------

  // ------------------------------------------------------------------------
  //                               Implementation
  // ------------------------------------------------------------------------

  pluginManager.addPlugin({
    id: 'abeamer.chart-tasks',
    uuid: '73631f28-df71-4b4d-88e1-c99a858e0fd3',
    author: 'Alexandre Bento Freire',
    email: 'abeamer@a-bentofreire.com',
    jsUrls: ['plugins/chart-tasks/chart-tasks.js'],
    teleportable: true,
  });


  function _maxOfArrayArray(data: number[][], startValue: number): number {
    data.forEach(series => {
      series.forEach(point => {
        startValue = Math.max(startValue, point);
      });
    });
    return startValue;
  }

  // ------------------------------------------------------------------------
  //                               _ChartVirtualAnimator
  // ------------------------------------------------------------------------

  class _ChartVirtualAnimator implements VirtualAnimator {

    charts: _WkChart[] = [];
    params: BaseChartTaskParams;
    props: AnyParams = {};
    selector: string;


    getProp(name: PropName): PropValue {
      return this.props[name];
    }


    setProp(name: PropName, value: PropValue, args?: ABeamerArgs): void {
      this.props[name] = value;
      if (name !== 'uid') {
        this.charts.forEach(chart => {
          chart._drawChart(this.params);
        });
      }
    }
  }

  // ------------------------------------------------------------------------
  //                               Captions
  // ------------------------------------------------------------------------

  interface _WkChartCaptions {
    fontColor?: string;
    fontFamily?: string;
    fontSize?: uint;
    marginBefore?: uint;
    marginAfter?: uint;
    alignment?: ChartCaptionAlignment;
    orientation?: uint;
    position?: uint;
    width?: uint;
    height?: uint;
    x?: uint;
    y?: uint;
  }


  function _setUpCaptionsFont(l: _WkChartCaptions,
    ctx: CanvasRenderingContext2D): void {

    ctx.font = `${l.fontSize}px ${l.fontFamily}`;
    ctx.fillStyle = l.fontColor;
    ctx.textBaseline = 'bottom';
  }

  // ------------------------------------------------------------------------
  //                               Labels
  // ------------------------------------------------------------------------

  interface _WkChartLabels extends _WkChartCaptions {
    captions?: string[];
  }


  export let testDiv: HTMLDivElement;

  function _alignCaptions(l: _WkChartCaptions, ctx: CanvasRenderingContext2D,
    text: string, width: uint): uint {

    if (l.alignment === ChartCaptionAlignment.left) {
      return 0;
    }
    // let style: CSSStyleDeclaration;
    // if (!testDiv) {
    //   testDiv = document.createElement('div');
    //   style = testDiv.style;
    //   style.position = 'absolute';
    //   style.top = '0px';
    //   style.left = '0px';
    //   style.width = '1px';
    //   style.height = '0px';
    //   document.body.appendChild(testDiv);
    // }

    // style = testDiv.style;
    // style.display = 'inline-block';
    // style.fontFamily = l.fontFamily;
    // style.fontSize = l.fontSize + 'px';
    // testDiv.textContent = text;

    // style.display = 'none';

    // @TODO: Implement a better way to compute the height
    const sz = ctx.measureText(text);
    switch (l.alignment) {
      case ChartCaptionAlignment.center:
        return (width - sz.width) / 2;
      case ChartCaptionAlignment.right:
        return (width - sz.width);
    }
    return 0;
  }

  // ------------------------------------------------------------------------
  //                               Line
  // ------------------------------------------------------------------------

  interface _WkChartLine {
    visible: boolean;
    color: string;
    width: number;
  }

  // ------------------------------------------------------------------------
  //                               Points
  // ------------------------------------------------------------------------

  interface _WkChartTitle extends _WkChartCaptions {
    caption?: string;
  }

  // ------------------------------------------------------------------------
  //                               Points
  // ------------------------------------------------------------------------

  interface _WkChartMarkers {
    visible?: boolean[][];
    shape?: ChartPointShape[][];
    size?: uint[][];
    color?: string[][];
  }

  // ------------------------------------------------------------------------
  //                               _WkChart
  // ------------------------------------------------------------------------

  abstract class _WkChart {

    protected props: AnyParams;
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;
    protected chartWidth: uint;
    protected chartHeight: uint;

    protected chartType: ChartTypes;
    protected min: number;
    protected max: number;
    protected sum: number;
    protected avg: number;
    protected seriesLen: uint;
    protected data: SeriesData[];

    protected animator: _ChartVirtualAnimator;

    // title
    protected title: _WkChartTitle = {};

    // colors
    fillColors: string[][];
    strokeColors: string[][];
    strokeWidth: uint[][];

    // overflow
    overflow: uint = 0;

    // graph  (x0, y0) = (left, bottom)
    graphX0: uint = 0;
    graphY0: uint;
    graphX1: uint;
    graphY1: uint = 0;

    constructor(protected args: ABeamerArgs) { }

    _drawChart(params: BaseChartTaskParams): void { }


    protected _fillArrayArrayParam<TI, TO>(param: TI | TI[] | TI[][],
      defValue: TI, strMapper?: any): TO[][] {

      const res: TO[][] = [];

      if (param === undefined) {
        param = defValue;
      }

      const isParamArray = Array.isArray(param);
      if (!isParamArray && strMapper && typeof param === 'string') {
        param = strMapper[param];
      }

      this.data.forEach((series, seriesI) => {
        let resItem = [];
        if (!isParamArray) {
          resItem = series.map(v => param);
        } else {

          let subParam = param[seriesI];
          const isSubParamArray = Array.isArray(subParam);
          if (!isSubParamArray && strMapper && typeof subParam === 'string') {
            subParam = strMapper[subParam];
          }

          if (!isSubParamArray) {
            resItem = series.map(v => subParam);
          } else {
            resItem = series.map((v, i) => {
              let itemParam = subParam[i];
              if (strMapper && typeof itemParam === 'string') {
                itemParam = strMapper[itemParam];
              }
              return itemParam;
            });
          }
        }
        res.push(resItem);
      });
      return res;
    }


    _initChart(params: BaseChartTaskParams): void {
      // colors

      this.fillColors = this._fillArrayArrayParam<string, string>(params.fillColors,
        'white');
      this.strokeColors = this._fillArrayArrayParam<string, string>(params.strokeColors,
        'black');
      this.strokeWidth = this._fillArrayArrayParam<uint, uint>(params.strokeWidth,
        1);

      this.overflow = _maxOfArrayArray(this.strokeWidth, this.overflow);

      this.graphX1 = this.chartWidth;
      this.graphY0 = this.chartHeight;
      this._initTitle(params);
    }


    _init(elAdapter: ElementAdapter, chartType: ChartTypes,
      animator: _ChartVirtualAnimator | undefined): void {

      this.canvas = elAdapter.getProp('element', this.args) as any;
      if (!this.canvas) {
        throwErr(`Didn't find the ${elAdapter.getId()}`);
      }

      this.context = this.canvas.getContext('2d');
      this.chartWidth = this.canvas.width;
      this.chartHeight = this.canvas.height;
      this.chartType = chartType;
      this.animator = animator;
      this.props = animator ? animator.props : {};
    }


    _initData(data: SeriesData[]): void {
      let max = -Number.MIN_VALUE;
      let min = Number.MAX_VALUE;
      let sum = 0;
      const firstSeriesLen = data[0].length;
      data.forEach(series => {
        if (series.length !== firstSeriesLen) {
          throwErr(`Every Series must have the same length`);
        }
        series.forEach(point => {
          max = Math.max(max, point);
          min = Math.min(min, point);
          sum += point;
        });
      });

      this.min = min;
      this.max = max;
      this.sum = sum;
      this.avg = (max - min) / 2;
      this.seriesLen = firstSeriesLen;
      this.data = data;
    }


    protected _initCaptions(defPosition: ChartCaptionPosition,
      defAlignment: ChartCaptionAlignment, captions: string[],
      labThis: ChartLabels, labOther: ChartLabels): _WkChartCaptions {

      const res: _WkChartCaptions = {
        fontColor: ExprOrStrToStr(labThis.fontColor || labOther.fontColor,
          'black', this.args),
        fontFamily: ExprOrStrToStr(labThis.fontFamily || labOther.fontFamily,
          'sans-serif', this.args),
        fontSize: ExprOrNumToNum(labThis.fontSize || labOther.fontSize,
          12, this.args),
        alignment: parseEnum(labThis.alignment, ChartCaptionAlignment, defAlignment),
        marginBefore: ExprOrNumToNum(labThis.marginBefore, 0, this.args),
        marginAfter: ExprOrNumToNum(labThis.marginAfter, 0, this.args),
        position: defPosition,
        orientation: ChartCaptionOrientation.horizontal,
      };

      _setUpCaptionsFont(res, this.context);
      const isHorizontal = res.position === ChartCaptionPosition.top ||
        res.position === ChartCaptionPosition.bottom;

      if (isHorizontal) {
        const joinedText = captions.join(' ');
        const sz = this.context.measureText(joinedText);
        res.width = sz.width;
      } else {
        res.width = 0;
        captions.forEach(caption => {
          res.width = Math.max(res.width, this.context.measureText(caption).width);
        });
      }
      res.height = res.fontSize * 1.2;

      let d: uint;
      switch (res.position) {
        case ChartCaptionPosition.top:
          res.y = this.graphY1 + res.height + res.marginBefore;
          d = res.height + res.marginBefore + res.marginAfter;
          this.graphY1 += d;
          break;

        case ChartCaptionPosition.left:
          res.x = this.graphX0 + res.marginBefore;
          d = res.width + res.marginBefore + res.marginAfter;
          this.graphX0 += d;
          break;

        case ChartCaptionPosition.bottom:
          res.y = this.graphY0 - res.marginAfter;
          d = res.height + res.marginBefore + res.marginAfter;
          this.graphY0 -= d;
          break;
      }
      return res;
    }


    protected _initTitle(params: AxisChartTaskParams) {
      let title = params.title || {} as ChartTitle;
      if (typeof title === 'string') {
        title = {
          caption: title as string,
        };
      }

      if (title.caption) {
        this.title = this._initCaptions(ChartCaptionPosition.top,
          ChartCaptionAlignment.center, [title.caption], title, title);
        this.title.caption = ExprOrStrToStr(title.caption, '', this.args);
      }
    }
  }

  // ------------------------------------------------------------------------
  //                               calcBestMax
  // ------------------------------------------------------------------------

  function _calcBestMax(v) {
    const vAbs = Math.abs(v);
    const isNegative = v < 0;
    const l10v = Math.log10(vAbs);
    const l10vf = Math.floor(l10v);
    const vBase = 10 ** l10vf;
    const vSubDigits = vAbs % vBase;
    if (Math.abs(vSubDigits) > 0.00001) {
      const vLow = vAbs - vSubDigits;
      const vHigh = (isNegative ? -vLow + vBase : vLow + vBase);
      return vHigh;
      // console.log(v, l10v, l10vf, vSubDigits, vLow, vHigh);
    } else {
      return v;
      // console.log(v);
    }
  }

  // ------------------------------------------------------------------------
  //                               Axis Chart
  // ------------------------------------------------------------------------

  class _WkAxisChart extends _WkChart {

    /** Chart Type per series. Use only if charType is `mixed`. */
    chartTypes: ChartTypes[];

    // axis
    xAxis: _WkChartLine;
    yAxis: _WkChartLine;
    y0Line: _WkChartLine;

    // labels X
    labelsX: _WkChartLabels;

    // labels Y
    labelsY: _WkChartLabels;

    // points
    markers: _WkChartMarkers;
    hasMarkers: boolean;

    // bar chart
    barWidth: uint;
    barMaxHeight: uint;
    barSpacing: uint;
    barSeriesSpacing: uint;

    // colors
    negativeFillColors: string[][];

    // limits
    maxValue: number;
    bestMaxValue: number;
    minValue: number;
    avgValue: number;


    protected _initLabels(params: AxisChartTaskParams): void {

      function ExprStrToLabels(l: ChartLabels | ExprString): ChartLabels {
        switch (typeof l) {
          case 'undefined': return {};
          case 'string': return { captions: l as string };
          default:
            return l as ChartLabels;
        }
      }

      const labelsX: ChartLabelsX = ExprStrToLabels(params.labelsX);
      const labelsY: ChartLabelsY = ExprStrToLabels(params.labelsY);
      let captions;

      // labels X
      captions = labelsX.captions;
      if (captions) {
        this.labelsX = this._initCaptions(ChartCaptionPosition.bottom,
          ChartCaptionAlignment.center, captions, labelsX, labelsY);
        this.labelsX.captions = captions;
      }

      // labels Y
      captions = labelsY.captions;
      if (labelsY.tickCount !== 0 || labelsY.captions) {
        const strCaption = labelsY.captions;
        if (!strCaption || !Array.isArray(strCaption)) {
          const isCaptionsExpr = isExpr(strCaption as string);
          const tickCount = labelsY.tickCount || 6;
          const newCaptions = [];
          const min = this.minValue;
          const delta = (this.maxValue - min) / (tickCount - 1);
          for (let i = 0; i < tickCount; i++) {
            const v = min + i * delta;
            if (isCaptionsExpr) {
              this.args.vars['v'] = v;
              const v1 = calcExpr(strCaption as string, this.args);
              newCaptions.push(v1.toString());
            } else {
              newCaptions.push(v.toString());
            }
          }
          captions = newCaptions;
        }

        this.labelsY = this._initCaptions(ChartCaptionPosition.left,
          ChartCaptionAlignment.right, captions, labelsY, labelsX);
        this.labelsY.captions = captions;
      }
    }


    protected _initLine(line: ChartLine): _WkChartLine {

      return {
        visible: line.visible !== undefined ? line.visible : true,
        color: ExprOrStrToStr(line.color, '#7c7c7c', this.args),
        width: ExprOrNumToNum(line.width, 1, this.args),
      };
    }


    protected _initMarkers(params: AxisChartTaskParams): void {
      const markers: _WkChartMarkers = {};
      this.hasMarkers = params.markers !== undefined || this.chartTypes
        .findIndex(cType => cType === ChartTypes.marker) !== -1;

      const pMarkers = params.markers || {};

      if (this.hasMarkers) {
        markers.visible = this._fillArrayArrayParam<boolean, boolean>(
          pMarkers.visible, this.chartType === ChartTypes.marker);
        markers.shape = this._fillArrayArrayParam<ChartPointShape | string, ChartPointShape>(
          pMarkers.shape, ChartPointShape.square, ChartPointShape);
        markers.size = this._fillArrayArrayParam<uint, uint>(
          pMarkers.size, 5);
        markers.color = this._fillArrayArrayParam<string, string>(
          pMarkers.color, 'black');

        this.overflow = _maxOfArrayArray(markers.size, this.overflow);
      }
      this.markers = markers;
    }


    protected _drawMarkers(dataPixels: int[][][]): void {
      const points = this.markers;
      const ctx = this.context;

      this.data.forEach((series, seriesI) => {
        for (let i = 0; i < series.length; i++) {
          if (points.visible[seriesI][i]) {
            ctx.fillStyle = points.color[seriesI][i];
            const size = points.size[seriesI][i];
            const sizeDiv2 = size / 2;
            const [x, y] = dataPixels[seriesI][i];

            switch (points.shape[seriesI][i]) {
              case ChartPointShape.circle:
                ctx.beginPath();
                ctx.arc(x, y, sizeDiv2, 0, Math.PI * 2);
                ctx.fill();
                break;

              case ChartPointShape.diamond:
                ctx.beginPath();
                ctx.moveTo(x - sizeDiv2, y);
                ctx.lineTo(x, y - sizeDiv2);
                ctx.lineTo(x + sizeDiv2, y);
                ctx.lineTo(x, y + sizeDiv2);
                ctx.fill();
                break;

              case ChartPointShape.square:
                ctx.fillRect(x - sizeDiv2, y - sizeDiv2, sizeDiv2, sizeDiv2);
                break;
            }
          }
        }
      });
    }


    protected _drawLine(line: _WkChartLine,
      x0: uint, y0: uint, x1: uint, y1: uint): void {

      const ctx = this.context;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }


    protected _computeBestValues(): void {
      this.bestMaxValue = _calcBestMax(this.max);
    }


    /** Initializes all the Axis Chart parameters. */
    _initChart(params: AxisChartTaskParams): void {

      this.chartTypes = this.data.map((series, seriesIndex) => {
        if (this.chartType !== ChartTypes.mixed) {
          return this.chartType;
        }

        if (!params.charTypes || params.charTypes.length <= seriesIndex) {
          return ChartTypes.bar;
        }

        return parseEnum(params.charTypes[seriesIndex], ChartTypes, ChartTypes.bar);
      });

      // axis
      this.xAxis = this._initLine(params.xAxis || {});
      this.yAxis = this._initLine(params.yAxis || {});
      this.y0Line = this._initLine(params.y0Line || {});

      // bar chart
      this.barWidth = ExprOrNumToNum(params.colWidth, 20, this.args);
      this.barMaxHeight = ExprOrNumToNum(params.colMaxHeight, 100, this.args);
      this.barSpacing = ExprOrNumToNum(params.colSpacing, 5, this.args);
      this.barSeriesSpacing = ExprOrNumToNum(params.colInterSpacing, 0, this.args);

      // limits
      this._computeBestValues();
      this.maxValue = ExprOrNumToNum(params.maxValue, this.bestMaxValue, this.args);
      this.minValue = ExprOrNumToNum(params.minValue, Math.min(this.min, 0), this.args);
      this.avgValue = this.avg;

      super._initChart(params);

      // colors
      this.negativeFillColors = !params.negativeFillColors ? this.fillColors :
        this._fillArrayArrayParam<string, string>(params.negativeFillColors, 'white');

      this._initMarkers(params);
      this._initLabels(params);

      // animation
      this.props['col-height'] = ExprOrNumToNum(params.colHeightStart, 1, this.args);
      this.props['deviation'] = ExprOrNumToNum(params.deviationStart, 1, this.args);
      this.props['sweep'] = ExprOrNumToNum(params.sweepStart, 1, this.args);
    }


    /** Implements Axis Chart animation. */
    _drawChart(params: AxisChartTaskParams): void {

      const barHeightV = this.props['col-height'];
      const deviationV = this.props['deviation'];
      const sweepV = this.props['sweep'];

      const chartWidth = this.chartWidth;
      const chartHeight = this.chartHeight;
      const ctx = this.context;
      const overflow = this.overflow;
      const x0 = this.graphX0;
      const y0 = this.graphY0;
      const y1 = this.graphY1;
      const topMargin = 1;
      const yLength = y0 - y1 - topMargin;

      // bar
      const barWidth = this.barWidth;
      const barSpacing = this.barSpacing;
      const barSeriesSpacing = this.barSeriesSpacing;

      // values
      const maxValue = this.maxValue;
      const minValue = this.minValue;
      const valueRange = maxValue - minValue;

      // y0 line
      const hasY0Line = maxValue * minValue < 0;
      const vy0Line = hasY0Line ? 0 : minValue >= 0 ? minValue : maxValue;
      const vy0LineClip = (vy0Line - minValue) / valueRange;
      const axis0Y = y0 - yLength * vy0LineClip;

      // data
      const data = this.data;
      const seriesLen = this.seriesLen;

      const maxSeriesLen = sweepV >= 1 ? seriesLen :
        Math.max(Math.min(Math.floor(seriesLen * sweepV) + 1, seriesLen), 0);

      // computes x-shift created by side-by-side bars.
      // only bar charts cause a x-shift.
      const xShiftPerSeries = [];
      let xShift = 0;

      data.forEach((series, seriesI) => {
        if (this.chartTypes[seriesI] === ChartTypes.bar) {
          if (xShift) {
            xShift += barSeriesSpacing;
          }
          xShiftPerSeries.push(xShift);
          xShift += barWidth;
        } else {
          xShiftPerSeries.push(0);
        }
      });
      if (!xShift) {
        xShift += barWidth;
      }
      const dataWidths = xShift + barSpacing;
      // the last bar doesn't needs barSpacing
      const totalWidth = dataWidths * seriesLen - barSpacing;
      const x1 = x0 + totalWidth;

      ctx.clearRect(0, 0, chartWidth, chartHeight);

      const y = axis0Y;
      const dataMidPixels: int[][][] = [];
      // data points
      data.forEach((series, seriesI) => {

        let xPrev: int;
        let yPrev: int;
        const seriesPixels: int[][] = [];
        const seriesMidPixels: int[][] = [];

        const chartType = this.chartTypes[seriesI];

        for (let i = 0; i < maxSeriesLen; i++) {

          ctx.lineWidth = this.strokeWidth[seriesI][i];
          ctx.strokeStyle = this.strokeColors[seriesI][i];

          let v = series[i];
          if (Math.abs(deviationV - 1) > 1e-6) {
            v = this.avgValue - ((this.avgValue - v) * deviationV);
          }

          ctx.fillStyle = v >= 0 ? this.fillColors[seriesI][i] :
            this.negativeFillColors[seriesI][i];

          const x = x0 + dataWidths * i + xShiftPerSeries[seriesI];
          const vClip = (v - vy0Line) / valueRange;
          const vT = vClip * barHeightV;
          const yLen = -yLength * vT;
          const xLen = dataWidths / 2;

          let xNew = xLen + x;
          let yNew = yLen + y;

          if ((i === maxSeriesLen - 1) && (sweepV < 1)) {
            const leftSweep = (sweepV - i / seriesLen);
            const reSweep = leftSweep / (1 / seriesLen);
            xNew = ((xNew - xPrev) * reSweep) + xPrev;
            yNew = ((yNew - yPrev) * reSweep) + yPrev;
          }

          let xMidNew = xNew;
          const yMidNew = yNew;

          switch (chartType) {
            case ChartTypes.bar:
              ctx.fillRect(x, y, barWidth, yLen);
              ctx.strokeRect(x, y, barWidth, yLen);
              xMidNew = x + barWidth / 2;
              break;

            case ChartTypes.line:
              if (i) {
                ctx.beginPath();
                ctx.moveTo(xPrev, yPrev);
                ctx.lineTo(xNew, yNew);
                ctx.stroke();
              }
              break;
          }

          xPrev = xNew;
          yPrev = yNew;
          seriesPixels.push([xNew, yNew]);
          seriesMidPixels.push([xMidNew, yMidNew]);
        }

        if (chartType === ChartTypes.area) {
          ctx.beginPath();
          ctx.moveTo(seriesPixels[0][0], y);
          seriesPixels.forEach(point => {
            ctx.lineTo(point[0], point[1]);
          });
          ctx.lineTo(seriesPixels[seriesPixels.length - 1][0], y);
          ctx.lineTo(seriesPixels[0][0], y);
          ctx.fill();
          ctx.stroke();
        }

        dataMidPixels.push(seriesMidPixels);
      });

      ctx.lineWidth = 1;

      // markers
      if (this.hasMarkers) {
        this._drawMarkers(dataMidPixels);
      }

      // titles
      const titleCaption = this.title.caption;
      if (this.title.caption) {
        _setUpCaptionsFont(this.title, ctx);
        const titleXPos = _alignCaptions(this.title, ctx,
          titleCaption, x1 - this.graphX0);
        ctx.fillText(titleCaption, this.graphX0 + titleXPos, this.title.y);
      }

      let captions: string[];
      // labelsX
      if (this.labelsX) {
        _setUpCaptionsFont(this.labelsX, ctx);
        captions = this.labelsX.captions;
        for (let i = 0; i < captions.length; i++) {
          const x = x0 + dataWidths * i;
          const text = captions[i];
          const deltaX = _alignCaptions(this.labelsX, ctx, text, xShift);
          ctx.fillText(text, x + deltaX, this.labelsX.y);
        }
      }

      // labelsY
      if (this.labelsY) {
        _setUpCaptionsFont(this.labelsY, ctx);
        captions = this.labelsY.captions;
        const fs2 = this.labelsY.height / 2;
        const scale = yLength / (captions.length - 1);
        for (let i = 0; i < captions.length; i++) {
          const yi = y0 - scale * i;
          const text = this.labelsY.captions[i];
          const deltaX = _alignCaptions(this.labelsY, ctx, text, this.labelsY.width);
          ctx.fillText(text, this.labelsY.x + deltaX, yi + fs2);
        }
      }

      // y0Line
      if (hasY0Line && this.y0Line.visible) {
        this._drawLine(this.y0Line, x0, axis0Y, x1, axis0Y);
      }

      // x-axis
      if (this.xAxis.visible) {
        this._drawLine(this.xAxis, x0, y0, x1, y0);
      }

      // y-axis
      if (this.yAxis.visible) {
        this._drawLine(this.yAxis, x0, y0, x0, y0 - yLength);
      }
    }
  }

  // ------------------------------------------------------------------------
  //                               Pie Chart
  // ------------------------------------------------------------------------

  class _WkPieChart extends _WkChart {

    _initChart(params: PieChartTaskParams): void {
      super._initChart(params);
      // animation
      this.props['angle'] = ExprOrNumToNum(params.angleStart, 0, this.args);
      this.props['dispersion'] = ExprOrNumToNum(params.dispersionStart, 1, this.args);
    }


    _drawChart(params: PieChartTaskParams): void {

      const angle = this.props['angle'];
      const dispersion = this.props['dispersion'];
      const isClockwise = params.isClockwise !== false;

      super._drawChart(params);
      const overflow = this.overflow;
      const x0 = this.graphX0 + overflow;
      const y1 = this.graphY1 + overflow;
      const diameter = Math.min(this.graphX1 - x0 - overflow, this.graphY0 - y1 - overflow);
      const radius = diameter / 2;
      const ctx = this.context;

      this.data.forEach((series, seriesI) => {

        for (let stage = 0; stage < 2; stage++) {
          let startAngle = angle;
          for (let i = 0; i < series.length; i++) {
            ctx.lineWidth = this.strokeWidth[seriesI][i];
            ctx.strokeStyle = this.strokeColors[seriesI][i];
            ctx.fillStyle = this.fillColors[seriesI][i];

            const point = series[i];
            const percentage = point / this.sum;
            let endAngle = (percentage * Math.PI * 2 * dispersion);
            if (!isClockwise) { endAngle = -endAngle; }
            endAngle += startAngle;

            ctx.beginPath();
            ctx.moveTo(x0 + radius, y1 + radius);
            ctx.arc(x0 + radius, y1 + radius, radius, startAngle, endAngle);
            ctx.closePath();
            if (stage === 0) {
              ctx.fill();
            } else {
              ctx.stroke();
            }
            startAngle = endAngle;
          }
        }
      });
    }
  }

  // ------------------------------------------------------------------------
  //                               Chart Task
  // ------------------------------------------------------------------------

  pluginManager.addTasks([['chart', _chartTask]]);


  /** Implements the Chart Task */
  function _chartTask(anime: Animation, wkTask: WorkTask,
    params: BaseChartTaskParams, stage: uint, args: ABeamerArgs): TaskResult {

    switch (stage) {
      case TS_INIT:
        let cType = params.chartType;
        if (typeof cType === 'string') {
          cType = ChartTypes[cType] as ChartTypes;
        }

        const data = params.data;
        if (!data.length) {
          throwErr(`Series have empty data`);
        }

        let animator: _ChartVirtualAnimator;

        if (params.animeSelector) {
          animator = new _ChartVirtualAnimator();
          animator.selector = params.animeSelector;
          animator.params = params;
          args.story.virtualAnimators.push(animator);
        }

        const elAdapters = args.scene.getElementAdapters(anime.selector);
        args.vars.elCount = elAdapters.length;
        elAdapters.forEach((elAdapter, elIndex) => {

          args.vars.elIndex = elIndex;

          let chart: _WkChart;

          switch (cType) {
            case ChartTypes.pie:
              chart = new _WkPieChart(args);
              break;

            case ChartTypes.marker:
            case ChartTypes.bar:
            case ChartTypes.line:
            case ChartTypes.area:
            case ChartTypes.mixed:
              chart = new _WkAxisChart(args);
              break;
            default:
              throwI8n(Msgs.UnknownType, { p: params.chartType });
          }

          chart._init(elAdapter, cType as ChartTypes, animator);
          chart._initData(data);
          chart._initChart(params);
          chart._drawChart(params);

          if (animator) { animator.charts.push(chart); }
        });
        break;
    }
    return TR_EXIT;
  }

  // ------------------------------------------------------------------------
  //                               Testing
  // ------------------------------------------------------------------------

  const
    testValues = [3.33, 8.4, 10, 12, 45, 0.12, 100, 1000, 12400, 95000,
      -10, -12, -89.3, -3.4, -400];

  testValues.forEach(v => {
    _calcBestMax(v);
  });
}
