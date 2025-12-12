# Data Backup Guide - IMPORTANT!

## Why You MUST Export Regularly

Your workout data is stored in **browser localStorage**. Think of it like sticky notes on your desk - convenient but temporary.

### What Can Cause Data Loss

Your data will be **PERMANENTLY DELETED** if:

- ❌ You clear browser cache/cookies
- ❌ You run "Clear browsing data" in browser settings
- ❌ You uninstall and reinstall your browser
- ❌ Your phone storage gets full and the system clears app data
- ❌ You switch browsers (Chrome → Firefox)
- ❌ You get a new phone
- ❌ Browser updates sometimes reset data
- ❌ You use Private/Incognito mode (data lost when you close tab)

### What WON'T Cause Data Loss

- ✅ Closing the browser tab
- ✅ Restarting your phone
- ✅ Updating the app HTML file on GitHub
- ✅ Going offline
- ✅ Browser crashes

## Export Frequency Recommendations

### Beginner (First Month)
**Export after EVERY workout**

Why: You're still learning the app. Better to have too many backups than none.

### Intermediate (Months 2-3)
**Export once per week**

Recommended: Every Sunday evening
- You've completed your week's workouts
- You can review your progress
- Start the new week fresh

### Advanced (Ongoing)
**Export at end of each training cycle**

Typical cycle: 4-6 weeks
- Before deload week
- Before changing workout program
- When planning your next mesocycle

### ALWAYS Export Before

1. **Changing your phone** - Export, set up new phone, verify app works, celebrate
2. **Clearing browser data** - Export first, then clear
3. **Phone/browser updates** - Export before updating
4. **Trying a new browser** - Export from old, import manually if needed
5. **End of month/cycle** - For progress analysis

## How to Export (Step by Step)

### Mobile (At the Gym)

1. Open the app
2. Tap "History" tab at the top
3. Tap "Export CSV" button (green with download arrow)
4. File downloads to your phone
5. **IMMEDIATELY** do one of these:
   - Email the file to yourself
   - Upload to Google Drive
   - Upload to Dropbox
   - Save to iCloud/OneDrive
   - AirDrop to another device (iPhone)

**Don't just leave it in Downloads folder!** That folder can get cleaned up automatically.

### Desktop

1. Open the app in your browser
2. Click "History" tab
3. Click "Export CSV"
4. Save to:
   - Cloud storage (Google Drive, Dropbox, etc.)
   - External hard drive
   - Email to yourself
   - Multiple locations (recommended!)

## Export File Naming

The app automatically names files: `workout-diet-log-YYYY-MM-DD.csv`

Example: `workout-diet-log-2025-12-12.csv`

**Pro Tip**: Create a folder structure like this:
```
Google Drive/
  └── Fitness/
      └── Workout Logs/
          ├── 2025-01/
          │   ├── workout-diet-log-2025-01-07.csv
          │   ├── workout-diet-log-2025-01-14.csv
          │   └── workout-diet-log-2025-01-31.csv
          └── 2025-02/
              └── workout-diet-log-2025-02-07.csv
```

## What the CSV Contains

Your export includes EVERYTHING:

- Date and time of each workout/meal
- Which day/meal (Day 1 - Push, Lunch, etc.)
- Exercise/food name
- Sets and reps
- Weight used
- RPE (effort level)
- Protein content
- Your personal notes

**Use this data to**:
- Analyze progress in Excel/Google Sheets
- Track progressive overload
- Identify plateau periods
- Plan your next training cycle
- Share with a trainer or coach

## Setting Up Automatic Reminders

### iPhone

1. Open Shortcuts app
2. Create automation: "Time of Day"
3. Set for: Every Sunday, 8:00 PM
4. Action: Show notification "Export your workout data!"
5. Save

### Android

1. Install app like "Reminder" or use Google Keep
2. Set recurring reminder: Every Sunday, 8:00 PM
3. Title: "Export workout tracker CSV"
4. Save

### Calendar

1. Open Google Calendar
2. Create recurring event: Every Sunday, 8:00 PM
3. Title: "Export Workout Data (CSV)"
4. Set notification: 0 minutes before
5. Save

## Recovery Plan (If You Lose Data)

### If you have recent CSV export:

1. Open the CSV in Excel/Google Sheets
2. You can view all your historical data
3. Continue tracking new workouts in the app
4. Use Excel to analyze your past performance

### If you don't have recent CSV:

1. Start fresh (painful lesson learned)
2. Your muscles remember your progress even if the app doesn't
3. Set up automatic reminders TODAY
4. Export after your next workout

## Cloud Storage Comparison

| Service | Free Storage | Mobile App | Auto-Upload |
|---------|--------------|------------|-------------|
| Google Drive | 15 GB | ✅ | ✅ |
| Dropbox | 2 GB | ✅ | ✅ |
| OneDrive | 5 GB | ✅ | ✅ |
| iCloud | 5 GB | ✅ (iOS) | ✅ |

**Recommendation**: Use Google Drive with the Drive app on your phone. Enable "Backup & Sync" for Downloads folder.

## Test Your Backup Process

**Right now, before you forget**:

1. ✅ Complete one workout in the app
2. ✅ Export the CSV
3. ✅ Upload to cloud storage
4. ✅ Verify you can open the file on another device
5. ✅ Set up recurring reminder
6. ✅ Bookmark this guide

## The Golden Rule

**"If it's not in at least 2 places, it doesn't exist"**

Every export should be:
- On your phone (temporary)
- In cloud storage (long-term)
- Optionally: Emailed to yourself (extra backup)

## Questions?

**Q: Can I restore data from CSV back into the app?**
A: Not automatically. The app doesn't have an import feature. Use Excel/Sheets to analyze historical data.

**Q: How much space do exports take?**
A: Very little! 6 months of daily tracking ≈ 50-100 KB (less than one photo).

**Q: Can I sync between my phone and tablet?**
A: No, localStorage doesn't sync. Pick one device or export/import manually.

**Q: What if I forget to export for weeks?**
A: As long as you don't clear browser data, your data is safe. Export ASAP and set up reminders.

---

## TL;DR - Quick Reference

**New to app**: Export after every workout
**Regular user**: Export every Sunday
**Before any changes**: ALWAYS export first
**Storage**: Use cloud service (Google Drive recommended)
**Reminder**: Set up recurring calendar/phone alert
**Golden Rule**: Data in 2+ places or it doesn't exist

**Export now. Future you will thank present you.**
