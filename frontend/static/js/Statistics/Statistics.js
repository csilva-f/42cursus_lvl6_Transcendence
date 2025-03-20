let myChart;
let myChart2;

function StatsSelect(elementID) {
	const statsEverythingIcon = document.getElementById('statsEverythingIcon');
	const statsGameIcon = document.getElementById('statsGameIcon');
	const statsTournamentIcon = document.getElementById('statsTournamentIcon');
	switch (elementID) {
		case 'statsEverythingIcon':
			disableIcon(statsGameIcon);
			disableIcon(statsTournamentIcon);
			activateIcon(statsEverythingIcon);
			createChart(userStats, 1);
			break;
		case 'statsGameIcon':
			disableIcon(statsEverythingIcon);
			disableIcon(statsTournamentIcon);
			activateIcon(statsGameIcon);
			createChart(userStats, 2);
			break;
		case 'statsTournamentIcon':
			disableIcon(statsEverythingIcon);
			disableIcon(statsGameIcon);
			activateIcon(statsTournamentIcon);
			createChart(userStats, 3);
			break;
	}
}

function createChart(userStats, option) {
	let xValues = [];
	let yValues = [];
	let victories = 0;
	let losses = 0;
	console.log(userStats)
	switch (option) {
		case 1:
			xValues = ["Matches Victories", "Matches Lost"];
			victories = parseInt(userStats.GameVictories) + parseInt(userStats.TournamentVictories);
			losses = parseInt(userStats.GameLosses) + parseInt(userStats.TournamentLosses);
			break;
		case 2:
			xValues = ["Games Victories", "Games Lost"];
			victories = parseInt(userStats.GameVictories);
			losses = parseInt(userStats.GameLosses);
			break;
		case 3:
			xValues = ["Tournaments Victories", "Tournaments Lost"];
			victories = parseInt(userStats.TournamentVictories);
			losses = parseInt(userStats.TournamentLosses);
			break;
	}
	yValues = [victories, losses];
	console.log(yValues)
	const barColors = ["#007f4ecc", "#e12729cc"];
	if (myChart)
        myChart.destroy();
	if (myChart2)
        myChart2.destroy();
    
    myChart = new Chart("myChart", {
		type: "doughnut",
		data: {
			labels: xValues,
			datasets: [{
				backgroundColor: barColors,
				data: yValues
			}]
		},
	});

	myChart2 = new Chart("myChart2", {
		type: "bar",
		data: {
			labels: ["Matches"],
			datasets: [
				{
					label: "Victories",
					backgroundColor: barColors[0],
					data: [yValues[0]]
				},
				{
					label: "Losses",
					backgroundColor: barColors[1],
					data: [yValues[1]]
				}
			],
		},
		options: {
			indexAxis: 'y',
			responsive: true,
			scales: {
				x: {
					stacked: false
				},
				y: {
					stacked: false
				}
			}
		}
	});
	
	
}

function changeChartType() {
	const chart1 = document.getElementById("myChart")
	const chart2 = document.getElementById("myChart2")
	if (chart1.classList.contains('d-none')) {
		chart1.classList.remove('d-none');
		chart2.classList.add('d-none');
	} else {
		chart2.classList.remove('d-none');
		chart1.classList.add('d-none');
	}
}

function insertPageInfo(userStats) {
	const points = document.getElementById("totalPoints");
	const time = document.getElementById("totalTime");
	const hits = document.getElementById("totalBallsHit");

	points.textContent = userStats.TotalGamePoints;
	const timeString = userStats.TotalGameTime;
	const formattedTime = timeString.split('.')[0];
	time.textContent = formattedTime;
	hits.textContent = userStats.TotalBallHits;
}
