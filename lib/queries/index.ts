const queries = {
  totalReadingAndPageFlips: {
    query: `
        SELECT "Product Name",
            "series-product-name",
            sum(total_reading_millis),
            sum(number_of_page_flips)
        FROM Kindle_Devices_ReadingSession
            JOIN BookRelation ON Kindle_Devices_ReadingSession.ASIN = BookRelation.ASIN
            JOIN Kindle_SagaSeriesInfra_CollectionRightsDatastore ON Kindle_Devices_ReadingSession.ASIN = Kindle_SagaSeriesInfra_CollectionRightsDatastore."item-ASIN"
        GROUP BY "Product Name",
        "series-product-name"`,
    headers: [
      "Product Name",
      "series-product-name",
      "sum(total_reading_millis)",
      "sum(number_of_page_flips)",
    ],
  },
  // 1. Total time spent reading Kindle books
  totalReadingTime: {
    query: `
        SELECT SUM(total_reading_millis) / 60000 AS total_minutes_read
        FROM Kindle_Devices_ReadingSession;
      `,
    headers: ["total_minutes_read"],
  },

  // 2. Total time spent listening to Audible audiobooks
  totalListeningTime: {
    query: `
        SELECT SUM("Event Duration Milliseconds") / 60000 AS total_minutes_listened
        FROM Listening;
      `,
    headers: ["total_minutes_listened"],
  },

  // 3. Most read Kindle book (with title)
  mostReadBook: {
    query: `
        SELECT cri."Product Name", COUNT(rs.ASIN) AS session_count, SUM(rs.total_reading_millis) / 60000 AS total_minutes_read
        FROM Kindle_Devices_ReadingSession rs
        JOIN Kindle_UnifiedLibraryIndex_CustomerRelationshipIndex cri ON rs.ASIN = cri.ASIN
        GROUP BY cri."Product Name"
        ORDER BY total_minutes_read DESC
        LIMIT 1;
      `,
    headers: ["Product Name", "session_count", "total_minutes_read"],
  },

  // 4. Most listened Audible book
  mostListenedBook: {
    query: `
        SELECT "Product Name", COUNT(*) AS session_count, SUM("Event Duration Milliseconds") / 60000 AS total_minutes_listened
        FROM Listening
        GROUP BY "Product Name"
        ORDER BY total_minutes_listened DESC
        LIMIT 1;
      `,
    headers: ["Product Name", "session_count", "total_minutes_listened"],
  },

  // 5. Average reading session duration
  avgReadingSession: {
    query: `
        SELECT AVG(total_reading_millis) / 60000 AS avg_session_minutes
        FROM Kindle_Devices_ReadingSession;
      `,
    headers: ["avg_session_minutes"],
  },

  // 6. Average listening session duration
  avgListeningSession: {
    query: `
        SELECT AVG("Event Duration Milliseconds") / 60000 AS avg_session_minutes
        FROM Listening;
      `,
    headers: ["avg_session_minutes"],
  },

  // 7. Books with the most bookmarks (with title)
  mostBookmarkedBooks: {
    query: `
        SELECT cri."Product Name", COUNT(kb.ASIN) AS bookmark_count
        FROM Kindle_Devices_kindleBookmarkActions kb
        JOIN Kindle_UnifiedLibraryIndex_CustomerRelationshipIndex cri ON kb.ASIN = cri.ASIN
        GROUP BY cri."Product Name"
        ORDER BY bookmark_count DESC
        LIMIT 5;
      `,
    headers: ["Product Name", "bookmark_count"],
  },

  // 8. Books with the most highlights (with title)
  mostHighlightedBooks: {
    query: `
        SELECT cri."Product Name", COUNT(kh.ASIN) AS highlight_count
        FROM Kindle_Devices_kindleHighlightActions kh
        JOIN Kindle_UnifiedLibraryIndex_CustomerRelationshipIndex cri ON kh.ASIN = cri.ASIN
        GROUP BY cri."Product Name"
        ORDER BY highlight_count DESC
        LIMIT 5;
      `,
    headers: ["Product Name", "highlight_count"],
  },

  // 9. Daily reading habit (minutes per day)
  dailyReadingTime: {
    query: `SELECT date_trunc('d', strptime(NULLIF(start_timestamp, 'Not Available'), '%Y-%m-%dT%H:%M:%SZ')) AS reading_date, SUM(total_reading_millis) / 60000 AS minutes_read
        FROM Kindle_Devices_ReadingSession
        GROUP BY reading_date
        ORDER BY reading_date DESC;
        `,
    headers: ["reading_date", "minutes_read"],
  },

  // 10. Daily listening habit (minutes per day)
  dailyListeningTime: {
    query: `
        SELECT "Start Date" AS listening_date, SUM("Event Duration Milliseconds") / 60000 AS minutes_listened
        FROM Listening
        GROUP BY listening_date
        ORDER BY listening_date DESC;
      `,
    headers: ["listening_date", "minutes_listened"],
  },

  // 11. Daily listening and reading time (minutes per day)
  // Something wrong with this query.
  dailyListeningAndReadingTime: {
    query: `WITH daily_reading AS (
    SELECT 
        date_trunc('day', strptime(NULLIF(start_timestamp, 'Not Available'), '%Y-%m-%dT%H:%M:%SZ')) AS reading_date,
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
),
ranked_reading AS (
    SELECT 
        date_trunc('day', strptime(NULLIF(start_timestamp, 'Not Available'), '%Y-%m-%dT%H:%M:%SZ')) AS reading_date,
        ASIN,
        SUM(total_reading_millis) / 60000 AS minutes_read,
        ROW_NUMBER() OVER (PARTITION BY date_trunc('day', strptime(NULLIF(start_timestamp, 'Not Available'), '%Y-%m-%dT%H:%M:%SZ')) 
                           ORDER BY SUM(total_reading_millis) DESC) AS rank
    FROM Kindle_Devices_ReadingSession
    GROUP BY reading_date, ASIN
),
ranked_listening AS (
    SELECT 
        "Start Date" AS listening_date,
        "Product Name" AS book_title,
        SUM("Event Duration Milliseconds") / 60000 AS minutes_listened,
        ROW_NUMBER() OVER (PARTITION BY "Start Date" 
                           ORDER BY SUM("Event Duration Milliseconds") DESC) AS rank
    FROM Listening
    GROUP BY listening_date, "Product Name"
),
most_read_book_per_day AS (
    SELECT 
        rr.reading_date, 
        cri."Product Name" AS most_read_book
    FROM ranked_reading rr
    LEFT JOIN Kindle_UnifiedLibraryIndex_CustomerRelationshipIndex cri 
        ON rr.ASIN = cri.ASIN
    WHERE rr.rank = 1
),
most_listened_book_per_day AS (
    SELECT 
        rl.listening_date, 
        rl.book_title AS most_listened_book
    FROM ranked_listening rl
    WHERE rl.rank = 1
)
SELECT 
    COALESCE(dr.reading_date, dl.listening_date) AS activity_date, 
    COALESCE(dr.minutes_read, 0) AS minutes_read, 
    COALESCE(dl.minutes_listened, 0) AS minutes_listened, 
    COALESCE(mrb.most_read_book, 'N/A') AS most_read_book, 
    COALESCE(mlb.most_listened_book, 'N/A') AS most_listened_book
FROM daily_reading dr
FULL OUTER JOIN daily_listening dl 
    ON dr.reading_date = dl.listening_date
LEFT JOIN most_read_book_per_day mrb 
    ON dr.reading_date = mrb.reading_date
LEFT JOIN most_listened_book_per_day mlb 
    ON dl.listening_date = mlb.listening_date
ORDER BY activity_date DESC;
`,
    headers: [
      "activity_date",
      "minutes_read",
      "minutes_listened",
      "most_read_book",
      "most_listened_book",
    ],
  },
};

export default queries;
