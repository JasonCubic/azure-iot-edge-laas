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
example tag read message
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
  [mac_address] VARCHAR(50) NOT NULL,
  [last_modified_unix_timestamp] [bigint] NULL,
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
  [rfid_reader_id] INT NOT NULL,
  [epc] VARCHAR(50) NOT NULL,
  [pc] VARCHAR(50) NOT NULL,
  [antenna_port] VARCHAR(50) NOT NULL,
  [peak_rssi] VARCHAR(50) NOT NULL,
  [seen_count] VARCHAR(50) NOT NULL,
  [timestamp] VARCHAR(50) NOT NULL,
  [unix_timestamp] BIGINT NOT NULL,
  [phase] VARCHAR(50) NOT NULL,
  [channel_index] VARCHAR(50) NOT NULL,
  [last_modified_unix_timestamp] [bigint] NULL,
  [isActive] [tinyint] NOT NULL DEFAULT 1,
);
GO


ALTER TABLE [dbo].[rfid_tag_reads]
ADD CONSTRAINT fk_rfid_tagReads_id_rfid_reader_id 
    FOREIGN KEY (rfid_reader_id)
    REFERENCES [dbo].[rfid_reader] (rfid_reader_id)
GO

