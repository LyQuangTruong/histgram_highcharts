var d3 = require("d3");
var Highcharts = require("highcharts");
require("highcharts/modules/histogram-bellcurve")(Highcharts);
var colData = [];
var categoryX = [];
var seriesData = [];

HistgramHighCharts.defaultSettings = {
  HorizontalAxis: "value",
  Timestamp: "ts",
  Title: "Histgram high charts",
  Legend: "value",
  Value: "value",
};

HistgramHighCharts.settings = EnebularIntelligence.SchemaProcessor(
  [
    {
      type: "text",
      name: "Title",
    },
    {
      type: "text",
      name: "Value",
    },
  ],
  HistgramHighCharts.defaultSettings
);

function createHistgramHighCharts(that) {
  if (seriesData != []) seriesData = [];
  if (categoryX != []) categoryX = [];
  ConvertDataAPI(that);
  that.histgramHighChartsC3 = Highcharts.chart("root", {
    title: {
      text: that.settings.Title,
    },

    xAxis: [
      {
        title: { text: "" },
        labels: {
          enabled: false, //default is true
        },
        visible: false,
        opposite: true,
        //alignTicks: false,
      },
      {
        title: { text: "Data" },
        opposite: false,
        // alignTicks: false,
      },
    ],

    yAxis: [
      {
        title: { text: "" },
        labels: {
          enabled: false, //default is true
        },
      },
      {
        title: { text: "" },
        opposite: true,
      },
    ],

    plotOptions: {
      histogram: {
        accessibility: {
          pointDescriptionFormatter: function (point) {
            var ix = point.index + 1,
              x1 = point.x.toFixed(3),
              x2 = point.x2.toFixed(3),
              val = point.y;
            return ix + ". " + x1 + " to " + x2 + ", " + val + ".";
          },
        },
      },
    },

    series: [
      {
        name: "Histogram",
        type: "histogram",
        xAxis: 1,
        yAxis: 1,
        baseSeries: "s1",
        zIndex: -1,
      },
      {
        name: "Data",
        type: "scatter",
        data: seriesData,
        id: "s1",
        marker: {
          radius: 1.5,
        },
        visible:false
      },
    ],
  });
}

function HistgramHighCharts(settings, options) {
  var that = this;
  this.el = window.document.createElement("div");
  this.el.id = "chart";

  this.settings = settings;
  this.options = options;
  this.data = [];
  this.maxNumber = 0;
  this.minNumber = 0;

  this.width = options.width || 700;
  this.height = options.height || 500;

  this.margin = { top: 20, right: 80, bottom: 30, left: 50 };

  setTimeout(function () {
    createHistgramHighCharts(that);
  }, 100);
}

HistgramHighCharts.prototype.addData = function (data) {
  var that = this;
  function fireError(err) {
    if (that.errorCallback) {
      that.errorCallback({
        error: err,
      });
    }
  }

  if (data instanceof Array) {
    var value = that.settings.Value;
    var ts = this.settings.Timestamp;
    let dataX = [];
    data.forEach((item) => {
      if (item[value] != undefined && item[value] != null) {
        dataX.push(item);
      }
    });

    this.filteredData = dataX
      .filter((d) => {
        let hasLabel = d.hasOwnProperty(value);
        const dLabel = d[value];
        if (typeof dLabel !== "string" && typeof dLabel !== "number") {
          fireError("HorizontalAxis is not a string or number");
          hasLabel = false;
        }
        return hasLabel;
      })
      .filter((d) => {
        let hasTs = d.hasOwnProperty(ts);
        if (isNaN(d[ts])) {
          fireError("Timestamp is not a number");
          hasTs = false;
        }
        return hasTs;
      })
      .sort((a, b) => b[that.settings.Value] - a[that.settings.Value]);

    if (this.filteredData.length === 0) {
      return;
    }

    this.data = this.filteredData;
    this.convertData();
  } else {
    fireError("no data");
  }
};

HistgramHighCharts.prototype.clearData = function () {
  this.data = {};
  colData = [];
  seriesData = [];
  categoryX = [];
  this.refresh();
};

HistgramHighCharts.prototype.convertData = function () {
  colData = this.data;
  this.refresh();
};

function ConvertDataAPI(that) {
  categoryX = [];
  seriesData = [];
  var value = that.settings.HorizontalAxis;
  var ts = that.settings.Timestamp;
  colData.forEach(function (val, index) {
    seriesData.push(val[that.settings.Value]);
    categoryX.push(val[ts]);
  });
}

HistgramHighCharts.prototype.resize = function (options) {
  this.width = options.width;
  this.height = options.height - 50;
};

HistgramHighCharts.prototype.refresh = function () {
  var that = this;

  ConvertDataAPI(that);

  if (this.axisX) this.axisX.remove();
  if (this.axisY) this.axisY.remove();
  if (this.yText) this.yText.remove();

  if (that.histgramHighChartsC3) {
    that.histgramHighChartsC3 = Highcharts.chart("root", {
      title: {
        text: that.settings.Title,
      },

      xAxis: [
        {
          title: { text: "" },
          labels: {
            enabled: false, //default is true
          },
          visible: false,
          opposite: true,
          //alignTicks: false,
        },
        {
          title: { text: "Data" },
          opposite: false,
          // alignTicks: false,
        },
      ],

      yAxis: [
        {
          title: { text: "" },
          labels: {
            enabled: false, //default is true
          },
        },
        {
          title: { text: "" },
          opposite: true,
        },
      ],

      plotOptions: {
        histogram: {
          accessibility: {
            pointDescriptionFormatter: function (point) {
              var ix = point.index + 1,
                x1 = point.x.toFixed(3),
                x2 = point.x2.toFixed(3),
                val = point.y;
              return ix + ". " + x1 + " to " + x2 + ", " + val + ".";
            },
          },
        },
      },

      series: [
        {
          name: "Histogram",
          type: "histogram",
          xAxis: 1,
          yAxis: 1,
          baseSeries: "s1",
          zIndex: -1,
        },
        {
          name: "Data",
          type: "scatter",
          data: seriesData,
          id: "s1",
          marker: {
            radius: 1.5,
          },
          visible:false
        },
      ],
    });
  }
};

HistgramHighCharts.prototype.onError = function (errorCallback) {
  this.errorCallback = errorCallback;
};

HistgramHighCharts.prototype.getEl = function () {
  return this.el;
};

window.EnebularIntelligence.register("histgramHighCharts", HistgramHighCharts);

module.exports = HistgramHighCharts;
