# Google Maps API Setup Guide

## Overview
This document provides step-by-step instructions for setting up Google Maps API for the ExpertNear.Me application.

## Free Tier Benefits
Google Maps offers a generous free tier:
- **$200/month credit** (more than enough for small to medium projects)
- **28,500 map loads per month**
- **40,000 places requests per month**
- **40,000 geocoding requests per month**

## Step-by-Step Setup

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account
- Create a new project (e.g., "ExpertNear-Me-Production")

### 2. Enable Required APIs
In your Google Cloud project:
1. Navigate to "APIs & Services" → "Library"
2. Enable these APIs:
   - **Maps JavaScript API** (for displaying maps)
   - **Places API** (for location search and autocomplete)
   - **Geocoding API** (for address lookup)

### 3. Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Copy the generated API key

### 4. Secure Your API Key
1. Click on the API key you just created
2. Under "API restrictions", select "Restrict key"
3. Select only the three APIs you enabled (Maps JavaScript API, Places API, Geocoding API)
4. Under "Application restrictions", add your website domains:
   - `localhost` (for development)
   - Your production domain (e.g., `expertnear.me`)

### 5. Add API Key to Environment
Add this to your `.env` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 6. Test the Implementation
Run your development server:
```bash
npm run dev
```

Navigate to your application and test:
- The map should load on the homepage
- Category markers should appear
- Search functionality should work

## Implementation Details

### Current Google Maps Integration
- **File**: `src/lib/google-maps.ts`
- **Component**: `src/components/map/MapComponent.tsx`
- **Features**:
  - Dynamic map loading
  - Category-based filtering
  - Provider markers with info windows
  - Responsive design

### Code Structure
```typescript
// Maps loading function
export async function loadGoogleMaps() {
  // Loads Google Maps API with your key
}

// Distance calculation
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  // Calculates distance between two coordinates
}
```

## Troubleshooting

### Common Issues

1. **Map not loading**
   - Check if API key is correct
   - Verify API key restrictions
   - Ensure APIs are enabled in Cloud Console

2. **"Invalid API key" error**
   - Copy/paste the API key correctly
   - Check for extra spaces
   - Verify the key hasn't been deleted

3. **Map doesn't show markers**
   - Check if provider data has valid coordinates
   - Verify the API response structure
   - Check browser console for errors

### Debug Mode
Add this to your browser console to debug Google Maps issues:
```javascript
window.google?.maps // Should show the maps object if loaded correctly
```

## Cost Optimization Tips

1. **Use caching**: Cache location data to reduce API calls
2. **Lazy loading**: Only load maps when needed
3. **Debounce search**: Prevent rapid successive API calls
4. **Server-side validation**: Validate coordinates before making API calls

## Next Steps

Once Google Maps is working:
1. Add map interactions (zoom, pan)
2. Implement route planning
3. Add heat maps for popular areas
4. Integrate with real-time location services

## Support

If you encounter issues:
1. Check Google Maps API documentation: https://developers.google.com/maps
2. Monitor Cloud Console usage: https://console.cloud.google.com/
3. Review error messages in browser console

---

**Note**: Google Maps API key setup is required for the map functionality to work properly in the application.