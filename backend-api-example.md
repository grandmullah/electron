# Backend API Structure for BetSlip Integration

## API Endpoints

### 1. Place Single Bets
**POST** `/api/bets/single`

**Request Body:**
```json
{
  "bets": [
    {
      "betId": "bet_1703123456789_abc123def",
      "gameId": "game_123",
      "homeTeam": "Manchester United",
      "awayTeam": "Liverpool",
      "betType": "3 Way",
      "selection": "Home",
      "odds": 2.50,
      "stake": 10.00,
      "potentialWinnings": 25.00,
      "userId": "user_456",
      "timestamp": "2023-12-21T12:34:56.789Z"
    },
    {
      "betId": "bet_1703123456790_xyz789ghi",
      "gameId": "game_124",
      "homeTeam": "Arsenal",
      "awayTeam": "Chelsea",
      "betType": "3 Way",
      "selection": "Draw",
      "odds": 3.20,
      "stake": 15.00,
      "potentialWinnings": 48.00,
      "userId": "user_456",
      "timestamp": "2023-12-21T12:34:56.789Z"
    }
  ],
  "totalStake": 25.00,
  "userId": "user_456",
  "timestamp": "2023-12-21T12:34:56.789Z"
}
```

**Response:**
```json
{
  "success": true,
  "bets": [
    {
      "success": true,
      "betId": "bet_1703123456789_abc123def",
      "message": "Bet placed successfully",
      "status": "accepted",
      "timestamp": "2023-12-21T12:34:56.789Z"
    },
    {
      "success": true,
      "betId": "bet_1703123456790_xyz789ghi",
      "message": "Bet placed successfully",
      "status": "accepted",
      "timestamp": "2023-12-21T12:34:56.789Z"
    }
  ]
}
```

### 2. Place Multibet
**POST** `/api/bets/multibet`

**Request Body:**
```json
{
  "betId": "multibet_1703123456789_abc123def",
  "bets": [
    {
      "betId": "bet_1703123456789_abc123def",
      "gameId": "game_123",
      "homeTeam": "Manchester United",
      "awayTeam": "Liverpool",
      "betType": "3 Way",
      "selection": "Home",
      "odds": 2.50,
      "stake": 10.00,
      "potentialWinnings": 25.00,
      "userId": "user_456",
      "timestamp": "2023-12-21T12:34:56.789Z"
    },
    {
      "betId": "bet_1703123456790_xyz789ghi",
      "gameId": "game_124",
      "homeTeam": "Arsenal",
      "awayTeam": "Chelsea",
      "betType": "3 Way",
      "selection": "Draw",
      "odds": 3.20,
      "stake": 10.00,
      "potentialWinnings": 32.00,
      "userId": "user_456",
      "timestamp": "2023-12-21T12:34:56.789Z"
    }
  ],
  "totalStake": 10.00,
  "combinedOdds": 8.00,
  "potentialWinnings": 80.00,
  "userId": "user_456",
  "timestamp": "2023-12-21T12:34:56.789Z",
  "betType": "multibet"
}
```

**Response:**
```json
{
  "success": true,
  "betId": "multibet_1703123456789_abc123def",
  "message": "Multibet placed successfully",
  "status": "accepted",
  "timestamp": "2023-12-21T12:34:56.789Z"
}
```

### 3. Get Bet History
**GET** `/api/bets/history/{userId}`

**Response:**
```json
{
  "success": true,
  "bets": [
    {
      "betId": "bet_1703123456789_abc123def",
      "gameId": "game_123",
      "homeTeam": "Manchester United",
      "awayTeam": "Liverpool",
      "betType": "3 Way",
      "selection": "Home",
      "odds": 2.50,
      "stake": 10.00,
      "potentialWinnings": 25.00,
      "status": "won",
      "result": "Home",
      "winnings": 25.00,
      "placedAt": "2023-12-21T12:34:56.789Z",
      "settledAt": "2023-12-21T15:30:00.000Z"
    }
  ]
}
```

### 4. Get Bet Status
**GET** `/api/bets/status/{betId}`

**Response:**
```json
{
  "success": true,
  "betId": "bet_1703123456789_abc123def",
  "status": "pending",
  "message": "Bet is pending settlement",
  "placedAt": "2023-12-21T12:34:56.789Z",
  "estimatedSettlement": "2023-12-21T15:30:00.000Z"
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": "Invalid betslip: Conflicting selections for Manchester United vs Liverpool",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "selections",
    "message": "Multiple selections for same game"
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "User not authenticated",
  "code": "AUTH_ERROR"
}
```

### Insufficient Balance Error
```json
{
  "success": false,
  "error": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE",
  "details": {
    "required": 25.00,
    "available": 15.00
  }
}
```

## Database Schema Example

### Bets Table
```sql
CREATE TABLE bets (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  game_id VARCHAR(255) NOT NULL,
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  bet_type VARCHAR(50) NOT NULL,
  selection VARCHAR(50) NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  stake DECIMAL(10,2) NOT NULL,
  potential_winnings DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'won', 'lost', 'void') DEFAULT 'pending',
  result VARCHAR(50),
  actual_winnings DECIMAL(10,2),
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_game_id (game_id),
  INDEX idx_status (status),
  INDEX idx_placed_at (placed_at)
);
```

