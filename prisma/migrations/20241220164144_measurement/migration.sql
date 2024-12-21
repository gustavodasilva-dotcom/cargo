BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Measurement] (
    [Id] NVARCHAR(1000) NOT NULL,
    [Name] NVARCHAR(1000) NOT NULL,
    [ConversionFactor] DECIMAL(32,16) NOT NULL,
    [BaseUnit] NVARCHAR(1000) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Measurement_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Measurement_pkey] PRIMARY KEY CLUSTERED ([Id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH