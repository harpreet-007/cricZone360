# Free Cricket API Setup

This project is currently wired for CricAPI / CricketData.org.

## Get a Free API Key

1. Open https://cricketdata.org/
2. Sign up or log in.
3. Go to the member area / dashboard.
4. Copy your API key.
5. Put it in:

```env
server/.env
```

Example:

```env
PORT=5001
CRIC_API_KEY=your_free_cricketdata_api_key_here
MONGODB_URI=mongodb://localhost:27017/cricket_platform
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

## Run After Changing Key

Close old API and web terminal windows, then run:

```bat
D:\cricket_project\clean-run-project.bat
```

## Test API

Open these in your browser:

```text
http://localhost:5001/api/health
http://localhost:5001/api/matches
http://localhost:5001/api/search?q=Virat%20Kohli
```

If `/api/health` works but `/api/matches` does not, the issue is usually the API key, provider quota, or internet access.
