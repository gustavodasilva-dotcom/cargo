BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[ShippingOrder] (
    [Id] UNIQUEIDENTIFIER NOT NULL,
    [Status] INT NOT NULL CONSTRAINT [ShippingOrder_Status_df] DEFAULT 1,
    [TrackingCode] NVARCHAR(17),
    [ShippedAt] DATETIME2,
    [DeliveredAt] DATETIME2,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShippingOrder_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ShippingOrder_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[ShippingOrderParties] (
    [Id] UNIQUEIDENTIFIER NOT NULL,
    [PartyType] INT NOT NULL CONSTRAINT [ShippingOrderParties_PartyType_df] DEFAULT 1,
    [Name] NVARCHAR(255) NOT NULL,
    [Email] NVARCHAR(320) NOT NULL,
    [Cellphone] NVARCHAR(15) NOT NULL,
    [Address] NVARCHAR(255) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShippingOrderParties_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL,
    [ShippingOrderId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [ShippingOrderParties_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[ShippingOrderItem] (
    [Id] UNIQUEIDENTIFIER NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Barcode] NVARCHAR(48) NOT NULL,
    [Quantity] FLOAT(53) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShippingOrderItem_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL,
    [MeasurementId] UNIQUEIDENTIFIER NOT NULL,
    [ShippingOrderId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [ShippingOrderItem_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ShippingOrderParties] ADD CONSTRAINT [ShippingOrderParties_ShippingOrderId_fkey] FOREIGN KEY ([ShippingOrderId]) REFERENCES [dbo].[ShippingOrder]([Id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShippingOrderItem] ADD CONSTRAINT [ShippingOrderItem_MeasurementId_fkey] FOREIGN KEY ([MeasurementId]) REFERENCES [dbo].[Measurement]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShippingOrderItem] ADD CONSTRAINT [ShippingOrderItem_ShippingOrderId_fkey] FOREIGN KEY ([ShippingOrderId]) REFERENCES [dbo].[ShippingOrder]([Id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
