'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';

const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export function LineChart({ data, title, xField = 'day', yField = 'count', color = '#1890ff' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const getOption = useCallback(() => ({
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => d[xField]),
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        data: data.map(d => d[yField]),
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}40` },
            { offset: 1, color: `${color}05` },
          ]),
        },
        lineStyle: { color },
        itemStyle: { color },
      },
    ],
  }), [data, title, xField, yField, color]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    chartInstance.current.setOption(getOption(), { notMerge: true });

    const handleResize = debounce(() => chartInstance.current?.resize(), 150);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [getOption]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(getOption(), { notMerge: true });
    }
  }, [getOption]);

  return <div ref={chartRef} style={{ width: '100%', height: '280px' }} />;
}

export function PieChart({ data, title, nameField = 'name', valueField = 'value' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const getOption = useCallback(() => ({
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            formatter: '{b}\n{c}',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((d, i) => ({
          name: d[nameField],
          value: d[valueField],
          itemStyle: { color: colors[i % colors.length] },
        })),
      },
    ],
  }), [data, title, nameField, valueField]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    chartInstance.current.setOption(getOption(), { notMerge: true });

    const handleResize = debounce(() => chartInstance.current?.resize(), 150);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [getOption]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(getOption(), { notMerge: true });
    }
  }, [getOption]);

  return <div ref={chartRef} style={{ width: '100%', height: '280px' }} />;
}

export function BarChart({ data, title, xField = 'day', yField = 'count', color = '#1890ff' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const getOption = useCallback(() => ({
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d[xField]),
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        data: data.map(d => d[yField]),
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color },
            { offset: 1, color: `${color}80` },
          ]),
        },
      },
    ],
  }), [data, title, xField, yField, color]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    chartInstance.current.setOption(getOption(), { notMerge: true });

    const handleResize = debounce(() => chartInstance.current?.resize(), 150);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [getOption]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(getOption(), { notMerge: true });
    }
  }, [getOption]);

  return <div ref={chartRef} style={{ width: '100%', height: '280px' }} />;
}

export function MultiBarChart({ data, title, series }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const getOption = useCallback(() => ({
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: series.map(s => s.name),
      bottom: '5%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day),
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: series.map((s, i) => ({
      name: s.name,
      type: 'bar',
      stack: 'total',
      barWidth: '50%',
      itemStyle: { color: colors[i % colors.length] },
      data: data.map(d => d[s.field]),
    })),
  }), [data, title, series]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    chartInstance.current.setOption(getOption(), { notMerge: true });

    const handleResize = debounce(() => chartInstance.current?.resize(), 150);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [getOption]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(getOption(), { notMerge: true });
    }
  }, [getOption]);

  return <div ref={chartRef} style={{ width: '100%', height: '280px' }} />;
}

export function RadarChart({ data, title, indicator }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const getOption = useCallback(() => ({
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' },
    },
    tooltip: {},
    legend: {
      data: data.map(d => d.name),
      bottom: '5%',
    },
    radar: {
      indicator: indicator,
      center: ['50%', '45%'],
      radius: '60%',
    },
    series: [{
      type: 'radar',
      data: data.map((d, i) => ({
        value: d.value,
        name: d.name,
        lineStyle: { color: colors[i % colors.length] },
        areaStyle: { color: `${colors[i % colors.length]}30` },
        itemStyle: { color: colors[i % colors.length] },
      })),
    }],
  }), [data, title, indicator]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    chartInstance.current.setOption(getOption(), { notMerge: true });

    const handleResize = debounce(() => chartInstance.current?.resize(), 150);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [getOption]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(getOption(), { notMerge: true });
    }
  }, [getOption]);

  return <div ref={chartRef} style={{ width: '100%', height: '280px' }} />;
}

export function ScatterChart({ data, title, xField = 'x', yField = 'y', colorField }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const getOption = useCallback(() => ({
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const item = data[params.dataIndex];
        return `${item.name || '数据点'}<br/>${xField}: ${item[xField]}<br/>${yField}: ${item[yField]}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: xField,
    },
    yAxis: {
      type: 'value',
      name: yField,
    },
    series: [{
      type: 'scatter',
      data: data.map(d => ({
        value: [d[xField], d[yField]],
        name: d.name,
        itemStyle: {
          color: colorField ? d[colorField] : '#1890ff',
          opacity: 0.8,
        },
      })),
      symbolSize: 12,
    }],
  }), [data, title, xField, yField, colorField]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    chartInstance.current.setOption(getOption(), { notMerge: true });

    const handleResize = debounce(() => chartInstance.current?.resize(), 150);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [getOption]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(getOption(), { notMerge: true });
    }
  }, [getOption]);

  return <div ref={chartRef} style={{ width: '100%', height: '280px' }} />;
}

export function FunnelChart({ data, title, nameField = 'name', valueField = 'value' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const getOption = useCallback(() => ({
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
    },
    series: [{
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid',
        },
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
      },
      emphasis: {
        label: {
          fontSize: 16,
        },
      },
      data: data.map((d, i) => ({
        value: d[valueField],
        name: d[nameField],
        itemStyle: { color: colors[i % colors.length] },
      })),
    }],
  }), [data, title, nameField, valueField]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    chartInstance.current.setOption(getOption(), { notMerge: true });

    const handleResize = debounce(() => chartInstance.current?.resize(), 150);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [getOption]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(getOption(), { notMerge: true });
    }
  }, [getOption]);

  return <div ref={chartRef} style={{ width: '100%', height: '280px' }} />;
}