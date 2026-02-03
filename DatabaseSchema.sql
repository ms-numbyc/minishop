-- MinishopDB 数据库表结构脚本

-- 创建商品表
CREATE TABLE Goods (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    Price DECIMAL(10, 2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    ImageUrl NVARCHAR(500),
    Status NVARCHAR(20) NOT NULL DEFAULT 'online', -- online/offline
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 创建抢购记录表
CREATE TABLE SeckillRecords (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    GoodsId NVARCHAR(50) NOT NULL,
    UserId NVARCHAR(50) NOT NULL, -- 用户ID，这里简化处理
    Quantity INT NOT NULL DEFAULT 1,
    OrderTime DATETIME2 NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) NOT NULL DEFAULT 'success', -- success/pending/failed
    FOREIGN KEY (GoodsId) REFERENCES Goods(Id)
);

-- 创建管理员表
CREATE TABLE AdminUsers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1
);

-- 插入默认管理员账户 (密码为明文 'admin123' 的哈希值，实际应用中应使用加密)
INSERT INTO AdminUsers (Username, PasswordHash, Email) 
VALUES ('admin', 'A4C56E4BA8722D130F41D8D0AC5D6C2212C12EED84C4AA0EA762CDDB9140238A', 'admin@minishop.com');

-- 创建索引以提高查询性能
CREATE INDEX IX_Goods_Status ON Goods(Status);
CREATE INDEX IX_Goods_UpdatedAt ON Goods(UpdatedAt);
CREATE INDEX IX_SeckillRecords_GoodsId ON SeckillRecords(GoodsId);
CREATE INDEX IX_SeckillRecords_OrderTime ON SeckillRecords(OrderTime);