# Mobile App SignalR Configuration - EXACT COPY

## What I Found

The mobile app at `C:\Users\lenovo\WebstormProjects\Archive-Admin-main\app` uses a **simpler and working** SignalR configuration.

## Key Differences

### 1. SignalR Endpoint
- ✅ Mobile uses: `/chat`
- ❌ Our frontend tried: `/chatHub`

### 2. Connection Configuration
Mobile app uses:
```typescript
.withUrl(hubUrl, {
  accessTokenFactory: () => token,
  skipNegotiation: true,  // ← KEY DIFFERENCE
  transport: signalR.HttpTransportType.WebSockets  // ← Only WebSockets
})
```

Our frontend tried:
```typescript
.withUrl(hubUrl, {
  accessTokenFactory: () => token,
  transport: signalR.HttpTransportType.WebSockets | ServerSentEvents | LongPolling
})
// Missing skipNegotiation!
```

### 3. Event Names
Mobile uses:
- `ReceiveMessage` ✅
- `UserTyping` ✅
- `MessageRead` ✅

Our frontend tried additional events that aren't in the mobile app:
- `UserOnline`
- `UserOffline`
- `TypingIndicator`

## Fix Required

### Step 1: Replace `composables/useSignalR.ts`

Delete current file and replace with exact copy from mobile app (already created as `useSignalR-mobile.ts`)

### Step 2: Update Chat Page

Use the mobile app's pattern:

```typescript
// Mobile app pattern (simple and works)
onMounted(async () => {
  if (token) {
    await initializeConnection(token)
    
    onReceiveMessage((message: any) => {
      // Handle message - backend sends PascalCase, just use it directly
      const convIndex = conversations.value.findIndex(
        c => c.userId === message.fromUserId || c.userId === message.FromUserId
      )
      // ... update conversation
    })
  }
  
  await fetchConversations()
})
```

### Step 3: API Calls

Mobile app uses direct `$fetch`:

```typescript
// Fetch conversations
const response = await $fetch<any>(`${config.public.baseUrl}/message/conversations`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`
  },
  query: {
    pageNumber: pageNumber.value,
    pageSize: pageSize.value
  }
})

conversations.value = response.data || []
```

### Step 4: Remove Complex Features

Mobile app doesn't use:
- ❌ Property normalization (PascalCase → camelCase)
- ❌ Online/Offline tracking
- ❌ Complex typing indicators
- ❌ Message delivered/read tracking via SignalR

It keeps it simple:
- ✅ Just listen for `ReceiveMessage`
- ✅ Update conversation list
- ✅ Show messages

## Action Plan

1. **Backup current files:**
   - Move `useSignalR.ts` to `useSignalR.backup.ts`
   - Move `useChat.ts` to `useChat.backup.ts`

2. **Copy mobile app files:**
   - Copy `useSignalR.ts` from mobile app
   - Adapt chat pages to use mobile app's simple pattern

3. **Update chat page:**
   - Use direct `$fetch` calls
   - Simple message handling
   - No complex state management

4. **Test:**
   - Restart dev server
   - Navigate to `/chats`
   - Should connect to `/chat` endpoint successfully

## Mobile App Files to Copy

From: `C:\Users\lenovo\WebstormProjects\Archive-Admin-main\app\`

Copy these patterns:
1. ✅ `composables/useSignalR.ts` - SignalR connection
2. ✅ `pages/chats/index.vue` - Conversations list
3. ✅ `pages/chats/convo/[id].vue` - Chat window

## Why This Works

The mobile app is **already working in production** with the same backend. By copying its exact implementation, we guarantee compatibility.

---

**Next Step**: Want me to replace the files with the mobile app's implementation?
