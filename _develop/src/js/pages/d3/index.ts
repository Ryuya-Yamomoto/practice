import * as d3 from 'd3';
import Util from '../../utils/util';

type DataItem = {
  date: Date;
  value: number;
};

export default class D3 {
  private readonly URL_DATA = '/engineer/yamamoto/practice/assets/json/d3/data.json';

  private contents = d3.select('#chart');
  private svg = this.contents.append('svg');

  private width = 0;
  private height = 0;
  private padding = 40;
  private timeparser: d3.TimeParser<any> = d3.timeParse('%Y/%m/%d');
  private format: d3.TimeFormatter<any> = d3.timeFormat('%y/%m');
  private xTicks = 0; //- x軸の目盛りの数

  private data: DataItem[] = [];
  private xScale: d3.ScaleTime<number, number, never> | null = null;
  private yScale: d3.ScaleLinear<number, number, never> | null = null;
  private xAxis: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private yAxis: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private linePath: d3.Selection<SVGPathElement, unknown, null, undefined> | null = null;
  private brushSvg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private brush: d3.BrushBehavior<unknown> | null = null;
  private tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null = null;

  constructor() {
    this.fetchData();
  }

  // 配列データのfetch
  fetchData = async () => {
    try {
      const data = await d3.json(this.URL_DATA);
      this.data = data.data as DataItem[];

      // 日付をパースし、月の1日に変換
      this.data = this.data.map((d) => {
        const parsedDate = this.timeparser(d.date);
        // 月の1日に設定
        const firstDayOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
        return { date: firstDayOfMonth, value: d.value };
      });

      // 初期表示のx軸の目盛りの数を指定
      this.xTicks = Util.IS_SP ? (this.data.length + 1) / 4 : this.data.length;

      this.init();

      // resize イベントを検知したら、再描画
      window.addEventListener('resize', this.init);
    } catch (error) {
      console.error('データの取得に失敗しました', error);
    }
  };

  // 初期処理
  init = () => {
    if (!this.contents || !this.svg) return;

    // 枠 描画 ============================
    this.width = this.contents.node()?.clientWidth - this.padding;
    this.height = this.contents.node()?.clientHeight - this.padding;

    // svg要素に g要素 を追加 x y にそれぞれ代入
    this.xAxis = this.svg.append('g').attr('class', 'axis axis-x');
    this.yAxis = this.svg.append('g').attr('class', 'axis axis-y');

    // x軸を時間のスケールに設定
    this.xScale = d3
      .scaleTime()
      .domain([
        d3.min(this.data, (d: DataItem) => d.date), //- データ内の日付の最小値を取得
        d3.max(this.data, (d: DataItem) => d.date), //- データ内の日付の最大値を取得
      ])
      .range([this.padding, this.width]); //- svg内でのX軸の位置の開始位置と終了位置を指定し、X軸の幅を設定する

    // y軸をvalueのスケールに設定
    this.yScale = d3
      .scaleLinear()
      .domain([
        0, //- Y軸の最小値を0に設定
        d3.max(this.data, (d: DataItem) => d.value),
      ]) //- データ内のvalueの最大値を取得
      .range([this.height, this.padding]); //- svg内でのY軸の位置の開始位置と終了位置を指定しY軸の幅を設定する

    // clipPathを定義（margin外に線が出ないようにする）
    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', this.padding)
      .attr('y', this.padding)
      .attr('width', this.width - this.padding)
      .attr('height', this.height - this.padding);

    // グラフを描画
    this.drawGraph();

    // レンジスライダーを追加
    this.createRangeSlider();

    // ツールチップを作成
    this.createTooltip();
  };