### Multibets Table
```sql
CREATE TABLE multibets (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  total_stake DECIMAL(10,2) NOT NULL,
  combined_odds DECIMAL(10,2) NOT NULL,
  potential_winnings DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'won', 'lost', 'void') DEFAULT 'pending',
  result VARCHAR(50),
  actual_winnings DECIMAL(10,2),
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_placed_at (placed_at)
);
```

### Multibet Selections Table
```sql
CREATE TABLE multibet_selections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  multibet_id VARCHAR(255) NOT NULL,
  bet_id VARCHAR(255) NOT NULL,
  game_id VARCHAR(255) NOT NULL,
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  bet_type VARCHAR(50) NOT NULL,
  selection VARCHAR(50) NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  
  FOREIGN KEY (multibet_id) REFERENCES multibets(id),
  INDEX idx_multibet_id (multibet_id),
  INDEX idx_bet_id (bet_id)
);
```

## Backend Processing Logic

### 1. Validation Steps
- Check user authentication
- Validate betslip structure
- Check for conflicting selections
- Verify minimum/maximum stakes
- Check user balance
- Validate odds haven't changed

### 2. Single Bets Processing
```javascript
// Pseudo-code
async function processSingleBets(betRequests) {
  // 1. Validate all bets
  const validation = await validateBetslip(betRequests);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // 2. Check user balance
  const totalStake = betRequests.reduce((sum, bet) => sum + bet.stake, 0);
  const userBalance = await getUserBalance(betRequests[0].userId);
  if (userBalance < totalStake) {
    throw new Error('Insufficient balance');
  }
  
  // 3. Deduct stake from user balance
  await deductFromBalance(betRequests[0].userId, totalStake);
  
  // 4. Create bet records
  const betResults = [];
  for (const betRequest of betRequests) {
    const bet = await createBet(betRequest);
    betResults.push(bet);
  }
  
  // 5. Return results
  return betResults;
}
```

### 3. Multibet Processing
```javascript
// Pseudo-code
async function processMultibet(multibetRequest) {
  // 1. Validate multibet
  const validation = await validateMultibet(multibetRequest.bets);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // 2. Check user balance
  const userBalance = await getUserBalance(multibetRequest.userId);
  if (userBalance < multibetRequest.totalStake) {
    throw new Error('Insufficient balance');
  }
  
  // 3. Deduct stake from user balance
  await deductFromBalance(multibetRequest.userId, multibetRequest.totalStake);
  
  // 4. Create multibet record
  const multibet = await createMultibet(multibetRequest);
  
  // 5. Create individual bet records for tracking
  for (const betRequest of multibetRequest.bets) {
    await createBet({
      ...betRequest,
      multibetId: multibet.id
    });
  }
  
  // 6. Return result
  return multibet;
}
```

## Security Considerations

1. **Authentication**: Require valid JWT tokens
2. **Rate Limiting**: Prevent rapid bet placement
3. **Input Validation**: Sanitize all inputs
4. **Odds Validation**: Check odds haven't changed since selection
5. **Balance Checks**: Ensure sufficient funds before processing
6. **Audit Logging**: Log all bet transactions
7. **Transaction Rollback**: Handle partial failures gracefully

## Testing Examples

### Test Single Bet Placement
```bash
curl -X POST http://localhost:8000/api/bets/single \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bets": [{
      "betId": "test_bet_1",
      "gameId": "game_123",
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "betType": "3 Way",
      "selection": "Home",
      "odds": 2.00,
      "stake": 10.00,
      "potentialWinnings": 20.00,
      "userId": "user_123",
      "timestamp": "2023-12-21T12:00:00.000Z"
    }],
    "totalStake": 10.00,
    "userId": "user_123",
    "timestamp": "2023-12-21T12:00:00.000Z"
  }'
```

### Test Multibet Placement
```bash
curl -X POST http://localhost:8000/api/bets/multibet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "betId": "test_multibet_1",
    "bets": [
      {
        "betId": "test_bet_1",
        "gameId": "game_123",
        "homeTeam": "Team A",
        "awayTeam": "Team B",
        "betType": "3 Way",
        "selection": "Home",
        "odds": 2.00,
        "stake": 10.00,
        "potentialWinnings": 20.00,
        "userId": "user_123",
        "timestamp": "2023-12-21T12:00:00.000Z"
      },
      {
        "betId": "test_bet_2",
        "gameId": "game_124",
        "homeTeam": "Team C",
        "awayTeam": "Team D",
        "betType": "3 Way",
        "selection": "Draw",
        "odds": 3.00,
        "stake": 10.00,
        "potentialWinnings": 30.00,
        "userId": "user_123",
        "timestamp": "2023-12-21T12:00:00.000Z"
      }
    ],
    "totalStake": 10.00,
    "combinedOdds": 6.00,
    "potentialWinnings": 60.00,
    "userId": "user_123",
    "timestamp": "2023-12-21T12:00:00.000Z",
    "betType": "multibet"
  }'
``` 