let myChart;

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
	const barColors = ["green", "red"];
	if (myChart)
        myChart.destroy();
    
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
}
