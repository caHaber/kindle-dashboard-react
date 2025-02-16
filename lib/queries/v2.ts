const queries = {
  // 1. Daily Reading & Listening Trend (Line Chart)
  dailyReadingListeningTrend: {
    query: `
        WITH daily_reading AS (
            SELECT 
                start_timestamp AS reading_date,
                SUM(total_reading_millis) / 60000 AS minutes_read
            FROM Kindle_Devices_ReadingSession
            GROUP BY reading_date
        ), 
        daily_listening AS (
            SELECT 
                "Start Date" AS listening_date,
                SUM("Event Duration Milliseconds") / 60000 AS minutes_listened
            FROM Listening
            GROUP BY listening_date
        )
        SELECT 
            COALESCE(dr.reading_date, dl.listening_date) AS activity_date, 
            COALESCE(dr.minutes_read, 0) AS minutes_read, 
            COALESCE(dl.minutes_listened, 0) AS minutes_listened
        FROM daily_reading dr
        FULL OUTER JOIN daily_listening dl 
            ON dr.reading_date = dl.listening_date
        ORDER BY activity_date DESC;
      `,
    headers: ["activity_date", "minutes_read", "minutes_listened"],
    chartDescription:
      "A line chart showing daily reading and listening time trends.",
  },

  // 2. Most Read & Listened Books (Bar Chart)
  mostReadListenedBooks: {
    query: `
        WITH reading_book_counts AS (
            SELECT 
                cri."Product Name" AS book_title,
                COUNT(rs.ASIN) AS read_sessions,
                SUM(rs.total_reading_millis) / 60000 AS total_minutes_read
            FROM Kindle_Devices_ReadingSession rs
            JOIN Kindle_UnifiedLibraryIndex_CustomerRelationshipIndex cri 
                ON rs.ASIN = cri.ASIN
            GROUP BY cri."Product Name"
        ),
        listening_book_counts AS (
            SELECT 
                "Product Name" AS book_title,
                COUNT(*) AS listen_sessions,
                SUM("Event Duration Milliseconds") / 60000 AS total_minutes_listened
            FROM Listening
            GROUP BY "Product Name"
        )
        SELECT 
            COALESCE(rb.book_title, lb.book_title) AS book_title,
            COALESCE(rb.total_minutes_read, 0) AS total_minutes_read,
            COALESCE(lb.total_minutes_listened, 0) AS total_minutes_listened
        FROM reading_book_counts rb
        FULL OUTER JOIN listening_book_counts lb 
            ON rb.book_title = lb.book_title
        ORDER BY total_minutes_read + total_minutes_listened DESC
        LIMIT 10;
      `,
    headers: ["book_title", "total_minutes_read", "total_minutes_listened"],
    chartDescription:
      "A bar chart showing the top 10 most read and listened books.",
  },

  // 3. Genre Preferences (Pie Chart)
  genrePreferences: {
    query: `
        SELECT 
            Genre,
            COUNT(*) AS book_count
        FROM Kindle_UnifiedLibraryIndex_CustomerGenres
        GROUP BY Genre
        ORDER BY book_count DESC;
      `,
    headers: ["Genre", "book_count"],
    chartDescription: "A pie chart showing distribution of book genres read.",
  },

  // 4. Daily Page Flips (Bar Chart)
  dailyPageFlips: {
    query: `
        SELECT 
            start_timestamp AS reading_date,
            SUM(number_of_page_flips) AS total_page_flips
        FROM Kindle_Devices_ReadingSession
        GROUP BY reading_date
        ORDER BY reading_date DESC;
      `,
    headers: ["reading_date", "total_page_flips"],
    chartDescription: "A bar chart showing daily number of page flips.",
  },

  // 5. Highlighting Trends (Line Chart)
  dailyHighlightTrends: {
    query: `
        SELECT 
            created_timestamp AS highlight_date,
            COUNT(*) AS highlight_count
        FROM Kindle_Devices_kindleHighlightActions
        GROUP BY highlight_date
        ORDER BY highlight_date DESC;
      `,
    headers: ["highlight_date", "highlight_count"],
    chartDescription:
      "A line chart showing daily trends of highlighted text in books.",
  },

  // 6. Bookmark Usage (Bar Chart)
  bookmarkUsage: {
    query: `
        SELECT 
            cri."Product Name" AS book_title,
            COUNT(*) AS bookmark_count
        FROM Kindle_Devices_kindleBookmarkActions kb
        JOIN Kindle_UnifiedLibraryIndex_CustomerRelationshipIndex cri 
            ON kb.ASIN = cri.ASIN
        GROUP BY cri."Product Name"
        ORDER BY bookmark_count DESC
        LIMIT 10;
      `,
    headers: ["book_title", "bookmark_count"],
    chartDescription: "A bar chart showing books with the most bookmarks.",
  },

  // 7. Reading Sessions Per Device (Pie Chart)
  readingSessionsPerDevice: {
    query: `
        SELECT 
            device_family,
            COUNT(*) AS session_count
        FROM Kindle_Devices_ReadingSession
        GROUP BY device_family
        ORDER BY session_count DESC;
      `,
    headers: ["device_family", "session_count"],
    chartDescription:
      "A pie chart showing the distribution of reading sessions across different devices.",
  },

  // 8. Listening Speed Trends (Line Chart)
  readingSpeedTrends: {
    query: `
        SELECT 
            start_timestamp AS reading_date,
            SUM(number_of_page_flips) AS total_page_flips,
            SUM(total_reading_millis) / 60000 AS total_minutes_read,
            CASE 
                WHEN SUM(total_reading_millis) > 0 
                THEN SUM(number_of_page_flips) / (SUM(total_reading_millis) / 60000)
                ELSE NULL
            END AS avg_reading_speed
        FROM Kindle_Devices_ReadingSession
        WHERE start_timestamp IS NOT NULL
        GROUP BY reading_date
        ORDER BY reading_date DESC;
      `,
    headers: [
      "reading_date",
      "total_page_flips",
      "total_minutes_read",
      "avg_reading_speed",
    ],
    chartDescription:
      "A line chart showing daily trends in reading speed (pages per minute).",
  },

  // 9. Daily Storage Impact (Bar Chart)
  storageImpact: {
    query: `
        SELECT 
            created_timestamp AS date,
            SUM(book_count) AS total_books_stored
        FROM Kindle_Devices_StorageContent
        GROUP BY date
        ORDER BY date DESC;
      `,
    headers: ["date", "total_books_stored"],
    chartDescription:
      "A bar chart showing the daily increase in books stored on the device.",
  },

  // 10. Weekly Reading vs. Listening (Stacked Bar Chart)
  weeklyReadingListening: {
    query: `
        WITH weekly_reading AS (
            SELECT 
                DATE_TRUNC('week', start_timestamp) AS week_start,
                SUM(total_reading_millis) / 60000 AS minutes_read
            FROM Kindle_Devices_ReadingSession
            GROUP BY week_start
        ),
        weekly_listening AS (
            SELECT 
                DATE_TRUNC('week', "Start Date") AS week_start,
                SUM("Event Duration Milliseconds") / 60000 AS minutes_listened
            FROM Listening
            GROUP BY week_start
        )
        SELECT 
            COALESCE(wr.week_start, wl.week_start) AS week_start,
            COALESCE(wr.minutes_read, 0) AS minutes_read,
            COALESCE(wl.minutes_listened, 0) AS minutes_listened
        FROM weekly_reading wr
        FULL OUTER JOIN weekly_listening wl
            ON wr.week_start = wl.week_start
        ORDER BY week_start DESC;
      `,
    headers: ["week_start", "minutes_read", "minutes_listened"],
    chartDescription:
      "A stacked bar chart comparing weekly reading vs. listening time.",
  },
};

export default queries;
