
/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import CartesianAxisModel from '@/src/coord/cartesian/AxisModel';
import { EChartsType } from '@/src/echarts';
import TimeScale from '@/src/scale/Time';
import { createChart, getECModel } from '../../core/utHelper';

describe('scale_time_exact_ticks', function () {
    let chart: EChartsType;
    beforeEach(function () {
        chart = createChart();
    });

    afterEach(function () {
        chart.dispose();
    });

    it('should use exact ticks when useExactTicks is true and data provided', function () {
        const exactTimes = [
            '2024-01-01 08:30:00',
            '2024-01-01 08:45:00',
            '2024-01-01 09:00:00',
            '2024-01-01 09:15:00',
            '2024-01-01 09:30:00'
        ];

        chart.setOption({
            xAxis: {
                type: 'time',
                useExactTicks: true,
                data: exactTimes
            },
            yAxis: { type: 'value' },
            series: [{
                type: 'line',
                data: [[exactTimes[0], 10], [exactTimes[1], 20], [exactTimes[2], 15]]
            }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        expect(ticks.length).toBe(exactTimes.length);
        const tickValues = ticks.map(t => t.value);
        const expectedValues = exactTimes.map(t => +new Date(t));
        expect(tickValues).toEqual(expectedValues);
    });

    it('should render 15-minute intervals exactly without rounding', function () {
        const fifteenMinIntervals = [
            '2024-01-01 08:15:00',
            '2024-01-01 08:30:00',
            '2024-01-01 08:45:00',
            '2024-01-01 09:00:00',
            '2024-01-01 09:15:00',
            '2024-01-01 09:30:00'
        ];

        chart.setOption({
            xAxis: {
                type: 'time',
                useExactTicks: true,
                data: fifteenMinIntervals
            },
            yAxis: {},
            series: [{ type: 'line', data: [] }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        const tickValues = ticks.map(t => t.value);
        const expectedValues = fifteenMinIntervals.map(t => +new Date(t));
        expect(tickValues).toEqual(expectedValues);
    });

    it('should fall back to automatic calculation when useExactTicks is true but data is empty', function () {
        chart.setOption({
            xAxis: {
                type: 'time',
                useExactTicks: true,
                data: []
            },
            yAxis: {},
            series: [{
                type: 'line',
                data: [
                    ['2024-01-01', 10],
                    ['2024-01-02', 20],
                    ['2024-01-03', 15]
                ]
            }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        expect(ticks.length).toBeGreaterThan(0);
    });

    it('should sort unsorted timestamps before rendering', function () {
        const unsortedTimes = [
            '2024-01-01 09:00:00',
            '2024-01-01 08:00:00',
            '2024-01-01 10:00:00',
            '2024-01-01 08:30:00'
        ];

        chart.setOption({
            xAxis: {
                type: 'time',
                useExactTicks: true,
                data: unsortedTimes
            },
            yAxis: {},
            series: [{ type: 'line', data: [] }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        const tickValues = ticks.map(t => t.value);
        const sortedValues = unsortedTimes.map(t => +new Date(t)).sort((a, b) => a - b);
        expect(tickValues).toEqual(sortedValues);
    });

    it('should ignore minInterval, maxInterval, and splitNumber when useExactTicks is true', function () {
        const exactTimes = [
            '2024-01-01 08:00:00',
            '2024-01-01 09:00:00',
            '2024-01-01 10:00:00'
        ];

        chart.setOption({
            xAxis: {
                type: 'time',
                useExactTicks: true,
                data: exactTimes,
                splitNumber: 10,
                minInterval: 1000,
                maxInterval: 100000
            },
            yAxis: {},
            series: [{ type: 'line', data: [] }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        expect(ticks.length).toBe(exactTimes.length);
        const tickValues = ticks.map(t => t.value);
        const expectedValues = exactTimes.map(t => +new Date(t));
        expect(tickValues).toEqual(expectedValues);
    });

    it('should maintain default behavior when useExactTicks is false or undefined', function () {
        chart.setOption({
            xAxis: {
                type: 'time'
            },
            yAxis: {},
            series: [{
                type: 'line',
                data: [
                    ['2024-01-01', 10],
                    ['2024-01-05', 20]
                ]
            }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        expect(ticks.length).toBeGreaterThan(0);
    });

    it('should have correct TimeScaleTick format with time level metadata', function () {
        const exactTimes = [
            '2024-01-01 08:00:00',
            '2024-01-01 09:00:00'
        ];

        chart.setOption({
            xAxis: {
                type: 'time',
                useExactTicks: true,
                data: exactTimes
            },
            yAxis: {},
            series: [{ type: 'line', data: [] }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        expect(ticks.length).toBe(exactTimes.length);
        ticks.forEach(tick => {
            expect(tick.value).toBeDefined();
            expect(tick.time).toBeDefined();
            expect(tick.time.level).toBeDefined();
            expect(tick.time.upperTimeUnit).toBeDefined();
            expect(tick.time.lowerTimeUnit).toBeDefined();
        });
    });

    it('should filter ticks by extent', function () {
        const exactTimes = [
            '2024-01-01 07:00:00',
            '2024-01-01 08:00:00',
            '2024-01-01 09:00:00',
            '2024-01-01 10:00:00',
            '2024-01-01 11:00:00'
        ];

        chart.setOption({
            xAxis: {
                type: 'time',
                useExactTicks: true,
                data: exactTimes,
                min: '2024-01-01 08:00:00',
                max: '2024-01-01 10:00:00'
            },
            yAxis: {},
            series: [{ type: 'line', data: [] }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        const tickValues = ticks.map(t => t.value);
        const expectedValues = [
            +new Date('2024-01-01 08:00:00'),
            +new Date('2024-01-01 09:00:00'),
            +new Date('2024-01-01 10:00:00')
        ];
        expect(tickValues).toEqual(expectedValues);
    });

    it('should handle numeric timestamp input', function () {
        const now = Date.now();
        const exactTimes = [
            now,
            now + 3600000,
            now + 7200000
        ];

        chart.setOption({
            xAxis: {
                type: 'time',
                useExactTicks: true,
                data: exactTimes
            },
            yAxis: {},
            series: [{ type: 'line', data: [] }]
        });

        const xAxis = getECModel(chart).getComponent('xAxis', 0) as CartesianAxisModel;
        const scale = xAxis.axis.scale as TimeScale;
        const ticks = scale.getTicks();

        expect(ticks.length).toBe(exactTimes.length);
        const tickValues = ticks.map(t => t.value);
        expect(tickValues).toEqual(exactTimes);
    });
});
