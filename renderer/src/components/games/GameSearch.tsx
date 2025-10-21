import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import GamesService from "../../services/gamesService";
import { Game, GameSearchFilters } from "../../types/games";
import { GameCard } from "./GameCard";

interface GameSearchProps {
  onGameSelect?: (game: Game) => void;
  onAddToBetSlip?: (
    game: Game,
    betType: string,
    selection: string,
    odds: number
  ) => void;
  isSelectionInBetSlip?: (
    gameId: string,
    betType: string,
    selection: string
  ) => boolean;
  onSearchResultsChange?: (hasResults: boolean) => void;
  leagueGames?: Game[];
  leagueKey?: string;
}

export const GameSearch: React.FC<GameSearchProps> = ({
  onGameSelect,
  onAddToBetSlip,
  isSelectionInBetSlip,
  onSearchResultsChange,
  leagueGames = [],
  leagueKey = "",
}) => {
  const [searchMode, setSearchMode] = useState<
    "id" | "filters" | "autocomplete" | "number"
  >("number");
  const [gameId, setGameId] = useState("");
  const [gameNumberQuery, setGameNumberQuery] = useState("");
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [filters, setFilters] = useState<{
    externalId: string;
    status: string;
    sportKey: string;
    search: string;
  }>({
    externalId: "",
    status: "",
    sportKey: "",
    search: "",
  });
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const numberSearchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearchById = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setError(null);
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    // Minimum 3 characters for search
    if (searchTerm.trim().length < 3) {
      setError(null);
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedGame(null);

    try {
      const trimmedTerm = searchTerm.trim();

      // If search term is long (30+ chars), likely a full ID - use direct lookup
      // Otherwise use search with partial matching for externalId
      if (trimmedTerm.length >= 30) {
        // Full ID - direct lookup
        const game = await GamesService.fetchGameById(trimmedTerm);
        setSelectedGame(game);
        setSearchResults([game]);
        onSearchResultsChange?.(true);
      } else {
        // Partial ID - use search endpoint which supports partial matching
        const games = await GamesService.searchGames({
          externalId: trimmedTerm,
        });

        if (games.length === 0) {
          setError(`No games found with ID containing "${trimmedTerm}"`);
          onSearchResultsChange?.(false);
        } else {
          setSearchResults(games);
          if (games.length === 1 && games[0]) {
            setSelectedGame(games[0]);
          }
          onSearchResultsChange?.(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch game");
      onSearchResultsChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearchById = useCallback((searchTerm: string) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearchById(searchTerm);
    }, 500); // 500ms debounce delay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (autocompleteTimerRef.current) {
        clearTimeout(autocompleteTimerRef.current);
      }
    };
  }, []);

  // Autocomplete search function
  const performAutocomplete = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    // Minimum 2 characters for autocomplete
    if (query.trim().length < 2) {
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const suggestions = await GamesService.autocompleteGames(
        query.trim(),
        20
      );

      if (suggestions.length === 0) {
        setError(`No games found matching "${query.trim()}"`);
        setSearchResults([]);
        onSearchResultsChange?.(false);
      } else {
        // Transform suggestions to Game objects
        const games = suggestions.map((suggestion) =>
          GamesService.transformAutocompleteToGame(suggestion)
        );
        setSearchResults(games);
        if (games.length === 1 && games[0]) {
          setSelectedGame(games[0]);
        }
        onSearchResultsChange?.(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to autocomplete games");
      setSearchResults([]);
      onSearchResultsChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced autocomplete
  const debouncedAutocomplete = useCallback((query: string) => {
    if (autocompleteTimerRef.current) {
      clearTimeout(autocompleteTimerRef.current);
    }

    autocompleteTimerRef.current = setTimeout(() => {
      performAutocomplete(query);
    }, 300); // Faster debounce for autocomplete (300ms)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle autocomplete input change
  const handleAutocompleteChange = (value: string) => {
    setAutocompleteQuery(value);
    debouncedAutocomplete(value);
  };

  // Handle input change with debounce
  const handleGameIdChange = (value: string) => {
    setGameId(value);
    debouncedSearchById(value);
  };

  // Manual search button handler (immediate, no debounce)
  const handleSearchById = () => {
    performSearchById(gameId);
  };

  const handleSearchWithFilters = async () => {
    // Check if at least one filter is provided
    const hasFilters =
      (filters.externalId && filters.externalId.trim() !== "") ||
      filters.status ||
      (filters.sportKey && filters.sportKey.trim() !== "") ||
      (filters.search && filters.search.trim() !== "");

    if (!hasFilters) {
      setError("Please provide at least one search filter");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedGame(null);

    try {
      // Build filter object with only non-empty values
      const searchFilters: GameSearchFilters = {};
      if (filters.externalId && filters.externalId.trim() !== "") {
        searchFilters.externalId = filters.externalId.trim();
      }
      if (filters.status && filters.status.trim() !== "") {
        searchFilters.status = filters.status as any;
      }
      if (filters.sportKey && filters.sportKey.trim() !== "") {
        searchFilters.sportKey = filters.sportKey.trim();
      }
      if (filters.search && filters.search.trim() !== "") {
        searchFilters.search = filters.search.trim();
      }

      const games = await GamesService.searchGames(searchFilters);
      setSearchResults(games);

      if (games.length === 0) {
        setError("No games found matching the search criteria");
        onSearchResultsChange?.(false);
      } else {
        onSearchResultsChange?.(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to search games");
      onSearchResultsChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  // Frontend filter by game number using stable indexes (cross-league search)
  const performNumberSearch = async (numberQuery: string) => {
    if (!numberQuery.trim()) {
      setError(null);
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    const searchNumber = parseInt(numberQuery.trim());

    if (isNaN(searchNumber)) {
      setError("Please enter a valid game number");
      setSearchResults([]);
      onSearchResultsChange?.(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedGame(null);

    try {
      // Load stored game indexes
      const stored = localStorage.getItem("betzone_game_indexes");

      if (!stored) {
        setError("No game indexes found. Please view games first.");
        setSearchResults([]);
        onSearchResultsChange?.(false);
        setLoading(false);
        return;
      }

      const existingIndexes: Record<
        string,
        { externalId: string; index: number; leagueKey: string }
      > = JSON.parse(stored);

      // Find which game(s) have this index number (search across all leagues)
      const matchingEntries = Object.entries(existingIndexes).filter(
        ([_, data]) => data.index === searchNumber
      );

      if (matchingEntries.length === 0) {
        setError(`No game found with number ${searchNumber} in any league`);
        setSearchResults([]);
        onSearchResultsChange?.(false);
        setLoading(false);
        return;
      }

      // Get the external IDs and league keys
      const gameInfo = matchingEntries[0][1]; // Get first match
      const targetLeagueKey = gameInfo.leagueKey;
      const targetExternalId = gameInfo.externalId;

      // Check if it's in the current league's loaded games
      let matchingGames = leagueGames.filter((game) => {
        const externalId = game.externalId || game.id;
        return externalId === targetExternalId;
      });

      // If not found in current league, fetch odds from the correct league API
      if (matchingGames.length === 0) {
        try {
          // Fetch fresh odds from the league odds API endpoint
          console.log(`🔄 Fetching odds from ${targetLeagueKey} API...`);
          const leagueGames = await GamesService.fetchOdds(targetLeagueKey);

          // Find the specific game by external ID
          const foundGame = leagueGames.find((game) => {
            const externalId = game.externalId || game.id;
            return externalId === targetExternalId;
          });

          if (foundGame) {
            matchingGames = [foundGame];
            if (targetLeagueKey !== leagueKey) {
              setError(
                `✅ Found in ${targetLeagueKey.toUpperCase()} with fresh odds (game #${searchNumber})`
              );
            }
          } else {
            // Game not found in odds API, try direct fetch as fallback
            console.log("Game not in odds API, trying direct fetch...");
            try {
              const game = await GamesService.fetchGameById(targetExternalId);
              if (game) {
                matchingGames = [game];
                if (targetLeagueKey !== leagueKey) {
                  setError(
                    `✅ Found in ${targetLeagueKey.toUpperCase()} (game #${searchNumber})`
                  );
                }
              }
            } catch (directFetchErr) {
              console.error("Direct fetch also failed:", directFetchErr);
            }
          }
        } catch (fetchErr: any) {
          console.error("Failed to fetch odds from league:", fetchErr);
          // Final fallback: try search
          try {
            const games = await GamesService.searchGames({
              externalId: targetExternalId,
            });

            if (games && games.length > 0) {
              matchingGames = games;
              if (targetLeagueKey !== leagueKey) {
                setError(
                  `✅ Found in ${targetLeagueKey.toUpperCase()} (game #${searchNumber})`
                );
              }
            }
          } catch (searchErr) {
            console.error("All fetch attempts failed:", searchErr);
          }
        }
      }

      setSearchResults(matchingGames);

      if (matchingGames.length === 0) {
        setError(
          `Game #${searchNumber} exists in ${targetLeagueKey.toUpperCase()} but couldn't load it. Try switching to that league.`
        );
        onSearchResultsChange?.(false);
      } else {
        if (targetLeagueKey !== leagueKey) {
          // Show info that it's from another league
          console.log(`✅ Found game #${searchNumber} from ${targetLeagueKey}`);
        }
        onSearchResultsChange?.(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to search games");
      onSearchResultsChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced number search
  const debouncedNumberSearch = useCallback(
    (query: string) => {
      if (numberSearchTimerRef.current) {
        clearTimeout(numberSearchTimerRef.current);
      }

      numberSearchTimerRef.current = setTimeout(() => {
        performNumberSearch(query);
      }, 300);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [leagueGames, leagueKey]
  );

  // Handle number search input change
  const handleGameNumberChange = (value: string) => {
    setGameNumberQuery(value);
    debouncedNumberSearch(value);
  };

  const handleClear = () => {
    setGameId("");
    setGameNumberQuery("");
    setAutocompleteQuery("");
    setFilters({
      externalId: "",
      status: "",
      sportKey: "",
      search: "",
    });
    setSearchResults([]);
    setSelectedGame(null);
    setError(null);
    onSearchResultsChange?.(false);

    // Clear any pending timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (autocompleteTimerRef.current) {
      clearTimeout(autocompleteTimerRef.current);
    }
    if (numberSearchTimerRef.current) {
      clearTimeout(numberSearchTimerRef.current);
    }
  };

  const toggleExpanded = (gameId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
    }
    setExpandedGames(newExpanded);
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={3}
          sx={{ color: "rgba(255,255,255,0.9)" }}
        >
          🔍 Search Games
        </Typography>

        {/* Search Mode Toggle */}
        <Stack direction="row" spacing={2} mb={3}>
          <Button
            variant={searchMode === "number" ? "contained" : "outlined"}
            onClick={() => {
              setSearchMode("number");
              handleClear();
            }}
            sx={{
              color:
                searchMode === "number" ? "white" : "rgba(255,255,255,0.7)",
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            🔢 Filter by Number
          </Button>
          <Button
            variant={searchMode === "autocomplete" ? "contained" : "outlined"}
            onClick={() => {
              setSearchMode("autocomplete");
              handleClear();
            }}
            sx={{
              color:
                searchMode === "autocomplete"
                  ? "white"
                  : "rgba(255,255,255,0.7)",
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            Quick Search
          </Button>
        </Stack>

        {/* Filter by Number */}
        {searchMode === "number" && (
          <Stack spacing={2}>
            <Alert severity="info" sx={{ bgcolor: "rgba(33, 150, 243, 0.1)" }}>
              Enter a game number (e.g., 101, 102, 201) - searches across all
              leagues
            </Alert>
            <TextField
              label="Game Number"
              value={gameNumberQuery}
              onChange={(e) => handleGameNumberChange(e.target.value)}
              placeholder="e.g., 101"
              type="number"
              fullWidth
              helperText={`⚡ Cross-league search - finds games from any league (e.g., 101=League 1, 401=League 4)`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(255, 193, 7, 0.8)",
                  fontWeight: 500,
                },
              }}
            />
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
                fullWidth
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Quick Search (Autocomplete) */}
        {searchMode === "autocomplete" && (
          <Stack spacing={2}>
            <TextField
              label="Quick Search"
              value={autocompleteQuery}
              onChange={(e) => handleAutocompleteChange(e.target.value)}
              placeholder="Type team name, external ID, or any text..."
              fullWidth
              helperText="⚡ Instant search! Type 2+ characters (searches team names, IDs, leagues)"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(76, 175, 80, 0.8)",
                  fontWeight: 500,
                },
              }}
            />
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
                fullWidth
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Search by ID - COMMENTED OUT */}

        {/* Search with Filters - COMMENTED OUT
        {searchMode === "filters" && (
          <Stack spacing={2}>
            <TextField
              label="External ID"
              value={filters.externalId}
              onChange={(e) =>
                setFilters({ ...filters, externalId: e.target.value })
              }
              placeholder="e.g., abc123"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
                Status
              </InputLabel>
              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                label="Status"
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "rgba(255,255,255,0.7)",
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="live">Live</MenuItem>
                <MenuItem value="finished">Finished</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Sport Key"
              value={filters.sportKey}
              onChange={(e) =>
                setFilters({ ...filters, sportKey: e.target.value })
              }
              placeholder="e.g., soccer_epl"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <TextField
              label="Search (Team Names)"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="e.g., Manchester, Liverpool"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SearchIcon />
                }
                onClick={handleSearchWithFilters}
                disabled={loading}
                fullWidth
              >
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        )} */}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
            sx={{ color: "rgba(255,255,255,0.9)" }}
          >
            Search Results ({searchResults.length})
          </Typography>
          <Stack spacing={2}>
            {searchResults.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isSelected={selectedGame?.id === game.id}
                onSelect={(g) => {
                  setSelectedGame(g);
                  onGameSelect?.(g);
                }}
                onAddToBetSlip={
                  onAddToBetSlip ||
                  (() => {
                    console.log("Add to bet slip not configured");
                  })
                }
                isSelectionInBetSlip={isSelectionInBetSlip || (() => false)}
                expandedGames={expandedGames}
                onToggleExpanded={toggleExpanded}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress sx={{ color: "primary.main" }} />
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.7)", mt: 2 }}
          >
            Searching...
          </Typography>
        </Box>
      )}
    </Box>
  );
};
