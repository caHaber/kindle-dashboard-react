export const GET_TOTAL_READING_AND_PAGE_FLIPS = {
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
}