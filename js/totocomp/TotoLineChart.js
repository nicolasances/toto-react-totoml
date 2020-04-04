import React, {Component} from 'react';
import {Animated, Easing, View, Text, ART, Image, StyleSheet} from 'react-native';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import * as path from 'd3-path';
import moment from 'moment';
import TRC from 'toto-react-components';

const {Group, Shape, Surface} = ART;
const d3 = {scale, shape, array, path};

/**
 * Creates a bar chart
 *
 * NOTE THE FOLLOWING
 *
 * 1. This component is RESPONSIVE: the height will be taken from the height of the wrapping element
 *
 *
 * Requires the following:
 * - data                   : the data to create the chart in the following form:
 *                            [ { x: numeric, x value,
 *                                y: numeric, y value,
 *                                temporary: boolean, optional, if true will highlight this element as a temporary one
 *                              }, {...} ]
 * - dataMultiLines         : the data to create multiple lines. Use this instead of data if you want to create multiple lines. The format is: 
 *                            [ [data line 1], ..., [data line n]]
 * - multiLinesColors       : the colors of the lines, in case of multi lines
 * - minYValue              : (optioanl) the y value to consider as a minimum (to avoid flat-looking lines)
 * - maxYValue              : (optional) the y value to consider as the maximum
 * - valueLabelTransform    : (optional) a function (value, i) => {transforms the value to be displayed on the bar (top part). i is the index of that value}
 * - xAxisTransform         : (optional) a function to be called with the x axis value to generate a label to put on the bar (bottom part)
 *                            NOTE that if showFirstAndLastVP is set to true, this will only show the first and last x labels
 * - xLabelPosition         : (optional, default 'bottom'). If set to 'top', the x labels will be positioned on the top of the graph
 * - xLabelLines            : (optional, default false). If true, will draw vertical lines (along the y axis) for each label
 * - moreSpaceForXLabels    : (optional, default false) pass true if the x axis label needs extra space (e.g. ends up in two lines)
 * - showValuePoints        : (optional, default true), shows the value points (circles)
 * - showFirstAndLastVP     : (optioanl, default true), shows the first and last value points (circles)
 * - valuePointsBackground  : (optional, default THEME color), defines the background color of the value points (Circles)
 * - valuePointsSize        : (optional, default 6), defines the radius of the circle value points
 * - curveCardinal          : (optional, default true), shows the curve as a curve cardinal. If set to false it will use the basic curve (curveLinear)
 * - leaveMargins           : (optional, default true), leave a 24 margin horizontally on each side of tthe graph
 * - areaColor              : (optional, default no color), colors the area underlying the graph with the specified color
 * - yLines                 : (optional) the y values for which to draw a horizontal line (to show the scale)
 *                            if passed, it's an [y1, y2, y3, ...]
 *                            each value will correspond to a horizontal line
 * - yLinesNumberLocale     : (optional) the locale to use to format the number with toLocaleString('<locale>') ... e,g. 'it'
 * - yLinesColor            : (optional) the color of the y lines
 * - yLinesLabelColor       : (optional) the color of the label of the ylines
 * - yLinesFullWidth        : (optional, default true) set false if the horizontal line shouldn't fill the whole width of the screen
 * - yLinesDashed           : (optional, default false). If true will show the y lines as dashed lines
 * - yLinesIcons            : (optional, default none). A list of icons to be added for each y line, where the label is (in front of the label)
 * - yLinesExtraLabels      : (optional, default none). A list of additional labels to be put next to the ylines labels
 * - valueLabelColor        : (optional, default COLOR_TEXT) the color of the value labels
 */
export default class TotoLineChart extends Component {

  /**
   * Constructor
   */
  constructor(props) {
    super(props);

    // Init the state!
    this.state = {
      yLines: [],
      // Graph settings
      settings: {
        lineColor: TRC.TotoTheme.theme.COLOR_THEME_LIGHT,
        valueLabelColor: props.valueLabelColor ? props.valueLabelColor : TRC.TotoTheme.theme.COLOR_TEXT,
        valueCircleColor: TRC.TotoTheme.theme.COLOR_THEME_LIGHT,
      },
      height: 0,
      width: 0,
    }

    // Default properties
    this.curveCardinal = this.props.curveCardinal == null ? true : this.props.curveCardinal;
    this.graphMargin = (this.props.leaveMargins == null || this.props.leaveMargins) ? 24 : -2;
    this.areaColor = this.props.areaColor;
    this.valuePointsBackground = this.props.valuePointsBackground == null ? TRC.TotoTheme.theme.COLOR_THEME : this.props.valuePointsBackground;
    this.valuePointsSize = this.props.valuePointsSize == null ? 6 : this.props.valuePointsSize;
    this.genericShapeStrokeWidth = 2;

    // Binding
    this.initGraph = this.initGraph.bind(this);
    this.createYLines = this.createYLines.bind(this);

  }

  /**
   * Mount the component
   */
  componentDidMount() {
  }

  /**
  * Unmount the component
  */
  componentWillUnmount() {
  }

  /**
   * Receives updated properties
   */
  initGraph() {
    
    if ((this.props.data == null || this.props.data.length == 0) && (this.props.dataMultiLines == null || this.props.dataMultiLines.length == 0)) return;

    this.showValuePoints = this.props.showValuePoints == null ? true : this.props.showValuePoints;
    this.showFirstAndLastVP = this.props.showFirstAndLastVP == null ? true : this.props.showFirstAndLastVP;
    this.xLabelPosition = this.props.xLabelPosition == null ? 'bottom' : this.props.xLabelPosition;
    this.xLabelLines = this.props.xLabelLines == null ? false : this.props.xLabelLines;
    this.yLinesDashed = this.props.yLinesDashed == null ? false : this.props.yLinesDashed;

    // SIZES AND Padding of elements
    this.xLabelSize = 12;
    this.xLabelBottomPadding = 6;

    if (this.props.moreSpaceForXLabels) this.xLabelSize += 12

    // Define the vertical and horizontal margins of the graph, in order to fit the circles
    let paddingV = 0, paddingH = 0;
    if (this.showValuePoints || this.showFirstAndLastVP) {
      paddingV = this.valuePointsSize / 2 + 2 * this.genericShapeStrokeWidth;
      paddingH = this.valuePointsSize + 2 * this.genericShapeStrokeWidth;
    }
    // Add the padding due to the labels
    if (this.props.xAxisTransform) paddingV += 2 * this.xLabelBottomPadding + this.xLabelSize; // 2* to leave some space between the label and the graph

    // Define the min and max x values
    let xMin = this.props.data ? d3.array.min(this.props.data, (d) => {return d.x}) : d3.array.min(this.props.dataMultiLines, (d) => {return d3.array.min(d, (di) => {return di.x})});
    let xMax = this.props.data ? d3.array.max(this.props.data, (d) => {return d.x}) : d3.array.max(this.props.dataMultiLines, (d) => {return d3.array.max(d, (di) => {return di.x})});
    
    // Define the min and max y values
    // let yMin = d3.array.min(this.props.data, (d) => {return d.y});
    let yMin = 0;
    let yMax = this.props.data ? d3.array.max(this.props.data, (d) => {return d.y}) : d3.array.max(this.props.dataMultiLines, (d) => {return d3.array.max(d, (di) => {return di.y})});
    if (this.props.minYValue) yMin = this.props.minYValue;
    if (this.props.maxYValue) yMax = this.props.maxYValue;

    // Update the scales
    this.x = d3.scale.scaleLinear().range([this.graphMargin + paddingH, this.state.width - this.graphMargin - paddingH]).domain([xMin, xMax]);
    this.y = d3.scale.scaleLinear().range([this.state.height - paddingV, paddingV]).domain([yMin, yMax]);

  }
  /**
   * Creates the horizontal y scale lines as requested in the property yLines
   */
  createYLines(ylines) {

    if (ylines == null) return;
    if (this.props.data == null && this.props.dataMultiLines == null) return;

    let shapes = [];

    // Define the color of the line
    let lineColor = TRC.TotoTheme.theme.COLOR_THEME_LIGHT + 50;
    if (this.props.yLinesColor) lineColor = this.props.yLinesColor;

    // Width of the line
    let lineStart = 0;
    let lineEnd = this.state.width;
    if (this.props.yLinesFullWidth == false) {
      lineStart = 24
      lineEnd -= 24
    }

    for (var i = 0; i < ylines.length; i++) {

      let line = d3.shape.line()
          .x((d) => {return d.x})
          .y((d) => {return d.y});

      let path = line([{x: lineStart, y: this.y(ylines[i])}, {x: lineEnd, y: this.y(ylines[i])}]);

      let dashed;
      if (this.yLinesDashed) dashed = [5,5];

      shapes.push(this.createShape(path, lineColor, null, dashed));
    }

    return shapes;

  }

