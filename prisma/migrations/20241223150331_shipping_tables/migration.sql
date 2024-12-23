BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[ShippingOrder] (
    [Id] NVARCHAR(1000) NOT NULL,
    [Status] INT NOT NULL CONSTRAINT [ShippingOrder_Status_df] DEFAULT 1,
    [ShippedAt] DATETIME2,
    [DeliveredAt] DATETIME2,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShippingOrder_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ShippingOrder_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[ShippingOrderConsignor] (
    [Id] NVARCHAR(1000) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShippingOrderConsignor_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL,
    [ShippingOrderId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ShippingOrderConsignor_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [ShippingOrderConsignor_ShippingOrderId_key] UNIQUE NONCLUSTERED ([ShippingOrderId])
);

-- CreateTable
CREATE TABLE [dbo].[ShippingOrderConsignee] (
    [Id] NVARCHAR(1000) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShippingOrderConsignee_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL,
    [ShippingOrderId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ShippingOrderConsignee_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [ShippingOrderConsignee_ShippingOrderId_key] UNIQUE NONCLUSTERED ([ShippingOrderId])
);

-- CreateTable
CREATE TABLE [dbo].[ShippingOrderItem] (
    [Id] NVARCHAR(1000) NOT NULL,
    [Barcode] NVARCHAR(1000) NOT NULL,
    [Quantity] FLOAT(53) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShippingOrderItem_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL,
    [MeasurementId] NVARCHAR(1000) NOT NULL,
    [ShippingOrderId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ShippingOrderItem_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ShippingOrderConsignor] ADD CONSTRAINT [ShippingOrderConsignor_ShippingOrderId_fkey] FOREIGN KEY ([ShippingOrderId]) REFERENCES [dbo].[ShippingOrder]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShippingOrderConsignee] ADD CONSTRAINT [ShippingOrderConsignee_ShippingOrderId_fkey] FOREIGN KEY ([ShippingOrderId]) REFERENCES [dbo].[ShippingOrder]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShippingOrderItem] ADD CONSTRAINT [ShippingOrderItem_MeasurementId_fkey] FOREIGN KEY ([MeasurementId]) REFERENCES [dbo].[Measurement]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShippingOrderItem] ADD CONSTRAINT [ShippingOrderItem_ShippingOrderId_fkey] FOREIGN KEY ([ShippingOrderId]) REFERENCES [dbo].[ShippingOrder]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
