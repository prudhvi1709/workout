# Workout & Diet Tracker

A simple, mobile-friendly web application to track your gym workouts and diet progress. Built for GitHub Pages - no backend required!

## Features

- **Day-Based Workout Tracking**: Select which workout day you're doing (Push, Legs, Pull, Full Body) and log only those exercises
- **Diet Tracking**: Log your meals with protein tracking across Lunch, Dinner, Pre-workout, and Weekly Treats
- **Session Logging**: Record weight used, RPE (Rate of Perceived Exertion), and personal notes for each exercise
- **History & Analytics**: View all your past workouts with dates, filter by type, and export to CSV for analysis
- **Offline-First**: All data stored in browser localStorage - works without internet after first load
- **Mobile Optimized**: Responsive Bootstrap UI designed for use at the gym

## Setup

### Prerequisites
- A GitHub account
- Two Excel files: `workout.xlsx` and `diet.xlsx`

### Excel File Format

**workout.xlsx** should have these columns:
```
Day | Exercise | Sets | Reps | Weight Used | RPE | Notes
```

Example:
```
Day 1 - Push | Chest Press Machine | 4 | 10-12 | | |
            | Pec Fly Machine     | 3 | 12-15 | | |
Day 2 - Legs | Leg Press          | 4 | 10-12 | | |
```

**diet.xlsx** should have these columns:
```
Meal | Option | Protein (g) | Notes
```

Example:
```
Lunch  | Soya + Rice + Veg    | 35-40 | Andhra spices allowed
Dinner | Paneer Stir Fry + 2 Chapati | 35-40 | Low carb, high protein
```

### GitHub Pages Deployment

1. **Create a new repository** on GitHub (e.g., `workout-tracker`)

2. **Add files to your repository**:
   ```
   workout-tracker/
   ├── index.html
   ├── workout.xlsx
   ├── diet.xlsx
   ├── README.md
   └── LICENSE
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or `master`) → `/root` → Save

4. **Access your app**:
   - URL: `https://yourusername.github.io/workout-tracker/`
   - Bookmark this on your phone for quick gym access

## Usage

### At the Gym

**Workout Tab**:
1. Open the app on your mobile browser
2. Select which day you're doing (e.g., "Day 2 - Legs")
3. For each exercise:
   - Enter the weight you used
   - Rate your perceived exertion (RPE 1-10)
   - Check the "Done" box when completed
   - Add notes like "Increase weight next time" or "Good form"
4. Click "Save Session" to log everything
5. Your progress is automatically saved to browser storage

**Diet Tab**:
1. Check off meals as you eat them
2. Add notes about portions, timing, or how you felt
3. Data saves immediately when checked

**History Tab**:
1. View all your logged workouts and meals
2. Filter by Workouts, Diet, or All
3. Export to CSV for analysis in Excel/Google Sheets

### Data Export & Backup

**IMPORTANT**: Your data is stored in browser localStorage. This means:

- ✅ Works offline after first load
- ✅ Fast and private (data never leaves your device)
- ❌ Can be lost if you clear browser data
- ❌ Not synced across devices
- ❌ Will be deleted if you clear cache/cookies

**Recommended Export Frequency**:

| Timeframe | Frequency | Why |
|-----------|-----------|-----|
| **Week 1-2** | After every workout | Getting used to the app, prevent early data loss |
| **Ongoing** | Once per week | End of week backup before your rest day |
| **End of Cycle** | End of mesocycle (4-6 weeks) | Before planning your next workout cycle |
| **Before Analysis** | Always | Right before reviewing progress and planning next phase |

**When to ALWAYS Export**:
- Before clearing browser cache/data
- Before updating your phone
- Before switching browsers
- When switching between devices
- Before making changes to the Excel files

**Export Process**:
1. Open the app → History tab
2. Click "Export CSV"
3. Save the file to Google Drive, Dropbox, or email it to yourself
4. File name format: `workout-diet-log-YYYY-MM-DD.csv`

## CSV Export Format

The exported CSV contains:
```
Date | Type | Day/Meal | Exercise/Food | Sets | Reps | Weight | RPE | Protein | Status | Notes
```

This format allows you to:
- Track progressive overload (weight increases over time)
- Analyze RPE trends to avoid overtraining
- Monitor protein intake consistency
- Review notes for exercise form improvements
- Compare performance across workout cycles

## Tips for Best Results

1. **Be Consistent**: Log immediately after completing each exercise
2. **Honest RPE**: Rate your true effort level, not what you wish it was
3. **Detailed Notes**: Future you will thank current you for specific notes
4. **Weekly Reviews**: Check your History tab every weekend
5. **Regular Exports**: Treat CSV exports like gym insurance - you hope you don't need them, but you'll be glad you have them
6. **Update Excel Files**: When you change your workout plan, update the Excel files and push to GitHub

## Troubleshooting

**Data Disappeared?**
- Browser cache was cleared - restore from your latest CSV export
- Using a different browser/device - localStorage doesn't sync
- Solution: Export regularly and import into Excel for analysis

**Excel Files Not Loading?**
- Check that `workout.xlsx` and `diet.xlsx` are in the same directory as `index.html`
- Verify column headers match the expected format
- Check browser console (F12) for error messages

**App Not Updating?**
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear cache for your GitHub Pages domain
- Wait 5-10 minutes after pushing changes to GitHub

## Technology Stack

- **Frontend**: HTML5, JavaScript (ES6+), Bootstrap 5
- **Excel Parsing**: SheetJS (xlsx.js)
- **Storage**: Browser localStorage API
- **Hosting**: GitHub Pages (static hosting)

## Privacy

- All data is stored locally in your browser
- No data is sent to any server (except GitHub Pages for the HTML/Excel files)
- No analytics, tracking, or cookies
- Your workout and diet data never leaves your device

## License

MIT License - See LICENSE file for details

## Contributing

Feel free to fork this project and customize it for your own needs! Some ideas:
- Add charts for progress visualization
- Implement data sync across devices (requires backend)
- Add timer for rest periods between sets
- Include workout templates for different goals
- Add body weight and measurements tracking

---

**Remember**: Export your data regularly! Browser localStorage is convenient but not permanent. Weekly CSV exports = peace of mind.
