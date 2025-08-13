# Backend API for Agent Functionality

This document outlines the backend API endpoints needed to support the agent functionality in the BetZone application.

## Base URL
```
Development: http://localhost:8000/api
Production: https://your-production-api.com/api
```

## Authentication
All agent endpoints require authentication with a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Token Refresh
To extend user sessions before token expiration:
```
POST /auth/refresh
Authorization: Bearer <current-token>
```
**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "phone_number": "+1234567890",
    "role": "user",
    "balance": 1000,
    "currency": "USD",
    "isActive": true,
    "bettingLimits": { ... },
    "preferences": { ... }
  },
  "token": "new-jwt-token-string",
  "message": "Token refreshed successfully"
}
```

## API Endpoints

### 1. User Management

#### Get Managed Users
```
GET /agent/users
```
**Response:**
```json
[
  {
    "id": "user_123",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "balance": 1500.00,
    "isActive": true,
    "lastActivity": "2024-01-15T10:30:00Z"
  }
]
```

#### Create New User
```
POST /agent/users
```
**Request Body:**
```json
{
  "name": "Jane Smith",
  "phoneNumber": "+1234567890",
  "initialBalance": 1000.00
}
```
**Response:**
```json
{
  "id": "user_456",
  "name": "Jane Smith",
  "phoneNumber": "+1234567890",
  "balance": 1000.00,
  "isActive": true,
  "lastActivity": "2024-01-15T10:30:00Z"
}
```

#### Update User Balance
```
POST /agent/users/balance
```
**Request Body:**
```json
{
  "userId": "user_123",
  "amount": 500.00,
  "type": "deposit"
}
```
**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "balance": 2000.00,
  "isActive": true,
  "lastActivity": "2024-01-15T10:30:00Z"
}
```

#### Deactivate User
```
POST /agent/users/{userId}/deactivate
```
**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### 2. Bet Management

#### Place Bet for User
```
POST /agent/bets
```
**Request Body:**
```json
{
  "userId": "user_123",
  "betType": "single",
  "stake": 100.00,
  "selections": [
    {
      "gameId": "game_456",
      "betType": "match_winner",
      "selection": "home",
      "odds": 2.50
    }
  ]
}
```
**Response:**
```json
{
  "id": "bet_789",
  "userId": "user_123",
  "userName": "John Doe",
  "betType": "single",
  "stake": 100.00,
  "potentialWinnings": 250.00,
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z",
  "selections": [
    {
      "gameId": "game_456",
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "betType": "match_winner",
      "selection": "home",
      "odds": 2.50
    }
  ]
}
```

#### Get Agent Bets
```
GET /agent/bets
```
**Response:**
```json
[
  {
    "id": "bet_789",
    "userId": "user_123",
    "userName": "John Doe",
    "betType": "single",
    "stake": 100.00,
    "potentialWinnings": 250.00,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z",
    "selections": [...]
  }
]
```

#### Update Bet Status
```
PATCH /agent/bets/{betId}/status
```
**Request Body:**
```json
{
  "status": "accepted"
}
```
**Response:**
```json
{
  "id": "bet_789",
  "userId": "user_123",
  "userName": "John Doe",
  "betType": "single",
  "stake": 100.00,
  "potentialWinnings": 250.00,
  "status": "accepted",
  "createdAt": "2024-01-15T10:30:00Z",
  "selections": [...]
}
```

### 3. Commission Management

#### Get Commission Transactions
```
GET /agent/commissions
```
**Response:**
```json
[
  {
    "id": "commission_123",
    "userId": "user_123",
    "userName": "John Doe",
    "betId": "bet_789",
    "amount": 5.00,
    "percentage": 5.0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Get Agent Statistics
```
GET /agent/stats
```
**Response:**
```json
{
  "totalCommission": 150.00,
  "totalBetsPlaced": 25,
  "totalStake": 5000.00
}
```

### 4. User Activity

#### Get User Activity
```
GET /agent/users/{userId}/activity
```
**Response:**
```json
{
  "bets": [
    {
      "id": "bet_789",
      "betType": "single",
      "stake": 100.00,
      "potentialWinnings": 250.00,
      "status": "accepted",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "balanceHistory": [
    {
      "amount": 500.00,
      "type": "deposit",
      "date": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Invalid request data",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  role ENUM('user', 'agent', 'admin') DEFAULT 'user',
  balance DECIMAL(10,2) DEFAULT 0.00,
  agent_id VARCHAR(255),
  commission DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id)
);
```

### Bets Table
```sql
CREATE TABLE bets (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  agent_id VARCHAR(255),
  bet_type ENUM('single', 'multibet') NOT NULL,
  stake DECIMAL(10,2) NOT NULL,
  potential_winnings DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'settled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (agent_id) REFERENCES users(id)
);
```

### Bet Selections Table
```sql
CREATE TABLE bet_selections (
  id VARCHAR(255) PRIMARY KEY,
  bet_id VARCHAR(255) NOT NULL,
  game_id VARCHAR(255) NOT NULL,
  bet_type VARCHAR(100) NOT NULL,
  selection VARCHAR(100) NOT NULL,
  odds DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bet_id) REFERENCES bets(id)
);
```

### Commission Transactions Table
```sql
CREATE TABLE commission_transactions (
  id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  bet_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (bet_id) REFERENCES bets(id)
);
```

## Security Considerations

1. **Authentication**: All agent endpoints require valid authentication tokens
2. **Authorization**: Agents can only access their managed users
3. **Input Validation**: All input data should be validated and sanitized
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Audit Logging**: Log all agent actions for compliance and security
6. **Data Encryption**: Sensitive data should be encrypted at rest and in transit

## Implementation Notes

1. **Commission Calculation**: Commission is calculated as a percentage of the stake amount
2. **Bet Status Flow**: pending → accepted/rejected → settled
3. **Balance Updates**: All balance changes should be atomic transactions
4. **User Deactivation**: Deactivated users cannot place new bets but existing bets remain active
5. **Agent Permissions**: Agents can only manage users assigned to them 