  /**
   * Creates the labels to put on the ylines, if any
   */
  createYLinesLabels(ylines) {

    if (ylines == null) return;
    if (this.props.data == null && this.props.dataMultiLines == null) return;

    let shapes = [];

    // Color
    let color = {color: TRC.TotoTheme.theme.COLOR_THEME_LIGHT}
    let tintColor = {tintColor: TRC.TotoTheme.theme.COLOR_THEME_LIGHT}
    if (this.props.yLinesLabelColor) {
      color = {color: this.props.yLinesLabelColor}
      tintColor = {tintColor: this.props.yLinesLabelColor}
    }

    // Font size
    let fontSize = {fontSize: 10}
    if (this.props.yLinesLabelFontSize) fontSize = {fontSize: this.props.yLinesLabelFontSize}

    for (var i = 0; i < ylines.length; i++) {

      let key = 'Label-YLine-' + Math.random();

      // Value formatting
      let value = ylines[i];
      if (this.props.yLinesNumberLocale && ylines[i]) value = ylines[i].toLocaleString(this.props.yLinesNumberLocale);

      // Check if an image needs to be drawn
      let image;
      if (this.props.yLinesIcons && this.props.yLinesIcons.length > i) image = (
        <Image source={this.props.yLinesIcons[i]} style={[styles.yLineImage, tintColor]} />
      )

      // Top position of the element 
      let top = this.y(ylines[i]) + 6;
      if (this.props.yLinesIcons) top += 3;

      // Additional Label
      let additionalLabel;
      if (this.props.yLinesExtraLabels && this.props.yLinesExtraLabels.length > i) additionalLabel = (
        <Text style={styles.yLinedAddLabel}>{this.props.yLinesExtraLabels[i]}</Text>
      )

      // Create the text element
      let element = (
        <View key={key} style={{flexDirection: 'row', position: 'absolute', left: 6, top: top, justifyContent: 'center', alignItems: 'center'}}>
          {image}
          <Text style={[styles.yAxisLabel, color]}>{value}</Text>
          {additionalLabel}
        </View>
      );

      shapes.push(element);
    }

    return shapes;

  }

