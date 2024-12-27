BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[ShippingOrderTrackingHistory] (
    [Id] UNIQUEIDENTIFIER NOT NULL,
    [Type] INT NOT NULL CONSTRAINT [ShippingOrderTrackingHistory_Type_df] DEFAULT 1,
    [Description] NVARCHAR(255) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShippingOrderTrackingHistory_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [ShippingOrderId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [ShippingOrderTrackingHistory_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ShippingOrderTrackingHistory] ADD CONSTRAINT [ShippingOrderTrackingHistory_ShippingOrderId_fkey] FOREIGN KEY ([ShippingOrderId]) REFERENCES [dbo].[ShippingOrder]([Id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