  // グラフ描画
  drawGraph = () => {
    if (!this.xScale || !this.yScale || !this.xAxis || !this.yAxis) return;

    const xScale = this.xScale;
    const yScale = this.yScale;

    // 表示範囲内のデータを取得（端まで線を引くため、範囲外の前後のデータも含める）
    const [domainMin, domainMax] = xScale.domain();
    const dataIndex = this.data.findIndex((d) => d.date >= domainMin);
    const lastIndex = this.data.findIndex((d) => d.date > domainMax);

    // 範囲の前後1つずつを含めてデータを取得（端まで線を引くため）
    const startIndex = Math.max(0, dataIndex - 1);
    const endIndex = lastIndex === -1 ? this.data.length : Math.min(this.data.length, lastIndex + 1);
    const visibleData = this.data.slice(startIndex, endIndex);

    // 一意な日付のみを抽出（重複を削除）- ただし軸ラベルには範囲内のみ
    const axisData = this.data.filter((d) => d.date >= domainMin && d.date <= domainMax);
    const uniqueDates = Array.from(new Set(axisData.map((d) => d.date.getTime()))).map((time) => new Date(time));

    // scaleをセットしてX軸を作成（一意な日付のみを目盛りに使用）
    const axisX = d3.axisBottom(xScale).tickValues(uniqueDates).tickFormat(this.format);

    // scaleをセットしてY軸を作成（グリッド線を横いっぱいに引く）
    const axisY = d3.axisLeft(yScale).tickSize(-(this.width - this.padding));

    // X軸の位置を指定し軸をセット
    this.xAxis.attr('transform', `translate(0, ${this.height})`).call(axisX);

    // Y軸の位置を指定し軸をセット
    this.yAxis.attr('transform', `translate(${this.padding}, 0)`).call(axisY);

    // グリッド線の色を薄く設定
    this.yAxis.selectAll('.tick line').attr('stroke', '#e0e0e0').attr('stroke-opacity', 1);

    // Y軸の一番上の横線のみ追加（薄いグレー）
    const maxValue = d3.max(this.data, (d: DataItem) => d.value);
    const minValue = d3.min(this.data, (d: DataItem) => d.value);

    // 最大値の横線
    this.svg
      .append('line')
      .attr('x1', this.padding)
      .attr('x2', this.width)
      .attr('y1', yScale(maxValue))
      .attr('y2', yScale(maxValue))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-opacity', 1);

    // 最小値の横線
    this.svg
      .append('line')
      .attr('x1', this.padding)
      .attr('x2', this.width)
      .attr('y1', yScale(minValue))
      .attr('y2', yScale(minValue))
      .attr('stroke', '#000000')
      .attr('stroke-opacity', 1);

    // 折れ線 描画 ============================
    const color = d3.rgb('#85a7cc');

    // 既存のパスを削除
    this.svg.selectAll('.line-path').remove();

    this.linePath = this.svg.append('path').attr('class', 'line-path').attr('clip-path', 'url(#clip)'); //- パス要素を生成してclipPathを適用
    const line = d3
      .line<DataItem>()
      .x((d: DataItem) => xScale(d.date))
      .y((d: DataItem) => yScale(d.value));

    // ドメイン範囲内のデータのみフィルタ（既に取得済みのvisibleDataを使用）
    this.linePath.datum(visibleData).attr('fill', 'none').attr('stroke', color).attr('d', line);
  };

