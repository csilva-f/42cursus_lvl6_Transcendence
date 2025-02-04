function StatsSelect(elementID) {
    const statsEverythingIcon = document.getElementById('statsEverythingIcon');
    const statsGameIcon = document.getElementById('statsGameIcon');
    const statsTournamentIcon = document.getElementById('statsTournamentIcon');
    switch (elementID) {
        case 'statsEverythingIcon':
            disableIcon(statsGameIcon);
            disableIcon(statsTournamentIcon);
            activateIcon(statsEverythingIcon);
            fetchStatistics();
            break;
        case 'statsGameIcon':
            disableIcon(statsEverythingIcon);
            disableIcon(statsTournamentIcon);
            activateIcon(statsGameIcon);
            //logica para mostrar apenas dos games
            break;
        case 'statsTournamentIcon':
            disableIcon(statsEverythingIcon);
            disableIcon(statsGameIcon);
            activateIcon(statsTournamentIcon);
            //logica para mostrar apenas dos tournaments
            break;
    }
}

function createChart(stats) {
    const xValues = ["Matches Victories", "Matches Lost"];
    console.log(stats)
    //let victories = parseInt(stats[0].GameVictories) + parseInt(stats[0].TournamentVictories);
    //let losses = parseInt(stats[0].GameLosses) + parseInt(stats[0].TournamentLosses);
    //const yValues = [victories, losses];
    const yValues = [3, 1]
    console.log(yValues)
    console.log("comentei o load automatico")
    const barColors = ["green", "red"];
    new Chart("myChart", {
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
