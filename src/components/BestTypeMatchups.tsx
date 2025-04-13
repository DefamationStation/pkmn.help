import { ReactNode } from "react";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { FancyText } from "./FancyText";
import { Type, types as allTypes } from "../misc/data-types";
import { defensiveMatchups, offensiveMatchups } from "../misc/data-matchups";
import { Generation } from "../misc/data-generations";

interface BestTypeMatchupsProps {
  generation: Generation;
  types: Type[];
  teraType: Type;
}

interface TypeScore {
  types: Type[];
  defenseScore: number;
  offenseScore: number;
  totalScore: number;
}

function calculateTypeScore(
  generation: Generation,
  baseTypes: Type[],
  teraType: Type,
  type1: Type,
  type2?: Type
): TypeScore {
  const testTypes = type2 ? [type1, type2] : [type1];
  let defenseScore = 0;
  let offenseScore = 0;

  // First check effectiveness against the Tera type (most important)
  const againstTera = offensiveMatchups({
    gen: generation,
    offenseTypes: testTypes,
    specialMoves: [],
    offenseAbilities: []
  });

  // Heavily reward being super effective against the Tera type
  againstTera.matchups.forEach(matchup => {
    if (matchup.type === teraType) {
      if (matchup.effectiveness === 2) {
        offenseScore += 8; // Major bonus for being super effective vs Tera type
      } else if (matchup.effectiveness === 0.5) {
        offenseScore -= 4; // Major penalty for being not very effective vs Tera type
      }
    }
  });

  // Check how well we defend against opponent's moves
  const defenseVsOpponent = defensiveMatchups({
    gen: generation,
    defenseTypes: testTypes,
    defenseTeraType: Type.none,
    abilityName: "none"
  });

  // Score defensive matchups
  defenseVsOpponent.matchups.forEach(matchup => {
    if (baseTypes.includes(matchup.type) || matchup.type === teraType) {
      // Heavily penalize weaknesses to opponent's types
      if (matchup.effectiveness === 2) {
        defenseScore -= 6;
      } else if (matchup.effectiveness === 1.25) {
        defenseScore -= 3;
      } else if (matchup.effectiveness === 0.5) {
        defenseScore += 3;
      } else if (matchup.effectiveness === 0) {
        defenseScore += 5;
      }
    }
  });

  // Check how well we hit the base types
  const offenseVsBase = offensiveMatchups({
    gen: generation,
    offenseTypes: testTypes,
    specialMoves: [],
    offenseAbilities: []
  });

  offenseVsBase.matchups.forEach(matchup => {
    if (baseTypes.includes(matchup.type)) {
      if (matchup.effectiveness === 2) {
        offenseScore += 4;
      } else if (matchup.effectiveness === 0.5) {
        offenseScore -= 2;
      }
    }
  });

  // Normalize scores to avoid extremes
  const normalizedDefense = Math.min(15, Math.max(-15, defenseScore));
  const normalizedOffense = Math.min(15, Math.max(-15, offenseScore));

  return {
    types: testTypes,
    defenseScore: normalizedDefense,
    offenseScore: normalizedOffense,
    totalScore: normalizedOffense + (normalizedDefense * 1.2)
  };
}

export function BestTypeMatchups({
  generation,
  types,
  teraType,
}: BestTypeMatchupsProps): ReactNode {  // Get all possible type combinations including single types
  const typeScores: TypeScore[] = [];
  // Get defensive matchups considering tera type
  const teraDefMatch = defensiveMatchups({
    gen: generation,
    defenseTypes: types,
    defenseTeraType: teraType,
    abilityName: "none"
  });

  // Find types that would be ineffective (including immunities)
  const ineffectiveTypes = new Set<Type>();
  teraDefMatch.matchups.forEach(matchup => {
    if (matchup.effectiveness === 0) {
      ineffectiveTypes.add(matchup.type);
    }
  });
  // Single types
  allTypes.forEach((type1) => {
    if (!ineffectiveTypes.has(type1)) {
      typeScores.push(calculateTypeScore(generation, types, teraType, type1));
    }
  });

  // Dual types
  allTypes.forEach((type1, i) => {
    allTypes.slice(i + 1).forEach((type2) => {
      // Skip if either type would be immune
      if (!ineffectiveTypes.has(type1) && !ineffectiveTypes.has(type2)) {
        typeScores.push(calculateTypeScore(generation, types, teraType, type1, type2));
      }
    });
  });

  // Sort by total score, best first
  typeScores.sort((a, b) => b.totalScore - a.totalScore);

  // Take top 5
  const bestTypes = typeScores.slice(0, 5);

  return (    <Flex direction="column" gap="medium">
      {/* Show top single types first */}
      <FancyText tag="h3" fontSize="medium" fontWeight="medium">
        Best Single Types
      </FancyText>
      {bestTypes
        .filter(score => score.types.length === 1)
        .slice(0, 3)
        .map((score, index) => (
          <Card key={`single-${index}`}>
            <Flex direction="row" gap="medium" align="center">
              <FancyText tag="div" fontSize="large" fontWeight="medium">
                #{index + 1}
              </FancyText>
              <Flex direction="row" gap="small">
                {score.types.map((type) => (
                  <Badge key={type} type={type} />
                ))}
              </Flex>
              <Flex flex="auto" />
              <Flex direction="column" gap="small">
                <FancyText tag="div" fontSize="small" color={score.defenseScore > 0 ? "1" : "3"}>
                  Defense: {score.defenseScore > 0 ? "+" : ""}{score.defenseScore.toFixed(1)}
                </FancyText>
                <FancyText tag="div" fontSize="small" color={score.offenseScore > 0 ? "1" : "3"}>
                  Offense: {score.offenseScore > 0 ? "+" : ""}{score.offenseScore.toFixed(1)}
                </FancyText>
              </Flex>
            </Flex>
          </Card>
        ))}

      <FancyText tag="h3" fontSize="medium" fontWeight="medium" style={{ marginTop: "1rem" }}>
        Best Dual Types
      </FancyText>
      {bestTypes
        .filter(score => score.types.length === 2)
        .slice(0, 3)
        .map((score, index) => (
          <Card key={`dual-${index}`}>
            <Flex direction="row" gap="medium" align="center">
              <FancyText tag="div" fontSize="large" fontWeight="medium">
                #{index + 1}
              </FancyText>
              <Flex direction="row" gap="small">
                {score.types.map((type) => (
                  <Badge key={type} type={type} />
                ))}
              </Flex>
              <Flex flex="auto" />
              <Flex direction="column" gap="small">
                <FancyText tag="div" fontSize="small" color={score.defenseScore > 0 ? "1" : "3"}>
                  Defense: {score.defenseScore > 0 ? "+" : ""}{score.defenseScore.toFixed(1)}
                </FancyText>
                <FancyText tag="div" fontSize="small" color={score.offenseScore > 0 ? "1" : "3"}>
                  Offense: {score.offenseScore > 0 ? "+" : ""}{score.offenseScore.toFixed(1)}
                </FancyText>
              </Flex>
            </Flex>
          </Card>
        ))}
        
      <FancyText tag="div" fontSize="small" color="3" style={{ marginTop: "1rem" }}>
        Higher scores are better. Types that would be immune (0×) to your selected type are excluded.
        Scores consider both matchup against your type and general type coverage.
      </FancyText>
    </Flex>
  );
}
