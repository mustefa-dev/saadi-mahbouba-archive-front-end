# Quick Test Guide

## Test the SignalR Connection

### Step 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Open Browser Console
Navigate to: `http://localhost:3000/chats`

### Step 3: Check Console Logs

**Expected Output:**
```
🔌 Connecting to SignalR hub: https://almawsua-dashboard.taco5k.site/chat
✅ SignalR Connected!
🚀 Chat page mounted
✅ SignalR listeners attached
```

**If you see this - SUCCESS!** ✅

### Step 4: Test Receiving Messages

From the mobile app, send a test message. You should see:
```
📨 New message received: {
  fromUserId: "...",
  content: "...",
  sentAt: "..."
}
```

## Common Issues & Fixes

### Issue 1: ReferenceError: useChat is not defined
**Status**: ✅ **FIXED** - We removed useChat composable

### Issue 2: SignalR 404 Error
**Check**: 
- Backend is running
- Endpoint is `/chat` (we're using this now)
- WebSockets are enabled

### Issue 3: Connection timeout
**Fix**: Check `skipNegotiation: true` is in useSignalR.ts (line 21)

## Verify Files

Run these commands to check files are correct:

```bash
# Check useSignalR has skipNegotiation
grep -n "skipNegotiation" composables/useSignalR.ts

# Should output: 21:          skipNegotiation: true,

# Check chat page doesn't use useChat
grep -n "useChat" pages/chats/index.vue

# Should only show the interface definition, no usage
```

## Success Criteria

- [ ] No errors in console
- [ ] See "✅ SignalR Connected!" message
- [ ] Conversations list loads
- [ ] Can see conversations
- [ ] (Optional) Receive real-time message from mobile app

---

**Ready to test!** 🚀
