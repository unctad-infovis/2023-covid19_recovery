import React, { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

// https://www.highcharts.com/
import Highcharts from 'highcharts';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import highchartsExporting from 'highcharts/modules/exporting';
import highchartsExportData from 'highcharts/modules/export-data';

// Load helpers.
import roundNr from '../helpers/RoundNr.js';

highchartsAccessibility(Highcharts);
highchartsExporting(Highcharts);
highchartsExportData(Highcharts);

Highcharts.setOptions({
  lang: {
    decimalPoint: '.',
    downloadCSV: 'Download CSV data',
    thousandsSep: ','
  }
});
Highcharts.SVGRenderer.prototype.symbols.download = (x, y, w, h) => {
  const path = [
    // Arrow stem
    'M', x + w * 0.5, y,
    'L', x + w * 0.5, y + h * 0.7,
    // Arrow head
    'M', x + w * 0.3, y + h * 0.5,
    'L', x + w * 0.5, y + h * 0.7,
    'L', x + w * 0.7, y + h * 0.5,
    // Box
    'M', x, y + h * 0.9,
    'L', x, y + h,
    'L', x + w, y + h,
    'L', x + w, y + h * 0.9
  ];
  return path;
};

function ColumnChart({
  data, data_decimals, export_title_margin, idx, note, source, subtitle, title, xlabel, xlabelrotation, ymax, ymin
}) {
  const chartRef = useRef();

  const chartHeight = 650;
  const isVisible = useIsVisible(chartRef, { once: true });

  const dummy_data = {
    data: [{ name: '', y: null }, { name: '2020', y: null }, { name: '2021', y: null }, { name: '2022', y: null }],
    name: 'Dummy data',
    showInLegend: false,
    xAxis: 1
  };
  data[3] = dummy_data;

  const createChart = useCallback(() => {
    Highcharts.chart(`chartIdx${idx}`, {
      caption: {
        align: 'left',
        margin: 15,
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontSize: '14px'
        },
        text: `<em>Source:</em> ${source} ${note ? (`<br /><em>Note:</em> <span>${note}</span>`) : ''}`,
        useHTML: true,
        verticalAlign: 'bottom',
        x: 0
      },
      chart: {
        height: 650,
        resetZoomButton: {
          theme: {
            fill: '#fff',
            r: 0,
            states: {
              hover: {
                fill: '#0077b8',
                stroke: 'transparent',
                style: {
                  color: '#fff'
                }
              }
            },
            stroke: '#7c7067',
            style: {
              fontFamily: 'Roboto',
              fontSize: 13,
              fontWeight: 400
            }
          }
        },
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontFamily: 'Roboto',
          fontWeight: 400
        },
        type: 'column',
        zoomType: 'x'
      },
      colors: ['#f58220', '#72bf44', '#009edb'],
      credits: {
        enabled: false
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: ['viewFullscreen', 'separator', 'downloadPNG', 'downloadPDF', 'separator', 'downloadCSV'],
            symbol: 'download',
            symbolFill: '#000'
          }
        },
        chartOptions: {
          chart: {
            events: {
              load() {
                // eslint-disable-next-line react/no-this-in-sfc
                this.renderer.image('https://unctad.org/sites/default/files/2022-11/unctad_logo.svg', 5, 15, 100, 100).add();
              }
            },
          },
          subtitle: {
            x: 100,
            widthAdjust: -144
          },
          title: {
            x: 100,
            margin: export_title_margin,
            widthAdjust: -144
          }
        }
      },
      legend: {
        align: 'right',
        enabled: (data.length > 1),
        itemStyle: {
          color: '#000',
          cursor: 'default',
          fontFamily: 'Roboto',
          fontSize: '16px',
          fontWeight: 400
        },
        layout: 'horizontal',
        margin: 0,
        verticalAlign: 'top'
      },
      subtitle: {
        align: 'left',
        enabled: true,
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '18px'
        },
        text: subtitle
      },
      title: {
        align: 'left',
        margin: 20,
        style: {
          color: '#000',
          fontSize: '30px',
          fontWeight: 700
        },
        text: title
      },
      plotOptions: {
        column: {
          animation: {
            duration: 2000,
          },
          cursor: 'pointer',
          groupPadding: 0.05,
          dataLabels: {
            enabled: false,
            formatter() {
              // eslint-disable-next-line react/no-this-in-sfc
              return (this.y === 0) ? '' : `${roundNr(this.y, data_decimals)}`;
            },
            color: 'rgba(0, 0, 0, 0.8)',
            style: {
              fontFamily: 'Roboto',
              fontSize: '12px',
              textOutline: '0 0 0',
              fontWeight: 300
            }
          },
          stacking: 'normal'
        }
      },
      responsive: {
        rules: [{
          chartOptions: {
            legend: {
              layout: 'horizontal'
            }
          },
          condition: {
            maxWidth: 500
          }
        }]
      },
      series: data,
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderRadius: 0,
        borderWidth: 1,
        crosshairs: true,
        formatter() {
          // eslint-disable-next-line react/no-this-in-sfc
          const values = this.points.map(point => [point.series.name, point.y, point.color]);
          const rows = [];
          rows.push(values.map(point => `<div style="color: ${point[2]}"><span class="tooltip_label">${(point[0]) ? `${point[0]}: ` : ''}</span><span class="tooltip_value">${roundNr(point[1], data_decimals)}</span></div>`).join(''));
          // eslint-disable-next-line react/no-this-in-sfc
          return `<div class="tooltip_container"><h3 class="tooltip_header">${xlabel} ${this.x}</h3>${rows}</div>`;
        },
        shadow: false,
        shared: true,
        useHTML: true
      },
      xAxis: [{
        accessibility: {
          description: xlabel
        },
        allowDecimals: false,
        categories: data[0].labels,
        crosshair: {
          color: 'rgba(124, 112, 103, 0.2)',
          width: 1
        },
        labels: {
          allowOverlap: true,
          rotation: xlabelrotation,
          formatter: (val) => {
            if (val.value === 'empty1' || val.value === 'empty2') {
              return '';
            }
            return (val.value).split(' ')[0];
          },
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400
          },
          y: 30
        },
        lineColor: 'transparent',
        lineWidth: 0,
        opposite: false,
        plotLines: null,
        showFirstLabel: true,
        showLastLabel: true,
        tickWidth: 1,
        title: {
          enabled: true,
          offset: 40,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400
          },
          text: xlabel
        }
      }, {
        categories: ['', '2020', '', '', '', '', '2021', '', '', '', '', '2022'],
        labels: {
          allowOverlap: true,
          enabled: true,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '14px',
            fontWeight: 600
          },
          rotation: 0,
          reserveSpace: true,
          y: 5,
          x: 30,
          useHTML: false
        },
        lineColor: '#ccc',
        lineWidth: 0,
        type: 'category'
      }],
      yAxis: {
        accessibility: {
          description: 'Index'
        },
        allowDecimals: true,
        custom: {
          allowNegativeLog: true
        },
        gridLineColor: 'rgba(124, 112, 103, 0.2)',
        gridLineWidth: 1,
        gridLineDashStyle: 'shortdot',
        labels: {
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: 16,
            fontWeight: 400
          }
        },
        endOnTick: false,
        lineColor: 'transparent',
        lineWidth: 0,
        max: ymax,
        min: ymin,
        opposite: false,
        startOnTick: false,
        plotLines: [{
          color: 'rgba(124, 112, 103, 0.6)',
          value: 0,
          width: 1
        }],
        showFirstLabel: true,
        showLastLabel: true,
        stackLabels: {
          enabled: true,
          formatter() {
            // eslint-disable-next-line react/no-this-in-sfc
            return (this.total === 0) ? '' : `${this.total}`;
          },
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: 16,
            fontWeight: 600
          }
        },
        tickInterval: 20,
        title: {
          align: 'high',
          enabled: true,
          reserveSpace: false,
          rotation: 0,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400
          },
          text: '',
          verticalAlign: 'top',
          x: 94,
          y: -25
        },
        type: 'linear'
      }
    });
    chartRef.current.querySelector(`#chartIdx${idx}`).style.opacity = 1;
  }, [idx, data, data_decimals, export_title_margin, note, source, subtitle, title, xlabel, xlabelrotation, ymax, ymin]);

  useEffect(() => {
    if (isVisible === true) {
      setTimeout(() => {
        createChart();
      }, 300);
    }
  }, [createChart, isVisible]);

  return (
    <div className="chart_container" style={{ minHeight: chartHeight }}>
      <div ref={chartRef}>
        {(isVisible) && (<div className="chart" id={`chartIdx${idx}`} />)}
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

ColumnChart.propTypes = {
  data: PropTypes.instanceOf(Array).isRequired,
  data_decimals: PropTypes.number.isRequired,
  export_title_margin: PropTypes.number,
  idx: PropTypes.string.isRequired,
  note: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  source: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  title: PropTypes.string.isRequired,
  xlabel: PropTypes.string,
  xlabelrotation: PropTypes.number,
  ymax: PropTypes.number,
  ymin: PropTypes.number
};

ColumnChart.defaultProps = {
  export_title_margin: 0,
  note: false,
  subtitle: false,
  xlabel: '',
  xlabelrotation: 0,
  ymax: undefined,
  ymin: undefined
};

export default ColumnChart;