  /**
   * Transforms cartesian coord in polar coordinates
   */
  polarCoord(centerX, centerY, radius, angleInDegrees) {

    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  /**
   * Creates a circle path
   */
  circlePath(cx, cy, radius) {

    let startAngle = 0;
    let endAngle = 360;

    var start = this.polarCoord(cx, cy, radius, endAngle * 0.9999);
    var end = this.polarCoord(cx, cy, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    var d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ]

    return d.join();

  }

  /**
   * Returns a shape drawing the provided path
   */
  createShape(path, color, fillColor, strokeDash) {

    let key = 'TotoLineChartShape-' + Math.random();

    return (
      <Shape key={key} d={path} strokeDash={strokeDash} strokeWidth={this.genericShapeStrokeWidth} stroke={color} fill={fillColor} />
    )
  }

  /**
   * Create the labels with the values
   */
  createValueLabels(data) {

    if (data == null) return;

    // The labels
    let labels = [];

    // For each point, create a bar
    for (var i = 0; i < data.length; i++) {

      if (data[i].y == null) continue;

      // The single datum
      let value = data[i].y;

      // Transform the value if necessary
      if (this.props.valueLabelTransform) value = this.props.valueLabelTransform(value, i);

      // Positioning of the text
      let x = this.x(data[i].x);
      let y = this.y(data[i].y);
      let key = 'Label-' + Math.random();
      let label;

      if (this.props.valueLabelTransform) label = (
        <Text style={[styles.valueLabel, {color: this.state.settings.valueLabelColor}]}>{value}</Text>
      )

      // Define the left shift based on the length of the string
      let leftShift = 8;
      if (value.length == 1) leftShift = 4;
      else if (value.length == 2) leftShift = 7;
      else if (value.length == 3) leftShift = 10;

      // Create the text element
      let element = (
        <View key={key} style={{position: 'absolute', left: x - leftShift, top: y - 24, alignItems: 'center'}}>
          {label}
        </View>
      );

      labels.push(element);
    }

    return labels;
  }

  /**
   * Create the x axis labels
   */
  createXAxisLabels(data) {

    if (data == null) return;
    if (this.props.xAxisTransform == null) return;

    // The labels
    let labels = [];

    // For each point, create a bar
    for (var i = 0; i < data.length; i++) {

      // If you only want to see the first and last VP, then the same applies for the labels
      if (this.showFirstAndLastVP) {
        if (i != 0 && i != data.length - 1) continue;
      }

      // The single datum
      let value = data[i].x;

      // Transform the value if necessary
      value = this.props.xAxisTransform(value);

      // Positioning of the text
      let x = this.x(data[i].x);
      let key = 'Label-X-' + Math.random();
      
      // Define the Y position
      let y = this.state.height - this.xLabelBottomPadding - this.xLabelSize;
      if (this.xLabelPosition == 'top') y = this.xLabelBottomPadding + this.xLabelSize;

      // Create the text element, only if there's a value to display
      if (value != null) {

        style = {
          position: 'absolute', 
          left: x - (this.showFirstAndLastVP ? 20 : 10), 
          top: y,
          alignItems: 'center',
          width: this.showFirstAndLastVP ? 40 : 20
        }

        // Define the label width
        if (!this.showFirstAndLastVP) style.width = 20

        let element = (
          <View key={key} style={style}>
            <Text style={styles.xAxisLabel}>{value}</Text>
          </View>
        );

        labels.push(element);
      }
    }

    return labels;
  }

  /**
   * Creates the x vertical lines
   */
  createXLines(data) {

    if (data == null) return;
    if (this.props.xAxisTransform == null) return;
    if (!this.xLabelLines) return;

    // Define the color of the line
    let lineColor = TRC.TotoTheme.theme.COLOR_THEME_LIGHT + 50;

    let lines = []

    // For each point, create a vertical line
    for (var i = 0; i < data.length; i++) {

      // If you only want to see the first and last VP, then the same applies for the labels
      if (this.showFirstAndLastVP) {
        if (i != 0 && i != data.length - 1) continue;
      }

      let datum = data[i];

      // Define the start and end of the line
      let lineStart = 0;
      let lineEnd = this.y(datum.y);

      if (this.xLabelPosition == 'top') lineStart += this.xLabelBottomPadding + this.xLabelSize*2.5;
  
      let line = d3.shape.line()
          .x((d) => {return d.x})
          .y((d) => {return d.y});

      let path = line([{x: this.x(datum.x), y: lineStart}, {x: this.x(datum.x), y: lineEnd}]);

      lines.push(this.createShape(path, lineColor, null, [5,5]));
    }
  
    return lines;
  }

  /**
   * Creates the bars
   * 
   * The parameter i is optional. 
   * When passed it indicates which line it is, in a multi line context
   */
  createLine(data, i) {

    // Don't draw if there's no data
    if (data == null) return;

    var line = d3.shape.line();

    line.x((d) => {return this.x(d.x)})
        .y((d) => {return this.y(d.y)})
        .curve(this.curveCardinal ? d3.shape.curveCardinal : d3.shape.curveLinear);

    var path = line([...data]);

    // Define the line color
    lineColor = this.state.settings.lineColor;
    if (i) lineColor = this.props.multiLinesColors[i];

    // Return the shape
    return this.createShape(path, lineColor);

  }

  /**
   * Creates the area chart
   */
  createArea(data) {

    // Don't draw if there's no data
    if (data == null) return;

    var area = d3.shape.area();

    area.x((d) => {return this.x(d.x)})
        .y1((d) => {return this.y(d.y)})
        .y0(this.y(0) + 1)
        .curve(this.curveCardinal ? d3.shape.curveCardinal : d3.shape.curveLinear);

    var path = area([...data]);

    // Return the shape
    return this.createShape(path, this.state.settings.lineColor, this.areaColor);

  }

  /**
   * Creates the circles for every value
   * 
   * The parameter i is optional. 
   * When passed it indicates which line the circles belongs to, in a multi line context
   */
  createCircles(data, i) {

    if (data == null) return;

    let circles = [];

    // Define the line color
    lineColor = this.state.settings.valueCircleColor;
    if (i) lineColor = this.props.multiLinesColors[i];

    for (var i = 0; i < data.length; i++) {

      if (this.showFirstAndLastVP) {
        if (i != 0 && i != data.length - 1) continue;
      }

      let datum = data[i];

      let circle = this.circlePath(this.x(datum.x), this.y(datum.y), this.valuePointsSize);

      circles.push(this.createShape(circle, lineColor, this.valuePointsBackground));
    }

    return circles;

  }

  /**
   * Renders the component
   */
  render() {

    this.initGraph();

    let multilines;
    let multicircles;
    let multilabels;
    let line;
    let circles;
    let labels;
    let xLabels;
    let xLines;

    if (this.props.data) {
      line = this.areaColor ? this.createArea(this.props.data) : this.createLine(this.props.data);
      circles = this.showValuePoints || this.showFirstAndLastVP ? this.createCircles(this.props.data) : null;
      labels = this.createValueLabels(this.props.data);
      xLabels = this.createXAxisLabels(this.props.data);
      xLines = this.createXLines(this.props.data);
    }
    else if (this.props.dataMultiLines) {
      
      multilines = []
      multicircles = []
      multilabels = []
      
      for (var l = 0; l < this.props.dataMultiLines.length; l++) {
        
        data = this.props.dataMultiLines[l];

        let line = this.areaColor ? this.createArea(data) : this.createLine(data, l);
        let circles = this.showValuePoints ? this.createCircles(data, l) : null;
        let labels = this.createValueLabels(data);
        
        multilines.push(line);
        multicircles.push(circles);
        multilabels.push(labels);
      }
    }

    let ylines = this.createYLines(this.props.yLines);
    let ylinesLabels = this.createYLinesLabels(this.props.yLines);

    return (
      <View style={styles.container} onLayout={(event) => {this.setState({height: event.nativeEvent.layout.height, width: event.nativeEvent.layout.width})}}>
        <Surface height={this.state.height} width={this.state.width}>
          {line}
          {multilines}
          {xLines}
          {ylines}
          {circles}
          {multicircles}
        </Surface>
        {labels}
        {multilabels}
        {ylinesLabels}
        {xLabels}
      </View>
    )
  }

}

/**
 * Stylesheets
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 10,
  },
  xAxisLabel: {
    color: TRC.TotoTheme.theme.COLOR_TEXT + '50',
    fontSize: 10,
    textAlign: 'center'
  },
  yAxisLabel: {
  },
  yLineImage: {
    width: 20, 
    height: 20,
    marginRight: 9,
  },
  yLinedAddLabel: {
    color: TRC.TotoTheme.theme.COLOR_ACCENT,
    fontSize: 12,
    marginLeft: 6,
  }
});
