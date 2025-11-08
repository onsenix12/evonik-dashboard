/**
 * Production Charts Module
 * Handles all chart initializations for the production dashboard
 * Breaks down the large initProductionCharts() function into smaller, focused functions
 */

// Chart instances namespace
const ProductionCharts = {
    equipmentUtilizationChart: null,
    sensorTrendsChart: null,
    oeeTrendChart: null,
    hourlyProductionChart: null,
    qualityTrendChart: null,
    safetyTrendChart: null,
    forecastChart: null
};

/**
 * Generate hour labels for 24-hour charts
 * @returns {Array<string>} Array of hour labels
 */
function generateHourLabels() {
    return Array.from({length: 24}, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return `${hour}:00`;
    });
}

/**
 * Generate day labels for trend charts
 * @param {number} days - Number of days to generate
 * @returns {Array<string>} Array of day labels
 */
function generateDayLabels(days = 30) {
    return Array.from({length: days}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
}

/**
 * Initialize Equipment Utilization Chart
 * @param {Object} data - Dashboard data object
 */
function initEquipmentUtilizationChart(data) {
    const ctx = document.getElementById('equipmentUtilizationChart');
    if (!ctx) return;

    ProductionCharts.equipmentUtilizationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['ME5 Unit', 'ME6 Unit'],
            datasets: [
                {
                    label: 'Current Output (MT/day)',
                    data: [
                        data.equipmentOutput.me5,
                        data.equipmentOutput.me6
                    ],
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: '#6366F1',
                    borderWidth: 2
                },
                {
                    label: 'Capacity (MT/day)',
                    data: [
                        data.equipmentOutput.me5Capacity,
                        data.equipmentOutput.me6Capacity
                    ],
                    backgroundColor: 'rgba(234, 88, 12, 0.6)',
                    borderColor: '#EA580C',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'MT/day' } }
            }
        }
    });
}

/**
 * Initialize Sensor Trends Chart
 * @param {Object} data - Dashboard data object
 */
function initSensorTrendsChart(data) {
    const ctx = document.getElementById('sensorTrendsChart');
    if (!ctx) return;

    const hours = generateHourLabels();
    ProductionCharts.sensorTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: data.sensorData.temperature,
                    borderColor: '#DC2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Pressure (bar)',
                    data: data.sensorData.pressure,
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    tension: 0.4
                },
                {
                    label: 'Flow Rate (m³/h)',
                    data: data.sensorData.flowRate,
                    borderColor: '#16A34A',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y2',
                    tension: 0.4
                },
                {
                    label: 'Vibration (mm/s)',
                    data: data.sensorData.vibration,
                    borderColor: '#EA580C',
                    backgroundColor: 'rgba(234, 88, 12, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y3',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Temperature (°C)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Pressure (bar)' },
                    grid: { drawOnChartArea: false }
                },
                y2: {
                    type: 'linear',
                    display: false
                },
                y3: {
                    type: 'linear',
                    display: false
                }
            }
        }
    });
}

/**
 * Initialize OEE Trend Chart
 * @param {Object} data - Dashboard data object
 */
function initOEETrendChart(data) {
    const ctx = document.getElementById('oeeTrendChart');
    if (!ctx) return;

    const days = generateDayLabels(30);
    ProductionCharts.oeeTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'OEE (%)',
                data: data.oeeTrend,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Industry Standard (85%)',
                data: Array(30).fill(85),
                borderColor: '#2563EB',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: false, min: 80, max: 100, title: { display: true, text: 'OEE (%)' } }
            }
        }
    });
}

/**
 * Initialize Hourly Production Chart
 * @param {Object} data - Dashboard data object
 */
function initHourlyProductionChart(data) {
    const ctx = document.getElementById('hourlyProductionChart');
    if (!ctx) return;

    const hours = generateHourLabels();
    ProductionCharts.hourlyProductionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Production (MT/hour)',
                data: data.hourlyProduction,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: '#6366F1',
                borderWidth: 1
            }, {
                label: 'Target (40.2 MT/hour)',
                data: Array(24).fill(40.2),
                type: 'line',
                borderColor: '#2563EB',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: 'MT/hour' } }
            }
        }
    });
}

/**
 * Initialize Quality Trend Chart
 * @param {Object} data - Dashboard data object
 */
function initQualityTrendChart(data) {
    const ctx = document.getElementById('qualityTrendChart');
    if (!ctx) return;

    const days = generateDayLabels(30);
    ProductionCharts.qualityTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Quality Rate (%)',
                data: data.qualityTrend.qualityRate,
                borderColor: '#16A34A',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Defect Rate (%)',
                data: data.qualityTrend.defectRate,
                borderColor: '#EA580C',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }, {
                label: 'Quality Target (98%)',
                data: Array(30).fill(98),
                borderColor: '#2563EB',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Defect Limit (2%)',
                data: Array(30).fill(2),
                borderColor: '#DC2626',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 96,
                    max: 100,
                    title: { display: true, text: 'Quality Rate (%)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 3,
                    title: { display: true, text: 'Defect Rate (%)' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

/**
 * Initialize Safety Trend Chart
 * @param {Object} data - Dashboard data object
 */
function initSafetyTrendChart(data) {
    const ctx = document.getElementById('safetyTrendChart');
    if (!ctx) return;

    const months = ['Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 
                    'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025'];
    ProductionCharts.safetyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Days Since Last Incident',
                data: data.safetyTrend.daysSinceIncident,
                borderColor: '#16A34A',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Near-Miss Reports',
                data: data.safetyTrend.nearMissReports,
                borderColor: '#EA580C',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: { display: true, text: 'Days Since Last Incident' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    title: { display: true, text: 'Near-Miss Reports' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

/**
 * Initialize Forecast Chart
 * @param {Object} data - Dashboard data object
 */
function initForecastChart(data) {
    const ctx = document.getElementById('forecastChart');
    if (!ctx) return;

    ProductionCharts.forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.forecastData.days,
            datasets: [{
                label: 'Forecast Capacity (MT/day)',
                data: data.forecastData.capacity,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4
            }, {
                label: 'Target Capacity (MT/day)',
                data: data.forecastData.target,
                borderColor: '#2563EB',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: { beginAtZero: false, min: 500, max: 1000, title: { display: true, text: 'MT/day' } }
            }
        }
    });
}

/**
 * Initialize all production charts
 * @param {Object} data - Dashboard data object
 */
function initProductionCharts(data) {
    initEquipmentUtilizationChart(data);
    initSensorTrendsChart(data);
    initOEETrendChart(data);
    initHourlyProductionChart(data);
    initQualityTrendChart(data);
    initSafetyTrendChart(data);
    initForecastChart(data);
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initProductionCharts,
        initEquipmentUtilizationChart,
        initSensorTrendsChart,
        initOEETrendChart,
        initHourlyProductionChart,
        initQualityTrendChart,
        initSafetyTrendChart,
        initForecastChart,
        ProductionCharts
    };
}

