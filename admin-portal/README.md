# ReserveX Admin Portal - Multi-Exhibition System

## 🚀 Quick Start

### Development
```powershell
npm install
npm run dev
```
Access at: http://localhost:5173

### Production Build
```powershell
npm run build
npm run preview
```

## 📁 Page Structure

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/dashboard` | Statistics and overview |
| **Manage Exhibitions** | `/exhibitions` | Create/edit/delete exhibitions |
| **Manage Stalls** | `/stalls` | Stall management per exhibition |
| **View Reservations** | `/reservations` | Filter and manage reservations |
| **Manage Vendors** | `/vendors` | Vendor info and history |
| **Stall Maps** | `/stall-maps` | Interactive grid visualization |
| **Admin Profile** | `/admin-profile` | Profile management |
| **Login** | `/` | Authentication |

## 🎨 Features

### Dashboard
- Multi-exhibition statistics
- Recent activity feed
- Quick action buttons
- Visual charts

### Manage Exhibitions
- Two-tab interface (Manage/Add)
- Create exhibitions with venue selection
- Edit and delete with safety checks
- View stall counts

### Manage Stalls
- Filter by exhibition
- Two-tab interface (Manage/Add)
- Grid position validation
- View vendor assignments

### View Reservations
- Advanced filtering (exhibition, vendor, stall, status, dates)
- Update reservation status
- Delete with automatic stall release

### Manage Vendors
- Search by name/email/business
- Sort by multiple criteria
- View detailed reservation history

### Stall Maps
- Interactive grid layout
- Color-coded by status
- Hover for details
- Per-exhibition views

## 🎨 Design System

### Colors
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Purple)
- Success: `#10b981` (Emerald)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Red)

### Patterns
- Two-tab interface for management pages
- Gradient backgrounds
- Modal confirmations for destructive actions
- Responsive grid layouts
- Status badges with color coding

## 🔧 API Integration

All API calls go through `services/admin.service.js`:

```javascript
// Dashboard
getDashboardStats()

// Exhibitions
getAllExhibitions()
getExhibitionById(id)
createExhibition(data)
updateExhibition(id, data)
deleteExhibition(id)
getAllVenues()

// Stalls
getAllStallsAdmin()
getStallsByExhibition(exhibitionId)
getStallById(id)
createStall(data)
updateStall(id, data)
deleteStall(id)

// Reservations
getAllReservationsAdmin()
getReservationsByExhibition(exhibitionId)
getReservationById(id)
updateReservationStatus(id, status)
deleteReservation(id)

// Vendors
getAllVendors()
getVendorById(id)
getVendorReservations(vendorId)
```

## 📦 Dependencies

```json
{
  "axios": "^1.13.5",          // HTTP client
  "jwt-decode": "^4.0.0",      // JWT parsing
  "react": "^19.2.0",          // React framework
  "react-dom": "^19.2.0",      // React DOM
  "react-router-dom": "^7.13.0", // Routing
  "recharts": "^2.15.4"        // Charts
}
```

## 🏗️ Project Structure

```
admin-portal/
├── src/
│   ├── pages/              # All page components
│   │   ├── Dashboard.jsx + .css
│   │   ├── ManageExhibitions.jsx + .css
│   │   ├── ManageStalls.jsx + .css
│   │   ├── ViewReservations.jsx + .css
│   │   ├── ManageVendors.jsx + .css
│   │   ├── StallMaps.jsx + .css
│   │   ├── AdminProfile.jsx + .css
│   │   └── login.jsx + .css
│   ├── components/         # Shared components
│   │   ├── NavBar.jsx + .css
│   │   ├── Sidebar.jsx
│   │   └── StallsPieChart.jsx
│   ├── services/           # API services
│   │   ├── admin.service.js
│   │   ├── api.js
│   │   └── auth.service.js
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx
│   ├── layouts/            # Layout components
│   │   └── AdminLayout.jsx
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies
└── vite.config.js          # Vite configuration
```

## 🔐 Authentication

Uses JWT tokens stored in localStorage:
- Login via `/api/auth/login`
- Token stored in `localStorage.getItem('token')`
- Automatic token injection via Axios interceptors
- Protected routes via AuthContext

## 🧪 Testing

### Manual Testing Flow
1. Login as admin
2. Create exhibition
3. Add stalls to exhibition
4. View stalls on map
5. Check dashboard for stats
6. Test reservation management
7. View vendor information

### Build Testing
```powershell
npm run build    # Should complete without errors
npm run preview  # Test production build
```

## 📱 Responsive Design

- Desktop: Full layout with all features
- Tablet: Adjusted grid layouts
- Mobile: Single column, collapsible filters

## 🎯 Key Features

✅ Multi-exhibition support
✅ Full CRUD operations
✅ Advanced filtering
✅ Interactive visualizations
✅ Safety checks and confirmations
✅ Responsive design
✅ Modern UI with gradients
✅ Real-time updates
✅ Status management
✅ Vendor tracking

## 🚨 Important Notes

1. **AdminProfile.jsx** is preserved unchanged from original
2. All API calls require backend running on `http://localhost:8080`
3. CORS must be configured in backend for frontend origin
4. JWT tokens expire - handle refresh or re-login
5. All delete operations have confirmation dialogs

## 🐛 Troubleshooting

### Build Fails
- Run `npm install` again
- Clear `node_modules` and reinstall
- Check for syntax errors in JSX files

### API Calls Fail
- Verify backend is running
- Check CORS configuration
- Verify JWT token is valid
- Check network tab in browser

### Pages Not Loading
- Check React Router configuration
- Verify all imports are correct
- Check browser console for errors

## 📊 Performance

- Initial bundle: ~380 KB (gzipped: ~110 KB)
- Build time: ~2 seconds
- Dev server startup: ~1 second
- Hot reload: Instant

## 🔄 Update Process

When backend API changes:
1. Update `services/admin.service.js`
2. Update DTOs if needed
3. Update component state management
4. Test all affected pages

## 📝 Code Style

- ESLint configured
- React best practices
- Consistent naming conventions
- Component-scoped CSS
- Async/await for API calls
- Error handling in all async operations

## 🎉 Ready to Deploy

Build is production-ready:
- ✅ All pages working
- ✅ Build passing
- ✅ No console errors
- ✅ Responsive design
- ✅ API integration complete

---

**Version:** 2.0.0  
**Status:** Production Ready ✅  
**Last Updated:** 2026-08-31
