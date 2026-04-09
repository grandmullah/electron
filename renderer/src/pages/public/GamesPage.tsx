import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "../../components/Header";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  addToBetSlip,
  BetSlipItem,
  toggleBetSlipVisibility,
} from "../../store/betslipSlice";
import GamesService, { Game } from "../../services/gamesService";
// Dynamic import for printService to enable code splitting
import settingsService from "../../services/settingsService";
import { API_BASE_URL, getApiHeaders } from "../../services/apiConfig";
import { useOdds } from "../../hooks/useOdds";
import useSWR from "swr";
import { GameCard } from "../../components/games/GameCard";
import { GameSearch } from "../../components/games/GameSearch";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Snackbar,
  Divider,
  Badge,
  Collapse,
  InputBase,
  InputAdornment,
} from "@mui/material";
import {
  SportsSoccer as SoccerIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

interface GamesPageProps {
  onNavigate: (
    page:
      | "home"
      | "dashboard"
      | "settings"
      | "games"
      | "agent"
      | "history"
      | "management"
      | "admin",
  ) => void;
}

// Country name to flag emoji (common countries)
const COUNTRY_FLAGS: Record<string, string> = {
  England: "🇬🇧",
  Spain: "🇪🇸",
  Germany: "🇩🇪",
  Italy: "🇮🇹",
  France: "🇫🇷",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  China: "🇨🇳",
  Croatia: "🇭🇷",
  Estonia: "🇪🇪",
  Scotland: "🏴",
  Wales: "🏴",
  Belgium: "🇧🇪",
  Turkey: "🇹🇷",
  Mexico: "🇲🇽",
  USA: "🇺🇸",
  Other: "🌐",
};

// Types now come from GamesService

export const GamesPage: React.FC<GamesPageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { items: betSlipItems } = useAppSelector((state) => state.betslip);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedBet, setSelectedBet] = useState<
    "home" | "draw" | "away" | null
  >(null);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const [loggedInUser, setLoggedInUser] = useState<string>("John Doe");
  const [leagueKey, setLeagueKey] = useState<string>("");
  const [upcomingPage, setUpcomingPage] = useState<number>(1);

  // Use SWR for odds fetching
  const { games, isLoading, error, mutate, isError, isEmpty, pagination } =
    useOdds(leagueKey, upcomingPage, 50);

  // League interface
  interface League {
    key: string;
    sportKey: string;
    sportName?: string;
    name: string;
    displayName: string;
    source?: string;
    category?: string;
    country?: string;
    logo?: string;
    countryFlag?: string;
  }

  type SupportedLeagueApiItem = {
    key?: unknown;
    name?: unknown;
    country?: unknown;
    countryCode?: unknown;
    countryFlag?: unknown;
    logo?: unknown;
    sport?: unknown; // can be string (new) or { key, name } (old)
    sportKey?: unknown;
    sportName?: unknown;
    source?: unknown;
    category?: unknown;
  };

  type SupportedLeaguesResponse = {
    success: boolean;
    message?: string;
    data?:
      | {
          byCountry?: Array<{
            country: string;
            countryFlag?: string;
            leagues: SupportedLeagueApiItem[];
          }>;
          all?: SupportedLeagueApiItem[];
          leagues?: SupportedLeagueApiItem[];
        }
      | SupportedLeagueApiItem[];
    count?: number;
    meta?: { daysAhead?: number };
  };

  type SupportedLeaguesClientModel = {
    all: League[];
    byCountry: Array<{
      country: string;
      countryFlag?: string;
      leagues: League[];
    }>;
    count?: number;
    meta?: { daysAhead?: number };
  };

  const normalizeLeague = (
    league: SupportedLeagueApiItem,
    opts: { fallbackCountry?: string; includeCountryInDisplayName: boolean },
  ): League => {
    const sportKeyFromField =
      typeof (league as any)?.sport === "string"
        ? ((league as any).sport as string)
        : typeof (league as any)?.sportKey === "string"
          ? ((league as any).sportKey as string)
          : typeof (league as any)?.sport?.key === "string"
            ? ((league as any).sport.key as string)
            : undefined;
    const sportName =
      typeof (league as any)?.sportName === "string"
        ? ((league as any).sportName as string)
        : typeof (league as any)?.sport?.name === "string"
          ? ((league as any).sport.name as string)
          : undefined;
    const key =
      typeof (league as any)?.key === "string"
        ? ((league as any).key as string)
        : undefined;
    const sportKeyFromKey = key ? key.split("_")[0] : undefined;
    const sportKey = sportKeyFromField || sportKeyFromKey || "unknown";
    const name =
      typeof (league as any)?.name === "string"
        ? ((league as any).name as string)
        : "Unknown";
    const countryRaw =
      typeof (league as any)?.country === "string"
        ? ((league as any).country as string)
        : undefined;
    const country = countryRaw || opts.fallbackCountry;
    const displayName =
      opts.includeCountryInDisplayName && country
        ? `${name} (${country})`
        : name;

    const out: League = {
      key: key ?? sportKey,
      sportKey,
      name,
      displayName,
    };

    if (sportName) out.sportName = sportName;
    const source =
      typeof (league as any)?.source === "string"
        ? ((league as any).source as string)
        : undefined;
    if (source) out.source = source;
    const category =
      typeof (league as any)?.category === "string"
        ? ((league as any).category as string)
        : undefined;
    if (category) out.category = category;
    if (country) out.country = country;
    const logo =
      typeof (league as any)?.logo === "string"
        ? ((league as any).logo as string)
        : undefined;
    if (logo) out.logo = logo;
    const countryFlag =
      typeof (league as any)?.countryFlag === "string"
        ? ((league as any).countryFlag as string)
        : undefined;
    if (countryFlag) out.countryFlag = countryFlag;

    return out;
  };

  // SWR fetcher function for leagues
  const leaguesFetcher = async (
    url: string,
  ): Promise<SupportedLeaguesClientModel> => {
    const response = await fetch(url, {
      headers: getApiHeaders(false),
    });
    const data = (await response.json()) as SupportedLeaguesResponse;

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch leagues");
    }

    // Supported leagues response shape (new):
    // { success: true, data: { byCountry: [...], all: [...] }, count, meta }
    // Backward compatibility: older API shapes returned { data: leagues[] } or { data: { leagues: leagues[] } }
    const payload = data?.data;
    const allItems: SupportedLeagueApiItem[] = Array.isArray(
      (payload as any)?.all,
    )
      ? ((payload as any).all as SupportedLeagueApiItem[])
      : Array.isArray((payload as any)?.leagues)
        ? ((payload as any).leagues as SupportedLeagueApiItem[])
        : Array.isArray(payload)
          ? (payload as SupportedLeagueApiItem[])
          : [];

    const all = allItems.map((l) =>
      normalizeLeague(l, { includeCountryInDisplayName: true }),
    );

    const byCountryFromApi = Array.isArray((payload as any)?.byCountry)
      ? ((payload as any).byCountry as Array<{
          country: string;
          countryFlag?: string;
          leagues: SupportedLeagueApiItem[];
        }>)
      : undefined;

    const byCountry =
      byCountryFromApi?.map((group) => ({
        country: group.country,
        ...(group.countryFlag ? { countryFlag: group.countryFlag } : {}),
        leagues: Array.isArray(group.leagues)
          ? group.leagues.map((l) =>
              normalizeLeague(l, {
                includeCountryInDisplayName: false,
                ...(group.country && group.country !== "Other"
                  ? { fallbackCountry: group.country }
                  : {}),
              }),
            )
          : [],
      })) ??
      (() => {
        const groups = new Map<string, League[]>();
        for (const league of all) {
          const country = league.country?.trim()
            ? league.country.trim()
            : "Other";
          const list = groups.get(country) ?? [];
          list.push({
            ...league,
            displayName: league.name, // country is the section heading
          });
          groups.set(country, list);
        }

        const countries = Array.from(groups.keys()).sort((a, b) =>
          a.localeCompare(b),
        );
        const otherIdx = countries.indexOf("Other");
        if (otherIdx >= 0) {
          countries.splice(otherIdx, 1);
          countries.push("Other");
        }

        return countries.map((country) => ({
          country,
          leagues: groups.get(country) ?? [],
        }));
      })();

    const result: SupportedLeaguesClientModel = { all, byCountry };
    if (typeof data.count === "number") result.count = data.count;
    if (data.meta) result.meta = data.meta;
    return result;
  };

  // SWR hook for leagues - NO fallback data to force using API response
  const {
    data: supportedLeaguesData,
    error: leaguesError,
    isLoading: leaguesLoading,
    mutate: mutateLeagues,
  } = useSWR<SupportedLeaguesClientModel>(
    `${API_BASE_URL}/leagues/supported`,
    leaguesFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Dedupe requests for 1 minute
      errorRetryCount: 2,
      onError: (error) => {},
    },
  );

  const supportedLeagues = supportedLeaguesData?.all;
  const supportedLeaguesByCountry = supportedLeaguesData?.byCountry;

  // No default league: start with today's scheduled games. User can select a league to filter.

  // Auto-expand the country that contains the selected league
  useEffect(() => {
    if (!leagueKey || !supportedLeaguesByCountry) return;
    const group = supportedLeaguesByCountry.find((g) =>
      g.leagues.some((l) => l.key === leagueKey),
    );
    if (group) {
      setExpandedCountries((prev) => new Set(prev).add(group.country));
    }
  }, [leagueKey, supportedLeaguesByCountry]);

  // Agent-specific state
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [leaguesSearchQuery, setLeaguesSearchQuery] = useState("");
  const [leaguesSectionExpanded, setLeaguesSectionExpanded] = useState(true);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(
    new Set(),
  );

  // Game indexes now come from the API via team_index field
  // No local index creation needed

  // Check if user is an agent
  useEffect(() => {
    if (user && user.role === "agent") {
      setIsAgentMode(true);
    } else {
      setIsAgentMode(false);
    }
  }, [user]);

  // Show refresh notification when data is revalidated
  useEffect(() => {
    if (!isLoading && games.length > 0) {
      setShowRefreshNotification(true);
      setTimeout(() => setShowRefreshNotification(false), 3000);
    }
  }, [games, isLoading]);

  // Manual refresh function for users
  const handleManualRefresh = useCallback(() => {
    mutate(); // Trigger SWR revalidation
  }, [mutate]);

  // Test printer (used by Header when on Games page)
  const handleTestPrinter = useCallback(async () => {
    try {
      const { testBixolonPrinter, testPrint } = await import(
        "../../services/printService"
      );
      testBixolonPrinter();
      testPrint(settingsService.getPrinterLogicalName());
    } catch {
      alert("Error: Unable to load print service. Please try again.");
    }
  }, []);

  // Print games function
  const handlePrintGames = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print games");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Betzone Games & Odds - ${new Date().toLocaleDateString()}</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 0.5cm;
              }
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              background: #f8f9fa;
              color: #333;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              color: white;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .print-header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
            }
            
            .print-header .subtitle {
              font-size: 16px;
              margin: 0;
              opacity: 0.9;
            }
            
            .print-header .timestamp {
              font-size: 12px;
              margin: 10px 0 0 0;
              opacity: 0.8;
            }
            
            .games-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 20px;
              margin-top: 20px;
            }
            
            .game-card {
              background: white;
              border-radius: 6px;
              padding: 8px 12px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              border: 1px solid #e0e0e0;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              min-height: 40px;
              page-break-inside: avoid;
            }
            
            .game-info-compact {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
              flex: 0 0 auto;
              flex-shrink: 0;
              min-width: 300px;
              max-width: 300px;
              margin-right: 20px;
            }
            
            .game-id-compact {
              background: #f1f3f5;
              color: #495057;
              padding: 3px 6px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: 600;
              font-family: 'Monaco', 'Courier New', monospace;
              white-space: nowrap;
            }
            
            .game-header {
              display: flex;
              align-items: center;
              gap: 8px;
              width: 100%;
            }
            
            .game-teams {
              font-size: 11px;
              font-weight: 600;
              color: #212529;
              white-space: nowrap;
              width: 300px;
              min-width: 300px;
              max-width: 300px;
            }
            
            .game-number {
              color: #FFD700;
              font-weight: 700;
              text-shadow: 0 0 3px rgba(255, 215, 0, 0.6);
              background: none;
            }
            
            .vs-separator {
              color: #6c757d;
              font-weight: 400;
              margin: 0 4px;
            }
            
            .game-time {
              font-size: 9px;
              color: #6c757d;
              white-space: nowrap;
              min-width: 90px;
              text-align: left;
              margin-top: 2px;
            }
            
            
            .betting-options {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              flex-wrap: nowrap;
              flex: 1;
              overflow-x: auto;
              padding: 4px 0;
            }
            
            .betting-option-compact {
              display: flex;
              align-items: center;
              gap: 2px;
              min-width: auto;
              white-space: nowrap;
            }
            
            .betting-option-vertical {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3px;
              min-width: 40px;
              max-width: 40px;
              text-align: center;
              flex-shrink: 0;
            }
            
            .betting-option-label-compact {
              font-size: 8px;
              font-weight: 600;
              color: #6c757d;
              text-transform: uppercase;
            }
            
            .betting-option-label-vertical {
              font-size: 8px;
              font-weight: 700;
              color: #495057;
              text-transform: uppercase;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 3px;
              padding: 2px 4px;
              min-width: 22px;
              max-width: 22px;
              text-align: center;
              line-height: 1;
            }
            
            .betting-option-value-compact {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: 600;
              color: #212529;
              min-width: 32px;
              text-align: center;
            }
            
            .betting-option-value-vertical {
              background: #e7f5ff;
              border: 1px solid #74c0fc;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: 700;
              color: #1971c2;
              min-width: 32px;
              max-width: 32px;
              text-align: center;
              line-height: 1;
            }
            
            .betting-option-value-compact.clickable {
              background: #e7f5ff;
              border-color: #74c0fc;
              color: #1971c2;
            }
            
            .betting-option-compact.disabled .betting-option-value-compact {
              background: #f1f3f5;
              color: #adb5bd;
              border-color: #e9ecef;
            }
            
            .betting-option-vertical.disabled .betting-option-value-vertical {
              background: #f1f3f5;
              color: #adb5bd;
              border-color: #e9ecef;
            }
            
            .betting-option-additional {
              margin-top: 4px;
              text-align: center;
            }
            
            .betting-option-additional small {
              font-size: 9px;
              color: #6c757d;
              font-style: italic;
            }
            
            .totals-section {
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e9ecef;
            }
            
            .totals-section:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            
            .totals-point-label {
              font-size: 10px;
              font-weight: 600;
              color: #495057;
              text-align: center;
              margin-bottom: 4px;
              background: #f8f9fa;
              padding: 2px 4px;
              border-radius: 3px;
            }
            
            .totals-horizontal {
              display: flex;
              gap: 4px;
              justify-content: center;
              flex-wrap: wrap;
              max-width: 100%;
              overflow: hidden;
            }
            
            .totals-point-group {
              display: flex;
              flex-direction: column;
              align-items: center;
              min-width: 24px;
              max-width: 40px;
              flex: 1 1 auto;
              flex-shrink: 1;
            }
            
            .totals-point-group .betting-option-sub-labels {
              display: flex;
              gap: 1px;
              margin-bottom: 1px;
            }
            
            .totals-point-group .betting-option-sub-label {
              font-size: 7px;
              color: #6c757d;
              text-align: center;
              min-width: 10px;
            }
            
            .totals-point-group .betting-option-values {
              display: flex;
              gap: 1px;
            }
            
            .totals-point-group .betting-option-value {
              font-size: 8px;
              padding: 2px 4px;
              min-width: 16px;
              text-align: center;
              border-radius: 2px;
            }
            
            @media print {
              .totals-horizontal {
                gap: 2px;
              }
              
              .totals-point-group {
                min-width: 20px;
                max-width: 35px;
                flex: 1 1 auto;
              }
              
              .totals-point-group .betting-option-value {
                font-size: 7px;
                padding: 2px 3px;
                min-width: 14px;
              }
            }
            
            /* Over/Under and Both Teams to Score have only 2 options */
            .betting-option-column:nth-child(3) .betting-option-sub-labels,
            .betting-option-column:nth-child(4) .betting-option-sub-labels {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .betting-option-column:nth-child(3) .betting-option-values,
            .betting-option-column:nth-child(4) .betting-option-values {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .print-footer {
              margin-top: 40px;
              text-align: center;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            
            .print-footer p {
              margin: 5px 0;
              font-size: 12px;
              color: #6c757d;
            }
            
            @media print {
              body {
                background: white;
                padding: 0.5cm;
              }
              
              .game-card {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #ccc;
                page-break-inside: avoid;
                padding: 6px 10px;
                margin-bottom: 6px;
              }
              
              .games-grid {
                gap: 6px;
              }
              
              .betting-options {
                flex-wrap: nowrap;
                gap: 6px;
                padding: 2px 0;
              }
              
              .game-info-compact {
                flex: 0 0 auto;
                min-width: 250px;
                max-width: 250px;
                margin-right: 15px;
                flex-direction: column;
                gap: 3px;
              }
              
              .game-id-compact {
                font-size: 8px;
                padding: 2px 5px;
              }
              
              .game-teams {
                font-size: 10px;
                width: 250px;
                min-width: 250px;
                max-width: 250px;
              }
              
              .game-number {
                color: #FFD700;
                font-weight: 700;
                text-shadow: none;
                background: none !important;
                background-color: transparent !important;
              }
              
              .game-time {
                font-size: 8px;
                min-width: 70px;
                text-align: left;
                margin-top: 1px;
              }
              
              .betting-option-label-compact {
                font-size: 7px;
              }
              
              .betting-option-value-compact {
                font-size: 8px;
                padding: 2px 4px;
                min-width: 28px;
              }
              
              .betting-option-vertical {
                min-width: 35px;
                max-width: 35px;
                gap: 2px;
              }
              
              .betting-option-label-vertical {
                font-size: 7px;
                padding: 1px 3px;
                min-width: 18px;
                max-width: 18px;
              }
              
              .betting-option-value-vertical {
                font-size: 8px;
                padding: 1px 4px;
                min-width: 28px;
                max-width: 28px;
              }
              
              .print-header {
                padding: 10px;
                margin-bottom: 10px;
              }
              
              .print-header h1 {
                font-size: 20px;
                margin-bottom: 5px;
              }
              
              .print-header .subtitle {
                font-size: 12px;
              }
              
              .print-header .timestamp {
                font-size: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>⚽ Betzone Games & Odds</h1>
            <p class="subtitle">${getLeagueDisplayName(leagueKey)} - ${new Date().toLocaleDateString()}</p>
            <p class="timestamp">Last Updated: ${lastUpdated.toLocaleString()}</p>
          </div>
          
          <div class="games-grid">
            ${games
              .map((game) => {
                const gameNumber = game.team_index?.fullIndex || 0;
                return `
              <div class="game-card">
                <!-- Game Info & Teams - All Horizontal -->
                <div class="game-info-compact">
                  <div class="game-id-compact">...${game.externalId ? game.externalId.slice(-5) : game.id.slice(-5)}</div>
                  <div class="game-header">
                    <div class="game-teams"><span class="game-number">[${gameNumber}]</span> ${game.homeTeam} <span class="vs-separator">vs</span> ${game.awayTeam}</div>
                  </div>
                  <div class="game-time">${new Date(game.matchTime).toLocaleDateString([], { month: "short", day: "numeric" })} ${new Date(game.matchTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                
                <!-- Odds - Vertical Layout -->
                <div class="betting-options">
                  <!-- H2H Odds -->
                  <div class="betting-option-vertical ${!game.homeOdds ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">1</div>
                    <div class="betting-option-value-vertical ${game.homeOdds ? "clickable" : ""}">${game.homeOdds || "-"}</div>
                  </div>
                  <div class="betting-option-vertical ${!game.drawOdds ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">X</div>
                    <div class="betting-option-value-vertical ${game.drawOdds ? "clickable" : ""}">${game.drawOdds || "-"}</div>
                  </div>
                  <div class="betting-option-vertical ${!game.awayOdds ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">2</div>
                    <div class="betting-option-value-vertical ${game.awayOdds ? "clickable" : ""}">${game.awayOdds || "-"}</div>
                  </div>
                  
                  <!-- DC -->
                  <div class="betting-option-vertical ${!game.doubleChance?.homeOrDraw ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">1X</div>
                    <div class="betting-option-value-vertical ${game.doubleChance?.homeOrDraw ? "clickable" : ""}">${game.doubleChance?.homeOrDraw || "-"}</div>
                  </div>
                  <div class="betting-option-vertical ${!game.doubleChance?.drawOrAway ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">X2</div>
                    <div class="betting-option-value-vertical ${game.doubleChance?.drawOrAway ? "clickable" : ""}">${game.doubleChance?.drawOrAway || "-"}</div>
                  </div>
                  <div class="betting-option-vertical ${!game.doubleChance?.homeOrAway ? "disabled" : ""}">
                    <div class="betting-option-label-vertical">12</div>
                    <div class="betting-option-value-vertical ${game.doubleChance?.homeOrAway ? "clickable" : ""}">${game.doubleChance?.homeOrAway || "-"}</div>
                  </div>
                  
                  <!-- Totals -->
                  ${
                    game.totals && game.totals.length > 0
                      ? game.totals
                          .slice(0, 1)
                          .map(
                            (total) => `
                    <div class="betting-option-vertical ${!total.over ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">O${total.point}</div>
                      <div class="betting-option-value-vertical ${total.over ? "clickable" : ""}">${total.over || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!total.under ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">U${total.point}</div>
                      <div class="betting-option-value-vertical ${total.under ? "clickable" : ""}">${total.under || "-"}</div>
                    </div>
                  `,
                          )
                          .join("")
                      : ""
                  }
                  
                  <!-- BTTS -->
                  ${
                    game.bothTeamsToScore?.yes || game.bothTeamsToScore?.no
                      ? `
                    <div class="betting-option-vertical ${!game.bothTeamsToScore?.yes ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">GG</div>
                      <div class="betting-option-value-vertical ${game.bothTeamsToScore?.yes ? "clickable" : ""}">${game.bothTeamsToScore?.yes || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!game.bothTeamsToScore?.no ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">NG</div>
                      <div class="betting-option-value-vertical ${game.bothTeamsToScore?.no ? "clickable" : ""}">${game.bothTeamsToScore?.no || "-"}</div>
                    </div>
                  `
                      : ""
                  }
                  
                  <!-- 1st Half H2H -->
                  ${
                    game.h2h_h1?.home || game.h2h_h1?.draw || game.h2h_h1?.away
                      ? `
                    <div class="betting-option-vertical ${!game.h2h_h1?.home ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H1-1</div>
                      <div class="betting-option-value-vertical ${game.h2h_h1?.home ? "clickable" : ""}">${game.h2h_h1?.home || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!game.h2h_h1?.draw ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H1-X</div>
                      <div class="betting-option-value-vertical ${game.h2h_h1?.draw ? "clickable" : ""}">${game.h2h_h1?.draw || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!game.h2h_h1?.away ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H1-2</div>
                      <div class="betting-option-value-vertical ${game.h2h_h1?.away ? "clickable" : ""}">${game.h2h_h1?.away || "-"}</div>
                    </div>
                  `
                      : ""
                  }
                  
                  <!-- 2nd Half H2H -->
                  ${
                    game.h2h_h2?.home || game.h2h_h2?.draw || game.h2h_h2?.away
                      ? `
                    <div class="betting-option-vertical ${!game.h2h_h2?.home ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H2-1</div>
                      <div class="betting-option-value-vertical ${game.h2h_h2?.home ? "clickable" : ""}">${game.h2h_h2?.home || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!game.h2h_h2?.draw ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H2-X</div>
                      <div class="betting-option-value-vertical ${game.h2h_h2?.draw ? "clickable" : ""}">${game.h2h_h2?.draw || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!game.h2h_h2?.away ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H2-2</div>
                      <div class="betting-option-value-vertical ${game.h2h_h2?.away ? "clickable" : ""}">${game.h2h_h2?.away || "-"}</div>
                    </div>
                  `
                      : ""
                  }
                  
                  <!-- 1st Half Totals -->
                  ${
                    game.totals_h1 && game.totals_h1.length > 0
                      ? game.totals_h1
                          .slice(0, 1)
                          .map(
                            (total) => `
                    <div class="betting-option-vertical ${!total.over ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H1-O${total.point}</div>
                      <div class="betting-option-value-vertical ${total.over ? "clickable" : ""}">${total.over || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!total.under ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H1-U${total.point}</div>
                      <div class="betting-option-value-vertical ${total.under ? "clickable" : ""}">${total.under || "-"}</div>
                    </div>
                  `,
                          )
                          .join("")
                      : ""
                  }
                  
                  <!-- 2nd Half Totals -->
                  ${
                    game.totals_h2 && game.totals_h2.length > 0
                      ? game.totals_h2
                          .slice(0, 1)
                          .map(
                            (total) => `
                    <div class="betting-option-vertical ${!total.over ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H2-O${total.point}</div>
                      <div class="betting-option-value-vertical ${total.over ? "clickable" : ""}">${total.over || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!total.under ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">H2-U${total.point}</div>
                      <div class="betting-option-value-vertical ${total.under ? "clickable" : ""}">${total.under || "-"}</div>
                    </div>
                  `,
                          )
                          .join("")
                      : ""
                  }
                  
                  <!-- 1st Half Team Totals -->
                  ${
                    game.team_totals_h1 && game.team_totals_h1.length > 0
                      ? game.team_totals_h1
                          .slice(0, 2)
                          .map((teamTotal) => {
                            const teamName =
                              (teamTotal.team === "home"
                                ? game.homeTeam
                                : game.awayTeam) || "";
                            const shortName = (
                              teamName.split(" ").slice(-1)[0] || ""
                            )
                              .substring(0, 4)
                              .toUpperCase();
                            return `
                    <div class="betting-option-vertical ${!teamTotal.over ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">${shortName} H1-O${teamTotal.point}</div>
                      <div class="betting-option-value-vertical ${teamTotal.over ? "clickable" : ""}">${teamTotal.over || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!teamTotal.under ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">${shortName} H1-U${teamTotal.point}</div>
                      <div class="betting-option-value-vertical ${teamTotal.under ? "clickable" : ""}">${teamTotal.under || "-"}</div>
                    </div>
                  `;
                          })
                          .join("")
                      : ""
                  }
                  
                  <!-- 2nd Half Team Totals -->
                  ${
                    game.team_totals_h2 && game.team_totals_h2.length > 0
                      ? game.team_totals_h2
                          .slice(0, 2)
                          .map((teamTotal) => {
                            const teamName =
                              (teamTotal.team === "home"
                                ? game.homeTeam
                                : game.awayTeam) || "";
                            const shortName = (
                              teamName.split(" ").slice(-1)[0] || ""
                            )
                              .substring(0, 4)
                              .toUpperCase();
                            return `
                    <div class="betting-option-vertical ${!teamTotal.over ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">${shortName} H2-O${teamTotal.point}</div>
                      <div class="betting-option-value-vertical ${teamTotal.over ? "clickable" : ""}">${teamTotal.over || "-"}</div>
                    </div>
                    <div class="betting-option-vertical ${!teamTotal.under ? "disabled" : ""}">
                      <div class="betting-option-label-vertical">${shortName} H2-U${teamTotal.point}</div>
                      <div class="betting-option-value-vertical ${teamTotal.under ? "clickable" : ""}">${teamTotal.under || "-"}</div>
                    </div>
                  `;
                          })
                          .join("")
                      : ""
                  }
                </div>
              </div>
            `;
              })
              .join("")}
          </div>
          
          <div class="print-footer">
            <p>Generated by Betzone on ${new Date().toLocaleString()}</p>
            <p>Total Games: ${games.length}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Helper function to convert date to CAT (Central Africa Time, UTC+2)
  const convertToCAT = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      // CAT is UTC+2
      const catOffset = 2 * 60; // 2 hours in minutes
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const catDate = new Date(utc + catOffset * 60000);

      // Format as: YYYY-MM-DD HH:MM (CAT)
      const year = catDate.getUTCFullYear();
      const month = String(catDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(catDate.getUTCDate()).padStart(2, "0");
      const hours = String(catDate.getUTCHours()).padStart(2, "0");
      const minutes = String(catDate.getUTCMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes} (CAT)`;
    } catch (error) {
      // If conversion fails, return original string
      return dateString;
    }
  };

  // Export games to Excel function
  const handleExportToExcel = async () => {
    if (!games || games.length === 0) {
      alert("No games data to export");
      return;
    }

    setIsExporting(true);
    let XLSX: any;
    
    try {
      // Check if electronAPI is available
      if (!window.electronAPI?.showSaveDialog) {
        console.log("Electron API not available, using browser download fallback");
      }

      // Dynamically import xlsx library with error handling
      try {
        XLSX = await import("xlsx");
        
        // Verify the library loaded correctly
        if (!XLSX || !XLSX.utils || !XLSX.utils.book_new) {
          throw new Error("XLSX library failed to load properly");
        }
      } catch (importError: any) {
        console.error("Failed to load xlsx library:", importError);
        alert("Failed to load Excel export library. Please check your internet connection and try again.");
        setIsExporting(false);
        return;
      }

      // Keep all totals lines for export (no truncation).
      const getAllTotals = (
        totals: Array<{
          point: number;
          over: number | string | null;
          under: number | string | null;
        }>,
      ) => totals || [];

      const toCellValue = (value: number | string | null | undefined) =>
        value == null ? "" : value;

      const getFriendlyMarketName = (marketKey: string): string => {
        const key = marketKey.toLowerCase().trim();
        const map: Record<string, string> = {
          h2h: "3 WAY",
          h2h_h1: "3 WAY - 1ST HALF",
          h2h_h2: "3 WAY - 2ND HALF",
          totals: "TOTAL GOALS",
          totals_h1: "1ST HALF O/U",
          totals_h2: "2ND HALF O/U",
          result_totals: "RESULT + TOTAL",
          double_chance: "DOUBLE CHANCE",
          btts: "BOTH TEAMS TO SCORE",
          spreads: "ASIAN HANDICAP",
          team_totals: "TEAM TOTALS",
          team_totals_h1: "1ST HALF TEAM TOTALS",
          team_totals_h2: "2ND HALF TEAM TOTALS",
          correct_score: "CORRECT SCORE",
          correct_score_h1: "1H CORRECT SCORE",
          correct_score_h2: "2H CORRECT SCORE",
        };
        return map[key] || key.replace(/_/g, " ").toUpperCase();
      };

      const shouldKeepHalfPoint = (point: number | undefined | null): boolean => {
        if (point == null || Number.isNaN(point)) return false;
        const decimal = Math.abs(point % 1);
        return Math.abs(decimal - 0.5) < 0.001;
      };

      const getMarketFamily = (marketKey: string): string => {
        const key = marketKey.toLowerCase().trim();
        if (key === "h2h" || key === "h2h_h1" || key === "h2h_h2") return "Result";
        if (key === "result_totals" || key.startsWith("totals") || key.includes("goal")) return "Goals";
        if (key.startsWith("totals_corners") || key.includes("corner")) return "Corners";
        if (key.startsWith("totals_cards") || key.startsWith("totals_yellow_cards") || key.includes("card")) return "Cards";
        if (
          key.startsWith("totals_fouls") ||
          key.startsWith("totals_tackles") ||
          key.startsWith("totals_shots") ||
          key.startsWith("totals_shotongoal") ||
          key.startsWith("totals_offsides") ||
          key.includes("foul") ||
          key.includes("shot") ||
          key.includes("offside") ||
          key.includes("tackle")
        ) return "Stats";
        if (key.startsWith("correct_score") || key.includes("score")) return "Score";
        if (key.startsWith("team_totals") || key.includes("total_home") || key.includes("total_away")) return "Team Totals";
        if (key === "spreads" || key.includes("handicap")) return "Spreads";
        if (key === "double_chance") return "Double Chance";
        if (key === "btts" || key.includes("both_teams")) return "BTTS";
        return "Other Markets";
      };

      const buildMarketOutcomeColumn = (
        marketKey: string,
        outcome: {
          name: string;
          price: number;
          point?: number;
          description?: string;
        },
      ): string => {
        const family = getMarketFamily(marketKey);
        const marketName = getFriendlyMarketName(marketKey);
        const parts = [family, marketName];
        if (outcome.description) parts.push(outcome.description);
        parts.push(outcome.name);
        if (outcome.point != null) parts.push(String(outcome.point));
        return parts.join(" - ");
      };

      const shouldIncludeMarketAsExtraColumn = (marketKey: string): boolean => {
        const key = marketKey.toLowerCase().trim();
        // These are already exported in canonical dedicated columns.
        const coveredByCanonicalColumns = new Set([
          "h2h",
          "h2h_h1",
          "h2h_h2",
          "totals",
          "totals_h1",
          "totals_h2",
          "double_chance",
          "btts",
        ]);
        return !coveredByCanonicalColumns.has(key);
      };

      const CARD_MARKET_TITLES: Record<string, string> = {
        h2h: "3 WAY",
        h2h_h1: "3 WAY - 1ST HALF",
        h2h_h2: "3 WAY - 2ND HALF",
        double_chance: "DOUBLE CHANCE",
        btts: "BOTH TEAMS TO SCORE",
        totals: "TOTAL GOALS",
        totals_h1: "1ST HALF O/U",
        totals_h2: "2ND HALF O/U",
        team_totals: "TEAM TOTALS",
        team_totals_h1: "1ST HALF TEAM TOTALS",
        team_totals_h2: "2ND HALF TEAM TOTALS",
        spreads: "ASIAN HANDICAP",
        result_totals: "RESULT + TOTAL",
        correct_score: "CORRECT SCORE",
        correct_score_h1: "1H CORRECT SCORE",
        correct_score_h2: "2H CORRECT SCORE",
      };

      const CARD_MARKET_ORDER = [
        "h2h",
        "double_chance",
        "totals",
        "btts",
        "h2h_h1",
        "h2h_h2",
        "totals_h1",
        "totals_h2",
        "team_totals",
        "team_totals_h1",
        "team_totals_h2",
        "spreads",
        "result_totals",
        "correct_score",
        "correct_score_h1",
        "correct_score_h2",
      ];

      const canonicalOutcomeKey = (
        game: Game,
        marketKey: string,
        outcome: { name: string; point?: number; description?: string },
      ): string => {
        const n = (outcome.name || "").trim();
        const nn = n.toLowerCase();
        const home = game.homeTeam?.toLowerCase().trim() || "";
        const away = game.awayTeam?.toLowerCase().trim() || "";
        const desc = (outcome.description || "").trim().toLowerCase();

        const overUnderWithPoint = () => {
          const direction = nn.includes("over")
            ? "Over"
            : nn.includes("under")
              ? "Under"
              : n;
          return outcome.point != null ? `${direction} ${outcome.point}` : direction;
        };

        if (marketKey === "h2h" || marketKey === "h2h_h1" || marketKey === "h2h_h2") {
          if (nn === "draw") return "X";
          if (home && nn.includes(home)) return "1";
          if (away && nn.includes(away)) return "2";
          return n;
        }
        if (marketKey === "double_chance") {
          if (nn.includes("1x") || (nn.includes("draw") && home && nn.includes(home)) || nn.includes("home or draw")) return "1X";
          if (nn.includes("x2") || (nn.includes("draw") && away && nn.includes(away)) || nn.includes("draw or away")) return "X2";
          if (nn.includes("12") || nn.includes("home or away")) return "12";
          return n;
        }
        if (marketKey === "btts") {
          if (nn === "yes") return "Yes";
          if (nn === "no") return "No";
          return n;
        }
        if (marketKey === "result_totals") {
          // Normalize to 1/X/2 + O/U point
          const [teamRaw = "", restRaw = ""] = n.split("/");
          const team = teamRaw.trim().toLowerCase();
          let side = teamRaw.trim();
          if (team === "draw") side = "X";
          else if (home && team.includes(home)) side = "1";
          else if (away && team.includes(away)) side = "2";
          const pointInRest = restRaw.match(/(\d+(?:\.\d+)?)/)?.[1];
          const dir =
            restRaw.toLowerCase().includes("over")
              ? "Over"
              : restRaw.toLowerCase().includes("under")
                ? "Under"
                : restRaw.trim();
          const p = outcome.point ?? (pointInRest ? Number(pointInRest) : undefined);
          return p != null ? `${side}/${dir} ${p}` : `${side}/${dir}`;
        }
        if (
          marketKey.startsWith("totals") ||
          marketKey.startsWith("team_totals")
        ) {
          if (marketKey.startsWith("team_totals")) {
            let teamSide = "";
            if (desc === "home" || (home && desc.includes(home)) || (home && nn.includes(home))) teamSide = "Home ";
            if (desc === "away" || (away && desc.includes(away)) || (away && nn.includes(away))) teamSide = "Away ";
            return `${teamSide}${overUnderWithPoint()}`.trim();
          }
          return overUnderWithPoint();
        }
        if (marketKey === "spreads") {
          if (home && nn.includes(home)) return outcome.point != null ? `1 ${outcome.point}` : "1";
          if (away && nn.includes(away)) return outcome.point != null ? `2 ${outcome.point}` : "2";
          return outcome.point != null ? `${n} ${outcome.point}` : n;
        }

        if (outcome.point != null) return `${n} ${outcome.point}`;
        return n;
      };

      // Build canonical market column set ordered like game card markets.
      const marketOutcomeSetByKey = new Map<string, Set<string>>();
      games.forEach((game) => {
        const addOutcome = (marketKey: string, outcomeKey: string) => {
          const set = marketOutcomeSetByKey.get(marketKey) || new Set<string>();
          set.add(outcomeKey);
          marketOutcomeSetByKey.set(marketKey, set);
        };

        if (game.rawMarkets && game.rawMarkets.length > 0) {
          game.rawMarkets.forEach((market) => {
            const key = market.key || "unknown_market";
            if (!shouldIncludeMarketAsExtraColumn(key)) return;
            (market.outcomes || []).forEach((o) => {
              if (o.point != null && !shouldKeepHalfPoint(Number(o.point))) return;
              addOutcome(
                key,
                canonicalOutcomeKey(game, key, {
                  name: o.name,
                  ...(o.point != null ? { point: o.point } : {}),
                  ...(o.description ? { description: o.description } : {}),
                }),
              );
            });
          });
        }

        // Ensure core card markets are always present even without rawMarkets
        if (game.homeOdds != null || game.drawOdds != null || game.awayOdds != null) {
          addOutcome("h2h", "1");
          addOutcome("h2h", "X");
          addOutcome("h2h", "2");
        }
        if (game.doubleChance?.homeOrDraw != null || game.doubleChance?.drawOrAway != null || game.doubleChance?.homeOrAway != null) {
          addOutcome("double_chance", "1X");
          addOutcome("double_chance", "X2");
          addOutcome("double_chance", "12");
        }
        if (game.bothTeamsToScore?.yes != null || game.bothTeamsToScore?.no != null) {
          addOutcome("btts", "Yes");
          addOutcome("btts", "No");
        }
        getAllTotals(game.totals || []).forEach((t) => {
          if (!shouldKeepHalfPoint(t.point)) return;
          addOutcome("totals", `Over ${t.point}`);
          addOutcome("totals", `Under ${t.point}`);
        });
        getAllTotals(game.totals_h1 || []).forEach((t) => {
          if (!shouldKeepHalfPoint(t.point)) return;
          addOutcome("totals_h1", `Over ${t.point}`);
          addOutcome("totals_h1", `Under ${t.point}`);
        });
        getAllTotals(game.totals_h2 || []).forEach((t) => {
          if (!shouldKeepHalfPoint(t.point)) return;
          addOutcome("totals_h2", `Over ${t.point}`);
          addOutcome("totals_h2", `Under ${t.point}`);
        });
      });

      const orderOutcomeKeys = (marketKey: string, keys: string[]): string[] => {
        if (marketKey === "h2h" || marketKey === "h2h_h1" || marketKey === "h2h_h2") {
          const base = ["1", "X", "2"];
          const extras = keys.filter((k) => !base.includes(k)).sort((a, b) => a.localeCompare(b));
          return [...base.filter((k) => keys.includes(k)), ...extras];
        }
        if (marketKey === "double_chance") {
          const base = ["1X", "12", "X2"];
          const extras = keys.filter((k) => !base.includes(k)).sort((a, b) => a.localeCompare(b));
          return [...base.filter((k) => keys.includes(k)), ...extras];
        }
        return [...keys].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      };

      const orderedMarketKeys = [
        ...CARD_MARKET_ORDER.filter((k) => marketOutcomeSetByKey.has(k)),
        ...Array.from(marketOutcomeSetByKey.keys())
          .filter((k) => !CARD_MARKET_ORDER.includes(k))
          .sort((a, b) => a.localeCompare(b)),
      ];

      const orderedMarketColumns = orderedMarketKeys.flatMap((marketKey) => {
        const title = CARD_MARKET_TITLES[marketKey] || getFriendlyMarketName(marketKey);
        const outcomeKeys = orderOutcomeKeys(
          marketKey,
          Array.from(marketOutcomeSetByKey.get(marketKey) || []),
        );
        return outcomeKeys.map((outcomeKey) => ({
          marketKey,
          outcomeKey,
          columnLabel: `${getMarketFamily(marketKey)} - ${title} - ${outcomeKey}`,
        }));
      });

      // Prepare data for export - betting shop fixture format
      const exportData = games.map((game, index) => {
        // Format match time
        const matchDate = new Date(game.matchTime);
        const timeStr = matchDate.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const dateStr = matchDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        });

        // Build row in betting shop fixture format
        const row: any = {
          "No": index + 1,
          "Date": dateStr,
          "Time": timeStr,
          "League": game.league || "",
          "Home": game.homeTeam,
          "Away": game.awayTeam,
        };

        const gameMarketOdds = new Map<string, number | string>();
        const setOdd = (marketKey: string, outcomeKey: string, value: number | string | null | undefined) => {
          gameMarketOdds.set(`${marketKey}::${outcomeKey}`, toCellValue(value));
        };

        // Canonical core card markets from top-level game fields.
        setOdd("h2h", "1", game.homeOdds);
        setOdd("h2h", "X", game.drawOdds);
        setOdd("h2h", "2", game.awayOdds);

        setOdd("double_chance", "1X", game.doubleChance?.homeOrDraw);
        setOdd("double_chance", "X2", game.doubleChance?.drawOrAway);
        setOdd("double_chance", "12", game.doubleChance?.homeOrAway);

        setOdd("btts", "Yes", game.bothTeamsToScore?.yes);
        setOdd("btts", "No", game.bothTeamsToScore?.no);

        setOdd("h2h_h1", "1", game.h2h_h1?.home);
        setOdd("h2h_h1", "X", game.h2h_h1?.draw);
        setOdd("h2h_h1", "2", game.h2h_h1?.away);

        setOdd("h2h_h2", "1", game.h2h_h2?.home);
        setOdd("h2h_h2", "X", game.h2h_h2?.draw);
        setOdd("h2h_h2", "2", game.h2h_h2?.away);

        getAllTotals(game.totals || []).forEach((t) => {
          if (!shouldKeepHalfPoint(t.point)) return;
          setOdd("totals", `Over ${t.point}`, t.over);
          setOdd("totals", `Under ${t.point}`, t.under);
        });
        getAllTotals(game.totals_h1 || []).forEach((t) => {
          if (!shouldKeepHalfPoint(t.point)) return;
          setOdd("totals_h1", `Over ${t.point}`, t.over);
          setOdd("totals_h1", `Under ${t.point}`, t.under);
        });
        getAllTotals(game.totals_h2 || []).forEach((t) => {
          if (!shouldKeepHalfPoint(t.point)) return;
          setOdd("totals_h2", `Over ${t.point}`, t.over);
          setOdd("totals_h2", `Under ${t.point}`, t.under);
        });

        // Additional markets from raw markets (excluding already-covered keys).
        if (game.rawMarkets && game.rawMarkets.length > 0) {
          game.rawMarkets.forEach((market) => {
            const marketKey = market.key || "unknown_market";
            if (!shouldIncludeMarketAsExtraColumn(marketKey)) return;
            (market.outcomes || []).forEach((outcome) => {
              if (outcome.point != null && !shouldKeepHalfPoint(Number(outcome.point))) return;
              const outcomeKey = canonicalOutcomeKey(game, marketKey, {
                name: outcome.name,
                ...(outcome.point != null ? { point: outcome.point } : {}),
                ...(outcome.description ? { description: outcome.description } : {}),
              });
              setOdd(marketKey, outcomeKey, outcome.price);
            });
          });
        }

        orderedMarketColumns.forEach((col) => {
          row[col.columnLabel] = toCellValue(
            gameMarketOdds.get(`${col.marketKey}::${col.outcomeKey}`),
          );
        });

        return row;
      });

      // Reorder columns by sparsity:
      // - Keep fixture columns pinned on the left.
      // - Keep denser odds columns next.
      // - Move very sparse columns (>=90% missing) to the far right.
      const pinnedLeftHeaders = ["No", "Date", "Time", "League", "Home", "Away"];
      const firstRowHeaders = Object.keys(exportData[0] || {});
      const dynamicHeaders = firstRowHeaders.filter(
        (h) => !pinnedLeftHeaders.includes(h),
      );
      const totalRows = Math.max(1, exportData.length);

      const missingRatioByHeader = new Map<string, number>();
      for (const header of dynamicHeaders) {
        let missingCount = 0;
        for (const row of exportData) {
          const value = row[header];
          const isMissing =
            value === "" ||
            value === null ||
            value === undefined;
          if (isMissing) missingCount++;
        }
        missingRatioByHeader.set(header, missingCount / totalRows);
      }

      const denseHeaders = dynamicHeaders.filter(
        (h) => (missingRatioByHeader.get(h) ?? 0) < 0.9,
      );
      const sparseHeaders = dynamicHeaders.filter(
        (h) => (missingRatioByHeader.get(h) ?? 0) >= 0.9,
      );

      const finalHeaderOrder = [
        ...pinnedLeftHeaders.filter((h) => firstRowHeaders.includes(h)),
        ...denseHeaders,
        ...sparseHeaders,
      ];

      const reorderedExportData = exportData.map((row) => {
        const orderedRow: Record<string, any> = {};
        for (const header of finalHeaderOrder) {
          orderedRow[header] = row[header] ?? "";
        }
        return orderedRow;
      });

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to worksheet (without title first)
      const worksheet = XLSX.utils.json_to_sheet(reorderedExportData);

      // Build 2-row header:
      // Row 1: Market type titles (merged)
      // Row 2: Specific outcomes/columns
      const numberOfCols = Object.keys(reorderedExportData[0] || {}).length;
      const headers = Object.keys(reorderedExportData[0] || {});
      
      // Shift all data down by 1 row:
      // row 0 => grouped section headers, row 1 => original column headers
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const rowShift = 1;
      for (let R = range.e.r; R >= 0; --R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const oldCell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
          if (oldCell) {
            worksheet[XLSX.utils.encode_cell({ r: R + rowShift, c: C })] = oldCell;
          }
        }
      }

      // Add grouped section headers in row 1 (index 0)
      if (!worksheet['!merges']) worksheet['!merges'] = [];

      // Build grouped section labels on row 1 (index 0)
      const getHeaderGroup = (header: string): string => {
        if (["No", "Date", "Time", "League", "Home", "Away"].includes(header)) return "Fixture Info";
        if (header.startsWith("FT ") || header === "1" || header === "X" || header === "2") return "Full Time";
        if (header.startsWith("1H ") || header.startsWith("H1") || header.startsWith("HX") || header.startsWith("H2") || header.startsWith("HO-") || header.startsWith("HU-")) return "1st Half";
        if (header.startsWith("2H ")) return "2nd Half";
        if (header.startsWith("DC ")) return "Double Chance";
        if (header.startsWith("BTS ")) return "BTTS";
        if (header.includes(" - ")) {
          const parts = header.split(" - ");
          if (parts.length >= 2) return `${parts[0]} - ${parts[1]}`;
          return parts[0] || "Other Markets";
        }
        if (header.startsWith("O-") || header.startsWith("U-")) return "Full Time";
        return "Other Odds";
      };

      let currentGroup = getHeaderGroup(headers[0] || "");
      let groupStart = 0;
      for (let idx = 0; idx < headers.length; idx++) {
        const group = getHeaderGroup(headers[idx] || "");
        const nextGroup =
          idx < headers.length - 1
            ? getHeaderGroup(headers[idx + 1] || "")
            : null;
        if (group !== currentGroup) {
          currentGroup = group;
          groupStart = idx;
        }
        if (nextGroup !== group) {
          const startCell = XLSX.utils.encode_cell({ r: 0, c: groupStart });
          worksheet[startCell] = { v: group, t: "s" };
          worksheet["!merges"].push({
            s: { r: 0, c: groupStart },
            e: { r: 0, c: idx },
          });
        }
      }

      // Row 2 should show only specific outcomes/field names.
      // For market columns shaped like "Family - Market Title - Outcome",
      // keep only the final "Outcome" segment.
      const getHeaderOutcomeLabel = (header: string): string => {
        if (header.includes(" - ")) {
          const parts = header.split(" - ").map((p) => p.trim()).filter(Boolean);
          return parts[parts.length - 1] || header;
        }
        return header;
      };
      headers.forEach((header, idx) => {
        const cell = XLSX.utils.encode_cell({ r: 1, c: idx });
        worksheet[cell] = { v: getHeaderOutcomeLabel(header), t: "s" };
      });
      
      // Update range to include grouped header row
      worksheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: range.e.r + rowShift, c: range.e.c }
      });

      // Dynamic column widths based on real content (header + data cells).
      const wscols = headers.map((header) => {
        let maxLen = getHeaderOutcomeLabel(header).length;

        for (const row of reorderedExportData) {
          const value = row[header];
          const text = value == null ? "" : String(value);
          if (text.length > maxLen) maxLen = text.length;
        }

        // Small padding and sane bounds to avoid unusable columns.
        const width = Math.min(Math.max(maxLen + 2, 4), 60);
        return { wch: width };
      });
      worksheet["!cols"] = wscols;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Games");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const defaultFilename = `betzone-games-${timestamp}.xlsx`;

      let filePath: string | undefined;

      // Use Electron file dialog if available
      if (window.electronAPI?.showSaveDialog) {
        const result = await window.electronAPI.showSaveDialog({
          title: "Save Games Export",
          defaultPath: defaultFilename,
          filters: [
            { name: "Excel Files", extensions: ["xlsx"] },
            { name: "All Files", extensions: ["*"] },
          ],
        });

        if (result.canceled) {
          setIsExporting(false);
          return;
        }

        filePath = result.filePath;
      }

      // Write file using the selected path or default download
      if (filePath && window.electronAPI?.writeExcelFile) {
        // In Electron, use IPC to write file to the selected location
        const buffer = XLSX.write(workbook, {
          type: "array",
          bookType: "xlsx",
        });
        const result = await window.electronAPI.writeExcelFile(
          filePath,
          buffer,
        );
        if (result.success) {
          alert(`Games data exported successfully to ${filePath}`);
        } else {
          throw new Error(result.error || "Failed to write file");
        }
      } else {
        // Fallback to browser download
        XLSX.writeFile(workbook, defaultFilename);
        alert(`Games data exported successfully to ${defaultFilename}`);
      }
    } catch (error: any) {
      alert(`Failed to export games: ${error.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Update last updated timestamp when games change
  useEffect(() => {
    if (games.length > 0) {
      setLastUpdated(new Date());
    }
  }, [games]);

  const handlePlaceBet = () => {
    if (!selectedGame || !selectedBet) {
      alert("Please select a game and bet type");
      return;
    }

    const odds =
      selectedBet === "home"
        ? selectedGame.homeOdds
        : selectedBet === "draw"
          ? selectedGame.drawOdds
          : selectedGame.awayOdds;

    if (!odds) {
      alert("Odds not available for this bet");
      return;
    }

    const potentialWinnings = betAmount * Number(odds);

    alert(`Bet placed successfully!
    Game: ${selectedGame.homeTeam} vs ${selectedGame.awayTeam}
    Bet: ${selectedBet.toUpperCase()}
    Amount: SSP ${betAmount}
    Odds: ${odds}
    Potential Winnings: SSP ${potentialWinnings.toFixed(2)}`);

    // Reset selections
    setSelectedGame(null);
    setSelectedBet(null);
    setBetAmount(10);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "var(--color-error)";
      case "finished":
        return "var(--color-text-muted)";
      default:
        return "var(--color-success)";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "LIVE";
      case "finished":
        return "FINISHED";
      default:
        return "UPCOMING";
    }
  };

  const getCountryFlag = (country: string) => COUNTRY_FLAGS[country] ?? "🌐";

  const toggleCountryExpanded = useCallback((country: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  }, []);

  const getLeagueDisplayName = (leagueKey: string) => {
    if (!leagueKey || leagueKey.trim() === "") return "Today's games";
    const league = supportedLeagues?.find((l) => l.key === leagueKey);
    return league
      ? league.name
      : leagueKey.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const toggleExpanded = useCallback((gameId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedGames((prev) => {
      const next = new Set(prev);
      if (next.has(gameId)) next.delete(gameId);
      else next.add(gameId);
      return next;
    });
  }, []);

  const getCanonicalGameId = useCallback((game: Game): string => {
    return game.externalId || game.team_index?.externalId || game.id;
  }, []);

  const betSlipSelectionLookup = useMemo(() => {
    const lookup = new Set<string>();
    const gameLookup = new Set<string>();
    for (const item of betSlipItems) {
      lookup.add(`${item.gameId}::${item.betType}::${item.selection}`);
      gameLookup.add(item.gameId);
    }
    return { selectionLookup: lookup, gameLookup };
  }, [betSlipItems]);

  const isSelectionInBetSlip = useCallback((
    gameId: string,
    betType: string,
    selection: string,
  ): boolean => {
    return betSlipSelectionLookup.selectionLookup.has(
      `${gameId}::${betType}::${selection}`,
    );
  }, [betSlipSelectionLookup]);

  const handleAddToBetSlip = useCallback((
    game: Game,
    betType: string,
    selection: string,
    odds: number,
    marketKey?: string,
  ) => {
    // Use original odds without reduction
    const reducedOdds = odds;
    const canonicalGameId = getCanonicalGameId(game);
    // Agent mode now only handles walk-in clients (shop bets), so no user selection needed

    // Regular user flow - add to bet slip
    const betSlipItem: BetSlipItem = {
      id: `${game.id}-${betType}-${selection}`,
      gameId: canonicalGameId,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      betType,
      selection,
      ...(marketKey ? { marketKey } : {}),
      odds: reducedOdds,
      stake: 0, // No default stake - user must input
      potentialWinnings: 0,
      bookmaker: "Betzone",
      gameTime: game.matchTime,
      sportKey:
        game.sportKey ||
        (game.league === "Premier League"
          ? "soccer_epl"
          : "soccer_" + game.league.toLowerCase().replace(/\s+/g, "_")),
    };

    dispatch(addToBetSlip(betSlipItem));

    // Add visual feedback with a brief pulse animation
    const elementId = `${game.id}-${betType}-${selection}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("pulse");
      setTimeout(() => {
        element.classList.remove("pulse");
      }, 600);
    }
  }, [dispatch, getCanonicalGameId]);

  const onBackToHome = useCallback(() => onNavigate("home"), [onNavigate]);

  const gamesPageActions = useMemo(() => ({
    onBackToHome,
    onPrintGames: handlePrintGames,
    onExportToExcel: handleExportToExcel,
    onTestPrinter: handleTestPrinter,
    isExporting,
    hasGames: !!(games && games.length > 0),
  }), [onBackToHome, handlePrintGames, handleExportToExcel, handleTestPrinter, isExporting, games]);

  const validGames = useMemo(
    () => games.filter((game) => game && game.id && game.homeTeam && game.awayTeam),
    [games],
  );

  const filteredCountryGroups = useMemo(() => {
    if (!supportedLeaguesByCountry) return [];
    const trimmed = leaguesSearchQuery.trim().toLowerCase();
    if (!trimmed) {
      return supportedLeaguesByCountry
        .map((group) => ({ ...group, filteredLeagues: group.leagues }))
        .filter((group) => group.filteredLeagues.length > 0);
    }
    return supportedLeaguesByCountry
      .map((group) => {
        const countryMatch = group.country.toLowerCase().includes(trimmed);
        const filteredLeagues = countryMatch
          ? group.leagues
          : group.leagues.filter(
              (l) =>
                l.name.toLowerCase().includes(trimmed) ||
                l.displayName.toLowerCase().includes(trimmed) ||
                l.key.toLowerCase().includes(trimmed),
            );
        return { ...group, filteredLeagues };
      })
      .filter((group) => group.filteredLeagues.length > 0);
  }, [supportedLeaguesByCountry, leaguesSearchQuery]);

  if (isLoading) {
    return (
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Header
          onNavigate={onNavigate}
          currentPage="games"
          isAgentMode={isAgentMode}
          gamesPageActions={gamesPageActions}
        />
        <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Stack alignItems="center" spacing={3}>
              <CircularProgress size={60} sx={{ color: "primary.main" }} />
              <Typography variant="h5" color="text.secondary">
                Loading games...
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Header
        onNavigate={onNavigate}
        currentPage="games"
        isAgentMode={isAgentMode}
        gamesPageActions={gamesPageActions}
      />

      <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
        {/* Main Content with Left Panel and Games - parent minHeight so both panels fill viewport */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            minHeight: "calc(100vh - 120px)",
            alignItems: "stretch",
          }}
        >
          {/* Left Panel - League Selector and Controls - Hidden on small/medium screens */}
          <Paper
            sx={{
              p: 3,
              width: "clamp(280px, 22vw, 420px)",
              minWidth: 280,
              maxWidth: 420,
              flexShrink: 0,
              height: "calc(150vh - 300px)",
              position: "sticky",
              top: 20,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
              overflowY: "auto",
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255,255,255,0.05)",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255,255,255,0.2)",
                borderRadius: "4px",
              },
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={3}
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Controls
            </Typography>

            <Stack spacing={2} mb={4}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleManualRefresh}
                color="success"
                fullWidth
                sx={{
                  fontWeight: 600,
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Refresh Odds
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => {
                  setShowSearchPanel(!showSearchPanel);
                  if (showSearchPanel) {
                    // Clear search results when closing panel
                    setHasSearchResults(false);
                  }
                }}
                color="primary"
                fullWidth
                sx={{
                  fontWeight: 600,
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {showSearchPanel ? "Hide Search" : "Search Games"}
              </Button>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
                textAlign="center"
              >
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            </Stack>

            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

            {/* Leagues section - collapsible with search */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                cursor: "pointer",
                "&:hover": { opacity: 0.9 },
              }}
              onClick={() => setLeaguesSectionExpanded(!leaguesSectionExpanded)}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                Leagues
              </Typography>
              {leaguesSectionExpanded ? (
                <ExpandLessIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
              ) : (
                <ExpandMoreIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
              )}
            </Box>

            <Collapse in={leaguesSectionExpanded}>
              <InputBase
                placeholder="Search teams, leagues"
                value={leaguesSearchQuery}
                onChange={(e) => setLeaguesSearchQuery(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }}
                    />
                  </InputAdornment>
                }
                sx={{
                  width: "100%",
                  mb: 2,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.9)",
                  "& input": { fontSize: 14 },
                  "& input::placeholder": {
                    color: "rgba(255,255,255,0.5)",
                    opacity: 1,
                  },
                }}
              />

              {leaguesLoading ? (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <CircularProgress
                    size={24}
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      mt: 1,
                      display: "block",
                    }}
                  >
                    Loading leagues...
                  </Typography>
                </Box>
              ) : leaguesError ? (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="caption" sx={{ color: "error.main" }}>
                    Failed to load leagues
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={0} sx={{ maxHeight: 360, overflowY: "auto" }}>
                  {/* Today's games - default view (no league filter) */}
                  <Box sx={{ mb: 1.5 }}>
                    <Chip
                      icon={<SoccerIcon />}
                      label="Today's games"
                      onClick={() => {
                        setLeagueKey("");
                        setUpcomingPage(1);
                      }}
                      color={!leagueKey ? "primary" : "default"}
                      variant={!leagueKey ? "filled" : "outlined"}
                      sx={{
                        fontWeight: 600,
                        width: "100%",
                        justifyContent: "flex-start",
                        backgroundColor: !leagueKey
                          ? "#667eea"
                          : "rgba(255,255,255,0.08)",
                        color: !leagueKey ? "white" : "rgba(255,255,255,0.8)",
                        borderColor: "rgba(255,255,255,0.15)",
                        "&:hover": {
                          backgroundColor: !leagueKey
                            ? "#5a6fd8"
                            : "rgba(255,255,255,0.15)",
                        },
                      }}
                    />
                  </Box>

                  {filteredCountryGroups.map((group) => {
                      const filteredLeagues = group.filteredLeagues;
                      const count = filteredLeagues.length;
                      if (count === 0) return null;

                      const isCountryExpanded =
                        expandedCountries.has(group.country) ||
                        leaguesSearchQuery.trim().length > 0;

                      return (
                        <Box key={group.country}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              py: 1,
                              px: 0.5,
                              cursor: "pointer",
                              borderRadius: 1,
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.06)",
                              },
                            }}
                            onClick={() => toggleCountryExpanded(group.country)}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {group.countryFlag ? (
                                <Box
                                  component="img"
                                  src={group.countryFlag}
                                  alt=""
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                  sx={{
                                    width: 20,
                                    height: 15,
                                    objectFit: "cover",
                                    borderRadius: "2px",
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <Typography
                                  component="span"
                                  sx={{ fontSize: "1.1em", lineHeight: 1 }}
                                >
                                  {getCountryFlag(group.country)}
                                </Typography>
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "rgba(255,255,255,0.9)",
                                  fontWeight: 500,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {group.country} ({count})
                              </Typography>
                            </Box>
                            {!leaguesSearchQuery.trim() &&
                              (isCountryExpanded ? (
                                <ExpandLessIcon
                                  sx={{
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: 20,
                                  }}
                                />
                              ) : (
                                <ExpandMoreIcon
                                  sx={{
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: 20,
                                  }}
                                />
                              ))}
                          </Box>
                          <Collapse in={isCountryExpanded}>
                            <Stack spacing={0.75} sx={{ pl: 2, pb: 1 }}>
                              {filteredLeagues.map((league) => (
                                <Chip
                                  key={`${group.country}-${league.key}`}
                                  icon={
                                    league.logo ? (
                                      <Box
                                        component="img"
                                        src={league.logo}
                                        alt=""
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).style.display = "none";
                                        }}
                                        sx={{
                                          width: 18,
                                          height: 18,
                                          objectFit: "contain",
                                          ml: 0.5,
                                        }}
                                      />
                                    ) : (
                                      <SoccerIcon sx={{ fontSize: 16 }} />
                                    )
                                  }
                                  label={league.displayName}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLeagueKey(league.key);
                                    setUpcomingPage(1);
                                  }}
                                  color={
                                    leagueKey === league.key
                                      ? "primary"
                                      : "default"
                                  }
                                  variant={
                                    leagueKey === league.key
                                      ? "filled"
                                      : "outlined"
                                  }
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    width: "100%",
                                    justifyContent: "flex-start",
                                    backgroundColor:
                                      leagueKey === league.key
                                        ? "#667eea"
                                        : "rgba(255,255,255,0.08)",
                                    color:
                                      leagueKey === league.key
                                        ? "white"
                                        : "rgba(255,255,255,0.8)",
                                    borderColor: "rgba(255,255,255,0.15)",
                                    "&:hover": {
                                      backgroundColor:
                                        leagueKey === league.key
                                          ? "#5a6fd8"
                                          : "rgba(255,255,255,0.15)",
                                    },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Collapse>
                        </Box>
                      );
                    })}
                </Stack>
              )}
            </Collapse>

            {/* Agent Mode Indicator */}
            {isAgentMode && (
              <Box>
                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={2}
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Agent Mode
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    background:
                      "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                    border: "1px solid #90CAF9",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        Shop Agent Active
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      align="center"
                    >
                      Processing walk-in client bets
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            )}
          </Paper>

          {/* Right Panel - Games */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {/* Search Panel */}
            <Collapse in={showSearchPanel}>
              <Box sx={{ mb: 3 }}>
                <GameSearch
                  onGameSelect={setSelectedGame}
                  onAddToBetSlip={handleAddToBetSlip}
                  isSelectionInBetSlip={isSelectionInBetSlip}
                  onSearchResultsChange={setHasSearchResults}
                  leagueGames={games}
                  leagueKey={leagueKey}
                />
              </Box>
            </Collapse>

            {/* Error Message */}
            {isError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => mutate()}>
                    Retry
                  </Button>
                }
                sx={{ mb: 3 }}
              >
                {error?.message || "Failed to load games"}
              </Alert>
            )}

            {/* Auto-refresh notification */}
            <Snackbar
              open={showRefreshNotification}
              autoHideDuration={3000}
              onClose={() => setShowRefreshNotification(false)}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                severity="success"
                icon={<RefreshIcon />}
                onClose={() => setShowRefreshNotification(false)}
              >
                Odds automatically refreshed at{" "}
                {new Date().toLocaleTimeString()}
              </Alert>
            </Snackbar>

            {/* Games Grid - Hidden when search results are displayed */}
            {!hasSearchResults && (
              <Box>
                {isEmpty &&
                (leagueKey === "soccer_uefa_world_cup_qualifiers" ||
                  leagueKey === "soccer_bundesliga" ||
                  leagueKey === "soccer_laliga") ? (
                  <Paper
                    sx={{
                      p: 6,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                      border: "1px solid #90CAF9",
                      mb: 3,
                    }}
                  >
                    <TrophyIcon
                      sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="primary.main"
                      gutterBottom
                    >
                      {getLeagueDisplayName(leagueKey)}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      No games available at the moment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      The {getLeagueDisplayName(leagueKey)} endpoint is not yet
                      implemented on the backend.
                      <br />
                      Expected endpoint: <code>/api/{leagueKey}/odds</code>
                    </Typography>
                  </Paper>
                ) : isEmpty ? (
                  <Paper
                    sx={{
                      p: 6,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
                      border: "1px solid #CE93D8",
                      mb: 3,
                    }}
                  >
                    <SoccerIcon
                      sx={{ fontSize: 64, color: "secondary.main", mb: 2 }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="secondary.main"
                      gutterBottom
                    >
                      No Games Available
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Please try refreshing or check back later
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    <Stack spacing={2}>
                      {validGames.map((game) => {
                          const gameNumber = game.team_index?.fullIndex || 0;
                          const canonicalGameId = getCanonicalGameId(game);

                          return (
                            <GameCard
                              key={game.id}
                              game={game}
                              isSelected={selectedGame?.id === game.id}
                              onSelect={setSelectedGame}
                              onAddToBetSlip={handleAddToBetSlip}
                              isSelectionInBetSlip={isSelectionInBetSlip}
                              isExpanded={expandedGames.has(game.id)}
                              onToggleExpanded={toggleExpanded}
                              gameNumber={gameNumber}
                              isHighlighted={betSlipSelectionLookup.gameLookup.has(canonicalGameId)}
                            />
                          );
                        })}
                    </Stack>

                    {pagination && pagination.totalPages > 1 && (
                      <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={2}
                        sx={{ mt: 3, mb: 2 }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={upcomingPage <= 1}
                          onClick={() => {
                            setUpcomingPage((p) => Math.max(1, p - 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          sx={{
                            color: "rgba(255,255,255,0.8)",
                            borderColor: "rgba(255,255,255,0.2)",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: "rgba(25,118,210,0.1)",
                            },
                            "&.Mui-disabled": {
                              color: "rgba(255,255,255,0.3)",
                              borderColor: "rgba(255,255,255,0.1)",
                            },
                          }}
                        >
                          Previous
                        </Button>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontWeight: 500,
                          }}
                        >
                          Page {pagination.page} of {pagination.totalPages}
                          <Typography
                            component="span"
                            sx={{
                              color: "rgba(255,255,255,0.4)",
                              ml: 1,
                              fontSize: "0.75rem",
                            }}
                          >
                            {`(${pagination.total} games)`}
                          </Typography>
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={upcomingPage >= pagination.totalPages}
                          onClick={() => {
                            setUpcomingPage((p) =>
                              Math.min(pagination.totalPages, p + 1),
                            );
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          sx={{
                            color: "rgba(255,255,255,0.8)",
                            borderColor: "rgba(255,255,255,0.2)",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: "rgba(25,118,210,0.1)",
                            },
                            "&.Mui-disabled": {
                              color: "rgba(255,255,255,0.3)",
                              borderColor: "rgba(255,255,255,0.1)",
                            },
                          }}
                        >
                          Next
                        </Button>
                      </Stack>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* Floating BetSlip Button - Only on small/medium screens */}
      {betSlipItems.length > 0 && (
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            position: "fixed",
            right: { xs: 16, sm: 24 },
            bottom: 80,
            zIndex: 1000,
          }}
        >
          <Badge
            badgeContent={betSlipItems.length}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#ff6b6b",
                color: "white",
                fontWeight: 600,
                right: -8,
                top: -8,
                minWidth: 20,
                height: 20,
              },
            }}
          >
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={() => dispatch(toggleBetSlipVisibility())}
              sx={{
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
                borderRadius: "12px",
                px: 2,
                py: 1.5,
                fontWeight: 600,
                boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                  boxShadow: "0 6px 24px rgba(25, 118, 210, 0.5)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Betslip
              </Typography>
            </Button>
          </Badge>
        </Box>
      )}
    </Box>
  );
};
