class Tournament {
    constructor(tournamentID) {
        this.tournamentID = tournamentID;
        this.games = [];
        this.gameWinners = [];
    }

    getGames() {
        return this.games;
    }
    setGames(tGames) {
        this.games = tGames;
    }
}

async function initLocalTournament() {
    try {
        let tournamentID = await postLocalTournament();
        const tournament = new Tournament(tournamentID);
        let tGames = await fetchTournamentGames(tournamentID);
        tournament.setGames(tGames);
        
    } catch (error) {
    }
}
