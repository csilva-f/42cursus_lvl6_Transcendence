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
        await tournament.setGames(tGames);
        
    } catch (error) {
        console.error("Error initializing local tournament:", error);
    }
}