  // レンジスライダーを作成（ブラシ機能付きミニマップ）
  createRangeSlider = () => {
    const brushHeight = 60;
    const brushMargin = { top: 10, right: 20, bottom: 20, left: 20 };
    const brushWidth = this.width + this.padding - brushMargin.left - brushMargin.right;

    // ブラシ用のSVGを作成
    this.brushSvg = d3
      .select('#chart')
      .append('svg')
      .attr('width', brushWidth + brushMargin.left + brushMargin.right)
      .attr('height', brushHeight + brushMargin.top + brushMargin.bottom)
      .style('margin-top', '20px');

    const brushG = this.brushSvg.append('g').attr('transform', `translate(${brushMargin.left},${brushMargin.top})`);

    // ミニマップ用のスケール
    const miniXScale = d3
      .scaleTime()
      .domain([
        d3.min(this.data, (d: DataItem) => d.date)!, //- 最小値
        d3.max(this.data, (d: DataItem) => d.date)!, //- 最大値
      ])
      .range([0, brushWidth]);

    const miniYScale = d3
      .scaleLinear()
      .domain([
        0, //- 最小値
        d3.max(this.data, (d: DataItem) => d.value)!, //- 最大値
      ])
      .range([brushHeight, 0]);

    // ミニマップにグラフを描画
    const miniLine = d3
      .line<DataItem>()
      .x((d) => miniXScale(d.date))
      .y((d) => miniYScale(d.value));

    brushG.append('path').datum(this.data).attr('fill', 'none').attr('stroke', '#85a7cc').attr('stroke-width', 1).attr('d', miniLine);

    // ブラシを作成
    this.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [brushWidth, brushHeight],
      ])
      .on('brush end', (event) => {
        if (!event.selection) return;
        const [x0, x1] = event.selection as [number, number];

        // 選択範囲の日付を取得
        const startDate = miniXScale.invert(x0);
        const endDate = miniXScale.invert(x1);

        // メインチャートのX軸ドメインを更新
        if (this.xScale) {
          this.xScale.domain([startDate, endDate]);
          this.drawGraph();
        }
      });

    // ブラシを適用（初期選択範囲は全体）
    brushG.append('g').attr('class', 'brush').call(this.brush).call(this.brush.move, [0, brushWidth]);
  };

  // ツールチップ 縦の羅線を作成
  createTooltip = () => {
    // ツールチップ用のdiv要素を作成
    this.tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip').style('opacity', 0);

    if (!this.xScale) return;

    const xScale = this.xScale;

    // ホバー時の縦線を作成
    const hoverLine = this.svg
      .append('line')
      .attr('class', 'hover-line')
      .attr('y1', this.padding)
      .attr('y2', this.height)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // ホバーエリアを作成（透明な矩形）
    const hoverArea = this.svg
      .append('rect')
      .attr('class', 'hover-area')
      .attr('x', this.padding)
      .attr('y', this.padding)
      .attr('width', this.width - this.padding)
      .attr('height', this.height - this.padding)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    // ツールチップ更新関数
    const updateTooltip = (event: MouseEvent) => {
      // マウスのX座標を取得（SVG全体での座標）
      const [mouseX] = d3.pointer(event, this.svg.node());

      // データが存在しない場合は何もしない
      if (!this.data || this.data.length === 0) {
        hoverLine.style('opacity', 0);
        this.tooltip!.style('opacity', 0);
        return;
      }

      // 表示範囲内のデータのみを対象にする
      const [domainMin, domainMax] = xScale.domain();
      const visibleData = this.data.filter((d) => d.date >= domainMin && d.date <= domainMax);

      if (visibleData.length === 0) {
        hoverLine.style('opacity', 0);
        this.tooltip!.style('opacity', 0);
        return;
      }

      // カーソル位置から最も近いデータポイントを見つける（ピクセル距離で比較）
      let closestData: DataItem | null = null;
      let minDistance = Infinity;

      visibleData.forEach((d: DataItem) => {
        const dataX = xScale(d.date);
        const distance = Math.abs(mouseX - dataX);
        if (distance < minDistance) {
          minDistance = distance;
          closestData = d;
        }
      });

      // データが見つからない場合は非表示（型ガード）
      if (!closestData) {
        hoverLine.style('opacity', 0);
        this.tooltip!.style('opacity', 0);
        return;
      }

      // 型を確定（closestDataはDataItem型）
      const data: DataItem = closestData;

      // 縦線の位置を更新
      const lineX = xScale(data.date);
      hoverLine.attr('x1', lineX).attr('x2', lineX).style('opacity', 1);

      // ツールチップの内容を更新
      const formattedDate = d3.timeFormat('%Y年%m月')(data.date);
      this.tooltip!.html(
        `
        <div class="chart-tooltip__date">${formattedDate}</div>
        <div class="chart-tooltip__value">値: ${data.value}</div>
      `,
      )
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`)
        .style('position', 'absolute')
        .style('opacity', 1);
    };

    // マウス移動イベント（requestAnimationFrameで最適化）
    let rafId: number | null = null;
    let lastEvent: MouseEvent | null = null;

    hoverArea.on('mousemove', (event) => {
      lastEvent = event; // 最新のイベントを保存

      if (rafId !== null) {
        return; // 既に予約済みなら何もしない
      }

      rafId = requestAnimationFrame(() => {
        if (lastEvent) {
          updateTooltip(lastEvent); // 最新のイベントで更新
        }
        rafId = null;
      });
    });

    // マウスアウトイベント
    hoverArea.on('mouseout', () => {
      lastEvent = null;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      this.tooltip!.style('opacity', 0);
      hoverLine.style('opacity', 0);
    });
  };

  // 表示範囲を更新（削除）
  updateRange = () => {
    // ブラシで制御するため、このメソッドは不要
  };
}
