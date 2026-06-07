# Paper Daily Roadmap

## Quick Wins

1. Daily page feedback
   - Add the same like/dislike feedback controls to daily Top 5 items.

2. Updates page reading density
   - Mark papers that have already appeared in the daily Top 5.
   - Collapse extra update items when one date has more than 3 entries, with a simple expand control.
   - Keep "details" inline after the one-line summary.

3. Source page clarity
   - Show the added WeChat public account list separately from journal/news sources.
   - Show source count and recent article count by source group.

4. Layout polish
   - Further reduce repeated text in long summaries, merged source blocks, and WeChat source display.
   - Keep the current system font stack and smaller page scale.

5. Automation stability
   - Keep scheduled GitHub Actions away from the top of the hour.
   - Prevent overlapping scheduled/manual update jobs.

## Next Major Version

1. Better recommendation scoring
   - Refine journal/source category weights.
   - Improve how like/dislike feedback changes topic weights.
   - Review whether source, topic, and paper-type weights should be adjusted after real usage.

2. Better WeChat paper extraction
   - Cluster WeChat posts that recommend the same paper within 7 days.
   - Keep method/data papers but filter out non-paper announcements, calls for papers, courses, ads, jobs, and conference notices.
   - Improve prompt and parsing for DOI, English paper title, authors, journal, and original paper URL.

3. Time window options
   - Support 7-day and 14-day views without mixing daily statistics.
   - Avoid duplicate recommendations when the same paper appears across multiple days.

4. Topic-aware update sorting
   - When one date has more than 5 update items, group or sort by topic category.
   - Keep topic labels compact; avoid keyword overload.

5. Page design refinement
   - Improve visual density for long abstracts.
   - Improve merged-source presentation.
   - Improve WeChat source presentation so it remains useful but not noisy.
