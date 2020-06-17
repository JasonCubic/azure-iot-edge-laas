-- Create a new database called 'location_history'
-- Connect to the 'master' database to run this snippet
USE master
GO


DROP DATABASE IF EXISTS location_history;

-- Create the new database if it does not exist already
IF NOT EXISTS (
  SELECT [name]
    FROM sys.databases
    WHERE [name] = N'location_history'
)
CREATE DATABASE location_history
GO

USE location_history
GO



-- Create a new table called '[tag_read_history]' in schema '[dbo]'
-- Drop the table if it already exists
IF OBJECT_ID('[dbo].[tag_read_history]', 'U') IS NOT NULL
DROP TABLE [dbo].[tag_read_history]
GO


CREATE TABLE [dbo].[tag_read_history]
(
  [tag_read_history_id] INT NOT NULL IDENTITY(1,1) PRIMARY KEY, -- Primary Key column
  [epc] VARCHAR(50) NOT NULL,
  [ms_timestamp] BIGINT NOT NULL,
  [json_data] NVARCHAR(MAX) NOT NULL DEFAULT '{}',
  [last_modified_ms_timestamp] [bigint] NULL,
  [is_active] [tinyint] NOT NULL DEFAULT 1,
);
GO

