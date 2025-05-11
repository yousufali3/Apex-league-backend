import { Tournament } from '../models/Tournament.js';

// Sort function (used for both solo and teams)
const sortByRankAndKills = (list) => {
  return list.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return b.kills - a.kills;
  });
};

// Helper to get rank-based prize
const getRankPrize = (rank, rankPrizes) => {
  for (const prize of rankPrizes) {
    if (rank >= prize.from && rank <= prize.to) {
      return prize.amount;
    }
  }
  return 0;
};

// 🧠 Main calculation logic
export const calculateWinners = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId)
    .populate('registeredPlayers')
    .populate('registeredTeams');

  const { prizeBreakup, mode } = tournament;

  let winners = [];

  if (mode === 'solo') {
    const sortedPlayers = sortByRankAndKills(tournament.registeredPlayers);
    winners = sortedPlayers.map((player) => {
      let prize = 0;

      if (prizeBreakup.type === 'per_kill') {
        prize = player.kills * prizeBreakup.perKillAmount;
      } else if (prizeBreakup.type === 'rank') {
        prize = getRankPrize(player.rank, prizeBreakup.rankPrizes);
      } else if (prizeBreakup.type === 'both') {
        prize =
          player.kills * prizeBreakup.perKillAmount +
          getRankPrize(player.rank, prizeBreakup.rankPrizes);
      }

      return {
        userId: player.userId,
        username: player.username,
        gameUid: player.gameUid,
        kills: player.kills,
        rank: player.rank,
        prize,
      };
    });
  } else {
    const sortedTeams = sortByRankAndKills(tournament.registeredTeams);
    winners = sortedTeams.map((team) => {
      let prize = 0;

      if (prizeBreakup.type === 'per_kill') {
        prize = team.kills * prizeBreakup.perKillAmount;
      } else if (prizeBreakup.type === 'rank') {
        prize = getRankPrize(team.rank, prizeBreakup.rankPrizes);
      } else if (prizeBreakup.type === 'both') {
        prize =
          team.kills * prizeBreakup.perKillAmount +
          getRankPrize(team.rank, prizeBreakup.rankPrizes);
      }

      return {
        teamName: team.teamName,
        players: team.players,
        kills: team.kills,
        rank: team.rank,
        prize,
      };
    });
  }

  tournament.winners = winners;
  await tournament.save();

  return winners;
};
