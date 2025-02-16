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
        headers: ['Book', 'Series', 'Total reading ms', '# of page flips']
    },
    // 1. Total time spent reading Kindle books
    totalReadingTime: {
        query: `
        SELECT SUM(total_reading_millis) / 60000 AS total_minutes_read
        FROM Kindle_Devices_ReadingSession;
      `,
        headers: ["Total Minutes Read"]
    },

    // 2. Total time spent listening to Audible audiobooks
    totalListeningTime: {
        query: `
        SELECT SUM("Event Duration Milliseconds") / 60000 AS total_minutes_listened
        FROM Listening;
      `,
        headers: ["Total Minutes Listened"]
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
        headers: ["Book Title", "Session Count", "Total Minutes Read"]
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
        headers: ["Book Title", "Session Count", "Total Minutes Listened"]
    },

    // 5. Average reading session duration
    avgReadingSession: {
        query: `
        SELECT AVG(total_reading_millis) / 60000 AS avg_session_minutes
        FROM Kindle_Devices_ReadingSession;
      `,
        headers: ["Average Session Duration (Minutes)"]
    },

    // 6. Average listening session duration
    avgListeningSession: {
        query: `
        SELECT AVG("Event Duration Milliseconds") / 60000 AS avg_session_minutes
        FROM Listening;
      `,
        headers: ["Average Listening Session Duration (Minutes)"]
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
        headers: ["Book Title", "Bookmark Count"]
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
        headers: ["Book Title", "Highlight Count"]
    },

    // 9. Daily reading habit (minutes per day)
    dailyReadingTime: {
        query: `SELECT date_trunc('d', strptime(NULLIF(start_timestamp, 'Not Available'), '%Y-%m-%dT%H:%M:%SZ')) AS reading_date, SUM(total_reading_millis) / 60000 AS minutes_read
        FROM Kindle_Devices_ReadingSession
        GROUP BY reading_date
        ORDER BY reading_date DESC;
        `,
        headers: ["Reading Date", "Minutes Read"]
    },

    // 10. Daily listening habit (minutes per day)
    dailyListeningTime: {
        query: `
        SELECT "Start Date" AS listening_date, SUM("Event Duration Milliseconds") / 60000 AS minutes_listened
        FROM Listening
        GROUP BY listening_date
        ORDER BY listening_date DESC;
      `,
        headers: ["Listening Date", "Minutes Listened"]
    },

    // 11. Daily listening and reading time (minutes per day)
    // Something wrong with this query.
    dailyListeningAndReadingTime: {
        query: `SELECT date_trunc('d', strptime(NULLIF(start_timestamp, 'Not Available'), '%Y-%m-%dT%H:%M:%SZ')) AS reading_date, SUM(total_reading_millis) / 60000 AS minutes_read,  SUM("Event Duration Milliseconds") / 60000 AS minutes_listened
        FROM Kindle_Devices_ReadingSession
        JOIN Listening ON date_trunc('d', strptime(NULLIF(start_timestamp, 'Not Available'), '%Y-%m-%dT%H:%M:%SZ')) = Listening."Start Date"
        GROUP BY reading_date
        ORDER BY reading_date DESC
        `,
        headers: ["Reading Date", "Minutes Read"]
    }
};

export default queries;
