SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[INSERT_COUNTRY_DATA] (
	@id numeric(10,0),
	@country NVARCHAR(50),
	@name NVARCHAR(50),
	@abbr NVARCHAR(50),
	@area NVARCHAR(50),
	@largest_city NVARCHAR(50),
	@capital NVARCHAR(50)
) AS
BEGIN
	SET NOCOUNT ON;
	SET NOCOUNT OFF;	
	MERGE dbo.COUNTRY_STATE AS main
USING (SELECT @id as id,@country as country,@name as name,@abbr as abbr,@area as area,@largest_city as largest_city,
@capital as capital) as country_state
ON main.id=@id
WHEN MATCHED THEN UPDATE SET
main.id=country_state.id,
main.country=country_state.country,
main.name=country_state.name,
main.abbr=country_state.abbr,
main.area=country_state.area,
main.largest_city=country_state.largest_city,
main.capital=country_state.capital
WHEN NOT MATCHED THEN INSERT (id,country,name,abbr,area,largest_city,capital)
values (country_state.id,country_state.country,country_state.name,country_state.abbr,country_state.area,country_state.largest_city,country_state.capital);
END
GO
