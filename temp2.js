    
        MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']]
            }
        };
    
    
        function switchTab(event, lang, tabName) {
            const container = event.currentTarget.closest('.tabs-container');
            container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            event.currentTarget.classList.add('active');
            document.getElementById(`tab-${lang}-${tabName}`).classList.add('active');
        }

        function switchStep(btn) {
            const container = btn.closest('.stepper');
            container.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));
            container.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            btn.nextElementSibling.classList.add('active');
        }
        const btn = document.getElementById('lang-switch');
        const text = document.getElementById('lang-text');
        
        btn.addEventListener('click', () => {
            const isEnglish = document.body.classList.contains('lang-en');
            if (isEnglish) {
                document.body.classList.remove('lang-en');
                document.body.classList.add('lang-fr');
                text.textContent = "Switch to English";
                buildTOC('fr');
            } else {
                document.body.classList.remove('lang-fr');
                document.body.classList.add('lang-en');
                text.textContent = "Passer au Français";
                buildTOC('en');
            }
        });

        // Dynamic Table of Contents Generator
        function buildTOC(lang) {
            const tocList = document.getElementById('toc-list');
            tocList.innerHTML = '';

            const activeMain = document.querySelector(`div[lang="${lang}"]`);
            if (!activeMain) return;

            const headings = activeMain.querySelectorAll('h2');
            headings.forEach((h2, index) => {
                if (!h2.id) {
                    h2.id = `${lang}-section-${index}`;
                }
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${h2.id}`;
                // Keep only the Roman numeral and first word or two to make buttons compact
                let shortTitle = h2.textContent.split(' ').slice(0, 3).join(' ');
                if (shortTitle.length > 25) shortTitle = shortTitle.substring(0, 22) + '...';
                a.textContent = shortTitle;
                a.className = 'toc-btn';
                li.appendChild(a);
                tocList.appendChild(li);
            });
        }

        // Initialize TOC immediately
        const isEnglish = document.body.classList.contains('lang-en');
        buildTOC(isEnglish ? 'en' : 'fr');
    
    
        document.addEventListener('DOMContentLoaded', function() {
            const pointLabelsPlugin = {
                id: 'pointLabels',
                afterDraw(chart) {
                    const { ctx, scales: { x, y } } = chart;
                    const dataset = chart.data.datasets[0];
                    const specialPoints = dataset.specialPoints;

                    if (!specialPoints) return;

                    ctx.save();
                    ctx.font = 'bold 18px Arial';
                    
                    specialPoints.forEach(pt => {
                        const meta = chart.getDatasetMeta(0);
                        const dataPoint = meta.data[pt.index];
                        if (!dataPoint) return;

                        const px = dataPoint.x;
                        const py = dataPoint.y;
                        const yZero = y.getPixelForValue(0);

                        // Draw dotted line
                        ctx.beginPath();
                        ctx.setLineDash([6, 4]);
                        ctx.moveTo(px, py);
                        ctx.lineTo(px, yZero);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = '#e11d48'; // Prominent red
                        ctx.stroke();

                        // Draw label exactly near the point
                        ctx.setLineDash([]);
                        let textY = py - 12;
                        let textX = px;
                        
                        // Move label higher if the point is at the bottom line
                        if (Math.abs(py - yZero) < 5) {
                            textY = py - 18;
                        }

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        const textWidth = ctx.measureText(pt.label).width;
                        
                        // White semi-transparent background so the label pops
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillRect(textX - textWidth/2 - 4, textY - 18, textWidth + 8, 22);
                        
                        ctx.fillStyle = '#e11d48';
                        ctx.fillText(pt.label, textX, textY);
                    });
                    
                    const examplePoints = dataset.examplePoints;
                    if (examplePoints) {
                        ctx.font = 'bold 13px Arial';
                        ctx.textBaseline = 'middle';
                        
                        examplePoints.forEach(ex => {
                            const meta = chart.getDatasetMeta(0);
                            const lower = Math.floor(ex.index);
                            const upper = Math.ceil(ex.index);
                            const fraction = ex.index - lower;
                            
                            const p1 = meta.data[lower];
                            const p2 = meta.data[upper] || p1;
                            
                            if (!p1) return;

                            const px = p1.x + fraction * (p2.x - p1.x);
                            const py = p1.y + fraction * (p2.y - p1.y);

                            // Draw a green dot
                            ctx.beginPath();
                            ctx.arc(px, py, 6, 0, 2 * Math.PI);
                            ctx.fillStyle = '#059669'; // Emerald green
                            ctx.fill();
                            ctx.strokeStyle = '#fff';
                            ctx.lineWidth = 2;
                            ctx.stroke();

                            // Determine where to place text
                            let textY = py - 30;
                            let textX;
                            const textWidth = ctx.measureText(ex.formula).width;

                            if (ex.forceLeft || px < chart.width / 2) {
                                // Left half of the chart (or forced): point outward to the left
                                textX = px - 20;
                                ctx.textAlign = 'right';
                                
                                // Prevent going off the left edge
                                if (textX - textWidth < 10) {
                                    textX = px + 20;
                                    ctx.textAlign = 'left';
                                }
                            } else {
                                // Right half of the chart: point outward to the right
                                textX = px + 20;
                                ctx.textAlign = 'left';
                                
                                // Prevent going off the right edge
                                if (textX + textWidth > chart.width - 10) {
                                    textX = px - 20;
                                    ctx.textAlign = 'right';
                                }
                            }
                            
                            // Prevent going off the top edge
                            if (py < 60) {
                                textY = py + 30;
                            }

                            // Draw pointer line
                            ctx.beginPath();
                            ctx.setLineDash([3, 3]);
                            ctx.moveTo(px, py);
                            ctx.lineTo(textX + (ctx.textAlign === 'right' ? 8 : -8), textY);
                            ctx.strokeStyle = '#059669';
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                            ctx.setLineDash([]);

                            // Draw text background box
                            const boxX = ctx.textAlign === 'right' ? textX - textWidth - 8 : textX - 8;
                            
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                            ctx.fillRect(boxX, textY - 14, textWidth + 16, 28);
                            
                            // Draw border for the box
                            ctx.strokeStyle = '#059669';
                            ctx.lineWidth = 1;
                            ctx.strokeRect(boxX, textY - 14, textWidth + 16, 28);

                            // Draw text
                            ctx.fillStyle = '#059669';
                            ctx.fillText(ex.formula, textX, textY);
                        });
                    }
                    ctx.restore();
                }
            };

            const commonOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'μ(x) = ' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: { min: 0, max: 1.2, title: { display: true, text: 'Degree (μ)' } }, // increased max to 1.2 so labels fit
                    x: { title: { display: true, text: 'Input (x)' } }
                }
            };

            function createChart(ctxId, dataConfig, customOptions = commonOptions) {
                ['En', 'Fr'].forEach(lang => {
                    const ctx = document.getElementById(ctxId + lang);
                    if (ctx) {
                        new Chart(ctx, {
                            type: 'line',
                            data: dataConfig,
                            options: customOptions,
                            plugins: [pointLabelsPlugin]
                        });
                    }
                });
            }

            // Intersection (Logical AND) Chart
            const interDataTriangle = [];
            const interDataTrapezoid = [];
            const interDataMin = [];
            for (let i = 0; i <= 200; i++) {
                let x = i / 10;
                let t = (x <= 5 || x >= 15) ? 0 : (x <= 10 ? (x - 5) / 5 : (15 - x) / 5);
                let p = (x <= 10 || x >= 20) ? 0 : (x <= 12 ? (x - 10) / 2 : (x <= 18 ? 1 : (20 - x) / 2));
                let m = Math.min(t, p);
                interDataTriangle.push({x, y: t});
                interDataTrapezoid.push({x, y: p});
                interDataMin.push({x, y: m});
            }

            const intersectionOptions = {
                ...commonOptions,
                scales: {
                    y: { 
                        min: 0, max: 1.2, 
                        title: { display: true, text: 'A ∩ B' },
                        ticks: { stepSize: 1, callback: function(value) { return (value === 0 || value === 1) ? value : ''; } }
                    },
                    x: { 
                        type: 'linear',
                        min: 0, max: 20,
                        title: { display: true, text: 'Input (x)' }
                    }
                }
            };

            createChart('intersectionChart', {
                datasets: [
                    {
                        label: 'A (Triangle)',
                        data: interTriangle,
                        borderColor: '#3b82f6',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0,
                        pointRadius: 0
                    },
                    {
                        label: 'B (Trapezoid)',
                        data: interTrapezoid,
                        borderColor: '#f59e0b',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0,
                        pointRadius: 0
                    },
                    {
                        label: 'A ∩ B',
                        data: interMin,
                        borderColor: 'transparent',
                        backgroundColor: 'rgba(16, 185, 129, 0.4)',
                        fill: true,
                        tension: 0,
                        pointRadius: 0
                    }
                ]
            }, intersectionOptions);

            // 1. Triangular (10, 20, 30)
            createChart('triangularChart', {
                labels: [0, 5, 10, 15, 20, 25, 30, 35, 40],
                datasets: [{
                    label: 'Triangular (10, 20, 30)',
                    data: [0, 0, 0, 0.5, 1, 0.5, 0, 0, 0],
                    specialPoints: [
                        {index: 2, label: 'a'},
                        {index: 4, label: 'b'},
                        {index: 6, label: 'c'}
                    ],
                    examplePoints: [
                        {index: 3, formula: 'μ(15) = (15-10)/10 = 0.5'},
                        {index: 5.2, formula: 'μ(26) = (30-26)/10 = 0.4'}
                    ],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0
                }]
            });

            // 2. Trapezoidal (10, 20, 30, 40)
            createChart('trapezoidalChart', {
                labels: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
                datasets: [{
                    label: 'Trapezoidal (10, 20, 30, 40)',
                    data: [0, 0, 0, 0.5, 1, 1, 1, 0.5, 0, 0, 0],
                    specialPoints: [
                        {index: 2, label: 'a'},
                        {index: 4, label: 'b'},
                        {index: 6, label: 'c'},
                        {index: 8, label: 'd'}
                    ],
                    examplePoints: [
                        {index: 2.4, formula: 'μ(12) = (12-10)/10 = 0.2'},
                        {index: 6.8, formula: 'μ(34) = (40-34)/10 = 0.6'}
                    ],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                    tension: 0
                }]
            });

            // 3. Gaussian (c=20, sigma=5)
            const gaussX = Array.from({length: 41}, (_, i) => i);
            const gaussY = gaussX.map(x => Math.exp(-Math.pow(x - 20, 2) / (2 * 25)));
            createChart('gaussianChart', {
                labels: gaussX,
                datasets: [{
                    label: 'Gaussian (c=20, σ=5)',
                    data: gaussY,
                    specialPoints: [
                        {index: 20, label: 'c'}
                    ],
                    examplePoints: [
                        {index: 13, formula: 'μ(13) = e^-(49/50) = 0.38'},
                        {index: 27, formula: 'μ(27) = e^-(49/50) = 0.38'}
                    ],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            });

            // 4. Sigmoid (a=0.5, c=20)
            const sigX = Array.from({length: 41}, (_, i) => i);
            const sigY = sigX.map(x => 1 / (1 + Math.exp(-0.5 * (x - 20))));
            createChart('sigmoidChart', {
                labels: sigX,
                datasets: [{
                    label: 'Sigmoid (a=0.5, c=20)',
                    data: sigY,
                    specialPoints: [
                        {index: 20, label: 'c'}
                    ],
                    examplePoints: [
                        {index: 18, formula: 'μ(18) = 1/(1+e^1) = 0.27', forceLeft: true},
                        {index: 22, formula: 'μ(22) = 1/(1+e^-1) = 0.73', forceLeft: true}
                    ],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            });
            // Fuzzy Quantifier Charts (Figures 5.1 to 5.5)
            const monoX = Array.from({length: 101}, (_, i) => i / 100);
            const monoY = monoX.map(x => (x < 0.5 ? 0 : (2 * x) - 1));
            
            const quantifierOptions = {
                ...commonOptions,
                plugins: {
                    legend: { display: true },
                    tooltip: commonOptions.plugins.tooltip
                },
                scales: {
                    y: {
                        min: 0,
                        max: 1.1,
                        title: { display: true, text: 'Q(p)' },
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return (value === 0 || value === 1) ? value : '';
                            }
                        }
                    },
                    x: {
                        title: { display: true, text: 'Proportion (p)' },
                        ticks: {
                            autoSkip: false,
                            callback: function(val, index) {
                                const xVal = monoX[index];
                                if (xVal === undefined) return '';
                                if ([0, 0.25, 0.5, 0.75, 1].includes(xVal)) {
                                    return xVal.toFixed(2);
                                }
                                return '';
                            },
                            maxRotation: 0
                        }
                    }
                }
            };
            
            ['EN', 'FR'].forEach(lang => {
                // 5.1 Monotonic
                const monoCtx = document.getElementById('monotonicChart' + lang);
                if (monoCtx) {
                    new Chart(monoCtx, {
                        type: 'line',
                        data: {
                            labels: monoX.map(x => x.toFixed(2)),
                            datasets: [{
                                label: 'Monotone (la plupart)',
                                data: monoY,
                                specialPoints: [{index: 50, label: '0.5'}],
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                fill: true,
                                tension: 0,
                                pointRadius: 0
                            }]
                        },
                        options: quantifierOptions,
                        plugins: [pointLabelsPlugin]
                    });
                }
                
                // 5.2 Non-monotonic (Gaussian around 0.5)
                const nonMonoCtx = document.getElementById('nonMonotonicChart' + lang);
                if (nonMonoCtx) {
                    const nonMonoY = monoX.map(x => Math.exp(-0.5 * Math.pow((x - 0.5) / 0.1, 2)));
                    new Chart(nonMonoCtx, {
                        type: 'line',
                        data: {
                            labels: monoX.map(x => x.toFixed(2)),
                            datasets: [{
                                label: 'Non monotone (≈ moitié)',
                                data: nonMonoY,
                                specialPoints: [{index: 50, label: '0.5'}],
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0
                            }]
                        },
                        options: quantifierOptions,
                        plugins: [pointLabelsPlugin]
                    });
                }

                // 5.3 Regular (Linear)
                const regCtx = document.getElementById('regularChart' + lang);
                if (regCtx) {
                    new Chart(regCtx, {
                        type: 'line',
                        data: {
                            labels: monoX.map(x => x.toFixed(2)),
                            datasets: [{
                                label: 'Régulier',
                                data: monoX,
                                borderColor: '#3b82f6',
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                fill: true,
                                tension: 0,
                                pointRadius: 0
                            }]
                        },
                        options: quantifierOptions
                    });
                }

                // 5.4 Non-regular (Constant 0.5)
                const nonRegCtx = document.getElementById('nonRegularChart' + lang);
                if (nonRegCtx) {
                    new Chart(nonRegCtx, {
                        type: 'line',
                        data: {
                            labels: monoX.map(x => x.toFixed(2)),
                            datasets: [{
                                label: 'Non régulier',
                                data: monoX.map(() => 0.5),
                                borderColor: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                fill: true,
                                tension: 0,
                                pointRadius: 0
                            }]
                        },
                        options: quantifierOptions
                    });
                }

                // 5.5 Linguistic ("Beaucoup" & "Peu")
                const lingCtx = document.getElementById('linguisticChart' + lang);
                if (lingCtx) {
                    const beaucoupY = monoX.map(x => 1 / (1 + Math.exp(-10 * (x - 0.5))));
                    const peuY = monoX.map(x => 1 - (1 / (1 + Math.exp(-10 * (x - 0.5)))));
                    new Chart(lingCtx, {
                        type: 'line',
                        data: {
                            labels: monoX.map(x => x.toFixed(2)),
                            datasets: [
                                {
                                    label: 'Beaucoup',
                                    data: beaucoupY,
                                    borderColor: '#111827',
                                    backgroundColor: 'transparent',
                                    fill: false,
                                    tension: 0.4,
                                    pointRadius: 0
                                },
                                {
                                    label: 'Peu',
                                    data: peuY,
                                    borderColor: '#d946ef',
                                    backgroundColor: 'transparent',
                                    fill: false,
                                    tension: 0.4,
                                    pointRadius: 0
                                }
                            ]
                        },
                        options: quantifierOptions,
                        plugins: [pointLabelsPlugin]
                    });
                }
            });
        });
    
