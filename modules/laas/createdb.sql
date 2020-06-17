-- Create a new database called 'rtls'
-- Connect to the 'master' database to run this snippet
USE master
GO


DROP DATABASE IF EXISTS rtls;

-- Create the new database if it does not exist already
IF NOT EXISTS (
  SELECT [name]
    FROM sys.databases
    WHERE [name] = N'rtls'
)
CREATE DATABASE rtls
GO

USE rtls
GO


/*
example tag read message from zebra tag reader
{
  "reader_name":"FX9600F05EC9 FX9600 RFID Reader",
  "mac_address":"84:24:8D:F0:5E:C9",
  "tag_reads":[
    {
      "epc":"000000000000000000003442",
      "pc":"3000",
      "antennaPort":"3",
      "peakRssi":"-72",
      "seenCount":"1",
      "timeStamp":"22/5/2020 22:4:0:111",
      "phase":"0.00",
      "channelIndex":"34"
    }
  ]
}

*/

-- Create a new table called '[rfid_reader]' in schema '[dbo]'
-- Drop the table if it already exists
IF OBJECT_ID('[dbo].[rfid_reader]', 'U') IS NOT NULL
DROP TABLE [dbo].[rfid_reader]
GO

CREATE TABLE [dbo].[rfid_reader]
(
  [rfid_reader_id] INT NOT NULL IDENTITY(1,1) PRIMARY KEY, -- Primary Key column
  [reader_name] VARCHAR(50) NOT NULL,
  [mac_address] VARCHAR(20) NOT NULL,
  [last_modified_ms_timestamp] [bigint] NULL,
  [is_active] [tinyint] NOT NULL DEFAULT 1,
);
GO



-- Create a new table called '[rfid_tag_reads]' in schema '[dbo]'
-- Drop the table if it already exists
IF OBJECT_ID('[dbo].[rfid_tag_reads]', 'U') IS NOT NULL
DROP TABLE [dbo].[rfid_tag_reads]
GO

CREATE TABLE [dbo].[rfid_tag_reads]
(
  [rfid_tagReads_id] INT NOT NULL IDENTITY(1,1) PRIMARY KEY, -- Primary Key column
  [epc] VARCHAR(50) NOT NULL,
  [mac_address] VARCHAR(20) NOT NULL,
  [antenna_port] INT NOT NULL,
  [ms_timestamp] BIGINT NOT NULL,
  [json_data] NVARCHAR(MAX) NOT NULL DEFAULT '{}',
  [last_modified_ms_timestamp] [bigint] NULL,
  [is_active] [tinyint] NOT NULL DEFAULT 1,
);
GO

-- TRUNCATE TABLE [rtls].[dbo].[rfid_tag_reads]



-- examples:
-- {
--   rules:
--     all: [
--       { operator: "eq", value: "84:24:8D:F0:5E:C9", path: "mac_address" },
--       { operator: "eq", value: 3, path: "antennaPort" },
--     ],
--     any: [],
--   ],
-- }

-- operators: eq, lt, lte, gt, gte, match, notmatch

-- Create a new table called '[location_rules]' in schema '[dbo]'
-- Drop the table if it already exists
IF OBJECT_ID('[dbo].[location_rules]', 'U') IS NOT NULL
DROP TABLE [dbo].[location_rules]
GO

CREATE TABLE [dbo].[location_rules]
(
  [location_rules_id] INT NOT NULL IDENTITY(1,1) PRIMARY KEY, -- Primary Key column
  [json_rules] NVARCHAR(MAX) NOT NULL DEFAULT '{}',
  -- [tag_value] VARCHAR(50) NOT NULL,
  [last_modified_ms_timestamp] [bigint] NULL,
  [is_active] [tinyint] NOT NULL DEFAULT 1,
);
GO



IF OBJECT_ID('[dbo].[marriage_eav]', 'U') IS NOT NULL
DROP TABLE [dbo].[marriage_eav]
GO

CREATE TABLE [dbo].[marriage_eav]
(
  [marriage_eav_id] INT NOT NULL IDENTITY(1,1) PRIMARY KEY, -- Primary Key column
  [entity] VARCHAR(50) NOT NULL, -- epc of rfid tag
  [marriage_attribute_id] INT NOT NULL,
  [value] VARCHAR(64) NOT NULL, -- unique identifier such as axle serial number, chassis serial, cab serial, etc, etc,
  [last_modified_by] VARCHAR(50) NULL,
  [last_modified_ms_timestamp] [bigint] NULL,
  [is_active] [tinyint] NOT NULL DEFAULT 1,
);
GO


IF OBJECT_ID('[dbo].[marriage_attributes]', 'U') IS NOT NULL
DROP TABLE [dbo].[marriage_attributes]
GO

CREATE TABLE [dbo].[marriage_attributes]
(
  [marriage_attribute_id] INT NOT NULL IDENTITY(1,1) PRIMARY KEY, -- Primary Key column
  [attribute] VARCHAR(50) NOT NULL, -- axle line, chassis line, cab line, etc
  [last_modified_by] VARCHAR(50) NULL,
  [last_modified_ms_timestamp] [bigint] NULL,
  [is_active] [tinyint] NOT NULL DEFAULT 1,
);
GO

ALTER TABLE [dbo].[marriage_eav]
ADD CONSTRAINT fk_marriage_attributes_marriage_attribute_id
  FOREIGN KEY (marriage_attribute_id)
  REFERENCES [dbo].[marriage_attributes] (marriage_attribute_id)
GO




-- Create a new table called '[tag_read_history]' in schema '[dbo]'
-- Drop the table if it already exists
IF OBJECT_ID('[dbo].[marriage_history]', 'U') IS NOT NULL
DROP TABLE [dbo].[marriage_history]
GO


CREATE TABLE [dbo].[marriage_history]
(
  [marriage_history_id] INT NOT NULL IDENTITY(1,1) PRIMARY KEY, -- Primary Key column
  [json_data] NVARCHAR(MAX) NOT NULL DEFAULT '{}',
  [last_modified_ms_timestamp] [bigint] NULL,
  [is_active] [tinyint] NOT NULL DEFAULT 1,
);
GO

