# 📱 PostApp

A mobile application for managing and publishing posts, built with React Native (Expo) and Laravel 12.

---

# ✨ Features

## 🔐 Authentication
- Register & Login with inline field-level validation (no alert popups)
- Token-based auth via Laravel Sanctum
- Auto-login with saved token on app launch
- Logout with confirmation alert
- Rate limiting (5 attempts/min) with friendly error messages

## 📝 Posts (CRUD)
- Create, read, update, and delete posts
- Title with 255 character counter
- Status toggle: **Draft** / **Published**
- Unsaved changes detection on edit screen
- Discard changes confirmation on back press

## 🔍 Search & Filter
- Live search with 500ms debounce (searches title, body, and status)
- Filter posts by Published or Draft from Home quick actions
- Results count display when searching
- Clear search button (✕)
- Contextual empty state messages

## 📊 Dashboard
- Time-based greeting (Good Morning / Afternoon / Evening)
- Stats cards: Total, Published, Drafts
- Swipeable chart slider with tab switcher:
  - 📈 **Line chart** — posts over last 6 months
  - 🍩 **Pie chart** — published vs drafts ratio
- Chart info row: Latest Month, Best Month, Avg / Month
- Custom legend for pie chart (Published, Drafts, Total)
- Pull-to-refresh with `🔄 Refreshing...` / `✅ Updated just now` indicator

## 📄 Posts List
- Infinite scroll pagination (10 posts per page)
- Skeleton loading cards with animated pulse
- Sticky range bar: `Showing 1–10 of 100 posts`
- `↑ Top` scroll-to-top button after page 1
- End bar: `── All 100 posts loaded ──`
- Pull-to-refresh
- Skeleton placeholders while loading more posts

## 👤 Profile Management
- Edit name and email with validation
- Change password with current password verification
- Delete account with confirmation (removes all posts and tokens)
- Success and error banners (inline, no alert popups)

## 🌙 Dark Mode
- Manual toggle on Home screen (Settings section)
- Persists across app restarts
- Applied to all screens: Login, Register, Posts List, Post Detail, Create Post, Edit Post, Edit Profile, Change Password
- Dynamic color system with light and dark color palettes

## 🎨 UI & UX
- Purple (`#6C63FF`) primary color throughout
- Curved bottom borders on headers
- Floating stat cards with colored top borders
- Animated splash screen
- Pull-to-refresh on all list screens
- Inline error handling on all forms (red border + red label)
- Success banners in green on profile updates
- Confirmation alerts for all destructive actions (delete, logout)
- Disabled button states when no changes or while loading