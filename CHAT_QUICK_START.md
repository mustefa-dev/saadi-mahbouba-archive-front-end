# Chat Feature - Quick Start Guide

## 🚀 Getting Started

### For Users
1. Navigate to `/chat` in your application
2. The chat will automatically connect to the support team
3. Start typing your message in the input field at the bottom
4. Press **Enter** to send (or **Shift+Enter** for a new line)
5. Click the attachment icon to send files or images

### For Admins
1. Navigate to `/chat` in your application
2. You'll see a list of all user conversations on the left
3. Click on any conversation to view and respond to messages
4. Use the same input controls to send messages

## 📋 Key Features

### ✅ Implemented Features

1. **Real-time Messaging**
   - Instant message delivery via SignalR WebSockets
   - Auto-reconnection if connection is lost
   - Connection status indicator (green = connected, red = disconnected)

2. **Message Types**
   - Text messages
   - Image attachments (with preview)
   - File attachments (PDFs, documents)
   - Voice messages (audio files)
   - Report messages (special format)

3. **User Experience**
   - Typing indicators ("User is typing...")
   - Read receipts (✓✓) and delivery receipts (✓)
   - Online/offline status indicators
   - Unread message counter
   - Auto-scroll to latest message
   - Load more messages (pagination)

4. **Admin Features**
   - View all user conversations
   - See unread message counts per user
   - Sort conversations by most recent activity
   - Online status for each user

5. **Message Management**
   - Delete your own messages
   - View full-size images by clicking
   - Download file attachments
   - Scroll through message history

## 🎯 User Guide

### Sending Messages

#### Text Message
1. Type your message in the input box
2. Press **Enter** to send
3. Use **Shift+Enter** for multi-line messages

#### Image/File Message
1. Click the attachment icon (📎)
2. Select your file (max 10MB)
3. Add an optional caption
4. Press **Enter** or click send

#### Voice Message
1. Click the attachment icon
2. Select an audio file
3. Press send

### Managing Messages

#### Delete a Message
1. Hover over your own message
2. Click the trash icon that appears
3. Confirm deletion

#### View Full-Size Image
1. Click on any image in the chat
2. View in modal overlay
3. Click outside or press X to close

### Understanding Status Icons

- **✓** Single check: Message delivered
- **✓✓** Double check: Message read
- **🟢** Green dot: User is online
- **⚫** Gray/no dot: User is offline
- **Typing...**: User is currently typing

## 🔧 Technical Details

### Files Structure
```
composables/
  ├── useChat.ts          # Chat state & API logic
  └── useSignalR.ts       # WebSocket connection
pages/
  └── chat.vue            # Main chat UI
types/
  └── messages.d.ts       # TypeScript types
utils/
  └── api-paths.ts        # API endpoints
```

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/Message/history` | GET | Load message history |
| `/api/Message/send` | POST | Send text message |
| `/api/Message/send-with-attachment` | POST | Send file/image |
| `/api/Message/unread-count` | GET | Get unread count |
| `/api/Message/mark-read` | POST | Mark messages as read |
| `/api/Message/mark-delivered/{id}` | PUT | Mark message delivered |
| `/api/Message/conversations` | GET | Get all conversations (admin) |
| `/api/Message/conversation/{userId}` | GET | Get user conversation (admin) |
| `/api/Message/{id}` | GET | Get single message |
| `/api/Message/{id}` | DELETE | Delete message |

### SignalR Events

**Receiving:**
- `ReceiveMessage` - New message received
- `UserOnline` - User came online
- `UserOffline` - User went offline
- `TypingIndicator` - User typing status

**Sending:**
- `SendTypingIndicator` - Send typing status
- `MessageDelivered` - Acknowledge delivery
- `MessagesRead` - Acknowledge read

## 🐛 Troubleshooting

### Connection Issues

**Problem:** Red "Disconnected" indicator
- **Solution:** Check your internet connection
- **Solution:** Refresh the page
- **Solution:** Wait for automatic reconnection (up to 30 seconds)

**Problem:** Yellow "Reconnecting..." banner
- **Solution:** Wait for automatic reconnection
- **Solution:** If it persists, refresh the page

### Message Issues

**Problem:** Messages not sending
- **Solution:** Check if you're connected (green indicator)
- **Solution:** Ensure message is not empty
- **Solution:** Check file size if sending attachment (max 10MB)

**Problem:** Can't delete a message
- **Solution:** You can only delete your own messages
- **Solution:** Refresh and try again

**Problem:** Images not loading
- **Solution:** Check your internet connection
- **Solution:** Click on the image to open in full size
- **Solution:** Try refreshing the page

### Performance Issues

**Problem:** Chat is slow or laggy
- **Solution:** Clear browser cache
- **Solution:** Close unnecessary browser tabs
- **Solution:** Check if you have many messages loaded (try refreshing)

## 💡 Tips & Tricks

1. **Keyboard Shortcuts**
   - `Enter` - Send message
   - `Shift+Enter` - New line in message
   - `Esc` - Close image preview/dialogs

2. **Best Practices**
   - Keep file sizes under 5MB for faster uploads
   - Use image compression tools before uploading large images
   - Delete unnecessary messages to keep chat clean

3. **For Admins**
   - Check unread counts regularly
   - Respond promptly to maintain user engagement
   - Use typing indicators to let users know you're responding

## 🔒 Privacy & Security

- All messages are encrypted in transit (HTTPS/WSS)
- Only authenticated users can access the chat
- Users can only delete their own messages
- File uploads are scanned and validated
- Maximum file size: 10MB

## 📱 Mobile Support

The chat is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Tablet devices

Mobile-specific features:
- Touch-friendly interface
- Optimized layout for small screens
- Native file picker integration

## 🆘 Support

If you encounter any issues:
1. Try refreshing the page
2. Check your internet connection
3. Clear browser cache
4. Contact technical support if issue persists

---

**Quick Reference Card**

| Action | How To |
|--------|--------|
| Send message | Type + Enter |
| New line | Shift + Enter |
| Attach file | Click 📎 icon |
| Delete message | Hover + click trash icon |
| View image | Click on image |
| Load older messages | Click "Load earlier messages" |
| Check connection | Look at green/red dot at top |

---

**Version:** 1.0.0  
**Last Updated:** November 11, 2025

